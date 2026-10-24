#!/usr/bin/env python3
"""LAB remote PNG-frame -> MP4 runner. Requires LAB_RENDER_API_URL, LAB_RUNNER_TOKEN."""
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

JOB_RE = re.compile(r"^[0-9a-fA-F-]{36}$")


def request(base, token, method, path, payload=None, content_type=None):
    headers = {"Authorization": f"Bearer {token}", "User-Agent": "LAB-Render-Runner/1.0", "Accept": "application/json"}
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(base + path, data=payload, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read()


def run():
    base = os.environ["LAB_RENDER_API_URL"].rstrip("/")
    token = os.environ["LAB_RUNNER_TOKEN"]
    job = os.environ["LAB_JOB_ID"]
    if not base.startswith("https://") or not JOB_RE.fullmatch(job):
        raise ValueError("Invalid API URL or job ID")
    prefix = f"/internal/jobs/{job}"
    def status(value):
        request(base, token, "POST", prefix + "/status",
                json.dumps({"status": value}).encode(), "application/json")
    try:
        manifest = json.loads(request(base, token, "GET", prefix))
        fps = int(manifest["fps"])
        count = int(manifest["frameCount"])
        width = int(manifest["width"])
        height = int(manifest["height"])
        if not (1 <= fps <= 60 and 1 <= count <= 600 and
                16 <= width <= 1920 and 16 <= height <= 1920 and
                width % 2 == 0 and height % 2 == 0):
            raise ValueError("Manifest outside supported limits")
        status("rendering")
        with tempfile.TemporaryDirectory(prefix="lab-render-") as temp:
            root = Path(temp)
            for index in range(count):
                png = request(base, token, "GET", f"{prefix}/frames/{index}")
                if len(png) > 8 * 1024 * 1024 or not png.startswith(b"\x89PNG\r\n\x1a\n"):
                    raise ValueError(f"Invalid PNG frame {index}")
                (root / f"frame_{index:06d}.png").write_bytes(png)
            output = root / "LAB-render.mp4"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-nostdin", "-y",
                "-framerate", str(fps), "-start_number", "0",
                "-i", str(root / "frame_%06d.png"),
                "-frames:v", str(count), "-vf", f"scale={width}:{height}:flags=lanczos",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output)
            ], check=True, timeout=1500)
            data = output.read_bytes()
            if len(data) > 100 * 1024 * 1024:
                raise ValueError("Rendered MP4 exceeds 100MB limit")
            request(base, token, "PUT", prefix + "/output", data, "video/mp4")
        print(f"Remote render complete: {job}")
    except Exception:
        try:
            status("failed")
        except Exception as status_error:
            print(f"Could not report failed status: {status_error}", file=sys.stderr)
        raise


if __name__ == "__main__":
    run()

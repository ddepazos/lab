
#!/usr/bin/env python3
"""
LAB Generative Design Studio
Remote Render Runner v2.3

Cloudflare Workers + R2 + GitHub Actions + FFmpeg

Required environment variables:
    LAB_RENDER_API_URL
    LAB_RUNNER_TOKEN
    LAB_JOB_ID
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

from pathlib import Path


# ----------------------------------------
# CONFIGURATION
# ----------------------------------------

MAX_FRAMES = 600
MAX_PNG_SIZE = 8 * 1024 * 1024
MAX_MP4_SIZE = 100 * 1024 * 1024

LEGACY_JOB_ID = (
    "beed6fb5-06a1-4c3c-8ddc-832ce3abee70"
)

JOB_RE = re.compile(
    r"^(?:"
    r"[0-9a-fA-F]{8}-"
    r"[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{12}"
    r"|beed6fb5-06a1-4c3c-8ddc-832ce3abee70"
    r")$"
)


# ----------------------------------------
# LOGGING
# ----------------------------------------

def log(message):
    print(
        f"[LAB RENDER] {message}",
        flush=True
    )


# ----------------------------------------
# HTTP CLIENT
# ----------------------------------------

def request(
    base,
    token,
    method,
    path,
    payload=None,
    content_type=None
):
    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "LAB-Render-Runner/2.3",
        "Accept": "application/json",
    }

    if content_type:
        headers["Content-Type"] = content_type

    req = urllib.request.Request(
        base + path,
        data=payload,
        headers=headers,
        method=method
    )

    try:
        with urllib.request.urlopen(
            req,
            timeout=120
        ) as response:
            return response.read()

    except urllib.error.HTTPError as error:
        details = error.read(2048).decode(
            "utf-8",
            errors="replace"
        )

        details = details.replace(
            token,
            "[REDACTED]"
        )

        log(
            f"HTTP ERROR: {method} {path} "
            f"-> {error.code}"
        )

        print(
            f"Server response: {details}",
            file=sys.stderr,
            flush=True
        )

        raise

    except urllib.error.URLError as error:
        log(
            f"Network error during "
            f"{method} {path}: {error.reason}"
        )
        raise


# ----------------------------------------
# STATUS MANAGEMENT
# ----------------------------------------

def update_status(
    base,
    token,
    prefix,
    value
):
    payload = json.dumps({
        "status": value
    }).encode("utf-8")

    request(
        base,
        token,
        "POST",
        prefix + "/status",
        payload,
        "application/json"
    )

    log(f"Status: {value}")


# ----------------------------------------
# MANIFEST VALIDATION
# ----------------------------------------

def validate_manifest(manifest):
    fps = int(manifest["fps"])
    count = int(manifest["frameCount"])
    width = int(manifest["width"])
    height = int(manifest["height"])

    if not 1 <= fps <= 60:
        raise ValueError(
            "Invalid FPS"
        )

    if not 1 <= count <= MAX_FRAMES:
        raise ValueError(
            "Invalid frame count"
        )

    if not (
        16 <= width <= 1920
        and 16 <= height <= 1920
    ):
        raise ValueError(
            "Invalid video dimensions"
        )

    if width % 2 or height % 2:
        raise ValueError(
            "Video dimensions must be even"
        )

    return (
        fps,
        count,
        width,
        height
    )


# ----------------------------------------
# FRAME DOWNLOAD
# ----------------------------------------

def download_frames(
    base,
    token,
    prefix,
    count,
    directory
):
    log(
        f"Downloading {count} PNG frames"
    )

    png_signature = (
        b"\x89PNG\r\n\x1a\n"
    )

    for index in range(count):
        data = request(
            base,
            token,
            "GET",
            f"{prefix}/frames/{index}"
        )

        if not (
            24 <= len(data) <= MAX_PNG_SIZE
        ):
            raise ValueError(
                f"Invalid PNG size: {index}"
            )

        if not data.startswith(
            png_signature
        ):
            raise ValueError(
                f"Invalid PNG signature: {index}"
            )

        output = directory / (
            f"frame_{index:06d}.png"
        )

        output.write_bytes(data)

        if (
            (index + 1) % 10 == 0
            or index + 1 == count
        ):
            log(
                f"Downloaded "
                f"{index + 1}/{count}"
            )


# ----------------------------------------
# FFMPEG ENCODING
# ----------------------------------------

def encode_video(
    directory,
    fps,
    count,
    width,
    height
):
    output = (
        directory / "LAB-render.mp4"
    )

    command = [
        "ffmpeg",
        "-hide_banner",
        "-nostdin",
        "-y",
        "-framerate",
        str(fps),
        "-start_number",
        "0",
        "-i",
        str(
            directory / "frame_%06d.png"
        ),
        "-frames:v",
        str(count),
        "-vf",
        (
            f"scale={width}:{height}"
            ":flags=lanczos"
        ),
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(output)
    ]

    log(
        "Starting FFmpeg H.264 encoding"
    )

    subprocess.run(
        command,
        check=True,
        timeout=1500
    )

    if not output.exists():
        raise RuntimeError(
            "FFmpeg did not generate MP4"
        )

    size = output.stat().st_size

    if not (
        12 <= size <= MAX_MP4_SIZE
    ):
        raise ValueError(
            f"Invalid MP4 size: {size}"
        )

    log(
        f"MP4 generated: {size} bytes"
    )

    return output


# ----------------------------------------
# UPLOAD MP4
# ----------------------------------------

def upload_video(
    base,
    token,
    prefix,
    output
):
    data = output.read_bytes()

    if data[4:8] != b"ftyp":
        raise ValueError(
            "Invalid MP4 signature"
        )

    log(
        "Uploading MP4 to Cloudflare R2"
    )

    result = request(
        base,
        token,
        "PUT",
        prefix + "/output",
        data,
        "video/mp4"
    )

    log(
        "MP4 uploaded successfully"
    )

    return result


# ----------------------------------------
# MAIN RENDER PIPELINE
# ----------------------------------------

def run():
    base = os.environ[
        "LAB_RENDER_API_URL"
    ].rstrip("/")

    token = os.environ[
        "LAB_RUNNER_TOKEN"
    ]

    job_id = os.environ[
        "LAB_JOB_ID"
    ]

    if not base.startswith(
        "https://"
    ):
        raise ValueError(
            "LAB_RENDER_API_URL "
            "must use HTTPS"
        )

    if not JOB_RE.fullmatch(
        job_id
    ):
        raise ValueError(
            "Invalid LAB_JOB_ID"
        )

    prefix = (
        f"/internal/jobs/{job_id}"
    )

    log(
        "LAB Remote Render Runner v2.3"
    )

    log(
        f"Job ID: {job_id}"
    )

    log(
        f"API: {base}"
    )

    try:
        # STEP 1: GET MANIFEST

        log(
            "Retrieving render manifest"
        )

        raw = request(
            base,
            token,
            "GET",
            prefix
        )

        manifest = json.loads(
            raw
        )

        (
            fps,
            count,
            width,
            height
        ) = validate_manifest(
            manifest
        )

        log(
            f"Configuration: "
            f"{width}x{height}, "
            f"{fps} FPS, "
            f"{count} frames"
        )

        # STEP 2: START RENDERING

        update_status(
            base,
            token,
            prefix,
            "rendering"
        )

        # STEP 3: DOWNLOAD FRAMES

        with tempfile.TemporaryDirectory(
            prefix="lab-render-"
        ) as temp:

            directory = Path(
                temp
            )

            download_frames(
                base,
                token,
                prefix,
                count,
                directory
            )

            # STEP 4: ENCODE MP4

            output = encode_video(
                directory,
                fps,
                count,
                width,
                height
            )

            # STEP 5: UPLOAD MP4

            upload_video(
                base,
                token,
                prefix,
                output
            )

        log(
            "Remote render completed: "
            f"{job_id}"
        )

    except Exception:
        log(
            "Render failed"
        )

        try:
            update_status(
                base,
                token,
                prefix,
                "failed"
            )

        except Exception as status_error:
            log(
                "Could not report "
                "failed status: "
                f"{status_error}"
            )

        raise


if __name__ == "__main__":
    run()

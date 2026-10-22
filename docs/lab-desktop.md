# LAB Desktop — Windows

LAB Desktop shares the React/Vite interface with the web app and uses **Tauri 2** for its native Windows window and installer. The browser-based video export (Mediabunny/WebCodecs) remains unchanged.

## Requirements

- Windows 10/11 and WebView2
- Node.js and npm
- Rust toolchain (rustup) and Microsoft C++ Build Tools (Desktop development with C++)
- Optional FFmpeg in PATH for the existing local script

## Run locally (PowerShell)

```powershell
cd C:\Users\nicol\lab
git pull origin main
cd react-app
npm.cmd install
npm.cmd install --save-dev @tauri-apps/cli@^2
npm.cmd run desktop:dev
```

## Create a Windows installer

```powershell
cd C:\Users\nicol\lab\react-app
npm.cmd run desktop:build
```

The installer is generated in `react-app\src-tauri\target\release\bundle\nsis\`. Install it and choose the option to create a desktop shortcut. **No installer has been built or installed on your PC from this chat.**

## Local FFmpeg

The existing script is retained at `C:\Users\nicol\lab\scripts\render-ffmpeg.ps1`. Tauri's native window does not automatically give browser JavaScript permission to run local processes. The current desktop app uses the same browser video export as LAB Web; direct invocation of local FFmpeg from the button requires a separately reviewed native command and explicit filesystem permissions.

## Web deployment

The existing Vite `base: './'` supports relative assets in desktop and static web hosting. For Cloudflare Pages use root directory `react-app`, build command `npm run build`, output directory `dist`. The Cloudflare deployment and custom domain still require access to the Cloudflare account.

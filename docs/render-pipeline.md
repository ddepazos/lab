# LAB: exportacion de alta resolucion (fase 1)

Esta rama incorpora resoluciones configurables en la interfaz: PNG cuadrado 800/1600/2160/4096 px y video cuadrado 800/1080/2160 px. El renderizado dentro de LAB sigue usando SVG/Canvas/WebGL y Mediabunny/WebCodecs. La exportacion a 2160 px puede fallar si el navegador, la GPU o el codificador no admiten ese tamano.

## FFmpeg opcional en Windows

El script `scripts/render-ffmpeg.ps1` permite codificar un video previamente exportado desde LAB o una secuencia de PNG numerados generada externamente. No genera fotogramas de LAB ni aumenta el detalle real de una fuente de baja resolucion.

Instala FFmpeg y comprueba `ffmpeg -version`. Desde la raiz del repositorio:

```powershell
.\scripts\render-ffmpeg.ps1 -InputPath "$HOME\Downloads\LAB-composicion-2D-3D.webm" -Format mp4 -Crf 18
```

Para una secuencia `frame000001.png`, `frame000002.png`, etc.:

```powershell
.\scripts\render-ffmpeg.ps1 -InputPath "C:\renders\frames" -Format mp4 -Fps 30 -Crf 18
```

**Limitaciones:** El MP4 generado usa H.264/yuv420p, por lo que no conserva canal alfa. La salida WebM del script tambien utiliza yuv420p sin alfa. Las imagenes de entrada pueden incluir transparencia, pero este codificador no la conserva. La opcion 4K de la interfaz es cuadrada (2160 x 2160), no UHD 3840 x 2160. El motor FFmpeg es un paso local opcional, no un servicio remoto conectado al editor.

## Antes de fusionar

```powershell
cd react-app
npm.cmd run build
npm.cmd test
```

Probar manualmente exportacion PNG a cada tamano, MP4 y WebM a 800 y 1080, y 2160 solo en un equipo con memoria suficiente. Verificar duracion, capas raster, texto, animaciones y 3D. No fusionar si hay fallos.

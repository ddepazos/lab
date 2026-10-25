# LAB — FFmpeg en GitHub Actions (fase inicial)

La interfaz React sigue publicada en GitHub Pages. El renderizado directo del botón usa WebCodecs/Mediabunny **en el navegador**. GitHub Pages no puede ejecutar FFmpeg del computador local ni GitHub Actions como si fuera una API HTTP permanente.

## Procesamiento remoto manual

El workflow [LAB FFmpeg render (manual)](../.github/workflows/ffmpeg-render.yml) descarga un artefacto de una ejecución previa **del mismo repositorio** que contenga exactamente un archivo de vídeo (MP4, WebM o MOV), lo recodifica con FFmpeg en un runner temporal de GitHub y publica el resultado como artefacto descargable durante siete días.

1. Ejecuta primero **LAB create render test input** (`.github/workflows/stage-render-input.yml`) desde GitHub → Actions. Este workflow genera un vídeo de prueba y lo publica como artifact `lab-render-input`. No utiliza una composición real de LAB.
2. Copia el **run ID** de la ejecución de prueba. Después abre GitHub → Actions → LAB FFmpeg render (manual) → Run workflow.
3. Indica ese run ID, el nombre `lab-render-input`, formato y CRF.
4. Descarga el resultado desde los artifacts de la ejecución de renderizado. Estos workflows manuales deben estar disponibles en la rama predeterminada para aparecer en la pestaña Actions; mientras estén en el PR, no constituyen una prueba de ejecución remota.

**Restricciones:** el vídeo se recodifica a la resolución original; no crea detalle 4K a partir de 800×800. Se exporta vídeo sin audio, deliberadamente en esta primera fase. Los artifacts tienen límites de tamaño y retención de GitHub. La disponibilidad y el coste de runners dependen del plan del repositorio.

## Arquitectura y seguridad

No se incluyen secretos ni tokens de GitHub en React. `workflow_dispatch` no es una API pública segura para el botón Renderizar: hace falta una API intermediaria autenticada que limite tamaño, duración, frecuencia, usuarios y costes. **Esa API aún no está implementada.**

La ruta local permanece intacta: `C:\Users\nicol\lab` y `scripts\render-ffmpeg.ps1`. El script local y el workflow remoto son dos vías independientes. No se ha cambiado la ruta del proyecto ni el botón Renderizar de la aplicación.

## Verificación

La sintaxis del workflow y su ejecución completa deben validarse en GitHub Actions con un artefacto de vídeo real. La compilación y las 20 pruebas de React se comprobaron anteriormente, antes de este workflow.

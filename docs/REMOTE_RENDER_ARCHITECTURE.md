# LAB — Remote Rendering / Cloudflare + GitHub Actions

Estado verificado: 2026-10-24/25. Repositorio canónico: `ddepazos/lab` (https://github.com/ddepazos/lab). Mantener historial, ramas y render local.

## Inventario y nombres exactos
- Frontend: LAB Generative Design Studio (React / TypeScript / Vite); publicación web: `https://lab-studio-asl.pages.dev`.
- Worker: `lab-render-api`; endpoint: `https://lab-render-api.ddepazosdesanmartin.workers.dev`; versión confirmada por `/health`: **2.3**.
- Cloudflare R2: bucket **`lab-render-output`**, binding **`RENDER_OUTPUT`**.
- GitHub Actions: `.github/workflows/render-remote.yml`; runner `scripts/render_remote.py`; FFmpeg H.264 `libx264`.
- Worker source local reportado: `C:\Users\nicol\lab-render-api\src\index.js` (proyecto separado del repositorio `ddepazos/lab`).
- Trabajo de compatibilidad: `beed6fb5-06a1-4c3c-8ddc-832ce3abee70` (verificar la longitud exacta antes de reusar). No renombrar ni re-subir frames.
- GitHub Action exitosa: https://github.com/ddepazos/lab/actions/runs/40150798779.

## Prueba comprobada
GitHub Actions terminó correctamente: manifiesto 800x800, 30 fps, 90 frames (3 s); descarga de 90/90 PNG, FFmpeg H.264 MP4 de 12.854 bytes, carga a R2 confirmada en logs. Se comprobó la **ruta manual** de GitHub Actions, NO todavía el despacho automático desde Worker, ni el botón web.

## Flujo objetivo
LAB frontend -> POST /api/jobs (manifest) -> PUT /api/jobs/{id}/frames/{index} (PNG) -> POST /api/jobs/{id}/submit -> GitHub workflow_dispatch -> runner GET /internal/jobs/{id} y frames -> FFmpeg -> PUT /internal/jobs/{id}/output -> frontend GET /api/jobs/{id} -> GET /api/jobs/{id}/download. Mantener modo local como alternativa.

## Pendientes por orden
1. Diagnosticar HTTP 400 en `dispatchGitHub` del Worker; revisar cuerpo de error **sin exponer secretos**. Comprobar permisos `actions:write` del token existente, workflow en main, input `job_id`, y ref `main`. Evitar tokens nuevos salvo evidencia de necesidad.
2. Inspeccionar estructura real de frontend y cablear botón remoto sin romper exportación local. Progreso: preparación, subida, cola, render, completado, descarga y errores. Controlar CORS, tamaño y reintentos idempotentes.
3. Verificar lectura de estado `completed` y descarga autenticada MP4. Probar end-to-end desde la UI con trabajo **nuevo**, sin reusar el trabajo ya completado.
4. Auditar ramas antes de fusionar: identificar commits únicos, archivos en conflicto, pruebas y builds; agrupar PRs pequeños hacia `develop` y luego `main`. Nunca fusionar automáticamente `gh-pages` ni borrar ramas con cambios sin integrar.
5. Documentar componentes, estados y arquitectura en Figma; enlazar prototipos con código y pruebas.

## Seguridad y estabilidad
Reutilizar las conexiones existentes. `API_TOKEN` y `RUNNER_TOKEN` en secretos de Cloudflare; `GITHUB_TOKEN` del Worker; `LAB_RUNNER_TOKEN` en GitHub Actions Secrets; `LAB_RENDER_API_URL` en GitHub Variables. **Nunca** incluir valores de tokens en repositorio, Figma, logs ni frontend público. No almacenar `API_TOKEN` privilegiado en JavaScript del navegador: diseñar autenticación y autorización apropiadas antes de habilitar render remoto público. No prometer que una conexión entre servicios evitará futuras solicitudes de autorización: las credenciales pueden caducar o perder permisos.

## Estrategia de ramas
Ramas observadas: `main`, `develop`, `gh-pages` y múltiples `feat/*`, `fix/*`, `docs/*`. `main` es referencia de la prueba exitosa; `develop` para integración; `gh-pages` es publicación, no rama de integración. Comparar diferencias antes de merge, validar `npm ci`, `npm run build`, prueba del lápiz, animación, exportación local y remota.

## Precauciones
El endpoint `/health` solo prueba disponibilidad, no entrega de render. Los estados y los errores deben revisarse sin regenerar tokens ni volver a subir los 90 fotogramas existentes. El despacho GitHub 400 sigue pendiente.

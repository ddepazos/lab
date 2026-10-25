# LAB Render API — validación controlada (24-10-2026)

## Confirmaciones mediante conectores
- GitHub: `.github/workflows/render-remote.yml` existe en `feat/cloudflare-r2-remote-render` y NO existe en `main` (404 verificado). El Worker está configurado para despachar a `main`; el despacho automático no está listo.
- Cloudflare: Worker `lab-render-api` tiene bindings `RENDER_OUTPUT` (R2), `API_TOKEN`, `RUNNER_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`, `ALLOWED_ORIGINS`. Se comprobaron los **nombres y tipos**, no valores de secretos ni su equivalencia con GitHub.
- El workflow limita cada job a 30 minutos y utiliza `concurrency` por `job_id` con `cancel-in-progress: false`. El script Python limita 600 fotogramas, 1920x1920, 100MB de salida y 1500 segundos para FFmpeg.
- No se ha ejecutado una prueba completa R2 → Actions → R2. No afirmar que el sistema está listo.

## Secuencia sin bucles
1. Revisar y corregir el contrato del Worker (payload de status, manifest, rutas y forma de `workflow_dispatch`), sin publicar tokens.
2. Confirmar que el secret `LAB_RUNNER_TOKEN` coincide con el Worker `RUNNER_TOKEN`, y que `GITHUB_TOKEN` tiene permiso de despachar Actions.
3. Probar una sola vez un job pequeño (por ejemplo, 30 PNG de 256x256 a 15 FPS) desde una fuente autorizada.
4. Verificar ejecución, salida MP4 y descarga; ante error, parar, inspeccionar logs y corregir antes de reintentar. Máximo un reintento manual por causa corregida.
5. Tras éxito, publicar workflow en `main` con revisión, conectar interfaz React y activar limpieza de R2.
6. No activar planes pagos ni exponer `API_TOKEN` en frontend público.

## Nota de seguridad
La concurrencia de GitHub no sustituye idempotencia de la API: `submit` debe rechazar un job ya enviado/en proceso/terminado y nunca despachar repetidamente el mismo UUID. Agregar control transaccional o bloqueo robusto antes de habilitar uso público.

## Estado
**Bloqueado para prueba E2E** hasta alinear rama de despacho y verificar contrato y credenciales. Motor local intacto.

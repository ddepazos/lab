# LAB Render API — Auditoría del contrato real Worker/Python (2026-10-24)

## Inspección efectiva
Se leyó el Worker **desplegado** mediante Cloudflare API `GET /accounts/{account_id}/workers/scripts/lab-render-api/content/v2` y se comparó con `scripts/render_remote.py` y `.github/workflows/render-remote.yml` de la rama `feat/cloudflare-r2-remote-render`.

## Contrato confirmado
| Operación | Worker | Python |
|---|---|---|
| Manifest | `GET /internal/jobs/{id}`, JSON con fps/frameCount/width/height | Compatible |
| Fotogramas | `GET /internal/jobs/{id}/frames/{index}`, bytes PNG | Compatible |
| Inicio | `POST /internal/jobs/{id}/status` con `{status:"rendering"}` | Compatible |
| Error | `POST /internal/jobs/{id}/status` con `{status:"failed"}` | Compatible |
| Salida | `PUT /internal/jobs/{id}/output`, `video/mp4` | Compatible |
| Descarga | `GET /api/jobs/{id}/download` autenticado con API_TOKEN | Implementado en Worker |
| Dispatch | `POST /repos/ddepazos/lab/actions/workflows/render-remote.yml/dispatches`, `ref:main`, `inputs.job_id` | Workflow no existe aún en main |

## Hallazgo de concurrencia — BLOQUEANTE para producción
`submit` hace: leer manifest con status uploading → verificar frames → llamar GitHub dispatch → escribir status queued. Dos solicitudes concurrentes pueden leer uploading antes del último guardado y lanzar dos dispatches. `concurrency` en GitHub no garantiza idempotencia de la API. **No habilitar submit público hasta implementar exclusión atómica por job ID.**

## Riesgos y condiciones
- No se conocen ni se deben exponer valores de RUNNER_TOKEN ni GITHUB_TOKEN. No se ha validado su equivalencia ni permisos.
- No se ha ejecutado render E2E; no afirmar listo.
- No modificar local FFmpeg ni activar plan pago.
- Para producción: solución de idempotencia robusta (por ejemplo, Durable Object por job o almacenamiento transaccional), límites de frecuencia y limpieza de R2.
- Para una prueba aislada: tras revisar PR #16 y alinear workflow en main, crear **un solo** job pequeño, una sola llamada submit y comprobar MP4. Ante fallo, detenerse y registrar causa; no automatizar reintentos.

## Próximo paso concreto
Revisar seguridad de submit e implementar bloqueo atómico antes de publicar interfaz. Luego alinear el workflow con main y verificar secretos con un job controlado.

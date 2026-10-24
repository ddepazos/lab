# LAB Render API — Consolidado y cierre de ciclo (2026-10-24)

## Objetivo
Renderizado remoto de fotogramas PNG a MP4 con Cloudflare Worker + R2 + GitHub Actions + FFmpeg, sin afectar el motor local.

## Confirmado
- Worker público `lab-render-api`: `GET /health` devolvió `service:lab-render-api`, `status:ok`, `storage:configured`, `version:2.0` (salida PowerShell del usuario).
- Endpoint `/internal/jobs/00000000-0000-0000-0000-000000000000` sin token devolvió HTTP 401 (salida PowerShell del usuario). **Esto no prueba autenticación válida**.
- Worker Cloudflare tiene bindings con nombres y tipos esperados: `API_TOKEN`, `RUNNER_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`, `ALLOWED_ORIGINS`, `RENDER_OUTPUT`; no se verificaron los valores.
- GitHub variable `LAB_RENDER_API_URL` y secret `LAB_RUNNER_TOKEN` existen, pero no se verificó coincidencia del secret con Cloudflare.
- Rama `feat/cloudflare-r2-remote-render` contiene `.github/workflows/render-remote.yml`, `scripts/render_remote.py` y documentación. PR #16 abierto hacia `main`; captura muestra un check aprobado y ausencia de conflictos, no validación E2E.
- El workflow no existe en `main` según consulta previa, mientras el Worker intenta despachar en `main`.
- Workflow: timeout 30 minutos, concurrencia por job_id; script: máximo 600 frames, salida <=100MB y timeout FFmpeg 1500s. Esto no sustituye deduplicación en Worker.
- El motor de renderizado local no se modificó en esta rama.

## Pendientes mínimos, sin repetir verificaciones
1. Revisar contrato real del Worker frente a `render_remote.py` (manifest, status, PUT output, dispatch input/ref).
2. Verificar tokens por prueba autenticada sin revelar secretos.
3. Resolver el ref del workflow (main vs rama), con revisión del PR antes de merge.
4. Implementar idempotencia del endpoint submit y límites de trabajos.
5. Ejecutar **un** render E2E pequeño, inspeccionar resultado MP4 y descarga; sin reintentos automáticos.
6. Integrar React y establecer expiración de archivos R2, presupuestos y alertas antes de uso público.

## Reglas de continuidad
- No repetir `/health`, 401 ni capturas del PR.
- No solicitar nuevamente pasos ya verificados.
- No afirmar que el render remoto funciona hasta completar prueba E2E.
- No activar planes pagos, no exponer secretos, no fusionar sin revisión, no alterar render local.
- Detenerse ante fallo y documentar causa; como máximo un reintento manual después de corregirla.

## Enlaces
- PR: https://github.com/ddepazos/lab/pull/16
- Rama: https://github.com/ddepazos/lab/tree/feat/cloudflare-r2-remote-render
- Worker health: https://lab-render-api.ddepazosdesanmartin.workers.dev/health
- R2: https://dash.cloudflare.com/ec80df83a13c0795e3c0c525259d9207/r2/default/buckets/lab-render-output

## Estado final
**Infraestructura y seguridad básica verificadas; E2E remoto NO validado.** Continuar exclusivamente desde pendientes mínimos.

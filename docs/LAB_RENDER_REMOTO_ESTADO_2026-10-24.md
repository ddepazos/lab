# LAB — Renderizado remoto: estado y plan de integración

**Fecha:** 2026-10-24  
**Repositorio:** ddepazos/lab  
**Rama de implementación:** `feat/cloudflare-r2-remote-render`  
**Estado:** infraestructura parcial; integración extremo a extremo pendiente.

## Objetivo
Renderizar animaciones de LAB como MP4 mediante Cloudflare Worker + R2 + GitHub Actions/FFmpeg, sin depender del computador del usuario durante la codificación y sin alterar la exportación local.

## Componentes confirmados
- Cloudflare Worker `lab-render-api` desplegado en `https://lab-render-api.ddepazosdesanmartin.workers.dev`.
- Bucket R2 `lab-render-output` creado y enlazado al Worker.
- Secretos del Worker `API_TOKEN`, `RUNNER_TOKEN`, `GITHUB_TOKEN` cargados (su validez cruzada no ha sido probada).
- Acceso sin autorización a `/api/jobs` responde HTTP 401.
- GitHub Actions habilitado; workflows `stage-render-input.yml` y `ffmpeg-render.yml` activos.
- Ejecuciones exitosas: entrada de prueba `40060649150`; conversión FFmpeg `40060711657`.
- Secreto de GitHub `LAB_RUNNER_TOKEN` configurado (coincidencia con Worker aún no comprobada).
- Variable GitHub `LAB_RENDER_API_URL` configurada y verificada sin formato Markdown.
- `main` actualizado localmente a `dab86a2` antes de crear la rama de integración.
- La rama `feat/lab-compact-ui-20261024` se mantiene separada.

## Distinción de flujos
Los workflows existentes convierten **archivos de video almacenados como artefactos de GitHub**. La nueva API está diseñada para recibir **fotogramas PNG** y entregar un MP4 mediante R2. Conservar ambos mecanismos.

## Pendientes priorizados
1. Crear `.github/workflows/render-remote.yml` para `workflow_dispatch` con identificador de trabajo.
2. Crear `scripts/render_remote.py`: leer manifiesto y fotogramas mediante rutas internas autenticadas, validar entradas, codificar H.264/yuv420p con FFmpeg, cargar MP4 a Worker y reportar fallos.
3. Verificar que el `GITHUB_TOKEN` del Worker realmente puede disparar el workflow y que `LAB_RUNNER_TOKEN` coincide con `RUNNER_TOKEN`.
4. Ejecutar prueba extremo a extremo de un único trabajo: creación, subida de PNG, despacho, codificación, almacenamiento R2 y descarga reproducible.
5. Integrar una modalidad remota en LAB React con progreso, estados y manejo de errores; preservar render local como alternativa.
6. Endurecer seguridad antes de uso público: autenticación por usuario o proxy seguro, cuotas, límites de archivos, expiración/limpieza de trabajos, validación de origen, manejo de concurrencia y control de costos.
7. Validar exportaciones, FPS, duración, resolución, reproducción, errores de red y disponibilidad del resultado con el PC apagado.
8. Revisar cambios mediante PR y pruebas antes de fusionar a `main`.

## Riesgos y precauciones
- Nunca incluir `API_TOKEN`, `RUNNER_TOKEN` ni `GITHUB_TOKEN` en el bundle público de React, en commits o en documentación.
- CORS no sustituye autenticación.
- La persistencia del estado de trabajo en manifiestos R2 requiere control de concurrencia para evitar escrituras simultáneas conflictivas.
- El éxito de los workflows FFmpeg existentes **no prueba** el circuito nuevo Cloudflare–GitHub–R2.
- El secreto `LAB_RUNNER_TOKEN` puede estar almacenado correctamente sin coincidir con el secreto de Cloudflare: verificarlo con prueba autenticada, nunca exponiendo valores.

## Criterios de aceptación
- Crear trabajo autorizado y subir fotogramas PNG válidos.
- Lanzar un workflow GitHub Actions desde el Worker con el token configurado.
- Generar MP4 H.264 válido con dimensiones y duración esperadas.
- Descargar el resultado desde R2 por API autorizada.
- Reportar errores sin dejar trabajos permanentemente en ejecución.
- Confirmar que render local y workflows preexistentes no sufren regresiones.
- No fusionar ni habilitar acceso público hasta cerrar los riesgos críticos.

## Referencias operativas
- GitHub: https://github.com/ddepazos/lab
- Worker: https://lab-render-api.ddepazosdesanmartin.workers.dev
- Workflows existentes: `.github/workflows/ffmpeg-render.yml`, `.github/workflows/stage-render-input.yml`
- Próximos archivos: `.github/workflows/render-remote.yml`, `scripts/render_remote.py`

**Este archivo es documentación de estado, no una declaración de integración terminada.**

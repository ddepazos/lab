# LAB - Infraestructura Cloudflare y renderizado remoto

**Fecha del diagnóstico:** 2026-10-23
**Versión documental:** 1.0
**Proyecto:** LAB / Generative Design Studio
**Repositorio:** https://github.com/ddepazos/lab
**Estado:** diagnóstico verificado; renderizado remoto pendiente.

## 1. Infraestructura verificada

- Wrangler 4.152.0 autenticado mediante OAuth.
- Cuenta Cloudflare accesible desde PowerShell.
- Cloudflare Pages: `diegopazos.pages.dev`.
- Repositorio conectado a Pages: `ddepazos/portafolios2026`.
- D1: ninguna base de datos listada.
- Workers independientes: ninguno visible en las capturas revisadas.
- API manual de Cloudflare: error de autenticación 9106.

## 2. Arquitectura propuesta

LAB React / Vite
    |
    v
Cloudflare Worker - API de renderizado
    |
    v
Gestor de trabajos
    |
    +-- D1: estados y metadatos (opcional)
    |
    +-- R2: archivos y resultados (opcional)
    |
    v
Motor remoto compatible con FFmpeg
    |
    v
Resultado MP4 / PNG / SVG

Esta arquitectura todavía no está desplegada.

## 3. Requisitos

1. Preservar el renderizado local existente.
2. Mantener el portafolio separado de LAB.
3. No desplegar infraestructura remota sin validar compatibilidad.
4. Verificar costos, límites y disponibilidad del motor remoto.
5. Probar el procesamiento remoto antes de integrarlo a producción.

## 4. Próximos pasos

- Auditar el motor de renderizado actual.
- Definir el contrato de la API.
- Seleccionar infraestructura de procesamiento FFmpeg.
- Implementar pruebas aisladas.
- Conectar el estado de trabajos y el almacenamiento.
- Integrar una opción de renderizado remoto en LAB.
- Documentar resultados y actualizar Figma.

## 5. Historial

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-10-23 | 1.0 | Diagnóstico Cloudflare y propuesta de renderizado remoto |

## 6. Estado de publicación

Este documento registra decisiones técnicas.
Su presencia en GitHub no implica que la API, D1, R2 o el motor remoto estén desplegados.

# LAB Web — Informe de auditoría funcional y mejoras (27-10-2026)

## Método y alcance
- Fuentes: código de `main`, tests Vitest y estado de GitHub Actions.
- Se identificó una pestaña LAB abierta en navegador conectado, pero `get_tab_context` falló por sesión cerrada. No se pudo controlar ni inspeccionar interactivamente la página. **No se realizó scraping funcional exhaustivo ni clics reales.**
- Último commit funcional probado en CI: `25ace81b` (LAB Web CI, React UI checks y Browser Smoke Test: success).
- Este informe distingue pruebas existentes de riesgos inferidos por lectura de código.

## Matriz de comprobación
| Función | Evidencia disponible | Resultado y límite |
|---|---|---|
| Build React/TypeScript | Web CI verde | Aprobado por CI; no equivale a interacción manual |
| UI y navegación | React UI checks verde | Aprobado por CI; cobertura de casos no exhaustiva |
| Smoke de navegador | Browser Smoke Test verde | Aprobado por CI; no valida todos los controles |
| Reloj de animación | `playback-clock.ts` sin recorte de 100 ms | Corrección integrada, falta medir FPS en navegador |
| Keyframes y transformaciones | `animation/render.test.ts`, `functional-regression.test.ts` | Pruebas de escala, opacidad, rotación, interpolación, extremos y no mutación |
| Capas | `state/studio.test.ts` | Pruebas de selección, borrado, bloqueo, reordenación e imagen importada |
| PNG importado | Test de centrado de imagen | No prueba arrastre real, decodificación ni render visual |
| Proyección isométrica y oblicua | `Layer.projection`, `composeSVG`, `LayersPanel` | Código integrado y CI verde; falta prueba de comparación visual |
| Generadores y Gestalt | Código de composición presente | No verificados visualmente uno por uno |
| Texto | `composeFrame` excluye texto de previewSvg e incluye en exportSvg | Riesgo de divergencia de previsualización/exportación; comprobar overlay de texto |
| Lienzo 3D | Three.js disponible | Sin medición de FPS o prueba funcional específica en esta auditoría |
| Exportación MP4 | Flujo separado | No se comparó fotograma a fotograma con preview |
| Tauri/Desktop | Fuera de alcance | Sin intervención |

## Cuellos de botella y prioridades
**P0 — Medir y corregir preview:** `TimelinePanel` llama `setTime`; `App` ejecuta `composeFrame` en `useMemo` dependiente de `time`; `composeFrame` produce tanto `previewSvg` como `exportSvg` en cada actualización. El doble trabajo es un candidato concreto de sobrecarga, no una causa demostrada sin profiling. Proponer composición diferida de exportación y caché por capa, conservando resultados.

**P0 — Consistencia preview/MP4:** prueba de comparación para tiempo 0, mitad y fin con igual semilla, capas, proyección y tamaño. Revisar texto en overlay y capas 3D.

**P1 — Matriz visual automatizada:** Playwright: controles de cada generador, presets, Gestalt, cambio de capa, bloqueo, importación PNG, panel compacto, timeline zoom/scroll, 2D/3D, proyecciones, reproducción, exportaciones. Capturas y errores de consola; documentar exactamente qué pruebas pasan.

**P1 — Proyección espacial:** tests de `composeSVG` para `flat/isometric/oblique` y regresión de capas antiguas; la perspectiva cónica y extrusión no están implementadas.

**P2 — Rendimiento:** medir tiempo de composición, frame budget, long tasks y memoria en hardware de gama baja antes de introducir Worker, OffscreenCanvas o bibliotecas nuevas.

## Reglas
- Sin ramas nuevas; no tocar lápiz ni lienzos estables; preservar main, FFmpeg, render remoto y Tauri.
- No declarar una herramienta funcional solo porque CI esté verde.
- Implementar mejoras incrementales y añadir pruebas antes de ampliar efectos.

## Implementación posterior — optimización de composición
- `composeFrame(..., includeExport=false)` permite generar solo el SVG de vista previa.
- `App.tsx` evita construir `exportSvg` en cada actualización de tiempo; `buildExportSvg()` genera el SVG completo únicamente al pulsar exportar SVG o PNG.
- La llamada anterior a `composeFrame` conserva su contrato predeterminado (`includeExport=true`).
- Nuevo test `src/core/compose-frame.test.ts` para modo preview, exportación explícita y compatibilidad.
- **Pendiente:** verificar CI de los nuevos commits, comparar salida SVG/PNG y medir FPS reales. Esta optimización no garantiza por sí sola fluidez ni corrige diferencias de 3D/texto con MP4.

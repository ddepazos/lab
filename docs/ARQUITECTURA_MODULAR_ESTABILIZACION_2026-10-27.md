# LAB Web — arquitectura modular y estabilización
Fecha: 2026-10-27. Rama: main. No crear ramas nuevas.

## Problema confirmado
Los cambios de CSS del editor provocaron conflictos de proporción del lienzo; Playwright detectó un lienzo horizontal de proporción visual 2.133 en vez de 1.778. React compilaba correctamente aunque la prueba funcional fallaba. No confundir compilación con estabilidad visual. El render SVG completo se recalcula con el tiempo de animación; una posible sobrecarga está pendiente de medición, no confirmada.

## Cambios realizados
- Se consolidaron reglas CSS de viewport, evitando forzar 1:1 para documentos horizontales y verticales.
- El artboard usa la proporción del documento para limitar su ancho en la vista previa; el tamaño del archivo/exportación no cambia.
- Se evitó que Flexbox reduzca la altura del artboard independientemente de su ancho (`flex:0 0 auto`).
- Playwright comprueba proporciones y dimensiones de 800×800, 1600×900, 900×1600 y 794×1123.
- Se extrajo el cálculo puro de reloj y FPS a `src/animation/playback-clock.ts`; `TimelinePanel.tsx` lo consume. No se modifica el formato de la línea de tiempo ni las pistas.

## Arquitectura incremental propuesta
- **React**: UI, paneles, interacción y composición; no ejecuta trabajos remotos por cada fotograma.
- **Zustand**: estado serializable del proyecto; una sola fuente de verdad.
- **Animation core**: reloj puro, interpolación y tracks; independiente del DOM.
- **2D**: generadores SVG actuales; posterior separación de geometría estática/dinámica y medición de tiempos.
- **3D**: Three.js independiente de la actualización de la línea de tiempo 2D.
- **Export**: SVG/PNG local y FFmpeg remoto con adaptadores explícitos; falla remota no bloquea edición local.
- **Workers**: solo para cálculos CPU intensivos tras medición; no manipulan DOM.
- **Presets**: futura migración a datos versionados, sin perder controles existentes.

## Contrato de no regresión
1. Mantener lápiz, DrawingCanvas, Konva y lienzos 2D/3D funcionales.
2. Preservar tamaños reales y proporciones de lienzo en preview/exportación.
3. Conservar presets, pistas y parámetros compatibles con el generador.
4. No eliminar herramientas, commits, ramas, ni modificar Tauri/Cloudflare sin validación.
5. No declarar estable sin CI Web + UI + Browser Smoke verdes en el **mismo SHA**.
6. Reproducción sostenida y pruebas de carga pendientes: medir generación SVG, tiempos de frame, memoria y scrub con retículas densas.
7. Separar cambios por responsabilidad, comparar cada commit y detener nuevas modificaciones si falla Playwright.

## Pendiente
Verificar los workflows del último commit; inspeccionar fallos y corregir solo causas verificadas. Validar visualmente 16:9, 9:16, A4 y personalización; probar reproducción continua y exportación antes de declarar LAB estable. No se ha realizado refactor total ni migración a Web Workers.


## Verificación de publicación Cloudflare Pages (27-10-2026)
- Proyecto: `lab-studio`; dominio: https://lab-studio-asl.pages.dev/
- **Confirmado por API de Cloudflare:** despliegue de producción `b323437be401293a7a4888a5a91c45fbe901a064` con estado `success`; URL inmutable https://6616ed9e.lab-studio-asl.pages.dev
- Los commits de código `7b08194d` (ajuste Flexbox), `362786a9` (reloj independiente) y `74332a16` (TimelinePanel usa el reloj) también figuran como despliegues de producción exitosos.
- GitHub Actions para `74332a16`: Web CI **success**, React UI checks **success**, Browser Smoke Test **failure**. No afirmar que el navegador funciona sin errores ni que la regresión del lienzo quedó resuelta.
- La documentación en `docs/` no se presenta como controles nuevos en la interfaz. La compartimentación del reloj es un cambio interno: no se espera un botón o panel nuevo.
- **Siguiente paso obligatorio:** inspeccionar el fallo de Browser Smoke Test y corregirlo con prueba de regresión antes de mover más funciones. Mantener lápiz, lienzos y 3D intactos.

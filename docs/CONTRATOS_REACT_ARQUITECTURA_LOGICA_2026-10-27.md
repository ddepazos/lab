# LAB React — arquitectura lógica por contratos
Fecha: 2026-10-27. Aplicación Web; conservar main y el comportamiento actual.

## Regla arquitectónica
La dirección de dependencia es `UI React → core puro → motores existentes`. Los motores no importan React, Zustand ni componentes visuales. Zustand mantiene el documento y las capas; la UI consume datos, no reimplementa cálculos.

## Límites implementados
- `src/animation/playback-clock.ts`: tiempo de reproducción y frecuencia de actualización sin dependencias React.
- `src/core/compose-frame.ts`: entrada `layers, timeline, time, doc`; salida `previewSvg, exportSvg`. Reutiliza `animatedLayers` y `composeSVG` existentes, sin alterar la generación. La vista previa excluye texto porque se representa en una capa superpuesta; la exportación lo incluye.
- `src/app/App.tsx`: consume `composeFrame`; deja de coordinar directamente interpolación de pistas y composición SVG.
- `src/state/studio.ts`: Zustand sigue siendo fuente de verdad. No introducir un segundo estado de documento.

## Invariantes
1. Una sola app React; sin iframes, microservicios ni nuevos servidores para separar carpetas.
2. No alterar lápiz, Konva, lienzos, escena 3D ni exportadores.
3. Igual entrada debe producir igual SVG que antes del refactor.
4. Los presets, formatos y pistas existentes no se eliminan.
5. No duplicar cálculos o estados como solución permanente; medir antes de optimizar.
6. Cada cambio requiere Web CI, React UI checks y Browser Smoke Test aprobados sobre el mismo commit.

## Migración gradual siguiente
1. Resolver el fallo actual de Playwright de proporción de lienzo, sin ocultar la prueba.
2. Extraer validación de documento y formatos a funciones puras compartidas por controles, vista previa y exportación.
3. Extraer el cálculo de pistas y su indexación por capa del render, manteniendo las mismas interpolaciones.
4. Crear contratos para exportadores local/remoto y manejo explícito de fallos.
5. Medir generación SVG y playback sostenido antes de decidir si introducir Workers o caché.
6. Una vez estable Web, reutilizar contratos en Tauri Desktop.

## Estado de validación
La separación de composición fue aplicada en main. Su compilación, prueba de navegador y despliegue **deben verificarse**; no declarar estabilidad por el mero commit. La prueba de proporciones del lienzo ya había fallado en commits anteriores.

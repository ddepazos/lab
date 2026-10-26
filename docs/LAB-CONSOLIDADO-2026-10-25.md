# LAB — Consolidado de solicitudes y limpieza segura

## Fuente de verdad
- Aplicación React: `react-app/`, rama `main`, repositorio `ddepazos/lab`.
- Cloudflare Pages `lab-studio`: raíz de compilación `react-app`, comando `npm run build`, salida `dist`.
- `index.html` de la raíz: implementación HTML/JS anterior. **No es la entrada de compilación de Cloudflare**. Mantener mientras se revisa GitHub Pages y cualquier dependencia de su renderizado local.

## Solicitudes consolidadas
1. Interfaz oscura y minimalista; maximizar lienzo sin retirar funciones.
2. Compactar biblioteca de módulos y panel de propiedades; paneles plegables y adaptables.
3. Compactar controles del lápiz (dibujar, borrar, color, grosor, deshacer, limpiar). CSS implementado en `react-app/src/app/styles.css`; lógica intacta.
4. Organizar animaciones, presets y línea de tiempo para reducir desplazamiento vertical.
5. Mantener intactos el lápiz y los lienzos 2D/3D funcionales, capas, controles, exportación SVG/PNG/video, FFmpeg, WebGL, Tauri y renderizado remoto.
6. Consolidar en `main` sin crear ramas adicionales; validar `npm run build`, pruebas y despliegue antes de eliminar código antiguo.

## Inventario contrastado
- `react-app/src/main.tsx` importa `./app/App` y `./app/styles.css`.
- `react-app/src/app/App.tsx` contiene los controles reales del lápiz.
- `react-app/src/state/studio.ts` gestiona estado con Zustand.
- `react-app/package.json` declara React, Vite, TypeScript, Zustand, Three.js, Konva, React-Konva y Mediabunny.
- La raíz contiene `index.html` independiente y documentación histórica.

## Candidatos a limpieza — NO borrar todavía
- `index.html` de raíz y archivos asociados: comprobar primero publicación GitHub Pages, rutas y funciones exclusivas del motor local.
- Ramas antiguas: verificar merges, workflows, PR y commits exclusivos antes de eliminarlas.
- Tests/workflows: no eliminar sin verificar si protegen exportación, compilación o publicación.

## Validación pendiente
- `npm run build` y pruebas automatizadas tras el cambio de estilos.
- Confirmar despliegue de Cloudflare y apariencia del lápiz en escritorio/móvil.
- Inventario completo de archivos y referencias antes de cualquier borrado.

## Actualización — rescate del HTML heredado (25 octubre 2026)

**Decisión:** `react-app/` es la fuente de verdad para el producto principal. `index.html` de raíz es una implementación independiente histórica; no eliminar hasta comprobar equivalencia funcional y desvincular el sitio GitHub Pages `https://ddepazos.github.io/lab/`.

### Inventario de funciones identificadas en `index.html`

| Capacidad heredada | Contraste con React | Acción |
|---|---|---|
| Generador de ondas, amplitud, frecuencia, decaimiento, ruido y distorsión | `react-app/src/generators/waves.ts` ya implementa parámetros análogos | Comparar valores, estilos y resultados SVG; migrar solo diferencias útiles |
| Render SVG y rasterización | React dispone de `generators/composite.ts` y exportadores SVG/PNG | Pruebas de equivalencia y rendimiento |
| Captura de fotogramas y grabación con `MediaRecorder` | React tiene exportación de video; no se ha probado equivalencia | Conservar como referencia y comparar con Mediabunny/FFmpeg |
| Codificador `gifEncode` GIF89a | No se confirmó equivalente en React | Evaluar integración modular y pruebas de reproducción |
| Three.js `OrbitControls`, `GLTFLoader` | React ya utiliza ambos en `editors/3d/Scene3D.tsx` | Evitar duplicación |
| Three.js `TransformControls` | No se confirmó en el editor React | Integrar manipulación visual tras validar compatibilidad |
| Historial `undoStack`/`redoStack` (hasta 60 estados) | Zustand gestiona estado; equivalencia de historial no comprobada | Implementar historial centralizado si falta |
| Capas, mezcla y propiedades | React tiene modelo `document/layers.ts` | Conservar el modelo React |
| Semillas y generación geométrica | React tiene generadores modulares | Comparar algoritmos antes de migrar |

### Animaciones y defectos observados

- React ya recibió controles de pistas 2D para rotación, X, Y, escala y opacidad.
- Se añadieron propiedades de retícula `mix` (Shape Mix) y `gridRotation` (rotación interna) en `animation/timeline.ts`, `animation/render.ts` y `components/TimelinePanel.tsx`.
- La reproducción del fondo 2D fue reportada con parpadeo al combinarse con objeto 3D. Se aplicaron límites de escala y una reducción de actualizaciones de vista previa, **pero no existe todavía prueba funcional que confirme la eliminación del parpadeo**.
- Los movimientos 3D se ampliaron con rebote, trayectoria en ocho, zoom pulsante y vibración; falta validación de cada preset y de exportación.
- Objetivo adicional: retículas con animación de módulos individuales y patrones SVG personalizados importados desde Illustrator. **No implementado todavía.**

### Plan de rescate y retiro

1. Validar compilación, reproducción 2D/3D y exportaciones de React.
2. Contrastar cada algoritmo heredado con su equivalente React; recuperar únicamente capacidades faltantes.
3. Añadir pruebas para GIF, video, controles 3D, historial y patrones SVG si se implementan.
4. Verificar y actualizar publicación GitHub Pages y enlaces dependientes de `index.html`.
5. Eliminar el HTML antiguo y sus dependencias **solo después** de confirmar que no quedan funciones exclusivas ni rutas activas.

### Registro de cambios

- Rediseño de interfaz React y barra compacta: commits `c153b0a`, `eb1fb905`.
- Pistas 2D y presets 3D: `9ce2e60`, `f9f9c28`.
- Nuevas pistas de retícula y optimización de reproducción: `5fc8eb4`, `cfd970b`, `e2e19f7`; el último despliegue de esta serie se verificó exitoso.
- README actualizado para reconocer React como aplicación principal: `6a247bc`.

**Estado de limpieza:** no se han eliminado archivos en esta fase. Mantener `main` sin ramas nuevas y preservar motor local, FFmpeg, Tauri y render remoto.

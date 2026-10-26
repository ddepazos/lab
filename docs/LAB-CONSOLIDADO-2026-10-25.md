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

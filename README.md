# LAB — Generative Design Studio

Editor creativo experimental de composición generativa **2D y 3D**, con sistemas modulares, retículas y principios de percepción visual Gestalt.

**Aplicación principal (React):** https://lab-studio-asl.pages.dev/  
**Sitio histórico (HTML):** https://ddepazos.github.io/lab/  
**Diseño UX/UI en Figma:** https://www.figma.com/design/0ZvF62mYgJYJBfwriEkzMD  
**Repositorio:** https://github.com/ddepazos/lab

> **Estado actualizado (octubre 2026):** la aplicación principal está en `react-app/` (React + TypeScript + Vite) y se publica en https://lab-studio-asl.pages.dev/ desde `main`. El `index.html` de la raíz sigue sirviendo a la URL histórica de GitHub Pages y contiene capacidades heredadas que requieren contraste antes de retirarlo. Las pantallas de Figma son referencias de diseño.

## Objetivo

Construir un entorno de diseño generativo donde cada objeto sea seleccionable, transformable, editable por propiedades, organizable en capas y exportable en formatos comprobados. Se priorizan estabilidad, accesibilidad y rendimiento antes de ampliar funcionalidades.

## Módulos del producto

| Módulo | Funciones previstas |
| --- | --- |
| Editor 2D | SVG, selección, formas, texto, imágenes, transformaciones, capas y grupos |
| Generadores | Signal Decay, mosaicos, tramas, espirales, **módulos**, **retículas**, flujo orgánico |
| Gestalt | Proximidad, semejanza, continuidad y cierre como reglas paramétricas sobre elementos |
| Editor 3D | Three.js, cámara, luces, materiales, objetos, jerarquía, GLB/GLTF |
| Animación | Línea de tiempo, pistas, fotogramas clave, interpolación y vista previa |
| Exportación | SVG, PNG, GIF, WebM/MP4 según compatibilidad, GLB; validación de archivos |
| Proyecto | Guardar/cargar, historial deshacer/rehacer, preferencias y recuperación |

## Diseño de interfaz

- **Barra superior:** proyecto, guardar, deshacer/rehacer, modo 2D/3D, previsualizar y exportar.
- **Panel izquierdo:** herramientas, generadores, presets y biblioteca.
- **Lienzo central:** selección, manipulación, guías, zoom y navegación.
- **Panel derecho:** propiedades contextuales, geometría, apariencia y Gestalt.
- **Panel inferior:** capas/jerarquía y línea de tiempo intercambiables.
- **Submenús Gestalt:** principio activo, intensidad, alcance, distancia/agrupación, similitud de atributos, trayectoria y cierre.

## Arquitectura

Consultar [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para responsabilidades, estructura de carpetas, flujos de datos, etapas de migración y criterios de calidad.

## Tecnología objetivo (propuesta)

- **Vite + TypeScript + React** para interfaz y módulos.
- **Zustand** para estado de proyecto, selección y paneles; historial basado en comandos.
- **Three.js** para escena 3D y controles.
- **Fabric.js** como candidato para manipulación 2D; integrar solo tras probar compatibilidad con el SVG generativo existente.
- **GSAP** para animaciones; **gifenc** para GIF; **Mediabunny/WebCodecs** como opción de video compatible.
- **Vitest + Playwright** para pruebas unitarias y de navegador.

Estas dependencias **aún no se han migrado ni instalado** como parte de esta documentación.

## Ramas y desarrollo

- `main`: sitio actual publicado por GitHub Pages; conservarlo estable.
- `develop`: documentación, prototipos de arquitectura y futura migración.
- Ramas `feature/*`: cambios aislados con pruebas antes de integrar.

**No se requiere otra cuenta de GitHub ni otro repositorio.** Se reutiliza `ddepazos/lab`.

## Primeros hitos

1. Documentar arquitectura, pantallas y contratos de módulos.
2. Crear pruebas de humo para interfaz, navegación y exportaciones actuales.
3. Preparar Vite/TypeScript en `develop` sin sustituir el sitio público.
4. Migrar generadores y reglas Gestalt con pruebas de salida SVG.
5. Integrar selección/capas e historial 2D/3D.
6. Validar exportación de GIF/video con decodificación y reproducción real.
7. Publicar cambios en `main` solo después de revisión.

## Límites del alcance

No se incluye generación mediante IA ni integración con la API de Hyper3D en esta etapa.

## Licencia

Pendiente de definir. La publicación del código en GitHub no implica automáticamente una licencia de reutilización.

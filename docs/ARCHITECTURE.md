# Arquitectura objetivo de LAB

**Estado:** propuesta técnica v0.1, octubre de 2026. No representa una migración terminada.  
**Referencia visual:** [Figma LAB](https://www.figma.com/design/0ZvF62mYgJYJBfwriEkzMD).

## Principios

1. Un **modelo de documento** independiente del DOM, SVG, Canvas o Three.js.
2. Dos adaptadores de renderizado (2D/3D), coordinados por estado y comandos comunes.
3. Los generadores producen objetos/escenas deterministas a partir de parámetros y semilla.
4. Gestalt opera sobre datos geométricos y relaciones, no solo como filtros visuales globales.
5. La exportación usa instantáneas reproducibles del documento, no depende del estado visible de los paneles.
6. Compatibilidad gradual: conservar `index.html` operativo mientras se migra y prueba.

## Mapa de pantallas y navegación

| Pantalla | Submenús | Panel contextual |
| --- | --- | --- |
| Editor 2D | Seleccionar, formas, texto, imágenes, generadores | Transformar, apariencia, Gestalt |
| Módulos | Familia, matriz, variaciones, distribución, presets | Filas, columnas, escala, separación, rotación, semilla |
| Retículas | Ortogonal, radial, modular, deformada | Filas, columnas, márgenes, medianiles, ángulo, distorsión |
| Editor 3D | Objetos, jerarquía, materiales, luces, cámara | Posición XYZ, rotación, escala, PBR, visibilidad |
| Animación | Pistas, fotogramas, interpolación, reproducción | Duración, FPS, bucle, propiedades animadas |
| Exportación | Imagen, vector, animación, escena 3D | Formato, dimensiones, calidad, compatibilidad y errores |

## Modelo de documento (contrato conceptual)

```ts
type DocumentModel = {
  id: string;
  version: number;
  width: number;
  height: number;
  seed: number;
  nodes: SceneNode[];
  timeline: Timeline;
};

type SceneNode = {
  id: string;
  type: 'shape' | 'text' | 'image' | 'generator' | 'group' | 'mesh3d';
  parentId: string | null;
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: { x: number; y: number; z?: number; rotation: number; scaleX: number; scaleY: number; scaleZ?: number };
  properties: Record<string, unknown>;
};

type GeneratorSpec = {
  kind: 'waves' | 'mosaic' | 'dots' | 'spiral' | 'modules' | 'grid' | 'flow';
  seed: number;
  parameters: Record<string, number | string | boolean>;
  gestalt?: GestaltRule[];
};

type GestaltRule = {
  principle: 'proximity' | 'similarity' | 'continuity' | 'closure';
  strength: number; // 0..1
  scope: 'selection' | 'group' | 'generator';
  parameters: Record<string, number | string>;
};
```

**Semántica Gestalt:**
- **Proximidad:** modifica distancia, agrupamiento y clústeres de elementos.
- **Semejanza:** controla correspondencias de forma, tamaño, color, orientación o patrón.
- **Continuidad:** organiza trayectorias, tangencias y alineación.
- **Cierre:** controla segmentos ausentes, contornos sugeridos y cierre de celdas.
- Las reglas se aplican de manera **determinista** y pueden deshacerse como comandos.

## Estructura objetivo (no creada todavía)

```text
lab/
├── README.md
├── docs/
│   └── ARCHITECTURE.md
├── src/
│   ├── app/              # Shell, rutas, layouts
│   ├── components/       # Botones, sliders, campos, menús, paneles
│   ├── document/         # Modelo, serialización, migraciones
│   ├── state/            # Selección, historial, comandos
│   ├── editors/
│   │   ├── 2d/           # Adaptador SVG/Canvas
│   │   └── 3d/           # Three.js, escena, controles
│   ├── generators/       # Siete familias generativas
│   ├── gestalt/          # Motor de reglas perceptuales
│   ├── animation/        # Timeline, pistas, keyframes
│   ├── export/           # SVG, PNG, GIF, video, GLB
│   └── styles/           # Tokens y estilos coherentes con Figma
├── tests/
│   ├── unit/
│   └── e2e/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Flujo de datos

```text
Acción UI → Comando validado → DocumentModel/Store
                             ├→ Historial undo/redo
                             ├→ Generadores → Gestalt → Adaptador 2D
                             ├→ Jerarquía de escena → Adaptador 3D
                             ├→ Timeline → evaluación temporal
                             └→ Instantánea → exportador → validación → descarga
```

## Exportaciones

- **SVG:** serialización y parseo válidos, viewBox correcto, capas visibles.
- **PNG:** dimensiones y transparencia coherentes, decodificación comprobada.
- **GIF:** frames y duración correctos; decodificar el resultado generado.
- **Video:** detectar `MediaRecorder`/`WebCodecs`, códecs y contenedores soportados; ofrecer alternativa clara si MP4 no está disponible. Verificar duración y reproducción.
- **GLB:** geometrías/materiales exportables; validar el archivo con importación de prueba.
- Evitar prometer formatos que el navegador no soporte.

## Diseño y accesibilidad

- Conservar base oscura y jerarquía de LAB actual: `#111111`, `#191919`, `#242424`, `#383838`; texto claro y tipografía sans.
- Paneles redimensionables, estados hover/focus/disabled, etiquetas visibles, navegación con teclado.
- Adaptación responsive sin solapamientos; accesibilidad de contraste y estados.
- Figma es la fuente de verdad de pantallas y componentes, el repositorio la fuente de verdad del comportamiento.

## Plan de migración seguro

**Etapa A — Diagnóstico:** inventario de controles y errores actuales; pruebas base con Playwright.  
**Etapa B — Infraestructura:** Vite/TypeScript, build GitHub Pages, CI; conservar interfaz y comportamiento.  
**Etapa C — Dominio:** DocumentModel, comandos, historial, persistencia JSON y migraciones.  
**Etapa D — Motores:** separar SVG/Canvas y Three.js; integrar módulos y retículas paramétricas.  
**Etapa E — Gestalt:** implementar reglas de geometría y pruebas visuales deterministas.  
**Etapa F — Animación/exportación:** timeline y pipelines con pruebas reales de archivos.  
**Etapa G — Integración:** accesibilidad, rendimiento, regresión y publicación controlada.

## Criterios de aceptación iniciales

- Ningún control visible sin acción, feedback o estado disabled.
- Selección/capas/propiedades sincronizadas y deshacer/rehacer reversible.
- Módulos y retículas responden a parámetros y Gestalt sin alterar otros generadores.
- Exportaciones verificadas con apertura o decodificación, no solo por tamaño de archivo.
- `npm run build`, pruebas unitarias y pruebas E2E pasan antes de integrar a `main`.
- GitHub Pages continúa publicando una versión operativa.
- Ninguna integración IA/Hyper3D en este alcance.

## Diagramas editables en FigJam

Los tres diagramas —arquitectura modular, mapa de navegación y flujo de edición/exportación— están en el tablero [LAB · Arquitectura y flujos](https://www.figma.com/board/PiiaIoGxas8qoTmspXP7SB).

## Decisión tecnológica preliminar

- **React + TypeScript + Vite** para la interfaz; **Zustand** para estado y comandos de historial.
- **Fabric.js** como primer candidato para edición 2D y salida SVG; evaluar **Konva** en una prueba comparativa de interacción antes de fijar el motor definitivo.
- **Three.js** existente para 3D; evaluar **React Three Fiber** en un prototipo aislado, sin reescribir la escena hasta validar controles.
- **gifenc** para GIF; **Mediabunny/WebCodecs** para video con detección de compatibilidad y alternativas.
- **Vitest y Playwright** para regresión y pruebas de archivos exportados.
- **Python (NumPy, SciPy, Shapely, Pillow)** solo para experimentación geométrica, procesamiento por lotes o servicios futuros. No es necesario un backend para el MVP.

**Estado:** decisiones propuestas y diagramas de diseño; ninguna de estas librerías nuevas está integrada por el hecho de figurar aquí.

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

## Biblioteca de módulos — referencia visual moza yk.design (octubre 2026)

La referencia compartida muestra un catálogo de teselas geométricas seleccionables (cuadrados, círculos, triángulos, anillos, cruces, pétalos, rosetas, diagonales, dameros), mezcla de formas y reproducción por fotogramas. Adoptar el principio de **variedad combinatoria**, sin replicar la interfaz ni los diseños de terceros.

### Familias propuestas

1. **Geométricos básicos:** cuadrado, disco, triángulo, semicírculo, cuarto de círculo, anillo, barra, diagonal.
2. **Teselaciones:** Truchet, damero, zigzag, escaleras, cuadrantes y continuidad de bordes.
3. **Radiales:** cruces, estrellas, pétalos, rosetas, anillos concéntricos, simetrías de orden N.
4. **Orgánicos:** células, manchas, curvas Bézier, arcos fluidos y variantes estocásticas.
5. **Tipográficos:** glifos abstractos, trazos y módulos basados en letras (fase posterior).
6. **Personalizados:** importar SVG, normalizar viewBox y usar como tesela, con validación.

### Controles de biblioteca y composición

- Galería con miniaturas SVG vectoriales, búsqueda, filtros por familia, favoritos y selección múltiple.
- Mezcla de módulos con pesos configurables (0–100 %), semilla reproducible, aleatorización y presets.
- Matriz de filas/columnas, tamaño de celda, márgenes, medianiles, alineación, rotación (0/90/180/270 o libre), reflejo, escala, opacidad y paleta.
- Reglas de vecindad para conectar trazos entre celdas, repetición por simetría y bloqueo de teselas.
- Gestalt paramétrica: proximidad (agrupamiento/espaciado), semejanza (forma/color/tamaño), continuidad (conectores entre celdas) y cierre (contornos incompletos).
- Controles de interacción: generar, regenerar con semilla, guardar preset, editar módulo individual, deshacer/rehacer, exportar SVG/PNG y animar variaciones.

### Modelo sugerido

```ts
type ModuleDefinition = {
  id: string;
  family: 'basic' | 'tessellation' | 'radial' | 'organic' | 'typographic' | 'custom';
  label: string;
  geometry: string; // SVG path or normalized geometry reference
  connectionPoints?: Array<{ edge: 'top' | 'right' | 'bottom' | 'left'; offset: number }>;
  allowedRotations: number[];
  mirrorable: boolean;
};

type ModuleMix = {
  moduleId: string;
  weight: number;
  enabled: boolean;
};
```

**Implementación:** construir un registro declarativo de módulos y miniaturas desde una sola definición geométrica; el generador y el exportador deben reutilizar esa geometría para evitar divergencias entre vista previa y SVG. La galería y sus controles se diseñarán primero en Figma.


## Bitácora — 26 de octubre de 2026

### Alcance y evidencia
- Aplicación canónica: `react-app/` (React, TypeScript, Vite); publicación indicada en README: `https://lab-studio-asl.pages.dev/`. El HTML raíz permanece como sitio histórico.
- Commit inspeccionado en `main`: `683bf5d9f265419d427b88edd06923b855e52a24`, mensaje `fix(gestalt): prevent unrelated decorative shapes in legacy generators`.
- Diferencia verificada en `react-app/src/generators/legacy.ts`: eliminación de cinco añadidos decorativos SVG asociados a `connectedness`, `commonRegion`, `figureGround`, `closure` y `continuity`. Esta eliminación no demuestra por sí sola una implementación paramétrica sustitutiva.
- En captura de GitHub Actions se observan dos ejecuciones fallidas del commit: **LAB React UI checks #102** (aprox. 14 s) y **LAB Web CI #67** (aprox. 18 s). La página del repositorio muestra indicador de fallo en el commit.
- Consultas del conector GitHub a estados combinados y ejecuciones de workflow asociadas al commit devolvieron listas vacías; esa consulta no contradice las ejecuciones visibles, ya que la consulta de ejecuciones está limitada a runs activados por pull request.
- `react-app/package.json` confirma el script `build: tsc --noEmit && vite build` y `test: vitest run`.

### Pendientes y criterios de no regresión
1. Obtener logs de los jobs fallidos, identificar causa exacta, corregir y volver a ejecutar compilación y pruebas; **no declarar build exitoso hasta verificarlo**.
2. Contrastar controles 2D y generadores personalizados con la implementación React actual; evitar duplicar funcionalidades heredadas.
3. Verificar que los principios Gestalt actúen sobre geometría/composición existente y no agreguen decoración no relacionada.
4. Evaluar edición individual de objetos 3D, propiedades por elemento y línea de tiempo con keyframes, reproducción y exportación. Son requerimientos de producto; no se marcan como completados.
5. Validar formatos de exportación, especialmente MP4/4K, con archivos reales y sin inferir compatibilidad a partir de la UI.
6. Conservar el lápiz y los lienzos 2D/3D que el usuario declaró funcionales; no alterar los motores locales/remotos, FFmpeg, Tauri ni la publicación sin pruebas específicas.
7. Trabajar sobre `main` sin ramas nuevas, sin borrar trabajo exclusivo y evitando cambios redundantes.

### Estado de cierre de la revisión
- Documentación actualizada; **sin corrección de código, nueva compilación ni despliegue confirmados durante esta revisión**.
- Las decisiones y requisitos históricos se conservan en las secciones anteriores. No confundir propuesta, implementación y validación.

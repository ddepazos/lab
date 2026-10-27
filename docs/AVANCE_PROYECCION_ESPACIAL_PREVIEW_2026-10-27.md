# LAB Web — Proyección espacial y previsualización (27-10-2026)

## Alcance implementado
- `Layer.projection` opcional: `flat`, `isometric`, `oblique`. La ausencia del campo conserva el comportamiento previo.
- `LayersPanel` permite seleccionar la proyección en capas de patrón desbloqueadas.
- `composeSVG` aplica transformaciones SVG afines al grupo de la capa, sin alterar el generador, las pistas ni los datos de origen. La transformación se comparte entre la composición SVG usada en vista previa y exportación.
- Se conserva la continuidad espacial, los lienzos, lápiz y motores existentes; sin dependencias ni ramas nuevas.
- `playback-clock.ts` dejó de descartar el tiempo transcurrido por el límite de 100 ms (commit ecf946a5).

## Límites explícitos
- `oblique` es una proyección afín con profundidad simulada, **no perspectiva cónica con punto de fuga**.
- Las proyecciones se habilitan inicialmente en **capas de patrón**. Texto en vivo utiliza una superposición separada y no debe declararse compatible hasta unificar su representación visual y la exportación.
- La animación en vivo puede seguir sufriendo bloqueos por recomposición SVG costosa. No se ha implementado OffscreenCanvas ni Web Worker.
- La implementación requiere verificación de TypeScript, pruebas funcionales y despliegue; no se considera terminada sin esas comprobaciones.

## Próximas comprobaciones, en orden
1. Ejecutar Web CI, React UI y Browser Smoke Test en `main`.
2. Comprobar visualmente proyección plano/isométrico/oblicuo, capa bloqueada y animación simultánea.
3. Medir latencia de composición por cuadro y caída de FPS antes de introducir un motor adicional.
4. Añadir pruebas de regresión de SVG y sincronía de exportación; después extender a texto y perspectiva real mediante Three.js/cámara si se justifica.

## Criterio antirregresión
Cambios pequeños, reversibles y medibles; no reemplazar herramientas estables, no duplicar relojes, no modificar FFmpeg ni exportación 3D. Si falla CI, detener nuevas funcionalidades y corregir el fallo específico.

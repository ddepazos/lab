# LAB — Guía de estilos · Graphite (v1.0)

Fuente de verdad: `react-app/src/app/styles.css`, commit `61bc812a` (27 octubre 2026). Esta guía documenta la interfaz de LAB; **no** reemplaza los colores del arte generado ni el fondo elegido por el usuario.

## Paleta semántica

| Token | Hex | Uso |
|---|---|---|
| `--lab-bg` | `#24262B` | Fondo del editor |
| `--lab-surface` | `#2D3036` | Menús, paneles e inspector |
| `--lab-surface-raised` | `#373B42` | Botones, inputs, tarjetas y pistas |
| `--lab-surface-hover` | `#42464E` | Hover y énfasis |
| `--lab-stroke` | `#50545D` | Bordes de controles |
| `--lab-stroke-soft` | `#41454D` | Separadores |
| `--lab-ink` | `#E0DED8` | Texto principal, blanco cálido |
| `--lab-ink-muted` | `#B6B5B1` | Texto secundario |
| `--lab-ink-subtle` | `#989BA2` | Etiquetas y ayuda |
| `--lab-accent` | `#E99A65` | Foco y estado activo |
| Acción principal | `#B97750` | Botón primario; texto `#25262A` |
| Selección | `#4A403B` | Fondo de módulo seleccionado |

## Tipografía

- Familia UI: `Inter, Segoe UI, Roboto, system-ui, sans-serif`.
- Jerarquía compacta actual: títulos de panel 12px, controles 10–11px, pistas 9px, ayudas 9–10px. Ajustar según accesibilidad y densidad de pantalla.
- Usar texto `#E0DED8` sobre superficies grafito. Evitar `#FFFFFF` y `#000000` en el chrome de la interfaz.
- La identidad de LAB mantiene el acento naranja atenuado. Reservarlo para foco, selección y acciones principales, no para texto extenso.

## Componentes

1. **Panel:** fondo `surface`, borde `stroke-soft`, tipografía `ink`.
2. **Botón:** `surface-raised` + `stroke`; hover `surface-hover` + `accent`.
3. **Botón primario:** fondo `#B97750`, texto `#25262A`.
4. **Input / select / textarea:** `surface-raised`, borde `stroke`, texto `ink`.
5. **Capas y timeline:** filas `surface-raised`; capa seleccionada marcada con `accent`; respetar zoom, scroll y colapso.
6. **Foco teclado:** contorno 2px `accent` y separación 2px.

## Aplicación en portafolios

Mostrar esta paleta como **caso de estudio de LAB**: swatches con nombres y códigos, captura real del editor, tipografía y estados de controles. **No recolorear globalmente** otros proyectos del portafolio ni sus imágenes. En páginas del caso LAB puede emplearse Graphite para el marco del proyecto.

## Sincronización GitHub ↔ Figma ↔ Portafolios

- GitHub: mantener los valores semánticos CSS y esta guía como referencia técnica.
- Figma: colección `LAB / Graphite`, variables de color con los mismos nombres/hex; estilos tipográficos y ejemplos de botones/paneles.
- Portafolios: sección de sistema visual del proyecto LAB enlazada al repositorio y al prototipo.
- Al cambiar un token, actualizar código, Figma y ficha del proyecto en la misma revisión; documentar fecha y versión.

## Alcance

El cambio de tema afecta solo a los controles del editor. SVG, WebGL, lienzos 2D/3D, exportaciones y colores de las composiciones deben conservarse.

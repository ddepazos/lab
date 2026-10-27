# LAB — Compactación de interfaz modular (propuesta de implementación)

Fecha: 2026-10-27. Estado: **especificación documentada; implementación React pendiente de inspección del código fuente**.

## Requisitos

- Sustituir controles inferiores permanentes por Dock contextual de 40–48 px con accesos a Animación, Línea de tiempo, Exportación, Render remoto y Ajustes.
- Abrir y cerrar cada panel individualmente; por defecto, solo uno abierto. Panel de 240–320 px de alto inicialmente, redimensionable.
- Mantener una línea de tiempo ampliable o desacoplable, sin alterar pistas, fotogramas clave ni reproducción.
- Mover la biblioteca Cloudflare R2 dentro de Render remoto sin eliminar protección ni cambiar credenciales o flujos locales.
- Permitir modo enfoque ocultando paneles laterales. Persistir preferencias de disposición sin alterar documentos.
- **Lienzo con esquinas rectas (border-radius: 0)**; no recortar, redondear, deformar, ni cambiar dimensiones de exportación.
- El lienzo aprovecha el espacio liberado solo mediante el viewport/zoom, conservando resolución y proporción del documento.
- Reutilizar controles, estados y servicios existentes. No introducir ramas nuevas ni tocar motores 2D/3D, lápiz, render, exportación o autenticación.

## Criterios de aceptación

1. Abrir/cerrar cada sección no reinicia parámetros ni animaciones.
2. Dock cerrado deja espacio útil al visor y no se superpone al contenido.
3. Lienzo mantiene esquinas a 90° y exportación sin redondeos.
4. La línea de tiempo reproduce y exporta los mismos fotogramas antes y después del cambio.
5. Exportaciones locales SVG, PNG, MP4/WebM y flujo remoto permanecen operativos.
6. Diseño responsive, navegación por teclado y estados accesibles de botones.
7. Ejecutar build y pruebas funcionales antes de desplegar Cloudflare.

## Pendientes

Localizar componentes actuales de layout y controles en main, implementar refactor mínimo, validar y desplegar. No marcar como completado hasta verificar commit, compilación y despliegue.

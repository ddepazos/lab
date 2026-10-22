# Manual de uso — LAB Generative Design Studio
Versión: 0.1 · Octubre de 2026 · Documento basado en el código publicado; algunas operaciones están pendientes de validación automática.

## 1. Acceso
Abrir https://ddepazos.github.io/lab/ en un navegador de escritorio actualizado. La aplicación pública sigue siendo HTML/CSS/JavaScript y Three.js. La migración React se desarrolla por separado.

## 2. Espacio de trabajo
- Panel izquierdo: modos y herramientas generativas.
- Centro: lienzo y barra de acciones.
- Panel derecho: parámetros, composición, color, capas y opciones 3D según el modo.
- En pantallas pequeñas los paneles pueden apilarse.

## 3. Crear una composición 2D
1. Seleccionar un modo de generación desde el panel de modos.
2. Ajustar semilla, trazo, expansión, espaciado y otros parámetros visibles.
3. Usar **Aleatorizar** o **Nueva semilla** para explorar variaciones.
4. Elegir colores de tinta y papel.
5. Usar **Animar** para la previsualización cuando el modo lo permita.
6. Exportar con **SVG** o **PNG**. Confirmar que el archivo descargado abre correctamente.

## 4. Trabajar con imágenes
1. Utilizar el selector de imagen **photo**.
2. Ajustar **opacidad de imagen** para combinarla con el diseño.
3. Probar **Extraer paleta de imagen** para adaptar colores.
4. Usar **Quitar imagen** para retirar la referencia.
La importación y el comportamiento de imágenes en 3D aún requieren pruebas de regresión.

## 5. Capas y texto
- **+ Texto** incorpora una capa textual; editar contenido, tamaño y posición en propiedades.
- **↑ / ↓** cambian el orden de la capa seleccionada.
- **↶ / ↷** corresponden al historial de acciones de capa.
- **⌫** elimina la capa seleccionada.
- Usar nombre, opacidad y mezcla para organizar la composición.

## 6. Modo 3D
1. Pulsar **Activar vista 3D**.
2. Elegir **tipo de malla**, profundidad, rotación e inclinación.
3. Revisar **material 3D** y controles de transformación.
4. Usar **Deseleccionar** para liberar el objeto seleccionado.
5. La interfaz incluye un campo de carga de modelo 3D y controles de animación.
Los formatos GLB/GLTF aparecen en el código. Verificar compatibilidad real antes de depender de ellos para producción.

## 7. Animación y exportación
- **Animar** inicia/detiene la previsualización según el modo.
- **GIF animado** y **Grabar video** ofrecen rutas de exportación que dependen de compatibilidad del navegador.
- Se incluyen controles de formato, fotogramas por segundo, velocidad, duración, bucle y reproducción continua.
- **JSON** permite exportar información del proyecto; comprobar que el archivo es válido antes de reutilizarlo.
No se ha confirmado todavía una batería de pruebas que garantice todas las exportaciones.

## 8. Problemas frecuentes
**No aparece el lienzo:** recargar la página y revisar la consola del navegador.
**Una herramienta se cae o no arrastra:** evitar guardar cambios críticos; documentar modo, navegador y pasos para reproducirlo.
**No se importa una imagen:** probar un PNG pequeño y revisar mensajes de estado.
**La vista 3D queda en blanco:** comprobar aceleración WebGL y compatibilidad del navegador.
**No se descarga un archivo:** revisar permisos de descarga y probar otro formato.
**La versión React no muestra el editor:** usar el enlace al editor original; la carcasa React es transitoria.

## 9. Auditoría y desarrollo
En la rama `feature/lab-auditoria-scraping` se incorporaron pruebas Playwright, inventario de controles, scraping de la interfaz pública y compilación de la carcasa React mediante GitHub Actions.
Resultados esperados: `audit-results/lab-audit.json`, `lab-audit.png`, `lab-scrape.json`.
**Estado al redactar:** no se han confirmado ejecuciones aprobadas. No afirmar estabilidad total ni publicar React como sustituto hasta superar las pruebas de interacción.

## 10. Buenas prácticas
Guardar copias de los archivos exportados; trabajar por versiones; comprobar archivos después de exportar; probar en escritorio antes de una demostración pública; documentar errores con captura y pasos reproducibles.

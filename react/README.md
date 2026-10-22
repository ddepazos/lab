# LAB React — migración progresiva

Esta es una **primera carcasa React**, no una migración funcional del editor. Conserva la aplicación HTML/Three.js dentro de un iframe durante la transición para evitar eliminar herramientas. No publicar en sustitución del editor hasta completar integración nativa, pruebas de importación PNG, animaciones, controles y exportación.

`npm install && npm run dev` desde `react/`.

Para desarrollo local con el editor en otro origen, definir `VITE_LEGACY_URL` con la URL autorizada. El editor no expone todavía un contrato React de estado compartido; el iframe es temporal.

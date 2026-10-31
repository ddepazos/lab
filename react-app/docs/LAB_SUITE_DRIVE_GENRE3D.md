# LAB Creative Suite · Integración con Drive y GENRE3D

**Estado 2026-10-31:** arquitectura documentada, conexión automática a Drive pendiente.

- Drive: cuenta llabcreativesuite@gmail.com; raíz 1GpBj2CiHS_ISKaHmJJ-iJvjQxepTPaCJ.
- Diez módulos: 01_MODELOS_3D, 02_RIGGING, 03_MATERIALES, 04_RECURSOS_2D,
  05_ANIMACIONES, 06_PROYECTOS_TERMINADOS, 07_TEMPLATES,
  08_DOCUMENTACION, 09_INTERCAMBIO_ADOBE, 10_BACKUPS.
- Figma: https://www.figma.com/design/f9ZjDmfI0fLwESIGxlHmMU
- Contrato productor: ddepazos/LAB-GENRE3D, rama feat/lab-suite-drive-interop-20261031.
- Parser preliminar: src/editors/3d/genre3dBridge.ts (en esta rama).
- El parser no está conectado aún al flujo de importación de la UI.
- Preservar capas 2D, timeline, transformaciones GLB y materiales originales.
- Importación aditiva con confirmación, advertencias y reversión.
- No introducir credenciales Drive en frontend. Conector privado con autorización mínima.
- Pendiente: verificar esquema avance.json, compilar, probar ida/vuelta, conectar UI y Drive.

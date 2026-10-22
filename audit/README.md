# Auditoría LAB (rama aislada)

La aplicación publicada usa **HTML/CSS/JavaScript + Three.js**, no React todavía. La auditoría no modifica la interfaz ni las conexiones de producción.

## Ejecutar
```bash
npm install --no-save @playwright/test
npx playwright install chromium
LAB_URL=https://ddepazos.github.io/lab/ npx playwright test audit/lab.spec.cjs
```
En Windows PowerShell:
```powershell
$env:LAB_URL="https://ddepazos.github.io/lab/"
npx playwright test audit/lab.spec.cjs
```

## Salidas
`audit-results/lab-audit.json` y `audit-results/lab-audit.png`.

## Cobertura actual
Inventario de controles, errores JavaScript, consola, solicitudes fallidas y captura. **No equivale aún a verificar funcionalmente** lápiz, arrastre, animaciones, carga PNG o render 3D: requieren pruebas de interacción con expectativas sobre el estado del lienzo.

## Próximos casos de regresión
- Subir PNG y verificar persistencia en 2D y 3D.
- Cambiar `anim3d` y verificar diferencias de transformación entre cuadros.
- Manipular `meshType`, `depth3d`, `rot3d` y `tilt3d` y comprobar cambios de geometría.
- Probar interacción de selección, arrastre y herramientas de dibujo.
- Verificar exportaciones SVG/PNG y estado de errores.

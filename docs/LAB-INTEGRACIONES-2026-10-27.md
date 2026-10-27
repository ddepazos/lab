# LAB — Registro de integraciones y decisiones (26–27 octubre 2026)

## Alcance y criterios
Repositorio: `ddepazos/lab`. Rama de trabajo: `main`, sin crear ramas adicionales. Prioridad: terminar LAB Web antes de consolidar Desktop Windows. No modificar innecesariamente lápiz, lienzos 2D/3D, línea de tiempo ni motores de exportación existentes.

## Implementado y confirmado
- `react-app/src/components/RemoteRenderLibrary.tsx`: componente de biblioteca remota que permite consultar un trabajo por UUID mediante `GET /api/jobs/:id` y descargar su MP4 mediante `GET /api/jobs/:id/download`, con autorización Bearer. Incluye comprobación de UUID, estado y errores. **No** lista automáticamente trabajos, no ofrece ZIP de fotogramas ni eliminación.
- `react-app/src/app/App.tsx`: incorpora `RemoteRenderLibrary` junto al panel de exportación.
- `react-app/src/components/VideoExport.tsx`: selector de formatos locales MP4/WebM; conservar sus rutas y verificar exportación funcional por separado.
- GitHub: cambios integrados en `main` hasta commit `58bb7a025ee8bca7d47f510ec1aea1042ce83055`.
- Compilación local Windows: `npm.cmd ci` y `npm.cmd run build` completados; TypeScript + Vite, 213 módulos, build de 28,09 s. Usar `npm.cmd` en PowerShell para evitar el bloqueo de `npm.ps1` por Execution Policy.
- Advertencias observadas: paquete JavaScript de ~1,79 MB con aviso de chunk >500 kB; `npm audit` notificó 1 vulnerabilidad moderada y 2 críticas. **No ejecutar** `npm audit fix --force` sin auditoría de compatibilidad.
- Cloudflare Pages: proyecto **`lab-studio`**, dominio `https://lab-studio-asl.pages.dev/`. Despliegue manual exitoso `https://03712e70.lab-studio-asl.pages.dev`, asociado al commit `58bb7a0`. También se observó despliegue por GitHub exitoso para el mismo commit.
- Worker remoto existente: `lab-render-api.ddepazosdesanmartin.workers.dev`; R2 privado `lab-render-output`. El Worker requiere autenticación para consultas/descargas. La compilación y el despliegue **no prueban** por sí solos que una descarga autenticada funcione desde el navegador.

## Seguridad y autenticación — estado real
- La interfaz de biblioteca remota **todavía muestra** un campo «Token de acceso» (contraseña) para el token del Worker. No se ha insertado ningún secreto en el repositorio; el valor ingresado se conserva temporalmente en estado React.
- Cloudflare Zero Trust/Access quedó habilitado en la cuenta, pero una consulta de API devolvió **cero aplicaciones Access y cero zonas de dominio propio**. No se ha configurado una política de Access para LAB.
- No retirar el requisito Bearer del Worker ni incluir `API_TOKEN`/tokens de cuenta Cloudflare en JavaScript público, URLs, repositorio o localStorage. Ocultar el campo sin reemplazar el mecanismo de autorización **no** equivale a inicio de sesión seguro.

## Decisiones del producto (aún NO implementadas)
1. Mantener LAB Web y sus herramientas generales disponibles sin inicio de sesión obligatorio.
2. Reservar **solo para el administrador** el renderizado remoto/avanzado en esta etapa.
3. Experiencia deseada para el administrador: entrar al renderizado avanzado desde su equipo habitual **sin introducir tokens ni autenticarse diariamente**.
4. Implementación segura futura: autorización inicial del dispositivo/sesión y credenciales de corta duración renovables automáticamente; revocación de dispositivos. No usar token perpetuo expuesto en el navegador, IP como única identidad, ni API secreta compartida en el frontend.
5. Posponer registro y administración multiusuario hasta disponer de base de datos y capacidad de servidor adecuada.
6. Etapa futura: base de datos (D1/PostgreSQL por evaluar), cuentas, roles, propiedad de trabajos, biblioteca individual, cuotas y colas de procesamiento; servidor más potente para renderizado profundo (FFmpeg/Blender/3D/4K) disponible a usuarios autorizados.
7. Mantener separación entre editor local, API de trabajos y almacenamiento R2, para ampliar sin reescribir el motor.

## Próximas verificaciones y pendientes
- Probar en navegador el componente de biblioteca remota, CORS, consulta autenticada y descarga real MP4; registrar resultado antes de marcar el flujo como validado.
- Diseñar y probar autenticación persistente del administrador antes de retirar el campo manual de token.
- Auditar dependencias vulnerables y partición del bundle sin introducir cambios incompatibles.
- Mantener pendientes listados de trabajos, ZIP PNG y políticas de retención de R2; no borrar objetos existentes automáticamente.
- Validar los formatos locales y regresiones 2D/3D, lápiz y timeline tras cambios relevantes.

## Operación segura Windows
```powershell
Set-Location "C:\Users\nicol\lab"
git status --short
git pull --ff-only origin main
Set-Location ".\react-app"
npm.cmd ci
npm.cmd run build
# Verificar proyecto antes de desplegar:
npx.cmd wrangler pages project list
npx.cmd wrangler pages deploy .\dist --project-name lab-studio --branch main
```
No ejecutar `git pull` si existen cambios locales sin revisar. No crear ramas ni eliminar recursos R2 como parte de estas instrucciones.

**Regla documental:** distinguir siempre «propuesto», «implementado», «compilado», «desplegado» y «probado funcionalmente».

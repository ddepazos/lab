# Evaluación preliminar: Administrable.cl para LAB y otros proyectos

Fecha: 2026-10-24. Fuente comercial a revisar: https://administrable.cl/

## Decisión provisional
- **LAB:** mantener Cloudflare Pages como frontend y evaluar Administrable.cl solo como posible backend de renderizado remoto. No migrar producción sin pruebas.
- **Raki 360:** comparar Administrable con Render y Odoo según arquitectura, PostgreSQL, procesos de fondo, soporte y costos.
- **Portafolios 2026:** mantener hosting estático existente salvo necesidad real.
- **Chile bajo la piel:** evaluar límites de almacenamiento y multimedia antes de considerar hosting económico/gratuito.

## Comprobaciones obligatorias antes de contratar
1. Compatibilidad con Node.js/Python, acceso SSH, despliegues Git y contenedores.
2. Posibilidad de instalar y ejecutar FFmpeg y dependencias; restricciones de CPU/RAM, duración de procesos y jobs en cola.
3. Almacenamiento temporal y persistente, transferencia, backups y recuperación.
4. Compatibilidad con PostgreSQL, workers, API, WebSockets, CORS y tareas programadas.
5. Precios actuales, renovación, límites, SLA y soporte; confirmar directamente con el proveedor.
6. Prueba de exportación MP4 H.264 desde LAB sin depender del PC local.

## Arquitectura propuesta
Navegador / LAB React (Cloudflare Pages) -> API autenticada de renderizado -> cola de trabajos -> worker FFmpeg -> almacenamiento temporal de resultados -> descarga segura. Mantener renderizado local operativo como alternativa. No incluir secretos en frontend.

## Estado
Solo evaluación de proveedor, **sin cuenta contratada ni integración desplegada**. Los precios y capacidades comentados anteriormente son preliminares y deben verificarse con el proveedor. No implica decisión de compra.

## Seguimiento
Retomar esta nota cuando el usuario pregunte por Administrable.cl o alternativas de hosting/renderizado para LAB, Raki 360, portafolios o Chile bajo la piel.

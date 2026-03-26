# Google Apps Script

Este archivo contiene el backend base para pegar en un proyecto de Apps Script.

## Requisitos

- Crear un Spreadsheet con estas hojas:
  - `productos`
  - `inventario`
  - `pedidos`
  - `detalle_pedidos`
  - `repartidores`
  - `movimientos_stock`
  - `stock`
  - `cierres_caja`
  - `usuarios`
  - `justificaciones`
  - `configuracion`
  - `archivo_pedidos`
  - `archivo`
- Configurar `SPREADSHEET_ID` en `Project Settings > Script properties`.
- Ejecutar `setup()` una vez para crear los encabezados, sembrar usuarios/productos base y copiar hojas alias.

## Endpoints

- `GET action=health`
- `GET action=productos`
- `GET action=pedidos`
- `GET action=repartidores`
- `POST action=login`
- `POST action=pedidos`
- `POST action=aceptarPedido`
- `POST action=rechazarPedido`
- `POST action=pedidoListo`
- `POST action=asignarRepartidor`
- `POST action=enRuta`
- `POST action=entregado`
- `POST action=justificacion`
- `POST action=pdfJustificacion`
- `POST action=movimientoStock`
- `POST action=cierreCaja`

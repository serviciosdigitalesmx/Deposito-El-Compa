# Depósito El Compa

Frontend público + panel interno para depósito de cerveza.

## Estructura

- `index.html`: panel del cliente
- `admin.html`: panel interno
- `js/deposito-api.js`: cliente de API para Apps Script
- `gas/Code.gs`: backend base para Google Apps Script

## Flujo

- El cliente hace pedidos desde el panel público.
- Caja recibe solicitudes y las acepta.
- Hieleras prepara, caja confirma, repartidor entrega.
- Sheets guarda el estado final.

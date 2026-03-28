#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🍻 Depósito El Compa"
echo "Preparando estructura base en: ${ROOT_DIR}"

mkdir -p "${ROOT_DIR}/assets/images" "${ROOT_DIR}/css" "${ROOT_DIR}/js" "${ROOT_DIR}/scripts"

FILES=(
  "index.html"
  "admin.html"
  "integrador.html"
  "panel-operativo.html"
  "panel-productos.html"
  "panel-repartidores.html"
  "panel-solicitudes.html"
  "panel-tecnico.html"
  "panel-repartidor.html"
  "panel-corte.html"
  "panel-archivo.html"
  "pedidos.html"
  "js/deposito-api.js"
  "gas/Code.gs"
)

echo ""
echo "Verificando archivos principales:"
for file in "${FILES[@]}"; do
  if [[ -f "${ROOT_DIR}/${file}" ]]; then
    echo "  [OK] ${file}"
  else
    echo "  [FALTA] ${file}"
  fi
done

echo ""
echo "Limpieza recomendada del navegador:"
echo "  1. Cierra sesiones viejas del panel."
echo "  2. Borra localStorage si cambiaste de versión."
echo "  3. Recarga con caché limpio si ves UI antigua."

echo ""
echo "Listo. Este script solo prepara estructura; no genera HTML ni PINs."

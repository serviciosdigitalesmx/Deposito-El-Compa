// Deposito El Compa GAS backend
const SHEETS = {
  productos: 'productos',
  pedidos: 'pedidos',
  detallePedidos: 'detalle_pedidos',
  repartidores: 'repartidores',
  movimientosStock: 'movimientos_stock',
  cierresCaja: 'cierres_caja',
  usuarios: 'usuarios',
  justificaciones: 'justificaciones',
  configuracion: 'configuracion',
  archivoPedidos: 'archivo_pedidos',
};

function doGet(e) {
  console.log('GET recibido', JSON.stringify(e || {}));
  return jsonResponse(handleRequest('GET', e));
}

function doPost(e) {
  console.log('POST recibido', JSON.stringify(e || {}));
  return jsonResponse(handleRequest('POST', e));
}

function doPatch(e) {
  return jsonResponse(handleRequest('PATCH', e));
}

function doDelete(e) {
  return jsonResponse(handleRequest('DELETE', e));
}

function setup() {
  const ss = getSpreadsheet();
  const specs = [
    [SHEETS.productos, ['id', 'nombre', 'precio', 'stock', 'categoria', 'imagen_url', 'activo', 'updated_at']],
    [SHEETS.pedidos, ['id', 'fecha_hora', 'cliente', 'telefono', 'direccion', 'total', 'estado', 'repartidor_id', 'metodo_pago', 'updated_at', 'creado_por']],
    [SHEETS.detallePedidos, ['id', 'pedido_id', 'producto_id', 'nombre_producto', 'cantidad', 'precio_unitario', 'subtotal']],
    [SHEETS.repartidores, ['id', 'nombre', 'telefono', 'estado', 'lat', 'lng', 'pedido_activo', 'updated_at']],
    [SHEETS.movimientosStock, ['id', 'producto_id', 'tipo', 'cantidad', 'referencia_pedido_id', 'fecha', 'usuario', 'motivo']],
    [SHEETS.cierresCaja, ['id', 'fecha', 'total_efectivo', 'total_tarjeta', 'total_transferencia', 'observaciones', 'usuario']],
    [SHEETS.usuarios, ['id', 'nombre', 'rol', 'pin', 'activo', 'updated_at']],
    [SHEETS.justificaciones, ['id', 'pedido_id', 'texto', 'usuario', 'rol', 'created_at', 'pdf_url']],
    [SHEETS.configuracion, ['clave', 'valor']],
    [SHEETS.archivoPedidos, ['id', 'fecha_hora', 'cliente', 'telefono', 'direccion', 'total', 'estado', 'repartidor_id', 'metodo_pago', 'closed_at']],
  ];

  specs.forEach(([name, headers]) => {
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    } else if (sheet.getLastRow() === 1) {
      const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (existing.join('|') !== headers.join('|')) {
        sheet.clear();
        sheet.appendRow(headers);
      }
    }
  });

  return { ok: true, message: 'Hojas verificadas o creadas' };
}

function handleRequest(method, e) {
  const params = e && e.parameter ? e.parameter : {};
  const body = parseBody(e);
  const action = params.action || body.action || '';
  const token = getHeaderToken(e) || body.token || params.token || '';

  switch (`${method}:${action}`) {
    case 'GET:health':
      return { ok: true, service: 'Deposito El Compa GAS', now: new Date().toISOString() };
    case 'GET:setup':
      return setup();
    case 'GET:productos':
      return listSheet(SHEETS.productos);
    case 'GET:pedidos':
      return listPedidos(params, token);
    case 'GET:repartidores':
      return listSheet(SHEETS.repartidores);
    case 'GET:justificaciones':
      return listSheet(SHEETS.justificaciones);
    case 'POST:login':
      return login(body);
    case 'POST:pedidos':
      return createPedido(body, token);
    case 'POST:aceptarPedido':
      return updatePedidoStatus(body.id, 'aceptado', body, token);
    case 'POST:rechazarPedido':
      return updatePedidoStatus(body.id, 'cancelado', body, token);
    case 'POST:pedidoListo':
      return updatePedidoStatus(body.id, 'listo', body, token);
    case 'POST:asignarRepartidor':
      return assignRepartidor(body.id, body.repartidorId, body, token);
    case 'POST:enRuta':
      return updatePedidoStatus(body.id, 'en_ruta', body, token);
    case 'POST:entregado':
      return updatePedidoStatus(body.id, 'entregado', body, token);
    case 'POST:justificacion':
      return saveJustificacion(body, token);
    case 'POST:pdfJustificacion':
      return createJustificationPdf(body, token);
    case 'POST:movimientoStock':
      return saveMovimientoStock(body, token);
    case 'POST:cierreCaja':
      return saveCierreCaja(body, token);
    default:
      return { ok: false, error: `Acción no soportada: ${method}:${action}` };
  }
}

function parseBody(e) {
  const params = e && e.parameter ? e.parameter : {};
  const body = {};

  Object.keys(params).forEach(key => {
    if (key !== 'action' && key !== 'token') {
      body[key] = decodeValue(params[key]);
    }
  });

  if (e && e.postData && e.postData.contents) {
    try {
      const raw = JSON.parse(e.postData.contents || '{}');
      Object.assign(body, raw);
    } catch (_) {
      const contents = String(e.postData.contents || '');
      if (contents.includes('=')) {
        contents.split('&').forEach(pair => {
          const [k, v] = pair.split('=');
          if (k) body[decodeURIComponent(k)] = decodeValue(decodeURIComponent(v || ''));
        });
      }
    }
  }

  return body;
}

function decodeValue(value) {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (!text) return '';
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function getHeaderToken(e) {
  return e && e.parameter && e.parameter.header_token ? e.parameter.header_token : '';
}

function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID') || '1QUISBqNelYSP2PZggtW1qZl0QF_XCxhSPBj7ilphVGg';
  if (!id) throw new Error('SPREADSHEET_ID no configurado');
  return SpreadsheetApp.openById(id);
}

function getSheet(name) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function listSheet(name) {
  const values = getSheet(name).getDataRange().getValues();
  const headers = values.shift() || [];
  return { ok: true, data: values.map(row => headers.reduce((acc, key, idx) => (acc[key] = row[idx], acc), {})) };
}

function listPedidos(params) {
  const all = listSheet(SHEETS.pedidos).data || [];
  const estado = params.estado || '';
  const repartidorId = params.repartidorId || '';
  const since = params.since || '';
  return {
    ok: true,
    data: all.filter(row => {
      const matchEstado = !estado || row.estado === estado;
      const matchRepartidor = !repartidorId || String(row.repartidor_id || '') === repartidorId;
      const matchSince = !since || String(row.updated_at || row.fecha_hora || '') > since;
      return matchEstado && matchRepartidor && matchSince;
    }),
  };
}

function login(body) {
  const role = String(body.role || '').trim();
  const pin = String(body.pin || '').trim();
  const users = listSheet(SHEETS.usuarios).data || [];
  const user = users.find(u => String(u.rol || '') === role && String(u.pin || '') === pin);
  if (!user) return { ok: false, error: 'Credenciales inválidas' };
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put(`token:${token}`, JSON.stringify({ id: user.id, rol: user.rol, nombre: user.nombre }), 60 * 60 * 6);
  return { ok: true, token, user: { id: user.id, nombre: user.nombre, rol: user.rol } };
}

function requireAuth(token, allowedRoles) {
  if (!token) throw new Error('Token requerido');
  const raw = CacheService.getScriptCache().get(`token:${token}`);
  if (!raw) throw new Error('Sesión inválida');
  const session = JSON.parse(raw);
  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(session.rol)) throw new Error('Sin permisos');
  return session;
}

function createPedido(body, token) {
  const lock = LockService.getScriptLock();
  try {
    const session = body.publico ? { rol: 'cliente', nombre: 'Público' } : requireAuth(token, ['admin', 'caja']);
    if (!lock.tryLock(10000)) {
      return { ok: false, error: 'Servidor ocupado. Reintenta en unos segundos.' };
    }

    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.pedidos);
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.pedidos);
      sheet.appendRow(['id', 'fecha_hora', 'cliente', 'telefono', 'direccion', 'total', 'estado', 'repartidor_id', 'metodo_pago', 'updated_at', 'creado_por']);
    }

    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    const row = [
      id,
      now,
      String(body.cliente || 'Sin nombre'),
      String(body.telefono || ''),
      String(body.direccion || 'Entrega en sucursal'),
      Number(body.total || 0),
      'nuevo',
      '',
      String(body.metodo_pago || 'efectivo'),
      now,
      session.rol,
    ];
    sheet.appendRow(row);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: 'Error en createPedido', details: String(e) };
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

function updatePedidoStatus(id, estado, body, token) {
  const session = requireAuth(token, ['admin', 'caja', 'hieleras', 'repartidor']);
  const sheet = getSheet(SHEETS.pedidos);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idx = headers.indexOf('id');
  const estadoIdx = headers.indexOf('estado');
  const updatedIdx = headers.indexOf('updated_at');
  const rowIndex = data.findIndex(r => String(r[idx]) === String(id));
  if (rowIndex < 0) throw new Error('Pedido no encontrado');
  sheet.getRange(rowIndex + 2, estadoIdx + 1).setValue(estado);
  if (updatedIdx >= 0) sheet.getRange(rowIndex + 2, updatedIdx + 1).setValue(new Date().toISOString());
  if (body && body.justificacion) saveJustificacion({ pedido_id: id, texto: body.justificacion, usuario: session.nombre, rol: session.rol }, token);
  return { ok: true, id, estado };
}

function assignRepartidor(id, repartidorId, body, token) {
  requireAuth(token, ['admin', 'caja']);
  const sheet = getSheet(SHEETS.pedidos);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const rowIndex = data.findIndex(r => String(r[headers.indexOf('id')]) === String(id));
  if (rowIndex < 0) throw new Error('Pedido no encontrado');
  sheet.getRange(rowIndex + 2, headers.indexOf('repartidor_id') + 1).setValue(repartidorId);
  sheet.getRange(rowIndex + 2, headers.indexOf('estado') + 1).setValue('asignado');
  sheet.getRange(rowIndex + 2, headers.indexOf('updated_at') + 1).setValue(new Date().toISOString());
  return { ok: true, id, repartidorId };
}

function saveJustificacion(body, token) {
  const session = requireAuth(token, ['admin', 'caja']);
  const sheet = getSheet(SHEETS.justificaciones);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'pedido_id', 'texto', 'usuario', 'rol', 'created_at', 'pdf_url']);
  }
  const id = Utilities.getUuid();
  sheet.appendRow([id, body.pedido_id || '', body.texto || '', session.nombre, session.rol, new Date().toISOString(), body.pdf_url || '']);
  return { ok: true, id };
}

function createJustificationPdf(body, token) {
  const session = requireAuth(token, ['admin', 'caja']);
  const pedido = body.pedido || {};
  const justificacion = body.justificacion || '';
  const html = HtmlService.createHtmlOutput(`
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { margin: 0 0 8px; }
          .meta { margin: 10px 0 18px; font-size: 14px; }
          .box { border: 1px solid #ddd; border-radius: 10px; padding: 14px; margin: 12px 0; }
          .row { display:flex; justify-content:space-between; margin: 6px 0; }
          .label { color:#555; }
          .value { font-weight:700; }
        </style>
      </head>
      <body>
        <h1>Depósito El Compa</h1>
        <div class="meta">Justificación de solicitud</div>
        <div class="box">
          <div class="row"><span class="label">Folio</span><span class="value">${escapeHtml(String(pedido.id || ''))}</span></div>
          <div class="row"><span class="label">Cliente</span><span class="value">${escapeHtml(String(pedido.cliente || ''))}</span></div>
          <div class="row"><span class="label">Teléfono</span><span class="value">${escapeHtml(String(pedido.telefono || ''))}</span></div>
          <div class="row"><span class="label">Dirección</span><span class="value">${escapeHtml(String(pedido.direccion || ''))}</span></div>
          <div class="row"><span class="label">Estado</span><span class="value">${escapeHtml(String(pedido.estado || 'nuevo'))}</span></div>
          <div class="row"><span class="label">Total</span><span class="value">$${Number(pedido.total || 0).toFixed(2)}</span></div>
        </div>
        <div class="box">
          <strong>Justificación / observaciones</strong>
          <p>${escapeHtml(String(justificacion))}</p>
        </div>
        <div class="box">
          <div class="row"><span class="label">Responsable</span><span class="value">${escapeHtml(session.nombre)}</span></div>
          <div class="row"><span class="label">Rol</span><span class="value">${escapeHtml(session.rol)}</span></div>
          <div class="row"><span class="label">Generado</span><span class="value">${new Date().toISOString()}</span></div>
        </div>
      </body>
    </html>
  `);

  const blob = html.getBlob().setName(`justificacion-${pedido.id || 'pedido'}.html`);
  const file = DriveApp.createFile(blob);
  const pdfBlob = file.getBlob().getAs(MimeType.PDF).setName(`justificacion-${pedido.id || 'pedido'}.pdf`);
  const pdfFile = DriveApp.createFile(pdfBlob);
  file.setTrashed(true);

  saveJustificacion({
    pedido_id: pedido.id || '',
    texto: justificacion,
    pdf_url: pdfFile.getUrl(),
  }, token);

  return { ok: true, pdf_url: pdfFile.getUrl(), file_id: pdfFile.getId() };
}

function saveMovimientoStock(body, token) {
  const session = requireAuth(token, ['admin', 'caja']);
  const sheet = getSheet(SHEETS.movimientosStock);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'producto_id', 'tipo', 'cantidad', 'referencia_pedido_id', 'fecha', 'usuario', 'motivo']);
  }
  const id = Utilities.getUuid();
  sheet.appendRow([id, body.producto_id || '', body.tipo || 'salida', Number(body.cantidad || 0), body.referencia_pedido_id || '', new Date().toISOString(), session.nombre, body.motivo || '']);
  return { ok: true, id };
}

function saveCierreCaja(body, token) {
  const session = requireAuth(token, ['admin', 'caja']);
  const sheet = getSheet(SHEETS.cierresCaja);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'fecha', 'total_efectivo', 'total_tarjeta', 'total_transferencia', 'observaciones', 'usuario']);
  }
  const id = Utilities.getUuid();
  sheet.appendRow([id, new Date().toISOString(), Number(body.total_efectivo || 0), Number(body.total_tarjeta || 0), Number(body.total_transferencia || 0), body.observaciones || '', session.nombre]);
  return { ok: true, id };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

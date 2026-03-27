// Deposito El Compa GAS backend
const VERSION = 'depot-gas-2026-03-26-0550';
const SHEETS = {
  productos: 'productos',
  inventario: 'inventario',
  pedidos: 'pedidos',
  detallePedidos: 'detalle_pedidos',
  repartidores: 'repartidores',
  movimientosStock: 'movimientos_stock',
  stock: 'stock',
  cierresCaja: 'cierres_caja',
  usuarios: 'usuarios',
  justificaciones: 'justificaciones',
  configuracion: 'configuracion',
  archivoPedidos: 'archivo_pedidos',
  archivo: 'archivo',
};

function doGet(e) {
  console.log('GET recibido', JSON.stringify(e || {}));
  try {
    return jsonResponse(handleRequest('GET', e));
  } catch (error) {
    console.error('GET error', error && error.stack ? error.stack : String(error));
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doPost(e) {
  console.log('POST recibido', JSON.stringify(e || {}));
  try {
    return jsonResponse(handleRequest('POST', e));
  } catch (error) {
    console.error('POST error', error && error.stack ? error.stack : String(error));
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doPatch(e) {
  try {
    return jsonResponse({ ok: false, error: 'PATCH no soportado en Apps Script Web App' });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doDelete(e) {
  try {
    return jsonResponse({ ok: false, error: 'DELETE no soportado en Apps Script Web App' });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function setup() {
  const ss = getSpreadsheet();
  const specs = [
    [SHEETS.productos, ['id', 'nombre', 'precio', 'stock', 'categoria', 'imagen_url', 'activo', 'updated_at']],
    [SHEETS.inventario, ['id', 'nombre', 'precio', 'stock', 'categoria', 'imagen_url', 'activo', 'updated_at']],
    [SHEETS.pedidos, ['id', 'fecha_hora', 'cliente', 'telefono', 'direccion', 'total', 'estado', 'repartidor_id', 'metodo_pago', 'updated_at', 'creado_por']],
    [SHEETS.detallePedidos, ['id', 'pedido_id', 'producto_id', 'nombre_producto', 'cantidad', 'precio_unitario', 'subtotal', 'created_at']],
    [SHEETS.repartidores, ['id', 'nombre', 'telefono', 'estado', 'lat', 'lng', 'pedido_activo', 'updated_at']],
    [SHEETS.movimientosStock, ['id', 'producto_id', 'tipo', 'cantidad', 'referencia_pedido_id', 'fecha', 'usuario', 'motivo']],
    [SHEETS.stock, ['id', 'producto_id', 'tipo', 'cantidad', 'referencia_pedido_id', 'fecha', 'usuario', 'motivo']],
    [SHEETS.cierresCaja, ['id', 'fecha', 'total_efectivo', 'total_tarjeta', 'total_transferencia', 'observaciones', 'usuario']],
    [SHEETS.usuarios, ['id', 'nombre', 'rol', 'pin', 'activo', 'updated_at']],
    [SHEETS.justificaciones, ['id', 'pedido_id', 'texto', 'usuario', 'rol', 'created_at', 'pdf_url']],
    [SHEETS.configuracion, ['clave', 'valor']],
    [SHEETS.archivoPedidos, ['id', 'fecha_hora', 'cliente', 'telefono', 'direccion', 'total', 'estado', 'repartidor_id', 'metodo_pago', 'closed_at', 'detalle_json']],
    [SHEETS.archivo, ['id', 'fecha_hora', 'cliente', 'telefono', 'direccion', 'total', 'estado', 'repartidor_id', 'metodo_pago', 'closed_at', 'detalle_json']],
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

  seedUsersIfEmpty(ss);
  seedProductsIfEmpty(ss);
  syncAliasSheets(ss);

  return { ok: true, message: 'Hojas verificadas o creadas' };
}

function seedUsersIfEmpty(ss) {
  const sheet = ss.getSheetByName(SHEETS.usuarios);
  if (!sheet) return;
  if (sheet.getLastRow() > 1) return;
  const now = new Date().toISOString();
  sheet.appendRow(['id', 'nombre', 'rol', 'pin', 'activo', 'updated_at']);
  [
    ['1', 'Administrador', 'admin', '1234', 'true', now],
    ['2', 'Caja', 'caja', '3333', 'true', now],
    ['3', 'Hieleras', 'hieleras', '1111', 'true', now],
    ['4', 'Repartidor', 'repartidor', '2222', 'true', now],
  ].forEach(row => sheet.appendRow(row));
}

function seedProductsIfEmpty(ss) {
  const sheet = ss.getSheetByName(SHEETS.productos);
  if (!sheet) return;
  if (sheet.getLastRow() > 1) return;
  const now = new Date().toISOString();
  const products = [
    ['1', 'Cerveza Modelo Especial', 35, 50, 'cerveza', 'modelo.png', 'true', now],
    ['2', 'Cerveza Corona', 32, 45, 'cerveza', 'corona.png', 'true', now],
    ['3', 'Cerveza Victoria', 30, 30, 'cerveza', 'victoria.png', 'true', now],
    ['4', 'Cerveza Indio', 32, 25, 'cerveza', 'indio.png', 'true', now],
    ['5', 'Cerveza XX Lager', 34, 40, 'cerveza', 'xx.png', 'true', now],
    ['6', 'Cerveza Tecate', 28, 30, 'cerveza', 'tecate.png', 'true', now],
    ['7', 'Cerveza Sol', 29, 30, 'cerveza', 'sol.png', 'true', now],
    ['8', 'Botana Mixta', 50, 20, 'botana', 'botana.png', 'true', now],
    ['9', 'Papas Sabritas', 35, 30, 'botana', 'papas.png', 'true', now],
    ['10', 'Cacahuates Japonés', 25, 50, 'botana', 'cacahuates.png', 'true', now],
    ['11', 'Hielo 5kg', 40, 15, 'otros', 'hielo.png', 'true', now],
    ['12', 'Coca Cola 2L', 28, 35, 'otros', 'refresco.png', 'true', now],
    ['13', 'Six Pack Modelo', 180, 12, 'cerveza', 'sixpackmodelo.png', 'true', now],
    ['14', 'Cubeta 12 Modelo', 350, 8, 'cerveza', 'cubeta12modelo.png', 'true', now],
  ];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'nombre', 'precio', 'stock', 'categoria', 'imagen_url', 'activo', 'updated_at']);
  }
  products.forEach(row => sheet.appendRow(row));
}

function syncAliasSheets(ss) {
  const aliases = [
    [SHEETS.inventario, SHEETS.productos],
    [SHEETS.stock, SHEETS.movimientosStock],
    [SHEETS.archivo, SHEETS.archivoPedidos],
  ];
  aliases.forEach(([aliasName, sourceName]) => {
    const alias = ss.getSheetByName(aliasName);
    const source = ss.getSheetByName(sourceName);
    if (!alias || !source) return;
    const values = source.getDataRange().getValues();
    if (!values || !values.length) return;
    alias.clear();
    alias.getRange(1, 1, values.length, values[0].length).setValues(values);
    alias.setFrozenRows(1);
  });
}

function handleRequest(method, e) {
  const params = e && e.parameter ? e.parameter : {};
  const body = parseBody(e);
  const action = params.action || body.action || '';
  const token = getHeaderToken(e) || body.token || params.token || '';

  switch (`${method}:${action}`) {
    case 'GET:health':
      return { ok: true, service: 'Deposito El Compa GAS', version: VERSION, now: new Date().toISOString() };
    case 'GET:version':
      return { ok: true, version: VERSION };
    case 'GET:setup':
      return setup();
    case 'GET:productos':
      return listSheet(SHEETS.productos);
    case 'GET:dashboard':
      return getDashboard(params);
    case 'GET:pedidos':
      return listPedidos(params, token);
    case 'GET:justificaciones':
      return listSheet(SHEETS.justificaciones);
    case 'GET:archivo':
      return listArchivoPedidos(params, token);
    case 'GET:repartidores':
      return listSheet(SHEETS.repartidores);
    case 'GET:login':
      return login({ role: params.role, pin: params.pin });
    case 'POST:login':
      return login(body);
    case 'POST:pedidos':
      return createPedido(body, token);
    case 'POST:productoGuardar':
      return saveProduct(body, token);
    case 'POST:productoActualizar':
      return updateProduct(body, token);
    case 'POST:productoToggle':
      return toggleProduct(body, token);
    case 'POST:aceptarPedido':
      return updatePedidoStatus(body.id, 'aceptado', body, token);
    case 'POST:rechazarPedido':
      return updatePedidoStatus(body.id, 'cancelado', body, token);
    case 'POST:pedidoListo':
      return updatePedidoStatus(body.id, body.estado || 'en_hieleras', body, token);
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
    case 'POST:archivarPedido':
      return archivePedido(body, token);
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
  if (!e || !e.parameter) return '';
  return e.parameter.header_token || e.parameter.token || '';
}

function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SPREADSHEET_ID') || '';

  if (!id) {
    const ss = SpreadsheetApp.create('Deposito El Compa Database');
    id = ss.getId();
    props.setProperty('SPREADSHEET_ID', id);
    return ss;
  }

  try {
    return SpreadsheetApp.openById(id);
  } catch (error) {
    const ss = SpreadsheetApp.create('Deposito El Compa Database');
    id = ss.getId();
    props.setProperty('SPREADSHEET_ID', id);
    return ss;
  }
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

function getDashboard(params) {
  const pedidos = listSheet(SHEETS.pedidos).data || [];
  const products = listSheet(SHEETS.productos).data || [];
  const archivados = listSheet(SHEETS.archivoPedidos).data || [];
  const hoy = new Date();
  const todayKey = hoy.toISOString().slice(0, 10);
  const pedidosHoy = pedidos.filter(p => String(p.fecha_hora || '').slice(0, 10) === todayKey);
  const vendidosHoy = pedidosHoy.filter(p => String(p.estado || '').toLowerCase() === 'entregado').reduce((sum, p) => sum + Number(p.total || 0), 0);
  const inventarioTotal = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const agotados = products.filter(p => Number(p.stock || 0) <= 0).length;
  const bajos = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) < 20).length;
  const byState = pedidos.reduce((acc, p) => {
    const key = String(p.estado || 'nuevo').toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const recentOrders = pedidos
    .slice()
    .sort((a, b) => String(b.updated_at || b.fecha_hora || '').localeCompare(String(a.updated_at || a.fecha_hora || '')))
    .slice(0, 8);
  const topProducts = products
    .slice()
    .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
    .slice(0, 5);

  return {
    ok: true,
    data: {
      pedidosHoy: pedidosHoy.length,
      ventasHoy: Number(vendidosHoy.toFixed(2)),
      inventarioTotal,
      agotados,
      bajos,
      estadoPedidos: byState,
      recientes: recentOrders,
      productos: products,
      topProducts,
      archivados: archivados.length,
      since: params.since || ''
    }
  };
}

function login(body) {
  const role = String(body.role || '').trim();
  const pin = String(body.pin || '').trim();
  const users = listSheet(SHEETS.usuarios).data || [];
  const user = users.find(u => String(u.rol || '') === role && String(u.pin || '') === pin);
  if (!user) return { ok: false, error: 'Credenciales inválidas' };
  const token = Utilities.getUuid();
  // CacheService only supports short TTLs; keep sessions inside the documented limit.
  CacheService.getScriptCache().put(
    `token:${token}`,
    JSON.stringify({ id: user.id, rol: user.rol, nombre: user.nombre }),
    1500
  );
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

function withDocumentLock(fn, timeoutMs) {
  const lock = LockService.getDocumentLock();
  const acquired = lock.tryLock(timeoutMs || 10000);
  if (!acquired) {
    throw new Error('No se pudo obtener el bloqueo del documento');
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
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
    const items = parseItems(body.items);
    const cliente = String(body.cliente || '').trim() || 'Sin nombre';
    const telefono = String(body.telefono || '').trim();
    const direccion = String(body.direccion || '').trim() || 'Entrega en sucursal';
    const total = Number(body.total || 0);
    const metodoPago = String(body.metodo_pago || 'efectivo').trim() || 'efectivo';
    const row = [
      id,
      now,
      cliente,
      telefono,
      direccion,
      total,
      'nuevo',
      '',
      metodoPago,
      now,
      session.rol,
    ];
    sheet.appendRow(row);

    if (items.length) {
      const detailSheet = getSheet(SHEETS.detallePedidos);
      if (detailSheet.getLastRow() === 0) {
        detailSheet.appendRow(['id', 'pedido_id', 'producto_id', 'nombre_producto', 'cantidad', 'precio_unitario', 'subtotal', 'created_at']);
      }
      items.forEach(item => {
        detailSheet.appendRow([
          Utilities.getUuid(),
          id,
          String(item.id || item.producto_id || ''),
          String(item.name || item.nombre || item.concepto || ''),
          Number(item.qty || item.cantidad || 1),
          Number(item.price || item.precio || 0),
          Number((Number(item.qty || item.cantidad || 1) * Number(item.price || item.precio || 0)).toFixed(2)),
          now
        ]);
      });
    }

    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: 'Error en createPedido', details: String(e) };
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

function saveProduct(body, token) {
  return withDocumentLock(function() {
    requireAuth(token, ['admin']);
    const sheet = getSheet(SHEETS.productos);
    ensureProductHeaders(sheet);
    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    const row = normalizeProductBody(body);
    sheet.appendRow([
      id,
      row.nombre,
      row.precio,
      row.stock,
      row.categoria,
      row.imagen_url,
      row.activo,
      now
    ]);
    return { ok: true, id };
  }, 12000);
}

function updateProduct(body, token) {
  return withDocumentLock(function() {
    requireAuth(token, ['admin']);
    const id = String(body.id || '').trim();
    if (!id) throw new Error('id requerido');
    const sheet = getSheet(SHEETS.productos);
    ensureProductHeaders(sheet);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const idx = headers.indexOf('id');
    const rowIndex = data.findIndex(r => String(r[idx]) === id);
    if (rowIndex < 0) throw new Error('Producto no encontrado');
    const row = normalizeProductBody(body);
    const sheetRow = rowIndex + 2;
    sheet.getRange(sheetRow, headers.indexOf('nombre') + 1).setValue(row.nombre);
    sheet.getRange(sheetRow, headers.indexOf('precio') + 1).setValue(row.precio);
    sheet.getRange(sheetRow, headers.indexOf('stock') + 1).setValue(row.stock);
    sheet.getRange(sheetRow, headers.indexOf('categoria') + 1).setValue(row.categoria);
    sheet.getRange(sheetRow, headers.indexOf('imagen_url') + 1).setValue(row.imagen_url);
    sheet.getRange(sheetRow, headers.indexOf('activo') + 1).setValue(row.activo);
    sheet.getRange(sheetRow, headers.indexOf('updated_at') + 1).setValue(new Date().toISOString());
    return { ok: true, id };
  }, 12000);
}

function toggleProduct(body, token) {
  return withDocumentLock(function() {
    requireAuth(token, ['admin']);
    const id = String(body.id || '').trim();
    if (!id) throw new Error('id requerido');
    const sheet = getSheet(SHEETS.productos);
    ensureProductHeaders(sheet);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const idx = headers.indexOf('id');
    const rowIndex = data.findIndex(r => String(r[idx]) === id);
    if (rowIndex < 0) throw new Error('Producto no encontrado');
    const sheetRow = rowIndex + 2;
    const activeIdx = headers.indexOf('activo') + 1;
    const current = String(sheet.getRange(sheetRow, activeIdx).getValue() || 'true').toLowerCase() === 'true';
    sheet.getRange(sheetRow, activeIdx).setValue(current ? 'false' : 'true');
    sheet.getRange(sheetRow, headers.indexOf('updated_at') + 1).setValue(new Date().toISOString());
    return { ok: true, id, activo: !current };
  }, 12000);
}

function updatePedidoStatus(id, estado, body, token) {
  const session = requireAuth(token, ['admin', 'caja', 'hieleras', 'repartidor']);
  const pedidoId = String(id || '').trim();
  const nuevoEstado = String(estado || '').trim();
  if (!pedidoId) throw new Error('Pedido no encontrado');
  if (!nuevoEstado) throw new Error('Estado inválido');
  const sheet = getSheet(SHEETS.pedidos);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idx = headers.indexOf('id');
  const estadoIdx = headers.indexOf('estado');
  const updatedIdx = headers.indexOf('updated_at');
  const rowIndex = data.findIndex(r => String(r[idx]) === pedidoId);
  if (rowIndex < 0) throw new Error('Pedido no encontrado');
  sheet.getRange(rowIndex + 2, estadoIdx + 1).setValue(nuevoEstado);
  if (updatedIdx >= 0) sheet.getRange(rowIndex + 2, updatedIdx + 1).setValue(new Date().toISOString());
  if (body && body.justificacion) saveJustificacion({ pedido_id: pedidoId, texto: body.justificacion, usuario: session.nombre, rol: session.rol }, token);
  return { ok: true, id: pedidoId, estado: nuevoEstado };
}

function parseItems(rawItems) {
  if (!rawItems) return [];
  if (Array.isArray(rawItems)) return rawItems;
  try {
    const parsed = typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems;
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function archivePedido(body, token) {
  return withDocumentLock(function() {
    const session = requireAuth(token, ['admin', 'caja']);
    const id = String(body.id || '').trim();
    if (!id) throw new Error('Pedido no encontrado');

    const sheet = getSheet(SHEETS.pedidos);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const idIdx = headers.indexOf('id');
    const estadoIdx = headers.indexOf('estado');
    const updatedIdx = headers.indexOf('updated_at');
    const rowIndex = data.findIndex(r => String(r[idIdx]) === id);
    if (rowIndex < 0) throw new Error('Pedido no encontrado');

    const pedidoRow = data[rowIndex];
    const estadoActual = String(pedidoRow[estadoIdx] || '').toLowerCase();
    if (estadoActual === 'archivado') {
      return { ok: true, id, archived: true };
    }

    const archivo = getSheet(SHEETS.archivoPedidos);
    if (archivo.getLastRow() === 0) {
      archivo.appendRow(['id', 'fecha_hora', 'cliente', 'telefono', 'direccion', 'total', 'estado', 'repartidor_id', 'metodo_pago', 'closed_at', 'detalle_json']);
    }

    const detalle = obtenerDetallePedido(id);
    archivo.appendRow([
      id,
      pedidoRow[headers.indexOf('fecha_hora')] || new Date().toISOString(),
      pedidoRow[headers.indexOf('cliente')] || '',
      pedidoRow[headers.indexOf('telefono')] || '',
      pedidoRow[headers.indexOf('direccion')] || '',
      Number(pedidoRow[headers.indexOf('total')] || 0),
      'archivado',
      pedidoRow[headers.indexOf('repartidor_id')] || '',
      pedidoRow[headers.indexOf('metodo_pago')] || '',
      new Date().toISOString(),
      JSON.stringify(detalle)
    ]);

    sheet.getRange(rowIndex + 2, estadoIdx + 1).setValue('archivado');
    if (updatedIdx >= 0) sheet.getRange(rowIndex + 2, updatedIdx + 1).setValue(new Date().toISOString());
    appendJustificacionRow({
      pedido_id: id,
      texto: String(body.justificacion || 'Pedido archivado').trim(),
      usuario: session.nombre,
      rol: session.rol,
      pdf_url: ''
    });
    return { ok: true, id };
  }, 12000);
}

function listArchivoPedidos(params, token) {
  const all = listSheet(SHEETS.archivoPedidos).data || [];
  const estado = params.estado || '';
  const since = params.since || '';
  return {
    ok: true,
    data: all.filter(row => {
      const matchEstado = !estado || String(row.estado || '') === estado;
      const matchSince = !since || String(row.closed_at || row.fecha_hora || '') > since;
      return matchEstado && matchSince;
    }),
  };
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
  return withDocumentLock(function() {
    const session = requireAuth(token, ['admin', 'caja']);
    return appendJustificacionRow({
      pedido_id: String(body.pedido_id || '').trim(),
      texto: String(body.texto || '').trim(),
      usuario: session.nombre,
      rol: session.rol,
      pdf_url: String(body.pdf_url || '').trim()
    });
  }, 12000);
}

function createJustificationPdf(body, token) {
  return withDocumentLock(function() {
    const session = requireAuth(token, ['admin', 'caja']);
    const pedido = body.pedido || {};
    const justificacion = String(body.justificacion || '').trim();
    if (!pedido.id) throw new Error('Pedido requerido para generar PDF');
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

    const tmpName = `justificacion-${pedido.id || 'pedido'}.html`;
    const blob = html.getBlob().setName(tmpName);
    const file = DriveApp.createFile(blob);
    const pdfBlob = file.getBlob().getAs(MimeType.PDF).setName(`justificacion-${pedido.id || 'pedido'}.pdf`);
    const pdfFile = DriveApp.createFile(pdfBlob);
    try {
      file.setTrashed(true);
    } catch (_) {}

    appendJustificacionRow({
      pedido_id: pedido.id || '',
      texto: justificacion,
      pdf_url: pdfFile.getUrl(),
      usuario: session.nombre,
      rol: session.rol
    });

    return { ok: true, pdf_url: pdfFile.getUrl(), file_id: pdfFile.getId() };
  }, 12000);
}

function saveMovimientoStock(body, token) {
  return withDocumentLock(function() {
    const session = requireAuth(token, ['admin', 'caja']);
    const sheet = getSheet(SHEETS.movimientosStock);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id', 'producto_id', 'tipo', 'cantidad', 'referencia_pedido_id', 'fecha', 'usuario', 'motivo']);
    }
    const id = Utilities.getUuid();
    const tipo = String(body.tipo || 'salida').trim();
    const cantidad = Number(body.cantidad || 0);
    if (!cantidad || cantidad <= 0) throw new Error('cantidad inválida');
    sheet.appendRow([id, String(body.producto_id || '').trim(), tipo, cantidad, String(body.referencia_pedido_id || '').trim(), new Date().toISOString(), session.nombre, String(body.motivo || '').trim()]);
    return { ok: true, id };
  }, 12000);
}

function saveCierreCaja(body, token) {
  return withDocumentLock(function() {
    const session = requireAuth(token, ['admin', 'caja']);
    const sheet = getSheet(SHEETS.cierresCaja);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id', 'fecha', 'total_efectivo', 'total_tarjeta', 'total_transferencia', 'observaciones', 'usuario']);
    }
    const id = Utilities.getUuid();
    const totalEfectivo = Number(body.total_efectivo || 0);
    const totalTarjeta = Number(body.total_tarjeta || 0);
    const totalTransfer = Number(body.total_transferencia || 0);
    sheet.appendRow([id, new Date().toISOString(), totalEfectivo, totalTarjeta, totalTransfer, String(body.observaciones || '').trim(), session.nombre]);
    return { ok: true, id };
  }, 12000);
}

function ensureProductHeaders(sheet) {
  const headers = ['id', 'nombre', 'precio', 'stock', 'categoria', 'imagen_url', 'activo', 'updated_at'];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }
  if (sheet.getLastRow() === 1) {
    const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (existing.join('|') !== headers.join('|')) {
      sheet.clear();
      sheet.appendRow(headers);
    }
  }
}

function normalizeProductBody(body) {
  return {
    nombre: String(body.nombre || body.name || '').trim(),
    precio: Number(body.precio || body.price || 0),
    stock: Number(body.stock || 0),
    categoria: String(body.categoria || body.category || 'otros').trim(),
    imagen_url: String(body.imagen_url || body.image || '').trim(),
    activo: String(body.activo !== undefined ? body.activo : true).toLowerCase()
  };
}

function appendJustificacionRow(payload) {
  const sheet = getSheet(SHEETS.justificaciones);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'pedido_id', 'texto', 'usuario', 'rol', 'created_at', 'pdf_url']);
  }
  const id = Utilities.getUuid();
  sheet.appendRow([
    id,
    String(payload.pedido_id || '').trim(),
    String(payload.texto || '').trim(),
    String(payload.usuario || '').trim(),
    String(payload.rol || '').trim(),
    new Date().toISOString(),
    String(payload.pdf_url || '').trim()
  ]);
  return { ok: true, id };
}

function obtenerDetallePedido(pedidoId) {
  const id = String(pedidoId || '').trim();
  if (!id) return [];
  const detalleSheet = getSheet(SHEETS.detallePedidos);
  const data = detalleSheet.getDataRange().getValues();
  if (!data || data.length < 2) return [];
  const headers = data[0];
  const idx = headers.indexOf('pedido_id');
  return data.slice(1)
    .filter(row => String(row[idx] || '') === id)
    .map(row => headers.reduce((acc, key, i) => (acc[key] = row[i], acc), {}));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

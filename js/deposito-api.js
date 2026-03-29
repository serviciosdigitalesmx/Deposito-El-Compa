(function (global) {
  function detectStorageKey() {
    const path = String(global.location && global.location.pathname || '').toLowerCase();
    if (path.includes('productos')) return 'DEPOSITO_PROD_V1';
    if (path.includes('operativo') || path.includes('caja')) return 'DEPOSITO_OPER_V1';
    if (path.includes('archivo')) return 'DEPOSITO_ARCH_V1';
    if (path.includes('tecnico') || path.includes('hieleras')) return 'DEPOSITO_HIELERAS_V1';
    if (path.includes('repartidor')) return 'DEPOSITO_REPARTIDOR_V1';
    if (path.includes('corte')) return 'DEPOSITO_CORTE_V1';
    if (path.includes('solicitudes')) return 'DEPOSITO_SOLICITUDES_V1';
    if (path.includes('admin')) return 'DEPOSITO_ADMIN_V1';
    return 'DEPOSITO_GENERIC_V1';
  }

  const defaultConfig = {
    endpoint: global.DEPOSITO_GAS_URL || '',
    token: global.DEPOSITO_GAS_TOKEN || '',
    storageKey: detectStorageKey(),
    timeoutMs: 12000,
  };
  const QUEUE_KEY = 'DEPOSITO_API_POST_QUEUE_V1';

  function normalizeResponse(data, response) {
    if (data && typeof data === 'object' && data.ok === false) {
      const error = new Error(data.user_message || data.error || 'Solicitud rechazada por el backend');
      error.code = data.error_code || data.code || 'SERVER_ERROR';
      error.debug = data.debug || '';
      error.response = data;
      if (error.code === 'AUTH_EXPIRED') {
        if (global.localStorage && defaultConfig.storageKey) {
          try { global.localStorage.removeItem(defaultConfig.storageKey); } catch (_) {}
        }
        if (global.DEPOSITO_API) {
          global.DEPOSITO_API.token = '';
        }
      }
      throw error;
    }
    return data && typeof data === 'object' ? data : { ok: true, data };
  }

  function loadQueue() {
    try {
      const raw = global.localStorage ? global.localStorage.getItem(QUEUE_KEY) : '[]';
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveQueue(queue) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue || []));
      }
    } catch (_) {}
  }

  function enqueuePost(url, body, token, envelope = null) {
    const queue = loadQueue();
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      body,
      token: token || defaultConfig.token || '',
      envelope,
      createdAt: new Date().toISOString(),
    };
    queue.push(item);
    saveQueue(queue);
    return item;
  }

  async function flushQueue() {
    const queue = loadQueue();
    if (!queue.length) return { ok: true, flushed: 0 };
    const remaining = [];
    let flushed = 0;
    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            ...(item.envelope || {}),
            ...(item.body || {}),
            token: item.token,
            header_token: item.token,
            __offline_sync: true,
          }),
          credentials: 'omit',
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : await response.text();
        if (!response.ok) {
          const message = typeof data === 'string' ? data : data.error || data.message || `HTTP ${response.status}`;
          const error = new Error(message);
          if (data && typeof data === 'object') {
            error.code = data.error_code || data.code || 'SERVER_ERROR';
            error.debug = data.debug || '';
          }
          throw error;
        }
        flushed += 1;
      } catch (error) {
        remaining.push(item);
        // Stop on first failure to preserve ordering.
        break;
      }
    }
    saveQueue(remaining.concat(queue.slice(flushed + remaining.length)));
    return { ok: true, flushed, remaining: loadQueue().length };
  }

  function buildUrl(path) {
    const base = (global.DEPOSITO_API && global.DEPOSITO_API.endpoint) || defaultConfig.endpoint;
    if (!base) return '';
    return `${base.replace(/\/$/, '')}${path}`;
  }

  async function request(path, { method = 'GET', body, token } = {}) {
    const url = buildUrl(path);
    if (!url) {
      throw new Error('API endpoint not configured');
    }

    if (method === 'POST') {
      return postViaForm(url, body, token);
    }

    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      const message = typeof payload === 'string' ? payload : payload.error || payload.message || `HTTP ${response.status}`;
      const error = new Error(message);
      if (payload && typeof payload === 'object') {
        error.code = payload.error_code || payload.code || '';
        error.debug = payload.debug || '';
      }
      throw error;
    }
    return normalizeResponse(payload, response);
  }

  function postViaForm(url, body, token) {
    const actionMatch = String(url || '').match(/[?&]action=([^&]+)/i);
    const action = actionMatch ? decodeURIComponent(actionMatch[1]) : '';
    const storageKey = global.DEPOSITO_API.storageKey || defaultConfig.storageKey;
    const sessionToken = token || defaultConfig.token || (storageKey && global.localStorage ? global.localStorage.getItem(storageKey) : '') || '';
    const envelope = {
      token: sessionToken,
      header_token: sessionToken,
      action,
      header: {
        intent: 'POST',
        action,
        uuid: global.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        timestamp: Date.now(),
        panel: String(global.location && global.location.pathname || ''),
      },
      payload: body || {},
    };
    const payload = {
      ...body,
      ...envelope,
      token: sessionToken,
      header_token: sessionToken,
      action,
      intent: 'POST',
      uuid: envelope.header.uuid,
      timestamp: envelope.header.timestamp,
    };
    const raw = JSON.stringify(payload);

    if (global.navigator && global.navigator.onLine === false) {
      enqueuePost(url, body, sessionToken, envelope);
      return Promise.resolve({ ok: true, queued: true, offline: true });
    }

    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: raw,
      credentials: 'omit',
      }).then(async (response) => {
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.error || data.message || `HTTP ${response.status}`;
        const error = new Error(message);
        if (data && typeof data === 'object') {
          error.code = data.error_code || data.code || 'SERVER_ERROR';
          error.debug = data.debug || '';
        }
        throw error;
      }
      return normalizeResponse(data, response);
    }).catch((error) => {
      const isNetworkLike = !error || /network|fetch|failed to fetch|load failed|connection/i.test(String(error.message || error));
      if (isNetworkLike) {
        enqueuePost(url, body, sessionToken, envelope);
        return { ok: true, queued: true, offline: true };
      }
      throw error;
    });
  }

  global.DEPOSITO_API = {
    ...defaultConfig,
    setConfig(config = {}) {
      Object.assign(defaultConfig, config);
      Object.assign(global.DEPOSITO_API, config);
    },
    getStorageKey() {
      return global.DEPOSITO_API.storageKey || defaultConfig.storageKey;
    },
    get(path, opts) {
      return request(path, { ...opts, method: 'GET' });
    },
    post(path, body, opts) {
      return request(path, { ...opts, method: 'POST', body });
    },
    patch(path, body, opts) {
      return request(path, { ...opts, method: 'PATCH', body });
    },
    del(path, opts) {
      return request(path, { ...opts, method: 'DELETE' });
    },
    syncQueue: flushQueue,
    queueLength() {
      return loadQueue().length;
    },
  };

  if (global.addEventListener) {
    global.addEventListener('online', () => {
      flushQueue().catch(() => {});
    });
  }
})(window);

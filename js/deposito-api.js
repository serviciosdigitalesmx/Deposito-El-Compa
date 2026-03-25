(function (global) {
  const defaultConfig = {
    endpoint: global.DEPOSITO_GAS_URL || '',
    token: global.DEPOSITO_GAS_TOKEN || '',
    timeoutMs: 12000,
  };

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), defaultConfig.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token || defaultConfig.token ? { 'X-Auth-Token': token || defaultConfig.token } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await response.json() : await response.text();
      if (!response.ok) {
        const message = typeof payload === 'string' ? payload : payload.error || payload.message || `HTTP ${response.status}`;
        throw new Error(message);
      }
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  global.DEPOSITO_API = {
    ...defaultConfig,
    setConfig(config = {}) {
      Object.assign(defaultConfig, config);
      Object.assign(global.DEPOSITO_API, config);
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
  };
})(window);

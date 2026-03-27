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

    if (method === 'POST') {
      return postViaForm(url, body, token);
    }

    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      const message = typeof payload === 'string' ? payload : payload.error || payload.message || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return payload;
  }

  function postViaForm(url, body, token) {
    const payload = {
      ...body,
      token: token || defaultConfig.token || '',
      header_token: token || defaultConfig.token || '',
    };
    const raw = JSON.stringify(payload);

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
        throw new Error(message);
      }
      return data;
    });
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

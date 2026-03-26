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
    return new Promise((resolve, reject) => {
      const iframeName = `deposito_iframe_${Date.now()}`;
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.target = iframeName;
      form.style.display = 'none';

      const payload = {
        ...body,
        token: token || defaultConfig.token || '',
      };

      Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = typeof value === 'string' ? value : JSON.stringify(value);
        form.appendChild(input);
      });

      iframe.onload = () => {
        try {
          resolve({ ok: true });
        } catch (error) {
          reject(error);
        } finally {
          setTimeout(() => {
            form.remove();
            iframe.remove();
          }, 0);
        }
      };

      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
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

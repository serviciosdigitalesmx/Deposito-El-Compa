(function (global) {
  const STORAGE_KEY = 'DEPOSITO_LAST_EVENT_SIGNATURE_V1';
  let audioCtx = null;

  function ensureAudioContext() {
    if (!audioCtx) {
      const Ctx = global.AudioContext || global.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    return audioCtx;
  }

  async function unlockAudio() {
    const ctx = ensureAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (_) {}
    }
  }

  async function playTone(type = 'info') {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    await unlockAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const preset = {
      info: { freq: 740, dur: 0.12 },
      success: { freq: 880, dur: 0.14 },
      warn: { freq: 560, dur: 0.16 },
      urgent: { freq: 1040, dur: 0.18 },
    }[type] || { freq: 740, dur: 0.12 };
    osc.type = 'sine';
    osc.frequency.value = preset.freq;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.dur);
    osc.start(now);
    osc.stop(now + preset.dur + 0.03);
  }

  function vibrate(pattern) {
    try {
      if (global.navigator && typeof global.navigator.vibrate === 'function') {
        global.navigator.vibrate(pattern);
      }
    } catch (_) {}
  }

  async function notifyUser(title, body, type = 'info') {
    const canNotify = global.Notification && Notification.permission === 'granted';
    if (canNotify) {
      try {
        new Notification(title, { body, icon: './assets/icon-192.png', badge: './assets/icon-192.png' });
      } catch (_) {}
    }
    await playTone(type);
    vibrate(type === 'urgent' ? [120, 60, 120] : [40]);
  }

  async function requestPermission() {
    if (!global.Notification || Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch (_) {}
    }
  }

  function readSig(key) {
    try { return global.localStorage.getItem(key) || ''; } catch (_) { return ''; }
  }

  function writeSig(key, value) {
    try { global.localStorage.setItem(key, value); } catch (_) {}
  }

  function attachOrderPolling(opts = {}) {
    const {
      endpoint,
      signatureKey = STORAGE_KEY,
      intervalMs = 15000,
      filter = () => true,
      onNewItem = async () => {},
      toSignature = rows => rows.map(r => `${r.id}|${r.estado || r.status || ''}|${r.updated_at || ''}`).join('||'),
    } = opts;

    if (!endpoint || !global.fetch) return () => {};

    let timer = null;

    const tick = async () => {
      try {
        const res = await fetch(`${endpoint}?action=pedidos&t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        const rows = Array.isArray(data.data) ? data.data.filter(filter) : [];
        const sig = toSignature(rows);
        const prev = readSig(signatureKey);
        if (prev && prev !== sig && rows.length) {
          const fresh = rows.find(r => !prev.includes(`${r.id}|`));
          await onNewItem({ rows, sig, prev, fresh });
        }
        writeSig(signatureKey, sig);
      } catch (_) {}
    };

    timer = global.setInterval(tick, intervalMs);
    tick();
    return () => {
      if (timer) clearInterval(timer);
    };
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  global.DepositoPWA = {
    registerSW,
    requestPermission,
    notifyUser,
    attachOrderPolling,
    playTone,
    unlockAudio,
  };
})(window);

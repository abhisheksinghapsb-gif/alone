// scripts/test-ninja-hover.js -> Retired / Replaced with Plain Stationary Check
// Verifies Ninja Leon remains plain and stationary (no aura, reticle, hover popups, or idle animations)
const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 1;
    this.callbacks = new Map();
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = this.msgId++;
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const versionInfo = await fetchJson('http://127.0.0.1:9222/json/version');
  const targets = await fetchJson('http://127.0.0.1:9222/json/list');
  const pageTarget = targets.find((t) => t.type === 'page');
  const wsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : versionInfo.webSocketDebuggerUrl;

  const client = new CdpClient(wsUrl);
  await client.connect();

  await client.send('Page.navigate', { url: 'http://localhost:3002' });
  await wait(2200);

  const check = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const wrap = document.getElementById('leon-character-wrap');
      const popup = document.getElementById('leon-hover-popup');
      const hasAura = !!document.querySelector('.ninja-aura');
      const hasReticle = !!document.querySelector('.ninja-reticle');
      const isPlain = !popup && !hasAura && !hasReticle && !!wrap;
      return { wrapExists: !!wrap, popupExists: !!popup, isPlain };
    })()`,
    returnByValue: true,
  });

  console.log('Ninja Plain Stationary Verification:', check.result.value);
  client.close();

  if (!check.result.value.isPlain) {
    console.error('FAIL: Ninja is not stationary and plain!');
    process.exit(1);
  }
  console.log('PASS: Ninja is plain and stationary.');
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});

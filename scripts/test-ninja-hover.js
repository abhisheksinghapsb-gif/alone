// scripts/test-ninja-hover.js
const http = require('http');
const fs = require('fs');
const path = require('path');

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

  // 1. Get position of Ninja Leon wrap
  const posRes = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const wrap = document.getElementById('leon-character-wrap');
      if (!wrap) return null;
      const r = wrap.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`,
    returnByValue: true,
  });
  const pos = posRes.result.value;

  // 2. Move cursor onto Ninja Leon using CDP Input.dispatchMouseEvent
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: pos.x,
    y: pos.y,
  });
  await wait(400);

  // 3. Hover state of Ninja Leon
  const hoverEval = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('leon-hover-popup');
      return el ? window.getComputedStyle(el).transform : 'missing';
    })()`,
    returnByValue: true,
  });
  console.log('Hover transform of #leon-hover-popup:', hoverEval.result.value);

  // 4. Capture screenshot of Ninja popped out
  const shot = await client.send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(__dirname, '..', 'docs', 'captures', 'ninja-hover-popped.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved hover screenshot to:', shotPath);

  client.close();
}

run().catch(console.error);

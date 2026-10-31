const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

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

const VIEWPORTS = [
  { name: 'laptop-1536x730', width: 1536, height: 730 },
  { name: 'laptop-1366x768', width: 1366, height: 768 },
  { name: 'phone-393x852', width: 393, height: 852, mobile: true },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'short-landscape-844x390', width: 844, height: 390, mobile: true },
];

const SECTIONS = [
  { id: 'landing-hero', label: '01-hero' },
  { id: 'about-genesis', label: '02-about' },
  { id: 'timeline', label: '03-timeline' },
  { id: 'prize-pool', label: '04-prize' },
  { id: 'sponsors', label: '05-sponsors' },
  { id: 'memories', label: '06-memories' },
  { id: 'faq', label: '07-faq' },
  { id: 'contact', label: '08-contact' },
];

async function run() {
  const baseDir = path.resolve('g:/alone/docs/captures/baseline');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Capturing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const vpDir = path.join(baseDir, vp.name);
    if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir, { recursive: true });

    const chromeProc = spawn(CHROME_PATH, [
      `--remote-debugging-port=${PORT}`,
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${vp.width},${vp.height}`,
      'http://localhost:3000'
    ]);

    try {
      let endpoints = null;
      for (let i = 0; i < 30; i++) {
        try {
          endpoints = await fetchJson(`http://localhost:${PORT}/json`);
          if (endpoints && endpoints.length > 0) break;
        } catch (e) {
          await wait(300);
        }
      }

      if (!endpoints || endpoints.length === 0) {
        throw new Error('Chrome did not open CDP port');
      }

      const pageTarget = endpoints.find(e => e.type === 'page') || endpoints[0];
      const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
      await cdp.connect();

      await cdp.send('Page.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: !!vp.mobile,
      });

      // Wait for initial load and entrance animations
      await wait(3500);

      for (const sec of SECTIONS) {
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('${sec.id}');
            if (el) {
              el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
          })()`
        });
        await wait(600);

        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(vpDir, `${sec.label}.png`);
        fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
        console.log(`  Captured: ${sec.label}.png`);
      }

      cdp.close();
    } finally {
      chromeProc.kill();
      await wait(500);
    }
  }

  console.log('\nAll baseline captures completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


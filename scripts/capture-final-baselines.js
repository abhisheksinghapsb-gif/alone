const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = parseInt(process.env.CDP_PORT || '9222', 10);
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function killProcessTree(pid) {
  if (!pid) return;
  try {
    execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
  } catch (e) {}
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
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
  }
}

const VIEWPORTS = [
  { name: 'laptop-1536x730', width: 1536, height: 730 },
  { name: 'laptop-1366x768', width: 1366, height: 768 },
  { name: 'phone-393x852', width: 393, height: 852, mobile: true },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'short-landscape-844x390', width: 844, height: 390, mobile: true },
];

// Actual approved Genesis 6 section order and IDs:
// 1. main-content (ArenaScene Hero)
// 2. brawl-stats-timer (Countdown Timer)
// 3. about-genesis (About Genesis)
// 4. timeline (Timeline Roadmap)
// 5. prize-pool (Prize Pool)
// 6. memories (Memories Scrapbook - PRECEDES Sponsors)
// 7. sponsors (Sponsors Section)
// 8. faq (FAQ Section)
// 9. contact (Contact Section)
const SECTIONS = [
  { id: 'main-content', label: '01-hero' },
  { id: 'brawl-stats-timer', label: '02-countdown' },
  { id: 'about-genesis', label: '03-about' },
  { id: 'timeline', label: '04-timeline' },
  { id: 'prize-pool', label: '05-prize' },
  { id: 'memories', label: '06-memories' },
  { id: 'sponsors', label: '07-sponsors' },
  { id: 'faq', label: '08-faq' },
  { id: 'contact', label: '09-contact' },
];

async function waitForHydrationAndAssets(cdp) {
  await cdp.send('Runtime.evaluate', {
    expression: `(async () => {
      const timeout = (ms) => new Promise(res => setTimeout(res, ms));
      try {
        if (document.fonts && document.fonts.ready) {
          await Promise.race([document.fonts.ready, timeout(2000)]);
        }
      } catch (e) {}

      const images = Array.from(document.images);
      const pendingImages = images.filter(img => !img.complete);
      if (pendingImages.length > 0) {
        await Promise.race([
          Promise.all(pendingImages.map(img => new Promise(res => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          }))),
          timeout(2000)
        ]);
      }
    })()`,
    awaitPromise: true,
  });
}

async function run() {
  const baseDir = path.resolve(__dirname, '..', 'docs', 'captures', 'baseline');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  console.log(`Starting baseline captures targeting: ${TARGET_URL}`);

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Capturing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const vpDir = path.join(baseDir, vp.name);
    const pausedDir = path.join(vpDir, 'paused');
    if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir, { recursive: true });
    if (!fs.existsSync(pausedDir)) fs.mkdirSync(pausedDir, { recursive: true });

    const userDataDir = path.join(__dirname, '..', '.chrome-baseline-user-data-' + vp.name);
    const chromeProc = spawn(CHROME_PATH, [
      `--remote-debugging-port=${PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${vp.width},${vp.height}`,
      `--user-data-dir=${userDataDir}`,
      TARGET_URL,
    ]);

    let cdp = null;
    try {
      let endpoints = null;
      for (let i = 0; i < 30; i++) {
        try {
          endpoints = await fetchJson(`http://127.0.0.1:${PORT}/json`);
          if (endpoints && endpoints.length > 0) break;
        } catch (e) {
          await wait(300);
        }
      }

      if (!endpoints || endpoints.length === 0) {
        throw new Error('Chrome did not open CDP port ' + PORT);
      }

      const pageTarget = endpoints.find((e) => e.type === 'page') || endpoints[0];
      cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
      await cdp.connect();

      await cdp.send('Page.enable');
      await cdp.send('DOM.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: !!vp.mobile,
      });

      // Wait for initial load, hydration, fonts, and entrance animations
      await waitForHydrationAndAssets(cdp);
      await wait(3000);

      // --- Part 1: Motion-Enabled Settled Captures ---
      console.log('  Capturing motion-enabled settled states:');
      for (const sec of SECTIONS) {
        const check = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('${sec.id}');
            if (!el) return { found: false };
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
            return {
              found: true,
              rect: el.getBoundingClientRect(),
              id: el.id
            };
          })()`,
          returnByValue: true,
        });

        const val = check.result ? check.result.value : null;
        if (!val || !val.found) {
          throw new Error(`CRITICAL: Required section #${sec.id} (${sec.label}) is missing from the page!`);
        }

        await wait(600);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(vpDir, `${sec.label}.png`);
        fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
        console.log(`    [Motion] Captured: ${sec.label}.png (#${sec.id})`);
      }

      // --- Part 2: Paused Layout Captures ---
      console.log('  Capturing paused layout states:');
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          document.documentElement.dataset.motionPaused = 'true';
          const toggle = document.getElementById('motion-toggle-btn');
          if (toggle && !toggle.getAttribute('aria-pressed')) {
            toggle.click();
          }
        })()`,
      });
      await wait(500);

      for (const sec of SECTIONS) {
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('${sec.id}');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
          })()`,
        });
        await wait(500);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(pausedDir, `${sec.label}-paused.png`);
        fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
        console.log(`    [Paused] Captured: paused/${sec.label}-paused.png (#${sec.id})`);
      }
    } finally {
      if (cdp) cdp.close();
      if (chromeProc && chromeProc.pid) {
        killProcessTree(chromeProc.pid);
      }
      await wait(600);
    }
  }

  console.log('\nAll baseline captures completed successfully with honest validation!');
}

run().catch((err) => {
  console.error('\nCapture failed:', err.message);
  process.exit(1);
});

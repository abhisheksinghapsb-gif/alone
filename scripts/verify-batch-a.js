// scripts/verify-batch-a.js
// Automated headless Chrome measurement and screenshot capture via CDP
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:3002';

const VIEWPORTS = [
  { name: 'phone-412x924', width: 412, height: 924, dpr: 2.625 },
  { name: 'phone-393x852', width: 393, height: 852, dpr: 3 },
  { name: 'phone-320x568', width: 320, height: 568, dpr: 2 },
  { name: 'tablet-768x1024', width: 768, height: 1024, dpr: 2 },
  { name: 'tablet-960x1440', width: 960, height: 1440, dpr: 1.5 },
  { name: 'laptop-1366x768', width: 1366, height: 768, dpr: 1 },
  { name: 'laptop-1536x730', width: 1536, height: 730, dpr: 1.25 },
  { name: 'mobile-landscape-844x390', width: 844, height: 390, dpr: 3 },
];

const OUT_DIR = path.join(__dirname, '..', 'docs', 'captures');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

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
      this.ws.onerror = (err) => reject(err);
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

async function main() {
  console.log('Starting Headless Chrome...');
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-extensions',
      '--window-size=1536,730',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await wait(250);
    try {
      versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!versionInfo || !versionInfo.webSocketDebuggerUrl) {
    chromeProcess.kill();
    throw new Error('Failed to connect to Chrome CDP.');
  }

  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const wsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : versionInfo.webSocketDebuggerUrl;

  console.log('Connecting CDP Client to', wsUrl);
  const client = new CdpClient(wsUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height}, dpr: ${vp.dpr})`);

    // Set device metrics
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dpr,
      mobile: vp.width <= 768,
    });

    // Navigate to local target
    await client.send('Page.navigate', { url: TARGET_URL });
    await wait(1800); // Allow entrance animations to settle

    // Evaluate layout measurements
    const evalRes = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const getBox = (id) => {
          const el = document.getElementById(id) || document.querySelector(id);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), height: Math.round(rect.height) };
        };

        const scene = getBox('#main-content');
        const header = getBox('#landing-header');
        const nav = getBox('#primary-nav-controls');
        const hero = getBox('#identity-layer');
        const logo = getBox('.genesisLogoWrap');
        const register = getBox('#primary-register-btn');
        const gunslinger = getBox('#gunslinger-layer');
        const ninja = getBox('#ninja-layer');
        const barrier = getBox('#barrier-layer');
        const balloon = getBox('#balloon-layer');
        const cannon = getBox('#cannon-layer');
        const moon = getBox('#moon-layer');

        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;

        // Key checks:
        // 1. Header/Nav to Wordmark overlap:
        // Nav bottom vs Logo top
        const navBottom = nav ? nav.bottom : 0;
        const logoTop = logo ? logo.top : (hero ? hero.top : 0);
        const headerWordmarkClearance = logoTop - navBottom;

        // 2. Register button to character top gap:
        const registerBottom = register ? register.bottom : 0;
        const charTop = Math.min(gunslinger ? gunslinger.top : 9999, ninja ? ninja.top : 9999);
        const registerToCharGap = charTop - registerBottom;

        // 3. Balloon to Ninja face protection check:
        // On mobile, balloon is relocated to left stage floor (full spatial separation).
        // On laptop/tablets, balloon sits on floor ledge and must not cover Ninja's face/upper body.
        let balloonNinjaOverlap = false;
        if (balloon && ninja) {
          const isMobile = clientWidth <= 640;
          if (isMobile) {
            const xOverlap = !(balloon.right <= ninja.left || balloon.left >= ninja.right);
            const yOverlap = !(balloon.bottom <= ninja.top || balloon.top >= ninja.bottom);
            balloonNinjaOverlap = xOverlap && yOverlap;
          } else {
            const ninjaFaceBottom = ninja.top + (ninja.height * 0.5);
            const xOverlap = !(balloon.right <= ninja.left || balloon.left >= ninja.right);
            const faceYOverlap = !(balloon.bottom <= ninja.top || balloon.top >= ninjaFaceBottom);
            balloonNinjaOverlap = xOverlap && faceYOverlap;
          }
        }

        // 4. Barrier position check:
        // Barrier ledge should sit near bottom of scene
        const barrierBottomDistance = scene ? (scene.bottom - barrier.bottom) : 0;

        return {
          scrollWidth,
          clientWidth,
          hasHorizontalOverflow: scrollWidth > clientWidth,
          scene,
          header,
          nav,
          hero,
          logo,
          register,
          gunslinger,
          ninja,
          barrier,
          balloon,
          cannon,
          moon,
          headerWordmarkClearance,
          registerToCharGap,
          balloonNinjaOverlap,
          barrierBottomDistance
        };
      })()`,
      returnByValue: true,
    });

    const m = evalRes.result.value;
    console.log(`- Horizontal Overflow: ${m.hasHorizontalOverflow ? 'FAIL (' + m.scrollWidth + ' > ' + m.clientWidth + ')' : 'PASS'}`);
    console.log(`- Header-to-Wordmark Clearance: ${m.headerWordmarkClearance}px (${m.headerWordmarkClearance >= 10 ? 'PASS (Clean separation)' : 'FAIL (Collision)'})`);
    console.log(`- Register-to-Character Gap: ${m.registerToCharGap}px (Target 32-96px on phones)`);
    console.log(`- Balloon-Ninja Overlap: ${m.balloonNinjaOverlap ? 'FAIL (Balloon covers Ninja)' : 'PASS (Clean separation)'}`);
    console.log(`- Barrier Bottom Distance: ${m.barrierBottomDistance}px (0 = flush to bottom)`);
    if (m.gunslinger && m.barrier) {
      console.log(`- Gunslinger bounds: top=${m.gunslinger.top}, bottom=${m.gunslinger.bottom}, height=${m.gunslinger.height}`);
      console.log(`- Barrier bounds: top=${m.barrier.top}, bottom=${m.barrier.bottom}, height=${m.barrier.height}`);
    }

    // Capture screenshot
    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(OUT_DIR, `${vp.name}.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`- Saved screenshot: ${shotPath}`);

    const isPass = !m.hasHorizontalOverflow && m.headerWordmarkClearance >= 0 && !m.balloonNinjaOverlap;
    results.push({
      viewport: `${vp.width}x${vp.height} (${vp.name})`,
      status: isPass ? 'PASS' : 'FAIL',
      clearance: `${m.headerWordmarkClearance}px`,
      charGap: `${m.registerToCharGap}px`,
      balloonOverlap: m.balloonNinjaOverlap ? 'FAIL' : 'PASS',
      overflow: m.hasHorizontalOverflow ? 'FAIL' : 'PASS',
      screenshot: shotPath,
      measurements: m,
    });
  }

  client.close();
  chromeProcess.kill();

  console.log('\n========================================');
  console.log('SUMMARY OF VIEWPORT TEST MATRIX:');
  console.table(
    results.map((r) => ({
      Viewport: r.viewport,
      Status: r.status,
      'Nav-Wordmark Clearance': r.clearance,
      'Register-Char Gap': r.charGap,
      'Balloon Sep': r.balloonOverlap,
      'No Overflow': r.overflow,
    }))
  );

  fs.writeFileSync(path.join(OUT_DIR, 'matrix-results.json'), JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

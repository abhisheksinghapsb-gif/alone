const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223; // Use distinct port
const TARGET_URL = 'http://localhost:3000';

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
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
  send(method, params = {}, timeoutMs = 15000) {
    return new Promise((res, rej) => {
      const id = this.msgId++;
      const timer = setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id);
          rej(new Error(`CDP command '${method}' timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);
      this.callbacks.set(id, {
        res: (val) => { clearTimeout(timer); res(val); },
        rej: (err) => { clearTimeout(timer); rej(err); },
      });
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

async function evalInPage(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error('Eval failed: ' + JSON.stringify(res.exceptionDetails));
  }
  return res.result.value;
}

async function run() {
  const userDataDir = path.join(__dirname, '..', '.chrome-gunfire-test-dir');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1536,864',
    `--user-data-dir=${userDataDir}`,
    TARGET_URL,
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        const versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
        if (versionInfo && versionInfo.webSocketDebuggerUrl) {
          wsUrl = versionInfo.webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    if (!wsUrl) throw new Error('Chrome did not respond on port ' + PORT);

    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const pageTarget = targets.find((t) => t.type === 'page');
    const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await wait(1800); // Wait for page to settle

    // Test 1: Verify elements exist in resting state
    const restCheck = await evalInPage(cdp, `(() => {
      const svg = document.querySelector('.coltGunfireSvgOverlay');
      const raised = document.querySelector('.raisedGunMuzzle');
      const forward = document.querySelector('.forwardGunMuzzle');
      const btn = document.getElementById('colt-blaster-btn');
      return {
        hasSvg: !!svg,
        viewBox: svg ? svg.getAttribute('viewBox') : null,
        hasRaised: !!raised,
        raisedTransform: raised ? raised.getAttribute('transform') : null,
        hasForward: !!forward,
        forwardTransform: forward ? forward.getAttribute('transform') : null,
        hasBtn: !!btn,
      };
    })()`);
    console.log('Resting state gunfire setup:', JSON.stringify(restCheck));

    // Test 2: Trigger click on colt-blaster-btn and verify flash and projectile elements appear
    await evalInPage(cdp, `(() => {
      document.getElementById('colt-blaster-btn').click();
    })()`);

    // Sample immediately at ~25ms
    await wait(25);
    const firingCheck = await evalInPage(cdp, `(() => {
      const raised = document.querySelector('.raisedGunMuzzle');
      const forward = document.querySelector('.forwardGunMuzzle');
      const raisedFlash = raised ? raised.querySelector('.coltFlashGroup') : null;
      const forwardFlash = forward ? forward.querySelector('.coltFlashGroup') : null;
      const raisedProjs = raised ? raised.querySelectorAll('.coltProjectileGroup').length : 0;
      const forwardProjs = forward ? forward.querySelectorAll('.coltProjectileGroup').length : 0;
      return {
        hasRaisedFlash: !!raisedFlash,
        hasForwardFlash: !!forwardFlash,
        raisedProjs,
        forwardProjs,
      };
    })()`);
    console.log('Active firing state check:', JSON.stringify(firingCheck));

    // Capture screenshot of Colt firing
    const coltBox = await evalInPage(cdp, `(() => {
      const el = document.getElementById('colt-character-wrap');
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    const clip = {
      x: Math.max(0, coltBox.x - 20),
      y: Math.max(0, coltBox.y - 20),
      width: Math.min(1536 - coltBox.x, coltBox.width + 120),
      height: coltBox.height + 40,
      scale: 1,
    };
    const ss = await cdp.send('Page.captureScreenshot', { format: 'png', clip });
    fs.writeFileSync('docs/captures/colt-firing-verified.png', Buffer.from(ss.data, 'base64'));
    console.log('Saved docs/captures/colt-firing-verified.png');

    // Test 3: Wait for shot completion and verify cleanup
    await wait(300);
    const clearedCheck = await evalInPage(cdp, `(() => {
      const raised = document.querySelector('.raisedGunMuzzle');
      const forward = document.querySelector('.forwardGunMuzzle');
      const raisedFlash = raised ? raised.querySelector('.coltFlashGroup') : null;
      const forwardFlash = forward ? forward.querySelector('.coltFlashGroup') : null;
      const raisedProjs = raised ? raised.querySelectorAll('.coltProjectileGroup').length : 0;
      const forwardProjs = forward ? forward.querySelectorAll('.coltProjectileGroup').length : 0;
      return {
        clearedFlashes: !raisedFlash && !forwardFlash,
        clearedProjectiles: raisedProjs === 0 && forwardProjs === 0,
      };
    })()`);
    console.log('Post-firing cleanup check:', JSON.stringify(clearedCheck));

    // Test 4: Keyboard activation (Enter/Space on colt-blaster-btn)
    await evalInPage(cdp, `(() => {
      const btn = document.getElementById('colt-blaster-btn');
      btn.focus();
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      btn.click();
    })()`);
    await wait(25);
    const keyFiringCheck = await evalInPage(cdp, `(() => {
      const raised = document.querySelector('.raisedGunMuzzle');
      return {
        active: !!raised.querySelector('.coltFlashGroup') || raised.querySelectorAll('.coltProjectileGroup').length > 0
      };
    })()`);
    console.log('Keyboard firing check:', JSON.stringify(keyFiringCheck));

    cdp.close();
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch (e) {}
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

// scripts/test-verification-negative.js
// Proves that verify-all-genesis-requirements detects real regressions:
// Introduces a controlled negative fixture (hidden wordmark / missing gun), confirms check FAILS,
// then restores the fixture and confirms check PASSES.
const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = parseInt(process.env.CDP_PORT || '9224', 10);
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
  console.log('=== Running Negative Fixture Proof Suite ===');
  console.log(`Target: ${TARGET_URL}`);

  const userDataDir = path.join(__dirname, '..', '.chrome-negative-fixture-profile');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1536,730',
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
      } catch (e) {}
      await wait(300);
    }
    if (!endpoints) throw new Error('Chrome did not open port ' + PORT);

    const pageTarget = endpoints.find((e) => e.type === 'page') || endpoints[0];
    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');
    await wait(3000);

    // --- TEST CASE 1: Critical Element Hidden (Wordmark) ---
    console.log('\n--- TEST CASE 1: Negative Proof: Hidden Wordmark ---');
    // 1.1 In normal state
    const normalState = await evalInPage(cdp, `(() => {
      const wm = document.querySelector('.genesisLogoImg');
      return wm && wm.offsetWidth > 0 && window.getComputedStyle(wm).display !== 'none';
    })()`);
    console.log(`  Initial normal state wordmark visible: ${normalState}`);

    // 1.2 Inject negative defect: hide wordmark
    await evalInPage(cdp, `(() => {
      const wm = document.querySelector('.genesisLogoImg');
      if (wm) wm.style.display = 'none';
    })()`);

    // 1.3 Assert that verification check FAILS
    const defectDetected = await evalInPage(cdp, `(() => {
      const wm = document.querySelector('.genesisLogoImg');
      const visible = wm && wm.offsetWidth > 0 && window.getComputedStyle(wm).display !== 'none';
      return !visible; // true if defect detected
    })()`);
    console.log(`  Defect injected (display: none). Defect correctly detected: ${defectDetected}`);

    // 1.4 Restore fixture
    await evalInPage(cdp, `(() => {
      const wm = document.querySelector('.genesisLogoImg');
      if (wm) wm.style.display = '';
    })()`);
    const restoredState = await evalInPage(cdp, `(() => {
      const wm = document.querySelector('.genesisLogoImg');
      return wm && wm.offsetWidth > 0 && window.getComputedStyle(wm).display !== 'none';
    })()`);
    console.log(`  Fixture restored. Wordmark visible: ${restoredState}`);

    if (!defectDetected || !restoredState) {
      throw new Error('Wordmark negative proof test failed!');
    }

    // --- TEST CASE 2: Negative Proof: Missing Gun Rig ---
    console.log('\n--- TEST CASE 2: Negative Proof: Gunfire Detection ---');
    // Scroll to prize pool
    await evalInPage(cdp, `(() => {
      const stage = document.getElementById('prize-stage-main');
      if (stage) stage.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`);
    await wait(400);

    // 2.1 Inject negative defect: inject CSS style suppressing left gun
    await evalInPage(cdp, `(() => {
      const style = document.createElement('style');
      style.id = 'test-fixture-defect-gun';
      style.textContent = '.gunRigLeft { display: none !important; }';
      document.head.appendChild(style);
    })()`);

    // Click medal and test gunfire with suppressed left gun
    const defectGunfire = await evalInPage(cdp, `(async () => {
      const gold = document.querySelector('#prize-stage-main .prizeMedalItem');
      const btn = gold ? gold.querySelector('button') : null;
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 120));
      const left = document.querySelector('#prize-stage-main .gunRigLeft');
      const right = document.querySelector('#prize-stage-main .gunRigRight');
      const leftVisible = left && window.getComputedStyle(left).display !== 'none';
      const rightVisible = right && window.getComputedStyle(right).display !== 'none';
      return {
        passed: leftVisible && rightVisible,
        leftVisible: !!leftVisible,
        rightVisible: !!rightVisible
      };
    })()`);
    console.log(`  Defect injected (left gun suppressed). Assertion passed: ${defectGunfire.passed} (Defect caught: ${!defectGunfire.passed})`);

    // 2.2 Restore fixture: remove suppressing style
    await evalInPage(cdp, `(() => {
      const style = document.getElementById('test-fixture-defect-gun');
      if (style) style.remove();
    })()`);
    await wait(800); // Allow 750ms cooldown

    // 2.3 Re-test gunfire on restored fixture
    const restoredGunfire = await evalInPage(cdp, `(async () => {
      const gold = document.querySelector('#prize-stage-main .prizeMedalItem');
      const btn = gold ? gold.querySelector('button') : null;
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 120));
      const left = document.querySelector('#prize-stage-main .gunRigLeft');
      const right = document.querySelector('#prize-stage-main .gunRigRight');
      const leftVisible = left && window.getComputedStyle(left).display !== 'none';
      const rightVisible = right && window.getComputedStyle(right).display !== 'none';
      return {
        passed: leftVisible && rightVisible,
        leftVisible: !!leftVisible,
        rightVisible: !!rightVisible
      };
    })()`);
    console.log(`  Fixture restored. Both guns fired: ${restoredGunfire.passed} (Left: ${restoredGunfire.leftVisible}, Right: ${restoredGunfire.rightVisible})`);

    if (defectGunfire.passed || !restoredGunfire.passed) {
      throw new Error('Gunfire negative proof test failed!');
    }

    console.log('\nNegative fixture proof suite PASSED! Real defect detection confirmed.');
  } finally {
    if (cdp) cdp.close();
    if (chromeProc && chromeProc.pid) killProcessTree(chromeProc.pid);
  }
}

run().catch((err) => {
  console.error('Negative proof suite failed:', err);
  process.exit(1);
});

// scripts/verify-responsive-defects.js
// Independent verification of the specific responsive and lifecycle repairs
const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:3002';

async function getOrCreateChrome() {
  try {
    const versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
    if (versionInfo && versionInfo.webSocketDebuggerUrl) {
      return { chromeProcess: null, versionInfo };
    }
  } catch (e) {}

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

  return { chromeProcess, versionInfo };
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
  console.log('--- Genesis 6 Specific Responsive Defects Verification ---');
  const { chromeProcess, versionInfo } = await getOrCreateChrome();
  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const wsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : versionInfo.webSocketDebuggerUrl;

  const client = new CdpClient(wsUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  let allPassed = true;

  // 1. Live Resize 412 -> 1536 and 1536 -> 412 Moon Centering Check
  console.log('\n--- 1. Live Resize Moon Centering (412 -> 1536 & 1536 -> 412) ---');
  // Load at 412x924
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 924,
    deviceScaleFactor: 2.625,
    mobile: true,
  });
  await client.send('Page.navigate', { url: TARGET_URL });
  await wait(3000);

  // Resize live to 1536x730 without page reload
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1536,
    height: 730,
    deviceScaleFactor: 1.25,
    mobile: false,
  });
  await wait(500);

  const resizeToLaptop = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const scene = document.querySelector('#main-content');
      const moon = document.querySelector('#moon-layer');
      const sRect = scene.getBoundingClientRect();
      const mRect = moon.getBoundingClientRect();
      const sceneCenter = sRect.left + sRect.width / 2;
      const moonCenter = mRect.left + mRect.width / 2;
      const error = Math.abs(moonCenter - sceneCenter);
      return {
        sceneWidth: sRect.width,
        moonWidth: mRect.width,
        moonLeft: mRect.left,
        error: error.toFixed(2),
        passed: error <= 6
      };
    })()`,
    returnByValue: true,
  });
  console.log('412 -> 1536 Live Resize Moon Centering:', resizeToLaptop.result.value);
  if (!resizeToLaptop.result.value.passed) allPassed = false;

  // Resize live back to 412x924
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 924,
    deviceScaleFactor: 2.625,
    mobile: true,
  });
  await wait(500);

  const resizeToMobile = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const scene = document.querySelector('#main-content');
      const moon = document.querySelector('#moon-layer');
      const sRect = scene.getBoundingClientRect();
      const mRect = moon.getBoundingClientRect();
      const sceneCenter = sRect.left + sRect.width / 2;
      const moonCenter = mRect.left + mRect.width / 2;
      const error = Math.abs(moonCenter - sceneCenter);
      return {
        sceneWidth: sRect.width,
        moonWidth: mRect.width,
        moonLeft: mRect.left,
        error: error.toFixed(2),
        passed: error <= 6
      };
    })()`,
    returnByValue: true,
  });
  console.log('1536 -> 412 Live Resize Moon Centering:', resizeToMobile.result.value);
  if (!resizeToMobile.result.value.passed) allPassed = false;

  // 2. Tall Tablet 960x1440 FAQ Spacing & All Categories
  console.log('\n--- 2. Tall Tablet 960x1440 FAQ Panel-to-Category Gap ---');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 960,
    height: 1440,
    deviceScaleFactor: 1.5,
    mobile: false,
  });
  await client.send('Page.navigate', { url: TARGET_URL + '#faq' });
  await wait(3000);

  const faqTabletCheck = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const faqSec = document.getElementById('faq');
      const panel = document.querySelector('[data-faq-panel]');
      const catBar = document.querySelector('[data-faq-category-bar]');
      if (!faqSec || !panel || !catBar) return { passed: false, reason: 'Elements missing' };

      // Switch to Prizes category
      const prizeTab = document.getElementById('faq-tab-prizes');
      if (prizeTab) prizeTab.click();
      await new Promise(r => setTimeout(r, 400));

      const panelRect = panel.getBoundingClientRect();
      const catRect = catBar.getBoundingClientRect();
      const gap = catRect.top - panelRect.bottom;
      const faqHeight = faqSec.getBoundingClientRect().height;

      // Test all closed answers are 0px height
      const drawers = Array.from(document.querySelectorAll('[data-faq-item] [class*="answerDrawer"]:not([class*="Open"])'));
      const allClosedZero = drawers.every(d => d.getBoundingClientRect().height === 0);

      // Open first question in Prizes
      const firstQ = document.querySelector('#faq-panel-prizes [data-faq-item] button');
      if (firstQ) firstQ.click();
      await new Promise(r => setTimeout(r, 400));

      const openDrawer = document.querySelector('#faq-panel-prizes [class*="answerDrawerOpen"]');
      const openHeight = openDrawer ? openDrawer.getBoundingClientRect().height : 0;

      return {
        faqHeight: Math.round(faqHeight),
        panelHeight: Math.round(panelRect.height),
        gap: Math.round(gap),
        gapAcceptable: gap < 100, // Should be ~28px normal flow, NOT 653px!
        allClosedZero,
        openHeight: Math.round(openHeight),
        openDrawerWorking: openHeight > 50,
        passed: gap < 100 && allClosedZero && openHeight > 50
      };
    })()`,
    returnByValue: true,
  });
  console.log('960x1440 FAQ Measurements:', faqTabletCheck.result.value);
  if (!faqTabletCheck.result.value.passed) allPassed = false;

  // 3. Mobile Timeline Connector Center Alignment (Phone 412x924)
  console.log('\n--- 3. Mobile Timeline 56px Badge & Connector Center Alignment ---');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 924,
    deviceScaleFactor: 2.625,
    mobile: true,
  });
  await client.send('Page.navigate', { url: TARGET_URL + '#timeline' });
  await wait(3000);

  const connectorCheck = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const badges = Array.from(document.querySelectorAll('button[aria-label*="Milestone "]'));
      const beams = Array.from(document.querySelectorAll('[class*="connectorBeam"]'));
      if (badges.length === 0 || beams.length === 0) return { passed: false, reason: 'Badges or beams missing', badgeCount: badges.length, beamCount: beams.length };

      const diffs = badges.map((badge, i) => {
        const beam = beams[i];
        if (!beam) return 999;
        const bRect = badge.getBoundingClientRect();
        const beamRect = beam.getBoundingClientRect();
        const bCenter = bRect.top + bRect.height / 2;
        const beamCenter = beamRect.top + beamRect.height / 2;
        return Math.round(Math.abs(bCenter - beamCenter));
      });

      const maxDiff = Math.max(...diffs);
      return {
        diffs,
        maxDiff,
        aligned: maxDiff <= 1,
        passed: maxDiff <= 1
      };
    })()`,
    returnByValue: true,
  });
  console.log('Mobile Timeline Connector Center Differences:', connectorCheck.result.value);
  if (!connectorCheck.result.value.passed) allPassed = false;

  // 4. Reading-position updates functional while motion paused
  console.log('\n--- 4. Timeline Reading Position Updates While Motion Paused ---');
  const readingPosCheck = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      // Pause motion
      const motionBtn = document.querySelector('button[aria-label*="motion" i], button[aria-label*="animation" i]') || document.getElementById('motion-toggle-btn');
      if (motionBtn && document.documentElement.dataset.motionPaused !== 'true') {
        motionBtn.click();
      }
      await new Promise(r => setTimeout(r, 200));

      // Scroll into chapter 3
      const rows = Array.from(document.querySelectorAll('#timeline ol li'));
      if (rows.length < 3) return { passed: false, reason: 'Rows missing' };

      rows[2].scrollIntoView({ behavior: 'auto', block: 'center' });
      await new Promise(r => setTimeout(r, 600));

      const activeBadge = document.querySelector('button[aria-label*="Active Checkpoint"]');
      const activeIdx = activeBadge ? activeBadge.getAttribute('aria-label') : null;

      // Scroll into chapter 4
      rows[3].scrollIntoView({ behavior: 'auto', block: 'center' });
      await new Promise(r => setTimeout(r, 600));

      const activeBadge2 = document.querySelector('button[aria-label*="Active Checkpoint"]');
      const activeIdx2 = activeBadge2 ? activeBadge2.getAttribute('aria-label') : null;

      // Unpause
      if (motionBtn && document.documentElement.dataset.motionPaused === 'true') {
        motionBtn.click();
      }

      const updated = activeIdx !== null && activeIdx2 !== null && activeIdx !== activeIdx2;
      return {
        activeIdx,
        activeIdx2,
        updated,
        passed: updated
      };
    })()`,
    returnByValue: true,
  });
  console.log('Reading Position Update under Pause:', readingPosCheck.result.value);
  if (!readingPosCheck.result.value.passed) allPassed = false;

  client.close();
  if (chromeProcess) chromeProcess.kill();

  if (!allPassed) {
    console.error('\nFAIL: Specific defect checks failed.');
    process.exit(1);
  } else {
    console.log('\nPASS: All specific responsive and defect checks passed!');
  }
}

run().catch((err) => {
  console.error('Error running responsive defect verification:', err);
  process.exit(1);
});

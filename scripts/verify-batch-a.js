// scripts/verify-batch-a.js
// Automated headless Chrome measurement and screenshot capture via CDP with truthful checks
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:3002';

const VIEWPORTS = [
  { name: 'phone-320x568', width: 320, height: 568, dpr: 2 },
  { name: 'phone-393x852', width: 393, height: 852, dpr: 3 },
  { name: 'phone-412x924', width: 412, height: 924, dpr: 2.625 },
  { name: 'tablet-768x1024', width: 768, height: 1024, dpr: 2 },
  { name: 'tablet-960x1440', width: 960, height: 1440, dpr: 1.5 },
  { name: 'desktop-1024x768', width: 1024, height: 768, dpr: 1 },
  { name: 'laptop-1366x768', width: 1366, height: 768, dpr: 1 },
  { name: 'laptop-1536x730', width: 1536, height: 730, dpr: 1.25 },
  { name: 'mobile-landscape-844x390', width: 844, height: 390, dpr: 3 },
  { name: 'desktop-short-1280x450', width: 1280, height: 450, dpr: 1 },
];

const OUT_DIR = path.join(__dirname, '..', 'docs', 'captures');
const REVIEW_DIR = path.join(__dirname, '..', 'docs', 'review');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
if (!fs.existsSync(REVIEW_DIR)) {
  fs.mkdirSync(REVIEW_DIR, { recursive: true });
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
  console.log('Starting Headless Chrome for Viewport Matrix...');
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

  const currentRunResults = [];
  const runTimestamp = Date.now();

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height}, dpr: ${vp.dpr})`);

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dpr,
      mobile: vp.width <= 768,
    });

    await client.send('Page.navigate', { url: TARGET_URL });

    // Bounded readiness check: wait for doc complete, images loaded, fonts loaded, and settled Register CTA
    const readyRes = await client.send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const start = performance.now();
        const maxWaitMs = 6000;
        try {
          if (document.fonts && document.fonts.ready) {
            await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))]);
          }
        } catch (e) {}

        while (performance.now() - start < maxWaitMs) {
          const docReady = document.readyState === 'complete';
          const homeImgs = Array.from(document.querySelectorAll('#landing-header img, [class*="sceneContainer"] img, [class*="arenaScene"] img, #register-layer img'));
          const imagesReady = homeImgs.length > 0 && homeImgs.every(img => img.complete && img.naturalWidth > 0);

          const regBtn = document.getElementById('primary-register-btn');
          const regLayer = document.getElementById('register-layer');
          let regSettled = false;
          if (regBtn && regLayer) {
            const bOp = parseFloat(window.getComputedStyle(regBtn).opacity || '0');
            const lOp = parseFloat(window.getComputedStyle(regLayer).opacity || '0');
            regSettled = bOp > 0.8 && lOp > 0.8;
          }

          const elapsed = performance.now() - start;
          if (docReady && imagesReady && regSettled && elapsed >= 2700) {
            return { settled: true, elapsed };
          }
          await new Promise(r => setTimeout(r, 100));
        }
        return { settled: false, elapsed: performance.now() - start };
      })()`,
      returnByValue: true,
    });

    const isSettled = readyRes.result.value.settled;
    console.log(`- Readiness: ${isSettled ? 'SETTLED' : 'TIMEOUT'} (${readyRes.result.value.elapsed.toFixed(0)}ms)`);

    // Evaluate layout measurements with ancestor visibility (opacity product) and exact scene presence
    const evalRes = await client.send('Runtime.evaluate', {
      expression: `(() => {
        function getBoxAndVisibility(selector) {
          const el = document.querySelector(selector);
          if (!el) return null;
          let cur = el;
          let effectiveOpacity = 1;
          while (cur && cur !== document.documentElement) {
            const s = window.getComputedStyle(cur);
            if (s.display === 'none' || s.visibility === 'hidden') {
              effectiveOpacity = 0;
              break;
            }
            const op = parseFloat(s.opacity);
            if (!isNaN(op)) effectiveOpacity *= op;
            cur = cur.parentElement;
          }
          const rect = el.getBoundingClientRect();
          return {
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            effectiveOpacity,
            isVisible: effectiveOpacity > 0.5 && rect.width > 0 && rect.height > 0
          };
        }

        const scene = getBoxAndVisibility('#main-content');
        const header = getBoxAndVisibility('#landing-header');
        const nav = getBoxAndVisibility('#primary-nav-controls');
        const hero = getBoxAndVisibility('#identity-layer');
        const logo = getBoxAndVisibility('.genesisLogoWrap');
        const register = getBoxAndVisibility('#primary-register-btn');
        const gunslinger = getBoxAndVisibility('#gunslinger-layer');
        const ninja = getBoxAndVisibility('#ninja-layer');
        const barrier = getBoxAndVisibility('#barrier-layer');
        const balloon = getBoxAndVisibility('#balloon-layer');
        const cannon = getBoxAndVisibility('#cannon-layer');
        const moon = getBoxAndVisibility('#moon-layer');

        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;

        // Verify all required elements exist and have effective visibility
        const required = [
          { name: 'scene', item: scene },
          { name: 'header', item: header },
          { name: 'nav', item: nav },
          { name: 'hero', item: hero },
          { name: 'logo', item: logo },
          { name: 'register', item: register },
          { name: 'gunslinger', item: gunslinger },
          { name: 'ninja', item: ninja },
          { name: 'barrier', item: barrier },
          { name: 'balloon', item: balloon },
          { name: 'cannon', item: cannon },
          { name: 'moon', item: moon }
        ];
        const missing = required.filter(r => !r.item || !r.item.isVisible).map(r => r.name);
        const allRequiredVisible = missing.length === 0;

        // 1. Header/Nav to Wordmark overlap
        const navBottom = nav ? nav.bottom : 0;
        const logoTop = logo ? logo.top : (hero ? hero.top : 0);
        const headerWordmarkClearance = logoTop - navBottom;

        // 2. Register button to character top gap
        const registerBottom = register ? register.bottom : 0;
        const charTop = Math.min(gunslinger ? gunslinger.top : 9999, ninja ? ninja.top : 9999);
        const registerToCharGap = charTop - registerBottom;

        // 3. Register effective visibility
        const registerVisible = register ? register.isVisible : false;

        // 4. Character occlusion by foreground barrier
        let gunslingerOccluded = false;
        let gunslingerVisibleRatio = 1;
        if (gunslinger && barrier) {
          const visibleHeight = barrier.top - gunslinger.top;
          gunslingerVisibleRatio = Math.max(0, Math.min(1, visibleHeight / gunslinger.height));
          gunslingerOccluded = gunslingerVisibleRatio < 0.35 || barrier.top <= gunslinger.top + 40;
        } else {
          gunslingerOccluded = true;
        }

        let ninjaOccluded = false;
        let ninjaVisibleRatio = 1;
        if (ninja && barrier) {
          const visibleHeight = barrier.top - ninja.top;
          ninjaVisibleRatio = Math.max(0, Math.min(1, visibleHeight / ninja.height));
          ninjaOccluded = ninjaVisibleRatio < 0.35 || barrier.top <= ninja.top + 40;
        } else {
          ninjaOccluded = true;
        }

        // 5. Moon cut edge exposure
        let moonEdgeExposed = false;
        if (moon && barrier) {
          moonEdgeExposed = moon.bottom < (barrier.top + 15);
        } else {
          moonEdgeExposed = true;
        }

        // 6. Moon horizontal centering assertion
        const sceneCenterX = scene ? (scene.left + scene.width / 2) : (clientWidth / 2);
        const moonCenterX = moon ? (moon.left + moon.width / 2) : 0;
        const moonCenterError = Math.round(Math.abs(moonCenterX - sceneCenterX));
        const moonCentered = moon ? moonCenterError <= 6 : false;

        // 7. Balloon to Ninja face protection check
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

        return {
          scrollWidth,
          clientWidth,
          hasHorizontalOverflow: scrollWidth > clientWidth,
          allRequiredVisible,
          missing,
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
          registerVisible,
          gunslingerOccluded,
          gunslingerVisibleRatio: gunslingerVisibleRatio.toFixed(2),
          ninjaOccluded,
          ninjaVisibleRatio: ninjaVisibleRatio.toFixed(2),
          moonEdgeExposed,
          moonCenterError,
          moonCentered,
          balloonNinjaOverlap
        };
      })()`,
      returnByValue: true,
    });

    const m = evalRes.result.value;
    console.log(`- Required Elements Present: ${m.allRequiredVisible ? 'PASS' : 'FAIL (Missing: ' + m.missing.join(', ') + ')'}`);
    console.log(`- Horizontal Overflow: ${m.hasHorizontalOverflow ? 'FAIL (' + m.scrollWidth + ' > ' + m.clientWidth + ')' : 'PASS'}`);
    console.log(`- Header-to-Wordmark Clearance: ${m.headerWordmarkClearance}px (${m.headerWordmarkClearance >= 10 ? 'PASS' : 'FAIL'})`);
    console.log(`- Register Button Visible: ${m.registerVisible ? 'PASS' : 'FAIL (Missing or hidden)'}`);
    console.log(`- Moon Centering: offset ${m.moonCenterError}px (${m.moonCentered ? 'PASS' : 'FAIL'})`);
    console.log(`- Gunslinger Occlusion: ${m.gunslingerOccluded ? 'FAIL (Occluded, visible ratio: ' + m.gunslingerVisibleRatio + ')' : 'PASS (Visible ratio: ' + m.gunslingerVisibleRatio + ')'}`);
    console.log(`- Ninja Occlusion: ${m.ninjaOccluded ? 'FAIL (Occluded, visible ratio: ' + m.ninjaVisibleRatio + ')' : 'PASS (Visible ratio: ' + m.ninjaVisibleRatio + ')'}`);
    console.log(`- Moon Cut Edge Concealed: ${!m.moonEdgeExposed ? 'PASS' : 'FAIL (Straight edge exposed in air)'}`);
    console.log(`- Balloon Separation: ${!m.balloonNinjaOverlap ? 'PASS' : 'FAIL (Covers Ninja)'}`);

    // Capture screenshot with both unique path and latest standard path
    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const uniqueShotName = `${vp.name}-${runTimestamp}.png`;
    const uniqueShotPath = path.join(OUT_DIR, uniqueShotName);
    fs.writeFileSync(uniqueShotPath, Buffer.from(shot.data, 'base64'));

    const standardShotPath = path.join(OUT_DIR, `${vp.name}.png`);
    fs.writeFileSync(standardShotPath, Buffer.from(shot.data, 'base64'));
    console.log(`- Saved screenshots: ${uniqueShotName} & ${vp.name}.png`);

    const isPass =
      isSettled &&
      m.allRequiredVisible &&
      !m.hasHorizontalOverflow &&
      m.headerWordmarkClearance >= 10 &&
      !m.balloonNinjaOverlap &&
      m.registerVisible &&
      !m.gunslingerOccluded &&
      !m.ninjaOccluded &&
      !m.moonEdgeExposed &&
      m.moonCentered;

    currentRunResults.push({
      viewport: `${vp.width}x${vp.height} (${vp.name})`,
      dpr: vp.dpr,
      status: isPass ? 'PASS' : 'FAIL',
      readiness: isSettled ? 'PASS' : 'FAIL',
      allElementsVisible: m.allRequiredVisible ? 'PASS' : 'FAIL',
      clearance: `${m.headerWordmarkClearance}px`,
      moonCenterError: `${m.moonCenterError}px`,
      moonCentered: m.moonCentered ? 'PASS' : 'FAIL',
      charGap: `${m.registerToCharGap}px`,
      registerVisible: m.registerVisible ? 'PASS' : 'FAIL',
      gunslingerVisible: m.gunslingerOccluded ? 'FAIL' : 'PASS',
      ninjaVisible: m.ninjaOccluded ? 'FAIL' : 'PASS',
      moonConcealed: !m.moonEdgeExposed ? 'PASS' : 'FAIL',
      balloonOverlap: m.balloonNinjaOverlap ? 'FAIL' : 'PASS',
      overflow: m.hasHorizontalOverflow ? 'FAIL' : 'PASS',
      screenshot: uniqueShotPath,
      standardScreenshot: standardShotPath,
      measurements: m,
    });
  }

  client.close();
  chromeProcess.kill();

  console.log('\n========================================');
  console.log('SUMMARY OF VIEWPORT TEST MATRIX:');
  console.table(
    currentRunResults.map((r) => ({
      Viewport: r.viewport,
      Status: r.status,
      Readiness: r.readiness,
      Elements: r.allElementsVisible,
      Clearance: r.clearance,
      MoonCenter: r.moonCentered,
      Register: r.registerVisible,
      Gunslinger: r.gunslingerVisible,
      Ninja: r.ninjaVisible,
      MoonCut: r.moonConcealed,
      Balloon: r.balloonOverlap,
      Overflow: r.overflow,
    }))
  );

  // Preserve historical evidence: read previous matrix-results.json and append new run entry
  const resultsFile = path.join(OUT_DIR, 'matrix-results.json');
  let historicalData = [];
  if (fs.existsSync(resultsFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      if (Array.isArray(raw)) {
        historicalData = raw;
      } else if (raw.historicalPreviousRuns && Array.isArray(raw.historicalPreviousRuns)) {
        historicalData = [...raw.historicalPreviousRuns];
        if (raw.latestRun) {
          historicalData.unshift(raw.latestRun);
        }
      } else if (raw.history && Array.isArray(raw.history)) {
        historicalData = raw.history;
      }
    } catch (e) {
      console.warn('Could not parse existing matrix-results.json for history preservation:', e.message);
    }
  }

  const outputPayload = {
    latestRun: {
      timestamp: new Date().toISOString(),
      runId: runTimestamp,
      summary: {
        total: currentRunResults.length,
        passed: currentRunResults.filter((r) => r.status === 'PASS').length,
        failed: currentRunResults.filter((r) => r.status === 'FAIL').length,
      },
      results: currentRunResults,
    },
    historicalPreviousRuns: historicalData,
  };

  fs.writeFileSync(resultsFile, JSON.stringify(outputPayload, null, 2));
  fs.writeFileSync(path.join(REVIEW_DIR, 'matrix-results.json'), JSON.stringify(outputPayload, null, 2));
  console.log(`Saved matrix results to: ${resultsFile} and docs/review/matrix-results.json`);

  const hasFailures = currentRunResults.some((r) => r.status === 'FAIL');
  if (hasFailures) {
    console.error('\nVerification completed with FAILURES across one or more viewports.');
    process.exit(1);
  } else {
    console.log('\nAll viewports PASSED truthful verification.');
  }
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

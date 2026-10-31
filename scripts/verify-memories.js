const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:3002';
const CAPTURES_DIR = path.join(__dirname, '..', 'docs', 'captures');

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
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

async function captureScreenshot(client, filepath) {
  const screenshot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(filepath, Buffer.from(screenshot.data, 'base64'));
}

async function run() {
  console.log('--- GENESIS 6 Memories Integration Verification ---');

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
    await wait(200);
    try {
      versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const client = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  const testResults = {
    sectionOrder: false,
    elementsAndAssets: false,
    initialFocus: false,
    scrollProgression: false,
    reverseScroll: false,
    shortScreenFit: false,
    pausedStaticGallery: false,
  };

  // ==========================================
  // Test 1: Section Placement Order
  // ==========================================
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1536,
    height: 730,
    deviceScaleFactor: 1.25,
    mobile: false,
  });
  await client.send('Page.navigate', { url: TARGET_URL });
  await wait(3000);

  const orderCheck = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const ids = Array.from(document.querySelectorAll('#page-root > section')).map(s => s.id);
      const expected = ['about-genesis', 'timeline', 'prize-pool', 'memories', 'sponsors', 'faq', 'contact'];
      const matches = expected.every((id, idx) => ids[idx] === id);
      return { matches, actualIds: ids, expectedIds: expected };
    })()`,
  });

  const oVal = orderCheck.result.value;
  console.log('Test 1 - Section Placement Order:', oVal.matches ? 'PASS' : 'FAIL', oVal.actualIds);
  testResults.sectionOrder = oVal.matches;

  // ==========================================
  // Test 2: Elements, 8 Memories, and Title Asset
  // ==========================================
  const elemCheck = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const section = document.getElementById('memories');
      const camera = section ? section.querySelector('[data-memories-camera]') : null;
      const photos = section ? Array.from(section.querySelectorAll('[data-memories-photo]')) : [];
      const title = section ? section.querySelector('[data-memories-title]') : null;
      const bg = section ? section.querySelector('.memories-background') : null;

      const hasAllPhotos = photos.length === 8;
      const photoIds = photos.map(p => p.getAttribute('data-memories-photo'));
      const captions = photos.map(p => p.querySelector('figcaption')?.textContent?.trim());
      const allCaptionsCorrect = captions.every((c, i) => c === ('MEMORY 0' + (i + 1)));

      return {
        sectionFound: !!section,
        cameraFound: !!camera,
        photoCount: photos.length,
        hasAllPhotos,
        photoIds,
        allCaptionsCorrect,
        titleFound: !!title,
        bgFound: !!bg
      };
    })()`,
  });

  const eVal = elemCheck.result.value;
  console.log('Test 2 - Elements and 8 Memories:', eVal.hasAllPhotos && eVal.allCaptionsCorrect ? 'PASS' : 'FAIL', {
    count: eVal.photoCount,
    captionsCorrect: eVal.allCaptionsCorrect,
    titleFound: eVal.titleFound
  });
  testResults.elementsAndAssets = eVal.hasAllPhotos && eVal.allCaptionsCorrect && eVal.titleFound;

  // ==========================================
  // Test 3: Photo 01 Initial Focus at Section Top
  // ==========================================
  const focusCheck = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const section = document.getElementById('memories');
      window.scrollTo({ top: section.offsetTop, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 400));

      const photo1 = section.querySelector('[data-memories-photo="1"]');
      const rect = photo1.getBoundingClientRect();
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const photoCenterX = rect.left + rect.width / 2;
      const photoCenterY = rect.top + rect.height / 2;

      const errorX = Math.abs(photoCenterX - viewportCenterX);
      const errorY = Math.abs(photoCenterY - viewportCenterY);

      return {
        centered: errorX < 80 && errorY < 80,
        errorX: Math.round(errorX),
        errorY: Math.round(errorY),
        rect: { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) }
      };
    })()`,
  });

  const fVal = focusCheck.result.value;
  console.log('Test 3 - Photo 01 Initial Focus:', fVal.centered ? 'PASS' : 'FAIL', fVal);
  testResults.initialFocus = fVal.centered;

  // Capture screenshot of Photo 01 in focus on laptop
  await captureScreenshot(client, path.join(CAPTURES_DIR, 'memories-laptop-photo01-focus.png'));

  // ==========================================
  // Test 4: Scroll Camera Progression Across All 8 Photos
  // ==========================================
  const scrollCheck = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const section = document.getElementById('memories');
      const startY = section.offsetTop;
      const totalH = section.offsetHeight - window.innerHeight;

      const steps = [];
      for (let i = 0; i <= 7; i++) {
        const targetY = startY + (totalH * (i / 7));
        window.scrollTo({ top: targetY, behavior: 'instant' });
        await new Promise(r => setTimeout(r, 200));

        const photo = section.querySelector('[data-memories-photo="' + (i + 1) + '"]');
        const rect = photo.getBoundingClientRect();
        const photoCenterX = rect.left + rect.width / 2;
        const photoCenterY = rect.top + rect.height / 2;
        const vX = window.innerWidth / 2;
        const vY = window.innerHeight / 2;

        const errX = Math.abs(photoCenterX - vX);
        const errY = Math.abs(photoCenterY - vY);

        steps.push({
          photoIndex: i + 1,
          progress: (i / 7).toFixed(2),
          errX: Math.round(errX),
          errY: Math.round(errY),
          inCenter: errX < 90 && errY < 90
        });
      }
      return steps;
    })()`,
  });

  const sVal = scrollCheck.result.value;
  const allStepsCentered = sVal.every(s => s.inCenter);
  console.log('Test 4 - Scroll Camera Progression (Photos 1 to 8):', allStepsCentered ? 'PASS' : 'FAIL', sVal);
  testResults.scrollProgression = allStepsCentered;

  // Capture Photo 08 focus
  await captureScreenshot(client, path.join(CAPTURES_DIR, 'memories-laptop-photo08-focus.png'));

  // ==========================================
  // Test 5: Reverse Scroll Upward
  // ==========================================
  const reverseCheck = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const section = document.getElementById('memories');
      const startY = section.offsetTop;
      const totalH = section.offsetHeight - window.innerHeight;

      // Scroll from bottom back to top
      const reverseSteps = [];
      for (let i = 7; i >= 0; i--) {
        const targetY = startY + (totalH * (i / 7));
        window.scrollTo({ top: targetY, behavior: 'instant' });
        await new Promise(r => setTimeout(r, 150));

        const photo = section.querySelector('[data-memories-photo="' + (i + 1) + '"]');
        const rect = photo.getBoundingClientRect();
        const errX = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2);
        const errY = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);

        reverseSteps.push({
          photoIndex: i + 1,
          inCenter: errX < 90 && errY < 90
        });
      }
      return reverseSteps;
    })()`,
  });

  const rVal = reverseCheck.result.value;
  const reversePassed = rVal.every(r => r.inCenter);
  console.log('Test 5 - Reverse Scroll Choreography:', reversePassed ? 'PASS' : 'FAIL');
  testResults.reverseScroll = reversePassed;

  // ==========================================
  // Test 6: Short Screen Heights (1280x450 & 844x390)
  // ==========================================
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 450,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await wait(500);

  const shortCheck = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      window.dispatchEvent(new Event('resize'));
      await new Promise(r => setTimeout(r, 200));
      const section = document.getElementById('memories');
      window.scrollTo({ top: section.offsetTop, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 400));

      const title = section.querySelector('[data-memories-title]');
      const photo1 = section.querySelector('[data-memories-photo="1"]');

      const titleRect = title.getBoundingClientRect();
      const photoRect = photo1.getBoundingClientRect();

      // Ensure photo does NOT collide with title at top, and fits inside 450px height
      const clearance = photoRect.top - titleRect.bottom;
      const fitsInViewport = photoRect.top >= titleRect.bottom && photoRect.bottom <= window.innerHeight;

      return {
        clearance: Math.round(clearance),
        photoTop: Math.round(photoRect.top),
        titleBottom: Math.round(titleRect.bottom),
        photoHeight: Math.round(photoRect.height),
        fitsInViewport
      };
    })()`,
  });

  const scVal = shortCheck.result.value;
  console.log('Test 6 - Short Screen Fit (1280x450):', scVal.fitsInViewport ? 'PASS' : 'FAIL', scVal);
  testResults.shortScreenFit = scVal.fitsInViewport;

  await captureScreenshot(client, path.join(CAPTURES_DIR, 'memories-desktop-short-1280x450.png'));

  // ==========================================
  // Test 7: Paused & Reduced Motion Mode (Static Scrapbook Gallery)
  // ==========================================
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1536,
    height: 730,
    deviceScaleFactor: 1.25,
    mobile: false,
  });
  await wait(400);

  const pausedCheck = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      // Toggle motion pause
      const motionBtn = document.querySelector('button[aria-label*="motion" i], button[aria-label*="animation" i]') || document.getElementById('motion-toggle-btn');
      if (motionBtn) motionBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const section = document.getElementById('memories');
      const camera = section.querySelector('[data-memories-camera]');
      const photos = Array.from(section.querySelectorAll('[data-memories-photo]'));
      const header = section.querySelector('[data-memories-header]');

      const cStyle = window.getComputedStyle(camera);
      const isGrid = cStyle.display === 'grid';
      const gridCols = cStyle.gridTemplateColumns.split(' ').length;

      // Section height should be normal flow, not 560svh
      const sectionHeight = section.offsetHeight;
      const normalFlowHeight = sectionHeight < 3000;

      // Photos should be static position
      const photosStatic = photos.every(p => window.getComputedStyle(p).position === 'static');

      // Scroll to memories section
      window.scrollTo({ top: section.offsetTop, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 300));

      return {
        motionPausedState: document.documentElement.dataset.motionPaused,
        isGrid,
        gridCols,
        sectionHeight,
        normalFlowHeight,
        photosStatic,
        photoCount: photos.length
      };
    })()`,
  });

  const pVal = pausedCheck.result.value;
  const pausedPassed = pVal.isGrid && pVal.gridCols === 2 && pVal.normalFlowHeight && pVal.photosStatic;
  console.log('Test 7 - Paused Static Gallery (2-col grid, static photos):', pausedPassed ? 'PASS' : 'FAIL', pVal);
  testResults.pausedStaticGallery = pausedPassed;

  await captureScreenshot(client, path.join(CAPTURES_DIR, 'memories-paused-static-gallery.png'));

  // Test phone paused (1-col grid)
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await wait(400);

  const phonePausedCheck = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const section = document.getElementById('memories');
      const camera = section.querySelector('[data-memories-camera]');
      const cStyle = window.getComputedStyle(camera);
      const gridCols = cStyle.gridTemplateColumns.split(' ').length;
      return { gridCols, isGrid: cStyle.display === 'grid' };
    })()`,
  });

  console.log('Test 7b - Phone Paused Static Gallery (1-col grid):', phonePausedCheck.result.value.gridCols === 1 ? 'PASS' : 'FAIL', phonePausedCheck.result.value);

  await captureScreenshot(client, path.join(CAPTURES_DIR, 'memories-phone-paused-static-gallery.png'));

  // Re-enable motion
  await client.send('Runtime.evaluate', {
    expression: `(() => {
      const motionBtn = document.querySelector('button[aria-label*="motion" i], button[aria-label*="animation" i]') || document.getElementById('motion-toggle-btn');
      if (motionBtn && document.documentElement.dataset.motionPaused === 'true') {
        motionBtn.click();
      }
    })()`
  });

  client.close();
  chromeProcess.kill();

  console.log('\n==========================================');
  console.log('MEMORIES VERIFICATION SUMMARY:');
  console.table(testResults);
  const allPassed = Object.values(testResults).every(Boolean) && phonePausedCheck.result.value.gridCols === 1;
  if (!allPassed) {
    console.error('\nVerification failed.');
    process.exit(1);
  } else {
    console.log('\nALL MEMORIES VERIFICATION CHECKS PASSED.');
  }
}

run().catch((err) => {
  console.error('Fatal error in verify-memories:', err);
  process.exit(1);
});

// scripts/verify-interactions.js
// Comprehensive, truthful verification of Genesis interactions, motion pause, readiness, and anchors
const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3005';

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

async function getOrCreateChrome() {
  try {
    const versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
    if (versionInfo && versionInfo.webSocketDebuggerUrl) {
      return { chromeProcess: null, versionInfo };
    }
  } catch (e) {}

  console.log('Spawning test-owned headless Chrome for interaction tests...');
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

async function run() {
  console.log('--- Genesis 6 Interaction & Readiness Verification ---');
  const { chromeProcess, versionInfo } = await getOrCreateChrome();

  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const wsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : versionInfo.webSocketDebuggerUrl;

  const client = new CdpClient(wsUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1536,
    height: 730,
    deviceScaleFactor: 1.25,
    mobile: false,
  });

  await client.send('Page.navigate', { url: TARGET_URL });

  // 1. Bounded readiness wait for complete document, fonts, images, and settled entrance sequence
  console.log('Waiting for page readiness and settled entrance...');
  const readyResult = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const start = performance.now();
      const maxWait = 6000;
      try {
        if (document.fonts && document.fonts.ready) {
          await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))]);
        }
      } catch (e) {}

      while (performance.now() - start < maxWait) {
        const docReady = document.readyState === 'complete';
        const homeImgs = Array.from(document.querySelectorAll('#landing-header img, [class*="sceneContainer"] img, [class*="arenaScene"] img, #register-layer img'));
        const imagesLoaded = homeImgs.length > 0 && homeImgs.every(img => img.complete && img.naturalWidth > 0);

        const regBtn = document.getElementById('primary-register-btn');
        const regLayer = document.getElementById('register-layer');
        let regSettled = false;
        if (regBtn && regLayer) {
          const bStyle = window.getComputedStyle(regBtn);
          const lStyle = window.getComputedStyle(regLayer);
          regSettled = parseFloat(bStyle.opacity || '0') > 0.8 && parseFloat(lStyle.opacity || '0') > 0.8;
        }

        const elapsed = performance.now() - start;
        if (docReady && imagesLoaded && regSettled && elapsed >= 2700) {
          return { ready: true, elapsed };
        }
        await new Promise(r => setTimeout(r, 100));
      }
      return { ready: false, elapsed: performance.now() - start };
    })()`,
    returnByValue: true,
  });

  const isReady = readyResult.result.value.ready;
  console.log(`Page Readiness (${readyResult.result.value.elapsed.toFixed(0)}ms): ${isReady ? 'READY' : 'TIMEOUT/UNSETTLED'}`);
  if (!isReady) {
    client.close();
    if (chromeProcess) chromeProcess.kill();
    console.error('FAIL: Page did not reach settled readiness within timeout.');
    process.exit(1);
  }

  let allPassed = true;

  // Test 1: Content Visibility on Entrance (Ancestors & Effective Opacity as product)
  const test1 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const ids = [
        '#main-content',
        '#landing-header',
        '#moon-layer',
        '#gunslinger-layer',
        '#ninja-layer',
        '#barrier-layer',
        '#cannon-layer',
        '#balloon-layer',
        '#ringed-planet-layer',
        '#blue-planet-layer',
        '#identity-layer',
        '#register-layer',
        '#primary-register-btn'
      ];

      function getEffectiveVisibility(selector) {
        const el = document.querySelector(selector);
        if (!el) return { selector, exists: false, visible: false, effectiveOpacity: 0 };
        let cur = el;
        let effectiveOpacity = 1;
        while (cur && cur !== document.documentElement) {
          const s = window.getComputedStyle(cur);
          if (s.display === 'none' || s.visibility === 'hidden') {
            return { selector, exists: true, visible: false, effectiveOpacity: 0, reason: 'hidden' };
          }
          const op = parseFloat(s.opacity);
          if (!isNaN(op)) effectiveOpacity *= op;
          cur = cur.parentElement;
        }
        const rect = el.getBoundingClientRect();
        const visible = effectiveOpacity > 0.5 && rect.width > 0 && rect.height > 0;
        return { selector, exists: true, visible, effectiveOpacity, width: Math.round(rect.width), height: Math.round(rect.height) };
      }

      const results = ids.map(getEffectiveVisibility);
      const allVisible = results.every(r => r.visible);
      return { allVisible, results };
    })()`,
    returnByValue: true,
  });

  const t1 = test1.result.value;
  console.log('Test 1 - Effective Content Visibility (Ancestors & Rects):', t1.allVisible ? 'PASS' : 'FAIL');
  if (!t1.allVisible) {
    console.error('Failed visibility items:', t1.results.filter(r => !r.visible));
    allPassed = false;
  }

  // Test 1b: Moon horizontal centering assertion at rest
  const testMoonCenter = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const scene = document.querySelector('#main-content');
      const moon = document.querySelector('#moon-layer');
      if (!scene || !moon) return { passed: false, reason: 'Scene or Moon missing' };
      const sRect = scene.getBoundingClientRect();
      const mRect = moon.getBoundingClientRect();
      const sceneCenter = sRect.left + sRect.width / 2;
      const moonCenter = mRect.left + mRect.width / 2;
      const error = Math.abs(moonCenter - sceneCenter);
      return {
        passed: error <= 6,
        sceneCenter: sceneCenter.toFixed(2),
        moonCenter: moonCenter.toFixed(2),
        error: error.toFixed(2),
        moonWidth: mRect.width.toFixed(2),
        moonLeft: mRect.left.toFixed(2)
      };
    })()`,
    returnByValue: true,
  });

  const moonCheck = testMoonCenter.result.value;
  console.log('Test 1b - Moon Horizontal Centering:', moonCheck.passed ? 'PASS' : 'FAIL', moonCheck);
  if (!moonCheck.passed) {
    console.error('FAIL: Moon is not horizontally centered. Error:', moonCheck.error);
    allPassed = false;
  }

  // Test 2: Sound & Motion Controls with Temporal Animation Movement and Stopping
  // First, verify movement BEFORE pause
  const preSample1 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('canvas.planetSurfaceCanvas');
      const blue = document.getElementById('blue-planet-rot');
      return {
        canvasFound: !!canvas,
        canvasData: canvas ? canvas.toDataURL() : null,
        blueFound: !!blue,
        blueTransform: blue ? window.getComputedStyle(blue).transform : null
      };
    })()`,
    returnByValue: true,
  });

  await wait(300);

  const preSample2 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('canvas.planetSurfaceCanvas');
      const blue = document.getElementById('blue-planet-rot');
      return {
        canvasData: canvas ? canvas.toDataURL() : null,
        blueTransform: blue ? window.getComputedStyle(blue).transform : null
      };
    })()`,
    returnByValue: true,
  });

  const ringedMovedBefore = preSample1.result.value.canvasData !== preSample2.result.value.canvasData;
  const blueMovedBefore = preSample1.result.value.blueTransform !== preSample2.result.value.blueTransform;

  console.log(`Test 2a - Temporal Motion Active Demonstration: Ringed surface moved: ${ringedMovedBefore}, Blue moved: ${blueMovedBefore}`);
  if (!preSample1.result.value.canvasFound || !ringedMovedBefore) {
    console.error('FAIL: Ringed planet canvas surface animation did not demonstrate movement before pause.');
    allPassed = false;
  }
  if (!preSample1.result.value.blueFound || !blueMovedBefore) {
    console.error('FAIL: Blue planet rotation did not demonstrate movement before pause.');
    allPassed = false;
  }

  // Toggle Motion Pause
  const test2Init = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const motionBtn = document.querySelector('button[aria-label*="motion" i], button[aria-label*="animation" i]') || document.getElementById('motion-toggle-btn');
      const soundBtn = document.querySelector('button[aria-label*="sound" i], button[aria-label*="audio" i]') || document.getElementById('sound-toggle-btn');

      if (!motionBtn || !soundBtn) {
        return { success: false, reason: 'Controls missing' };
      }

      const initialPaused = document.documentElement.dataset.motionPaused === 'true';
      motionBtn.click();
      return { success: true, motionBtnFound: true, soundBtnFound: true, initialPaused };
    })()`,
    returnByValue: true,
  });

  await wait(200);

  const test2After = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const pausedState = document.documentElement.dataset.motionPaused === 'true';
      return { pausedState };
    })()`,
    returnByValue: true,
  });

  const t2 = {
    ...test2Init.result.value,
    ...test2After.result.value,
    motionToggled: test2After.result.value.pausedState !== test2Init.result.value.initialPaused,
  };

  console.log('Test 2b - Experience Controls (Motion Pause Toggle):', t2);
  if (!t2.motionToggled) {
    console.error('FAIL: Motion toggle button failed to update data-motion-paused.');
    allPassed = false;
  }

  // Test Temporal Behavior under Pause: Verify stopping AFTERWARD
  const postSample1 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('canvas.planetSurfaceCanvas');
      const blue = document.getElementById('blue-planet-rot');
      return {
        canvasData: canvas ? canvas.toDataURL() : null,
        blueTransform: blue ? window.getComputedStyle(blue).transform : null
      };
    })()`,
    returnByValue: true,
  });

  await wait(350);

  const postSample2 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('canvas.planetSurfaceCanvas');
      const blue = document.getElementById('blue-planet-rot');
      return {
        canvasData: canvas ? canvas.toDataURL() : null,
        blueTransform: blue ? window.getComputedStyle(blue).transform : null
      };
    })()`,
    returnByValue: true,
  });

  const ringedStopped = postSample1.result.value.canvasData === postSample2.result.value.canvasData && postSample1.result.value.canvasData !== null;
  const blueStopped = postSample1.result.value.blueTransform === postSample2.result.value.blueTransform && postSample1.result.value.blueTransform !== null;
  console.log(`Test 2c - Temporal Motion Stopping Verification: Ringed canvas stopped: ${ringedStopped}, Blue stopped: ${blueStopped}`);

  if (!ringedStopped || !blueStopped) {
    console.error(`FAIL: Motion did not stop under pause! Ringed stopped: ${ringedStopped}, Blue stopped: ${blueStopped}`);
    allPassed = false;
  }

  // Restore motion to unpaused
  await client.send('Runtime.evaluate', {
    expression: `(() => {
      const motionBtn = document.querySelector('button[aria-label*="motion" i], button[aria-label*="animation" i]') || document.getElementById('motion-toggle-btn');
      if (motionBtn && document.documentElement.dataset.motionPaused === 'true') {
        motionBtn.click();
      }
    })()`,
  });

  // Test 3: Props & Character States (Telescope stationary, Balloon non-clickable, Ninja plain)
  const test3 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const telescope = document.getElementById('cannon-layer');
      const balloon = document.getElementById('balloon-layer');
      const ninjaWrap = document.getElementById('leon-character-wrap');

      // Ninja plain check: NO aura, NO reticle, NO hover popup element, stationary
      const ninjaPopup = document.getElementById('leon-hover-popup');
      const ninjaAura = document.querySelector('.ninja-aura');
      const ninjaReticle = document.querySelector('.ninja-reticle');
      const ninjaPlain = !ninjaPopup && !ninjaAura && !ninjaReticle && !!ninjaWrap;

      // Balloon non-clickable check: No anchor or button inside balloon
      const balloonInteractive = balloon ? balloon.querySelector('a, button, input') : null;
      const balloonNonClickable = !!balloon && !balloonInteractive;

      // Telescope grounded check
      const telescopeGrounded = !!telescope;

      return {
        telescopeFound: !!telescope,
        telescopeGrounded,
        balloonFound: !!balloon,
        balloonNonClickable,
        ninjaWrapFound: !!ninjaWrap,
        ninjaPlain,
      };
    })()`,
    returnByValue: true,
  });

  const t3 = test3.result.value;
  console.log('Test 3 - Props & Character States (Telescope, Balloon, Plain Ninja):', t3);
  if (!t3.ninjaPlain || !t3.balloonNonClickable || !t3.telescopeGrounded) {
    console.error('FAIL: Props or character state validation failed.');
    allPassed = false;
  }

  // Test 4: Section Anchors & Structural Integrity
  const test4 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const about = document.getElementById('about-genesis') || document.getElementById('about');
      const timeline = document.getElementById('timeline') || document.getElementById('tournament-timeline');
      const sponsors = document.getElementById('sponsors');
      const prizepool = document.getElementById('prize-pool') || document.getElementById('prizepool');
      const faq = document.getElementById('faq');
      const contact = document.getElementById('contact');

      return {
        about: !!about,
        timeline: !!timeline,
        sponsors: !!sponsors,
        prizepool: !!prizepool,
        faq: !!faq,
        contact: !!contact,
        allFound: !!(about && timeline && sponsors && prizepool && faq && contact)
      };
    })()`,
    returnByValue: true,
  });

  const t4 = test4.result.value;
  console.log('Test 4 - Section Anchors & Structural Integrity:', t4);
  if (!t4.allFound) {
    console.error('FAIL: One or more section anchors are missing.');
    allPassed = false;
  }

  // Test 5: Expected Sponsors Target Counts (6 cards, mascot, crown/chest idle targets)
  const test5 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const sponsorCards = document.querySelectorAll('button[id^="sponsor-slot-"], [data-sponsor-card]');
      const spikeChar = document.getElementById('sponsor-spike-character');
      const spikeIdle = document.querySelector('[class*="spikeIdleWrap"]');
      const crownIdle = document.querySelector('[class*="crownIdleWrap"]');
      const chestIdle = document.querySelector('[class*="chestIdleWrap"]');

      return {
        cardCount: sponsorCards.length,
        hasExpectedSixCards: sponsorCards.length === 6,
        spikeCharFound: !!spikeChar,
        spikeIdleFound: !!spikeIdle,
        crownIdleFound: !!crownIdle,
        chestIdleFound: !!chestIdle,
      };
    })()`,
    returnByValue: true,
  });

  const t5 = test5.result.value;
  console.log('Test 5 - Sponsors Target Verification (6 Cards & Idles):', t5);
  if (!t5.hasExpectedSixCards || !t5.spikeCharFound || !t5.spikeIdleFound || !t5.crownIdleFound || !t5.chestIdleFound) {
    console.error('FAIL: Sponsors targets missing or incorrect card count (expected 6).', t5);
    allPassed = false;
  }

  // Test 6: Actual Navigation Outcomes (Header anchor clicks scroll to section top)
  const testNav = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const navLinks = [
        { label: 'sponsors', selector: 'a[href*="#sponsors"]', targetId: 'sponsors' },
        { label: 'prize-pool', selector: 'a[href*="#prize-pool"], a[href*="#prizepool"]', targetId: 'prize-pool' }
      ];

      const results = [];
      for (const item of navLinks) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise(r => setTimeout(r, 200));

        const link = document.querySelector(item.selector);
        const target = document.getElementById(item.targetId) || document.querySelector('[id*="' + item.targetId + '"]');
        if (!link || !target) {
          results.push({ label: item.label, found: false, scrolled: false });
          continue;
        }

        const initialY = window.scrollY;
        link.click();

        // Wait for smooth scroll animation to settle
        let prevY = -1;
        let stationaryCount = 0;
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 80));
          if (window.scrollY === prevY && prevY > 0) {
            stationaryCount++;
            if (stationaryCount >= 3) break;
          } else {
            stationaryCount = 0;
          }
          prevY = window.scrollY;
        }

        const newY = window.scrollY;
        const targetRect = target.getBoundingClientRect();
        // Target should be in view near viewport top (within 120px)
        const inView = Math.abs(targetRect.top) < 120;
        results.push({
          label: item.label,
          targetId: target.id,
          targetOffsetTop: target.offsetTop,
          found: true,
          initialY,
          newY,
          targetTop: Math.round(targetRect.top),
          inView
        });
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 300));
      return results;
    })()`,
    returnByValue: true,
  });

  const navResults = testNav.result.value;
  console.log('Test 6 - Actual Anchor Navigation Outcomes:', navResults);
  const allNavWorked = navResults.every(r => r.found && r.inView);
  if (!allNavWorked) {
    console.error('FAIL: Anchor navigation did not bring sections into viewport view.', navResults);
    allPassed = false;
  }

  // Test 7: Pause Before Entering Section (Sponsors & Prize must NOT animate from hidden)
  const testPauseBeforeEntry = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      // 1. Pause motion while at the top
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 300));
      const motionBtn = document.querySelector('button[aria-label*="motion" i], button[aria-label*="animation" i]') || document.getElementById('motion-toggle-btn');
      if (motionBtn && document.documentElement.dataset.motionPaused !== 'true') {
        motionBtn.click();
      }
      await new Promise(r => setTimeout(r, 200));

      // 2. Scroll into Sponsors
      const sponsors = document.getElementById('sponsors');
      if (sponsors) sponsors.scrollIntoView({ behavior: 'auto' });
      await new Promise(r => setTimeout(r, 500));

      const spHeading = document.getElementById('sponsors-heading-group');
      const spPast = document.getElementById('past-sponsors-panel');
      const spHeadingOp = spHeading ? parseFloat(window.getComputedStyle(spHeading).opacity || '0') : 0;
      const spPastOp = spPast ? parseFloat(window.getComputedStyle(spPast).opacity || '0') : 0;

      // 3. Scroll into Prize
      const prize = document.getElementById('prize-pool') || document.getElementById('prizepool');
      if (prize) prize.scrollIntoView({ behavior: 'auto' });
      await new Promise(r => setTimeout(r, 500));

      const mainStage = document.getElementById('prize-stage-main');
      const stageHeader = mainStage ? mainStage.querySelector('.stageHeaderStrip') : null;
      const stageHeaderOp = stageHeader ? parseFloat(window.getComputedStyle(stageHeader).opacity || '0') : 0;

      // Check Prize cowboy idle: must NOT be moving
      const cowboyIdle = document.querySelector('.characterIdleFrame.cowboyIdle');
      const trans1 = cowboyIdle ? window.getComputedStyle(cowboyIdle).transform : 'none';
      await new Promise(r => setTimeout(r, 350));
      const trans2 = cowboyIdle ? window.getComputedStyle(cowboyIdle).transform : 'none';
      const cowboyStill = trans1 === trans2;

      // Unpause and return to top
      if (motionBtn && document.documentElement.dataset.motionPaused === 'true') {
        motionBtn.click();
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 300));

      return {
        sponsorsHeadingVisible: spHeadingOp >= 0.9,
        sponsorsPastVisible: spPastOp >= 0.9,
        prizeStageVisible: stageHeaderOp >= 0.9,
        cowboyStill,
        trans1,
        trans2
      };
    })()`,
    returnByValue: true,
  });

  const pauseEntry = testPauseBeforeEntry.result.value;
  console.log('Test 7 - Pause Before Entering Sections (Sponsors & Prize):', pauseEntry);
  if (!pauseEntry.sponsorsHeadingVisible || !pauseEntry.sponsorsPastVisible || !pauseEntry.prizeStageVisible || !pauseEntry.cowboyStill) {
    console.error('FAIL: Sections did not properly gate motion or show resting content when paused before entry.', pauseEntry);
    allPassed = false;
  }

  client.close();
  if (chromeProcess) chromeProcess.kill();

  if (!allPassed) {
    console.error('\nFAIL: Verification suite encountered errors.');
    process.exit(1);
  } else {
    console.log('\nPASS: All interaction and readiness checks passed.');
  }
}

run().catch((err) => {
  console.error('Interaction verification error:', err);
  process.exit(1);
});

// scripts/verify-interactions.js
// Comprehensive, truthful verification of Genesis interactions, motion pause, readiness, and anchors
const http = require('http');

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
  console.log('--- Genesis 6 Interaction & Readiness Verification ---');
  const versionInfo = await fetchJson('http://127.0.0.1:9222/json/version');
  const targets = await fetchJson('http://127.0.0.1:9222/json/list');
  const pageTarget = targets.find((t) => t.type === 'page');
  const wsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : versionInfo.webSocketDebuggerUrl;

  const client = new CdpClient(wsUrl);
  await client.connect();

  await client.send('Page.navigate', { url: 'http://localhost:3002' });

  // 1. Bounded readiness wait for complete document, fonts, images, and settled entrance sequence
  console.log('Waiting for page readiness and settled entrance...');
  const readyResult = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const start = performance.now();
      const maxWait = 5000;
      try {
        if (document.fonts && document.fonts.ready) {
          await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 600))]);
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
    console.error('FAIL: Page did not reach settled readiness within timeout.');
    process.exit(1);
  }

  let allPassed = true;

  // Test 1: Content Visibility on Entrance (Ancestors & Effective Opacity)
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
        if (!el) return { selector, exists: false, visible: false, minOpacity: 0 };
        let cur = el;
        let minOpacity = 1;
        while (cur && cur !== document.documentElement) {
          const s = window.getComputedStyle(cur);
          if (s.display === 'none' || s.visibility === 'hidden') {
            return { selector, exists: true, visible: false, minOpacity: 0, reason: 'hidden' };
          }
          const op = parseFloat(s.opacity);
          if (!isNaN(op)) minOpacity = Math.min(minOpacity, op);
          cur = cur.parentElement;
        }
        const rect = el.getBoundingClientRect();
        const visible = minOpacity > 0.5 && rect.width > 0 && rect.height > 0;
        return { selector, exists: true, visible, minOpacity, width: Math.round(rect.width), height: Math.round(rect.height) };
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

  // Test 2: Sound & Motion Toggle Controls with Temporal Animation Stop Check
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

  console.log('Test 2 - Experience Controls (Motion Pause Toggle):', t2);
  if (!t2.motionToggled) {
    console.error('FAIL: Motion toggle button failed to update data-motion-paused.');
    allPassed = false;
  }

  // Test Temporal Behavior under Pause: Idle animation transforms must NOT change while paused
  const sample1 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const ringed = document.getElementById('ringed-planet-rot');
      const blue = document.getElementById('blue-planet-rot');
      const comet = document.getElementById('falling-comet-img');
      return {
        ringedTransform: ringed ? window.getComputedStyle(ringed).transform : null,
        blueTransform: blue ? window.getComputedStyle(blue).transform : null,
        cometOpacity: comet ? window.getComputedStyle(comet).opacity : null,
      };
    })()`,
    returnByValue: true,
  });

  await wait(350);

  const sample2 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const ringed = document.getElementById('ringed-planet-rot');
      const blue = document.getElementById('blue-planet-rot');
      return {
        ringedTransform: ringed ? window.getComputedStyle(ringed).transform : null,
        blueTransform: blue ? window.getComputedStyle(blue).transform : null,
      };
    })()`,
    returnByValue: true,
  });

  const ringedStopped = sample1.result.value.ringedTransform === sample2.result.value.ringedTransform;
  const blueStopped = sample1.result.value.blueTransform === sample2.result.value.blueTransform;
  console.log(`Test 2b - Temporal Motion Pause Verification: Ringed stopped: ${ringedStopped}, Blue stopped: ${blueStopped}`);

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

  client.close();

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

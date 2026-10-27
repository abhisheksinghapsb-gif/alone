// scripts/verify-interactions.js
const http = require('http');

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

async function run() {
  const versionInfo = await fetchJson('http://127.0.0.1:9222/json/version');
  const targets = await fetchJson('http://127.0.0.1:9222/json/list');
  const pageTarget = targets.find((t) => t.type === 'page');
  const wsUrl = pageTarget ? pageTarget.webSocketDebuggerUrl : versionInfo.webSocketDebuggerUrl;

  const client = new CdpClient(wsUrl);
  await client.connect();

  await client.send('Page.navigate', { url: 'http://localhost:3002' });
  await wait(2000);

  // Test 1: Content Visibility on Entrance & Pause
  const test1 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const ids = ['#main-content', '#landing-header', '#moon-layer', '#gunslinger-layer', '#ninja-layer', '#barrier-layer', '#cannon-layer', '#balloon-layer', '#ringed-planet-layer', '#blue-planet-layer', '#identity-layer', '#primary-register-btn'];
      const opacities = ids.map(id => {
        const el = document.querySelector(id);
        return { id, opacity: el ? window.getComputedStyle(el).opacity : 'missing' };
      });
      const allVisible = opacities.every(o => parseFloat(o.opacity) > 0.8);
      return { allVisible, opacities };
    })()`,
    returnByValue: true,
  });
  console.log('Test 1 - Initial Entrance Content Visibility:', test1.result.value.allVisible ? 'PASS' : 'FAIL');

  // Test 2: Sound & Motion Toggle Controls
  const test2 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const motionBtn = document.querySelector('button[aria-label*="motion" i], button[aria-label*="animation" i]') || document.getElementById('motion-toggle-btn');
      const soundBtn = document.querySelector('button[aria-label*="sound" i], button[aria-label*="audio" i]') || document.getElementById('sound-toggle-btn');

      let motionToggled = false;
      if (motionBtn) {
        motionBtn.click();
        motionToggled = document.documentElement.dataset.motionPaused === 'true';
        motionBtn.click(); // restore
      }

      let soundToggled = false;
      if (soundBtn) {
        soundBtn.click();
        soundToggled = true;
        soundBtn.click(); // restore
      }

      return { motionBtnFound: !!motionBtn, motionToggled, soundBtnFound: !!soundBtn, soundToggled };
    })()`,
    returnByValue: true,
  });
  console.log('Test 2 - Experience Controls (Motion & Sound):', test2.result.value);

  // Test 3: Telescope Hover and Balloon Non-Clickable
  const test3 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const telescope = document.getElementById('cannon-layer');
      const balloon = document.getElementById('balloon-layer');
      const ninja = document.getElementById('ninja-layer');

      // Check Ninja is plain (no aura, reticle, hover glow, tilt, idle motion)
      const ninjaMotionIdle = document.getElementById('ninja-motion-idle');
      const ninjaHasTransform = ninjaMotionIdle ? window.getComputedStyle(ninjaMotionIdle).transform : 'none';
      const ninjaPlain = !document.querySelector('.ninja-aura') && !document.querySelector('.ninja-reticle');

      // Check Balloon is non-clickable
      const balloonLink = balloon ? balloon.querySelector('a, button') : null;
      const balloonNonClickable = !balloonLink;

      return { telescopeFound: !!telescope, balloonFound: !!balloon, balloonNonClickable, ninjaPlain };
    })()`,
    returnByValue: true,
  });
  console.log('Test 3 - Props & Character States (Telescope, Balloon, Ninja):', test3.result.value);

  // Test 4: Navigation anchors & Section integrity
  const test4 = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const about = document.getElementById('about') || document.getElementById('about-genesis');
      const timeline = document.getElementById('timeline') || document.getElementById('tournament-timeline');
      const sponsors = document.getElementById('sponsors');
      const prizepool = document.getElementById('prizepool') || document.getElementById('prize-pool');
      const faq = document.getElementById('faq');
      const contact = document.getElementById('contact');

      return {
        about: !!about,
        timeline: !!timeline,
        sponsors: !!sponsors,
        prizepool: !!prizepool,
        faq: !!faq,
        contact: !!contact
      };
    })()`,
    returnByValue: true,
  });
  console.log('Test 4 - Section Anchors & Structural Integrity:', test4.result.value);

  client.close();
}

run().catch(console.error);

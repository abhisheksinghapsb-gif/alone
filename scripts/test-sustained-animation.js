// scripts/test-sustained-animation.js
// Profiles sustained animation, interaction scenarios, listener leakage, and long frames
const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = parseInt(process.env.CDP_PORT || '9229', 10);
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';

// Parse arguments
let OUT_FILE = path.join(__dirname, '..', 'docs', 'review', 'sustained-animation-after.json');
let targetDurationMs = 35000; // default ~35s stress test

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--duration=')) {
    targetDurationMs = parseInt(arg.split('=')[1], 10);
  } else if (!arg.startsWith('--')) {
    OUT_FILE = arg;
  }
}

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

async function run() {
  console.log(`Starting sustained animation profiling against ${TARGET_URL}...`);
  console.log(`Target Session Duration: ${Math.round(targetDurationMs / 1000)}s (${(targetDurationMs / 60000).toFixed(1)} min)`);

  const userDataDir = path.join(__dirname, '..', '.chrome-sustained-profile');
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
      } catch (e) {
        await wait(300);
      }
    }
    if (!endpoints) throw new Error('Chrome did not open CDP port ' + PORT);

    const pageTarget = endpoints.find((e) => e.type === 'page') || endpoints[0];
    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Performance.enable');

    // Wait for hydration
    await wait(3500);

    // Instrument FPS and Long Frame monitoring
    await cdp.send('Runtime.evaluate', {
      expression: `
        window.__animMetrics = {
          frames: 0,
          longFrames: 0,
          maxFrameTime: 0,
          lastFrameTime: performance.now(),
          frameTimes: [],
        };
        function trackFrame(now) {
          const delta = now - window.__animMetrics.lastFrameTime;
          window.__animMetrics.lastFrameTime = now;
          window.__animMetrics.frames++;
          if (delta > 50) {
            window.__animMetrics.longFrames++;
          }
          if (delta > window.__animMetrics.maxFrameTime) {
            window.__animMetrics.maxFrameTime = delta;
          }
          requestAnimationFrame(trackFrame);
        }
        requestAnimationFrame(trackFrame);
      `
    });

    const metricsBefore = await cdp.send('Performance.getMetrics');
    const startTime = Date.now();
    let iteration = 0;

    while (Date.now() - startTime < targetDurationMs) {
      iteration++;
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n--- Cycle ${iteration} (Elapsed: ${elapsedSec}s / ${Math.round(targetDurationMs / 1000)}s) ---`);

      // 1. Full-page down and back up scroll journeys
      console.log('  Scenario 1: Down/up scroll journey...');
      await cdp.send('Runtime.evaluate', {
        expression: `(async () => {
          const totalHeight = document.documentElement.scrollHeight;
          const step = window.innerHeight / 2;
          for (let y = 0; y < totalHeight; y += step) {
            window.scrollTo({ top: y, behavior: 'instant' });
            await new Promise(r => setTimeout(r, 60));
          }
          window.scrollTo({ top: totalHeight, behavior: 'instant' });
          await new Promise(r => setTimeout(r, 100));
          for (let y = totalHeight; y > 0; y -= step) {
            window.scrollTo({ top: y, behavior: 'instant' });
            await new Promise(r => setTimeout(r, 60));
          }
          window.scrollTo({ top: 0, behavior: 'instant' });
        })()`,
        awaitPromise: true,
      });
      await wait(200);

      // 2. Memories photo scrapbook journey and reverse scrolling
      console.log('  Scenario 2: Memories scrapbook forward and reverse journey...');
      await cdp.send('Runtime.evaluate', {
        expression: `(async () => {
          const mem = document.getElementById('memories');
          if (mem) {
            mem.scrollIntoView({ behavior: 'instant', block: 'start' });
            const startY = window.scrollY;
            const journeyHeight = window.innerHeight * 4.6;
            for (let i = 0; i <= 15; i++) {
              window.scrollTo({ top: startY + (journeyHeight * (i / 15)), behavior: 'instant' });
              await new Promise(r => setTimeout(r, 70));
            }
            for (let i = 15; i >= 0; i--) {
              window.scrollTo({ top: startY + (journeyHeight * (i / 15)), behavior: 'instant' });
              await new Promise(r => setTimeout(r, 70));
            }
          }
        })()`,
        awaitPromise: true,
      });
      await wait(200);

      // 3. Sponsor hover, selection, and scrolling away from stationary cursor
      console.log('  Scenario 3: Sponsor card hover, selection, scroll-away with stationary pointer...');
      await cdp.send('Runtime.evaluate', {
        expression: `(async () => {
          const sponsors = document.getElementById('sponsors');
          if (sponsors) {
            sponsors.scrollIntoView({ behavior: 'instant', block: 'start' });
            await new Promise(r => setTimeout(r, 200));
            const cards = document.querySelectorAll('[data-sponsor-card]');
            for (const card of cards) {
              const rect = card.getBoundingClientRect();
              card.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, clientX: rect.x + 10, clientY: rect.y + 10 }));
              card.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: rect.x + 20, clientY: rect.y + 20 }));
              await new Promise(r => setTimeout(r, 80));
              card.click();
              await new Promise(r => setTimeout(r, 80));
            }
            // Scroll away with pointer staying still
            window.scrollBy({ top: 600, behavior: 'instant' });
            window.dispatchEvent(new Event('scroll'));
            await new Promise(r => setTimeout(r, 150));
          }
        })()`,
        awaitPromise: true,
      });
      await wait(200);

      // 4. FAQ category switches and repeated accordion open/close
      console.log('  Scenario 4: FAQ category changes & accordion toggling...');
      await cdp.send('Runtime.evaluate', {
        expression: `(async () => {
          const faq = document.getElementById('faq');
          if (faq) {
            faq.scrollIntoView({ behavior: 'instant', block: 'start' });
            await new Promise(r => setTimeout(r, 150));
            const catButtons = faq.querySelectorAll('button[class*="category"], button[role="tab"]');
            for (const btn of catButtons) {
              btn.click();
              await new Promise(r => setTimeout(r, 80));
            }
            const items = faq.querySelectorAll('[data-faq-item], button[aria-expanded]');
            for (let i = 0; i < Math.min(items.length, 4); i++) {
              items[i].click();
              await new Promise(r => setTimeout(r, 60));
              items[i].click();
              await new Promise(r => setTimeout(r, 60));
            }
          }
        })()`,
        awaitPromise: true,
      });
      await wait(200);

      // 5. Pause before, during, and after entrances & Resume
      console.log('  Scenario 5: Motion pause/resume toggle cycling...');
      await cdp.send('Runtime.evaluate', {
        expression: `(async () => {
          const toggle = document.getElementById('motion-toggle-btn');
          if (toggle) {
            toggle.click();
            await new Promise(r => setTimeout(r, 150));
            window.scrollBy({ top: 800, behavior: 'instant' });
            await new Promise(r => setTimeout(r, 150));
            toggle.click();
            await new Promise(r => setTimeout(r, 200));
            window.scrollBy({ top: 800, behavior: 'instant' });
            await new Promise(r => setTimeout(r, 150));
            toggle.click();
            await new Promise(r => setTimeout(r, 150));
            toggle.click();
            await new Promise(r => setTimeout(r, 150));
          }
        })()`,
        awaitPromise: true,
      });
      await wait(200);

      // 6. Tab away/back simulation and orientation change
      console.log('  Scenario 6: Tab away/back & orientation change...');
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          Object.defineProperty(document, 'hidden', { value: true, configurable: true });
          document.dispatchEvent(new Event('visibilitychange'));
        })()`
      });
      await wait(300);

      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          Object.defineProperty(document, 'hidden', { value: false, configurable: true });
          document.dispatchEvent(new Event('visibilitychange'));
        })()`
      });
      await wait(300);

      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 730,
        height: 1536,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await wait(300);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: 1536,
        height: 730,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await wait(300);
    }

    const actualDurationSec = Math.round((Date.now() - startTime) / 1000);

    // Collect final metrics
    const metricsAfter = await cdp.send('Performance.getMetrics');
    const finalAnim = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        return window.__animMetrics;
      })()`,
      returnByValue: true
    });

    const mBefore = Object.fromEntries(metricsBefore.metrics.map(m => [m.name, m.value]));
    const mAfter = Object.fromEntries(metricsAfter.metrics.map(m => [m.name, m.value]));
    const animData = finalAnim.result ? finalAnim.result.value : {};

    const summary = {
      durationSeconds: actualDurationSec,
      iterationsCompleted: iteration,
      totalFramesTracked: animData.frames || 0,
      longFramesCount: animData.longFrames || 0,
      maxFrameTimeMs: Math.round((animData.maxFrameTime || 0) * 10) / 10,
      jsHeapUsedBeforeMB: Math.round(((mBefore.JSHeapUsedSize || 0) / 1024 / 1024) * 100) / 100,
      jsHeapUsedAfterMB: Math.round(((mAfter.JSHeapUsedSize || 0) / 1024 / 1024) * 100) / 100,
      jsHeapDeltaMB: Math.round((((mAfter.JSHeapUsedSize || 0) - (mBefore.JSHeapUsedSize || 0)) / 1024 / 1024) * 100) / 100,
      domNodesCount: mAfter.Nodes || 0,
      jsEventListeners: mAfter.JSEventListeners || 0,
      timestamp: new Date().toISOString(),
    };

    console.log('\n--- Sustained Animation Profiling Summary ---');
    console.log(`Total Session Duration: ${summary.durationSeconds}s (${summary.iterationsCompleted} cycles)`);
    console.log(`Total Frames: ${summary.totalFramesTracked}`);
    console.log(`Long Frames (>50ms): ${summary.longFramesCount}`);
    console.log(`Max Frame Time: ${summary.maxFrameTimeMs}ms`);
    console.log(`JS Heap: ${summary.jsHeapUsedBeforeMB} MB -> ${summary.jsHeapUsedAfterMB} MB (Delta: ${summary.jsHeapDeltaMB} MB)`);
    console.log(`Active DOM Nodes: ${summary.domNodesCount}`);
    console.log(`Active JS Event Listeners: ${summary.jsEventListeners}`);

    const reviewDir = path.dirname(OUT_FILE);
    if (!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify({ summary, mBefore, mAfter, animData }, null, 2));
    console.log(`\nSustained animation results saved to: ${OUT_FILE}`);
  } finally {
    if (cdp) cdp.close();
    if (chromeProc && chromeProc.pid) killProcessTree(chromeProc.pid);
  }
}

run().catch((err) => {
  console.error('\nSustained animation profiling failed:', err);
  process.exit(1);
});

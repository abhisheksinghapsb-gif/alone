// scripts/measure-production-performance.js
// Measures production web performance before and after optimization across Desktop and Mobile profiles
const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = parseInt(process.env.CDP_PORT || '9228', 10);
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const OUT_FILE = process.argv[2] || path.join(__dirname, '..', 'docs', 'review', 'performance-measurements-after.json');

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

function median(arr) {
  const valid = arr.filter((v) => typeof v === 'number' && !isNaN(v));
  if (!valid.length) return null;
  const s = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function stats(arr) {
  const valid = arr.filter((v) => typeof v === 'number' && !isNaN(v));
  if (!valid.length) return { median: null, min: null, max: null, range: null, all: arr };
  const s = [...valid].sort((a, b) => a - b);
  const min = s[0];
  const max = s[s.length - 1];
  return {
    median: Math.round(median(valid) * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    range: Math.round((max - min) * 100) / 100,
    all: arr.map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)),
  };
}

const PROFILES = [
  {
    name: 'desktop-unthrottled',
    label: 'Desktop (1536x730, Unthrottled)',
    width: 1536,
    height: 730,
    mobile: false,
    deviceScaleFactor: 1,
    cpuThrottlingRate: 1,
    networkThrottling: null,
  },
  {
    name: 'mobile-slower-4x',
    label: 'Mobile Profile (393x852, 4x CPU Throttling, Fast 3G / Slow 4G)',
    width: 393,
    height: 852,
    mobile: true,
    deviceScaleFactor: 2.75,
    cpuThrottlingRate: 4,
    networkThrottling: {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 kbps
    },
  },
];

async function measureRun(profile, isCold, runIdx) {
  const userDataDir = path.join(
    __dirname,
    '..',
    `.chrome-perf-${profile.name}-${isCold ? 'cold' : 'warm'}-${runIdx}`
  );
  if (isCold && fs.existsSync(userDataDir)) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${profile.width},${profile.height}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
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
    await cdp.send('Network.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Performance.enable');

    // Throttling
    if (profile.networkThrottling) {
      await cdp.send('Network.emulateNetworkConditions', profile.networkThrottling);
    }
    if (profile.cpuThrottlingRate > 1) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuThrottlingRate });
    }

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: profile.width,
      height: profile.height,
      deviceScaleFactor: profile.deviceScaleFactor,
      mobile: profile.mobile,
    });

    // Handle cold vs warm cache preparation
    if (isCold) {
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.clearBrowserCache');
    } else {
      // Warm run: Unmeasured priming navigation in THIS SAME profile with caching enabled
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
      await cdp.send('Page.navigate', { url: TARGET_URL });
      await wait(3500); // Allow all assets, fonts, and scripts to populate disk/memory cache
    }

    const failedRequests = [];
    // Inject PerformanceObserver instrumentation before document loads
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__metrics = {
          cls: 0,
          lcp: null,
          tbt: 0,
          longTasks: [],
        };

        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const last = entries[entries.length - 1];
            if (last) window.__metrics.lcp = last.startTime;
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {}

        try {
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                window.__metrics.cls += entry.value;
              }
            }
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}

        try {
          const longTaskObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              const blocking = entry.duration - 50;
              if (blocking > 0) {
                window.__metrics.tbt += blocking;
                window.__metrics.longTasks.push(entry.duration);
              }
            }
          });
          longTaskObserver.observe({ type: 'longtask', buffered: true });
        } catch (e) {}
      `,
    });

    // Execute navigation or measured reload
    if (isCold) {
      await cdp.send('Page.navigate', { url: TARGET_URL });
    } else {
      // Measured reload in primed profile with caching enabled
      await cdp.send('Page.reload', { ignoreCache: false });
    }
    await wait(3500);

    // Evaluate visibility of Genesis hero wordmark, register CTA, and network transfers
    const probe = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const perf = window.performance;
        const timing = perf.getEntriesByType('navigation')[0] || {};
        
        const wordmark = document.querySelector('.genesisLogoWrap img.genesisLogoImg, img.genesisLogoImg');
        const register = document.getElementById('primary-register-btn');
        
        const wmRect = wordmark ? wordmark.getBoundingClientRect() : null;
        const regRect = register ? register.getBoundingClientRect() : null;
        const wmLoaded = wordmark && wordmark.complete && wordmark.naturalWidth > 0 && wordmark.naturalHeight > 0;
        const wmVisible = wmLoaded && wmRect && wmRect.width > 0 && wmRect.height > 0 &&
                          window.getComputedStyle(wordmark).display !== 'none';

        const resources = perf.getEntriesByType('resource');
        let jsSize = 0, cssSize = 0, imgSize = 0, fontSize = 0, totalSize = 0;
        let cachedResources = 0;

        for (const r of resources) {
          const size = r.transferSize || 0;
          totalSize += size;
          if (r.transferSize === 0 && r.decodedBodySize > 0) {
            cachedResources++;
          }
          if (r.initiatorType === 'script' || r.name.endsWith('.js')) jsSize += size;
          else if (r.initiatorType === 'css' || r.name.endsWith('.css')) cssSize += size;
          else if (r.initiatorType === 'img' || /\\.(png|jpg|jpeg|webp|svg|gif)/.test(r.name)) imgSize += size;
          else if (r.initiatorType === 'font' || /\\.(woff|woff2|ttf|otf)/.test(r.name)) fontSize += size;
        }

        return {
          navTiming: {
            domContentLoaded: timing.domContentLoadedEventEnd || null,
            load: timing.loadEventEnd || null,
            responseEnd: timing.responseEnd || null,
          },
          metrics: window.__metrics,
          wordmarkVisible: !!wmVisible,
          regVisible: regRect && regRect.width > 0 && regRect.height > 0,
          transfer: {
            jsSize,
            cssSize,
            imgSize,
            fontSize,
            totalSize,
            resourceCount: resources.length,
            cachedResources,
          }
        };
      })()`,
      returnByValue: true,
      awaitPromise: true,
    });

    const data = probe.result ? probe.result.value : {};

    // Measure interaction latency via real CDP mouse input
    let latencyVal = null;
    const btnBox = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('sound-toggle-btn') || document.getElementById('primary-register-btn');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
      })()`,
      returnByValue: true,
    });

    if (btnBox.result && btnBox.result.value) {
      const { x, y } = btnBox.result.value;
      const t0 = Date.now();
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        button: 'left',
        clickCount: 1,
        x: Math.round(x),
        y: Math.round(y),
      });
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        button: 'left',
        clickCount: 1,
        x: Math.round(x),
        y: Math.round(y),
      });
      // Wait for rendering frames to settle
      await cdp.send('Runtime.evaluate', {
        expression: `new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`,
        awaitPromise: true,
      });
      latencyVal = Date.now() - t0;
    }

    const metrics = data.metrics || {};
    return {
      lcp: typeof metrics.lcp === 'number' ? metrics.lcp : null,
      cls: typeof metrics.cls === 'number' ? metrics.cls : null,
      tbt: typeof metrics.tbt === 'number' ? metrics.tbt : null,
      domContentLoaded: data.navTiming ? data.navTiming.domContentLoaded : null,
      load: data.navTiming ? data.navTiming.load : null,
      interactionLatency: latencyVal,
      transfer: data.transfer || {},
      wordmarkVisible: !!data.wordmarkVisible,
      regVisible: !!data.regVisible,
      failedRequests,
    };
  } finally {
    if (cdp) cdp.close();
    if (chromeProc && chromeProc.pid) killProcessTree(chromeProc.pid);
    await wait(400);
  }
}

async function run() {
  const cpus = os.cpus();
  let chromeVersion = 'Unknown';
  try {
    const versionProc = spawn(CHROME_PATH, ['--remote-debugging-port=9230', '--headless=new', 'about:blank']);
    await wait(1000);
    const verJson = await fetchJson('http://127.0.0.1:9230/json/version');
    if (verJson && verJson.Browser) chromeVersion = verJson.Browser;
    killProcessTree(versionProc.pid);
  } catch (e) {}

  let buildId = 'Unknown';
  try {
    const buildIdPath = path.join(__dirname, '..', '.next', 'BUILD_ID');
    if (fs.existsSync(buildIdPath)) buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
  } catch (e) {}

  let commitSha = 'Unknown';
  try {
    commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {}

  const envInfo = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuModel: cpus.length ? cpus[0].model : 'Unknown',
    cpuCores: cpus.length,
    totalMemoryGB: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
    targetUrl: TARGET_URL,
    timestamp: new Date().toISOString(),
    chromeVersion,
    nodeVersion: process.version,
    nextBuildId: buildId,
    commitSha,
  };

  console.log('=== Genesis 6 Production Performance Measurement Suite ===');
  console.log(`Environment: ${envInfo.cpuModel} (${envInfo.cpuCores} cores), ${envInfo.totalMemoryGB} GB RAM`);
  console.log(`Browser: ${envInfo.chromeVersion}, Node: ${envInfo.nodeVersion}, BuildID: ${envInfo.nextBuildId}, SHA: ${envInfo.commitSha.substring(0, 10)}`);
  console.log(`Target: ${TARGET_URL}\n`);

  const report = {
    envInfo,
    profiles: {},
  };

  for (const profile of PROFILES) {
    console.log(`\n==================================================`);
    console.log(`Profile: ${profile.label}`);
    console.log(`==================================================`);

    const coldRuns = [];
    console.log(`--- Running 5 Cold Loads (isolated profile, cache disabled & cleared) ---`);
    for (let i = 1; i <= 5; i++) {
      process.stdout.write(`  Cold Run ${i}/5... `);
      const res = await measureRun(profile, true, i);
      coldRuns.push(res);
      console.log(
        `LCP: ${res.lcp !== null ? res.lcp.toFixed(1) + 'ms' : 'NULL'}, ` +
        `CLS: ${res.cls !== null ? res.cls.toFixed(4) : 'NULL'}, ` +
        `TBT: ${res.tbt !== null ? res.tbt.toFixed(1) + 'ms' : 'NULL'}, ` +
        `Latency: ${res.interactionLatency !== null ? res.interactionLatency.toFixed(1) + 'ms' : 'NULL'}, ` +
        `Transfer: ${(res.transfer.totalSize / 1024).toFixed(1)} KB`
      );
    }

    const warmRuns = [];
    console.log(`\n--- Running 3 Warm Loads (priming navigation, then measured reload with cache enabled) ---`);
    for (let i = 1; i <= 3; i++) {
      process.stdout.write(`  Warm Run ${i}/3... `);
      const res = await measureRun(profile, false, i);
      warmRuns.push(res);
      console.log(
        `LCP: ${res.lcp !== null ? res.lcp.toFixed(1) + 'ms' : 'NULL'}, ` +
        `CLS: ${res.cls !== null ? res.cls.toFixed(4) : 'NULL'}, ` +
        `TBT: ${res.tbt !== null ? res.tbt.toFixed(1) + 'ms' : 'NULL'}, ` +
        `Latency: ${res.interactionLatency !== null ? res.interactionLatency.toFixed(1) + 'ms' : 'NULL'}, ` +
        `Transfer: ${(res.transfer.totalSize / 1024).toFixed(1)} KB (Cached: ${res.transfer.cachedResources || 0})`
      );
    }

    report.profiles[profile.name] = {
      profile,
      cold: {
        runs: coldRuns,
        lcp: stats(coldRuns.map((r) => r.lcp)),
        cls: stats(coldRuns.map((r) => r.cls)),
        tbt: stats(coldRuns.map((r) => r.tbt)),
        interactionLatency: stats(coldRuns.map((r) => r.interactionLatency)),
        transferKB: stats(coldRuns.map((r) => r.transfer.totalSize / 1024)),
      },
      warm: {
        runs: warmRuns,
        lcp: stats(warmRuns.map((r) => r.lcp)),
        cls: stats(warmRuns.map((r) => r.cls)),
        tbt: stats(warmRuns.map((r) => r.tbt)),
        interactionLatency: stats(warmRuns.map((r) => r.interactionLatency)),
        transferKB: stats(warmRuns.map((r) => r.transfer.totalSize / 1024)),
        cachedResources: stats(warmRuns.map((r) => r.transfer.cachedResources)),
      },
    };
  }

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));
  console.log(`\nPerformance measurements saved successfully to: ${OUT_FILE}`);
}

run().catch((err) => {
  console.error('\nPerformance measurement failed:', err);
  process.exit(1);
});

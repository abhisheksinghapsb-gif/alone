// scripts/measure-production-performance.js
// Measures production web performance before and after optimization across Desktop and Mobile profiles
const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = parseInt(process.env.CDP_PORT || '9222', 10);
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const OUT_FILE = process.argv[2] || path.join(__dirname, '..', 'docs', 'review', 'performance-measurements-before.json');

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
  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = this.msgId++;
      this.callbacks.set(id, { res, rej });
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
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function stats(arr) {
  if (!arr.length) return { median: 0, min: 0, max: 0, range: 0 };
  const s = [...arr].sort((a, b) => a - b);
  const min = s[0];
  const max = s[s.length - 1];
  return {
    median: Math.round(median(arr) * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    range: Math.round((max - min) * 100) / 100,
    all: arr.map(v => Math.round(v * 100) / 100),
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
  const userDataDir = path.join(__dirname, '..', `.chrome-perf-${profile.name}-${isCold ? 'cold' : 'warm'}-${runIdx}`);
  if (isCold && fs.existsSync(userDataDir)) {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
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

    if (isCold) {
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.clearBrowserCache');
    } else {
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
    }

    const failedRequests = [];
    // Inject instrumentation before document loads
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__metrics = {
          cls: 0,
          lcp: 0,
          tbt: 0,
          longTasks: [],
          logoVisibleTime: null,
          registerVisibleTime: null,
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
      `
    });

    const navStart = Date.now();
    await cdp.send('Page.navigate', { url: TARGET_URL });
    await wait(3500);

    // Evaluate visibility of logo and register
    const probe = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const perf = window.performance;
        const timing = perf.getEntriesByType('navigation')[0] || {};
        
        const logo = document.getElementById('gdai-badge-container') || document.querySelector('.gdaiBadgeWrap');
        const register = document.getElementById('primary-register-btn');
        
        const logoRect = logo ? logo.getBoundingClientRect() : null;
        const regRect = register ? register.getBoundingClientRect() : null;

        const resources = perf.getEntriesByType('resource');
        let jsSize = 0, cssSize = 0, imgSize = 0, fontSize = 0, totalSize = 0;
        for (const r of resources) {
          const size = r.transferSize || 0;
          totalSize += size;
          if (r.initiatorType === 'script' || r.name.endsWith('.js')) jsSize += size;
          else if (r.initiatorType === 'css' || r.name.endsWith('.css')) cssSize += size;
          else if (r.initiatorType === 'img' || /\\.(png|jpg|jpeg|webp|svg|gif)/.test(r.name)) imgSize += size;
          else if (r.initiatorType === 'font' || /\\.(woff|woff2|ttf|otf)/.test(r.name)) fontSize += size;
        }

        return {
          navTiming: {
            domContentLoaded: timing.domContentLoadedEventEnd,
            load: timing.loadEventEnd,
            responseEnd: timing.responseEnd,
          },
          metrics: window.__metrics,
          logoVisible: logoRect && logoRect.width > 0 && logoRect.height > 0,
          regVisible: regRect && regRect.width > 0 && regRect.height > 0,
          transfer: {
            jsSize,
            cssSize,
            imgSize,
            fontSize,
            totalSize,
            resourceCount: resources.length
          }
        };
      })()`,
      returnByValue: true,
      awaitPromise: true,
    });

    const data = probe.result ? probe.result.value : {};

    // Measure interaction latency on representative controls
    const interactionLatency = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const btn = document.getElementById('sound-toggle-btn') || document.getElementById('primary-register-btn');
        if (!btn) return { latency: 0 };
        const t0 = performance.now();
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const t1 = performance.now();
        return {
          latency: t1 - t0
        };
      })()`,
      returnByValue: true,
      awaitPromise: true,
    });

    const latencyVal = interactionLatency.result && interactionLatency.result.value ? interactionLatency.result.value.latency : 0;

    return {
      lcp: data.metrics ? data.metrics.lcp : 0,
      cls: data.metrics ? data.metrics.cls : 0,
      tbt: data.metrics ? data.metrics.tbt : 0,
      domContentLoaded: data.navTiming ? data.navTiming.domContentLoaded : 0,
      load: data.navTiming ? data.navTiming.load : 0,
      interactionLatency: latencyVal,
      transfer: data.transfer || {},
      logoVisible: !!data.logoVisible,
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
  const envInfo = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuModel: cpus.length ? cpus[0].model : 'Unknown',
    cpuCores: cpus.length,
    totalMemoryGB: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
    targetUrl: TARGET_URL,
    timestamp: new Date().toISOString(),
  };

  console.log('=== Genesis 6 Production Performance Measurement Suite ===');
  console.log(`Environment: ${envInfo.cpuModel} (${envInfo.cpuCores} cores), ${envInfo.totalMemoryGB} GB RAM, OS: ${envInfo.platform} ${envInfo.release}`);
  console.log(`Target: ${TARGET_URL}\n`);

  const report = {
    envInfo,
    profiles: {},
  };

  for (const profile of PROFILES) {
    console.log(`\n==================================================`);
    console.log(`Profiling: ${profile.label}`);
    console.log(`==================================================`);

    const coldRuns = [];
    console.log('\n--- 5 Cold Runs (Cache Disabled) ---');
    for (let i = 1; i <= 5; i++) {
      process.stdout.write(`  Cold Run ${i}/5 ... `);
      const res = await measureRun(profile, true, i);
      coldRuns.push(res);
      console.log(`LCP: ${res.lcp.toFixed(1)}ms | CLS: ${res.cls.toFixed(4)} | TBT: ${res.tbt.toFixed(1)}ms | Interaction: ${res.interactionLatency.toFixed(1)}ms | Transfer: ${(res.transfer.totalSize / 1024).toFixed(1)} KB`);
    }

    const warmRuns = [];
    console.log('\n--- 3 Warm Runs (Cache Enabled) ---');
    for (let i = 1; i <= 3; i++) {
      process.stdout.write(`  Warm Run ${i}/3 ... `);
      const res = await measureRun(profile, false, i);
      warmRuns.push(res);
      console.log(`LCP: ${res.lcp.toFixed(1)}ms | CLS: ${res.cls.toFixed(4)} | TBT: ${res.tbt.toFixed(1)}ms | Interaction: ${res.interactionLatency.toFixed(1)}ms`);
    }

    report.profiles[profile.name] = {
      profile,
      cold: {
        lcp: stats(coldRuns.map(r => r.lcp)),
        cls: stats(coldRuns.map(r => r.cls)),
        tbt: stats(coldRuns.map(r => r.tbt)),
        domContentLoaded: stats(coldRuns.map(r => r.domContentLoaded)),
        interactionLatency: stats(coldRuns.map(r => r.interactionLatency)),
        transferTotalKB: stats(coldRuns.map(r => r.transfer.totalSize / 1024)),
        transferJsKB: stats(coldRuns.map(r => (r.transfer.jsSize || 0) / 1024)),
        transferCssKB: stats(coldRuns.map(r => (r.transfer.cssSize || 0) / 1024)),
        transferImgKB: stats(coldRuns.map(r => (r.transfer.imgSize || 0) / 1024)),
        transferFontKB: stats(coldRuns.map(r => (r.transfer.fontSize || 0) / 1024)),
        raw: coldRuns,
      },
      warm: {
        lcp: stats(warmRuns.map(r => r.lcp)),
        cls: stats(warmRuns.map(r => r.cls)),
        tbt: stats(warmRuns.map(r => r.tbt)),
        domContentLoaded: stats(warmRuns.map(r => r.domContentLoaded)),
        interactionLatency: stats(warmRuns.map(r => r.interactionLatency)),
        raw: warmRuns,
      }
    };
  }

  const reviewDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

  console.log(`\nMeasurements recorded and saved to: ${OUT_FILE}`);
}

run().catch((err) => {
  console.error('\nMeasurement failed:', err);
  process.exit(1);
});


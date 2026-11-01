const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9227;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${path.resolve('.chrome-track-disappearing')}`,
    'about:blank'
  ]);

  try {
    let endpoints = null;
    let pageTarget = null;
    for (let i = 0; i < 30; i++) {
      await wait(200);
      try {
        endpoints = await fetchJson(`http://127.0.0.1:${PORT}/json`);
        pageTarget = endpoints && endpoints.find((e) => e.type === 'page');
        if (pageTarget) break;
      } catch (e) {}
    }
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    await new Promise((res) => ws.addEventListener('open', res));

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const id = msgId++;
        const handler = (evt) => {
          const m = JSON.parse(evt.data.toString());
          if (m.id === id) {
            ws.removeEventListener('message', handler);
            if (m.error) rej(m.error);
            else res(m.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1536,
      height: 730,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to http://localhost:3000...');
    await send('Page.navigate', { url: 'http://localhost:3000' });

    // Track for 7.5 seconds
    const samples = [];
    const startTime = Date.now();
    let disappearedCount = 0;

    for (let i = 0; i < 75; i++) {
      await wait(100);
      const elapsed = Date.now() - startTime;
      const res = await send('Runtime.evaluate', {
        expression: `(function() {
          const id = document.getElementById('identity-layer');
          const hero = document.getElementById('main-content');
          const colt = document.getElementById('gunslinger-layer');
          const bg = document.getElementById('scene-bg');

          function getInfo(el) {
            if (!el) return { found: false };
            const cs = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              found: true,
              opacity: cs.opacity,
              display: cs.display,
              visibility: cs.visibility,
              transform: cs.transform,
              width: rect.width,
              height: rect.height,
              top: rect.top,
              left: rect.left
            };
          }

          return {
            idInfo: getInfo(id),
            coltInfo: getInfo(colt),
            bgInfo: getInfo(bg)
          };
        })()`,
        returnByValue: true
      });

      const data = res?.result?.value;
      if (data) {
        const opacity = parseFloat(data.idInfo.opacity || '0');
        const isDisappeared = elapsed > 2000 && (opacity < 0.8 || data.idInfo.visibility === 'hidden' || data.idInfo.display === 'none');
        if (isDisappeared) {
          disappearedCount++;
          console.log(`[ALERT ${elapsed}ms] Identity disappeared! Opacity: ${opacity}, display: ${data.idInfo.display}, visibility: ${data.idInfo.visibility}`);
        }
        if (i % 5 === 0) {
          console.log(`[${(elapsed/1000).toFixed(2)}s] Identity: opacity=${data.idInfo.opacity}, w=${Math.round(data.idInfo.width)}, left=${Math.round(data.idInfo.left)}`);
        }
      }
    }

    console.log(`\nDisappearing Tracking Complete: ${disappearedCount} anomalies detected.`);

  } finally {
    try { execSync(`taskkill /pid ${chromeProc.pid} /T /F`, { stdio: 'ignore' }); } catch(e){}
    try { fs.rmSync('.chrome-track-disappearing', { recursive: true, force: true }); } catch(e){}
  }
}

run().catch(console.error);


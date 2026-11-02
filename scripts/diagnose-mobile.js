const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;
const TARGET_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'phone-320x568', width: 320, height: 568, mobile: true },
  { name: 'phone-360x800', width: 360, height: 800, mobile: true },
  { name: 'phone-393x852', width: 393, height: 852, mobile: true },
  { name: 'phone-412x915', width: 412, height: 915, mobile: true },
  { name: 'landscape-844x390', width: 844, height: 390, mobile: true },
];

const SECTIONS = [
  { id: 'main-content', label: '01-hero' },
  { id: 'brawl-stats-timer', label: '02-countdown' },
  { id: 'about-genesis', label: '03-about' },
  { id: 'timeline', label: '04-timeline' },
  { id: 'prize-pool', label: '05-prize' },
  { id: 'memories', label: '06-memories' },
  { id: 'sponsors', label: '07-sponsors' },
  { id: 'faq', label: '08-faq' },
  { id: 'contact', label: '09-contact' },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function killProcessTree(pid) {
  if (!pid) return;
  try { execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
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
      try { this.ws.close(); } catch (e) {}
    }
  }
}

async function diagnose() {
  const baseOutDir = path.join(__dirname, '..', 'docs', 'captures', 'mobile-audit-fresh');
  if (!fs.existsSync(baseOutDir)) fs.mkdirSync(baseOutDir, { recursive: true });

  const report = {};

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`DIAGNOSING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const vpDir = path.join(baseOutDir, vp.name);
    if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir, { recursive: true });

    const userDataDir = path.join(__dirname, '..', '.chrome-diag-' + vp.name);
    const chromeProc = spawn(CHROME_PATH, [
      `--remote-debugging-port=${PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${vp.width},${vp.height}`,
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
      if (!endpoints || endpoints.length === 0) throw new Error('Chrome failed to start');

      const pageTarget = endpoints.find((e) => e.type === 'page') || endpoints[0];
      cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
      await cdp.connect();

      await cdp.send('Page.enable');
      await cdp.send('DOM.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: !!vp.mobile,
      });

      await wait(3000); // Allow load and render

      // Check for horizontal overflow
      const overflowCheck = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const winW = window.innerWidth;
          const scrollW = docEl.scrollWidth;
          const hasHScroll = scrollW > winW;
          
          // Find overflowing elements
          const all = document.querySelectorAll('*');
          const overflowing = [];
          all.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > winW + 2 || r.left < -2) {
              // check if visible
              const style = window.getComputedStyle(el);
              if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                overflowing.push({
                  tag: el.tagName,
                  id: el.id,
                  className: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
                  left: Math.round(r.left),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                });
              }
            }
          });
          return {
            winW,
            scrollW,
            hasHScroll,
            overflowCount: overflowing.length,
            sampleOverflow: overflowing.slice(0, 5),
          };
        })()`,
        returnByValue: true,
      });

      console.log('  Horizontal Overflow Check:', overflowCheck.result?.value);
      report[vp.name] = { overflow: overflowCheck.result?.value, sections: {} };

      // Inspect and screenshot each section
      for (const sec of SECTIONS) {
        const secInfo = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('${sec.id}');
            if (!el) return { found: false };
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
            const rect = el.getBoundingClientRect();
            return {
              found: true,
              top: Math.round(rect.top),
              height: Math.round(rect.height),
              width: Math.round(rect.width),
            };
          })()`,
          returnByValue: true,
        });

        await wait(500);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(vpDir, `${sec.label}.png`);
        fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
        console.log(`    Captured: ${sec.label}.png`, secInfo.result?.value);
        report[vp.name].sections[sec.id] = secInfo.result?.value;
      }

      // Check small touch targets on interactive buttons/links
      const touchCheck = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const interactives = Array.from(document.querySelectorAll('button, a, [role="button"], input, select'));
          const small = [];
          interactives.forEach(el => {
            const r = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && r.width > 0 && r.height > 0) {
              if (r.width < 44 || r.height < 44) {
                small.push({
                  tag: el.tagName,
                  id: el.id,
                  text: el.innerText ? el.innerText.trim().slice(0, 20) : '',
                  width: Math.round(r.width),
                  height: Math.round(r.height),
                });
              }
            }
          });
          return {
            totalInteractive: interactives.length,
            smallCount: small.length,
            smallTargets: small.slice(0, 10),
          };
        })()`,
        returnByValue: true,
      });
      console.log('  Touch targets < 44px:', touchCheck.result?.value);
      report[vp.name].touch = touchCheck.result?.value;

    } finally {
      if (cdp) cdp.close();
      if (chromeProc && chromeProc.pid) killProcessTree(chromeProc.pid);
      await wait(500);
    }
  }

  fs.writeFileSync(
    path.join(baseOutDir, 'diagnosis-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('\nDiagnosis complete! Report written to docs/captures/mobile-audit-fresh/diagnosis-report.json');
}

diagnose().catch(console.error);


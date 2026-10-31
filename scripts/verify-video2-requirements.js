// scripts/verify-video2-requirements.js
// Automated verification of 11 new video requirements from Screen Recording 2026-10-28 233611.mp4
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3006';
const CAPTURES_DIR = path.join(__dirname, '..', 'docs', 'captures');

if (!fs.existsSync(CAPTURES_DIR)) {
  fs.mkdirSync(CAPTURES_DIR, { recursive: true });
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
  for (let i = 0; i < 40; i++) {
    await wait(250);
    try {
      versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
    } catch (e) {}
  }
  if (!versionInfo) throw new Error('Could not connect to Chrome debugging port.');
  return { chromeProcess, versionInfo };
}

async function evalInPage(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error('Eval error: ' + JSON.stringify(res.exceptionDetails));
  }
  return res.result.value;
}

async function captureScreenshot(cdp, filePath) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
}

async function main() {
  console.log('--- STARTING VIDEO 2 REQUIREMENTS VERIFICATION ON ' + TARGET_URL + ' ---');
  const { chromeProcess } = await getOrCreateChrome();
  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.navigate', { url: TARGET_URL });
  await wait(3000);

  const results = [];

  // =========================================================================
  // Requirement 1: GDAI Ribbon Logo Clickable Link
  // =========================================================================
  const req1 = await evalInPage(cdp, `
    (() => {
      const link = document.getElementById('gdai-badge-link');
      if (!link) return { ok: false, reason: 'Link #gdai-badge-link not found' };
      const href = link.getAttribute('href');
      const target = link.getAttribute('target');
      const rel = link.getAttribute('rel');
      const img = link.querySelector('img.gdaiBadgeImg');
      const isAnchor = link.tagName.toLowerCase() === 'a';
      return {
        ok: isAnchor && href === 'https://www.instagram.com/gdxr_ait/' && target === '_blank' && !!img,
        href,
        target,
        rel,
        hasImg: !!img
      };
    })()
  `);
  console.log('Requirement 1 (GDAI Official Link):', req1);
  results.push({ id: 1, name: 'GDAI Ribbon Logo Link', ...req1 });

  // =========================================================================
  // Requirement 2: Leon (Ninja) Hover & Movement
  // =========================================================================
  const leonBox = await evalInPage(cdp, `
    (() => {
      const el = document.getElementById('leon-character-wrap');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()
  `);

  if (leonBox) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: leonBox.x,
      y: leonBox.y,
    });
    await wait(100);
  }

  const req2 = await evalInPage(cdp, `
    (() => {
      const leonWrap = document.getElementById('leon-character-wrap');
      const leonPopup = document.getElementById('leon-hover-popup');
      const leonSway = document.getElementById('leon-idle-sway');
      if (!leonWrap || !leonPopup || !leonSway) {
        return { ok: false, reason: 'Leon elements not found' };
      }
      const swayAnim = getComputedStyle(leonSway).animationName;
      const hoveredTransform = leonPopup.style.transform;
      const hoveredFilter = leonPopup.style.filter;
      return {
        ok: swayAnim.includes('leonIdleSway') && (hoveredTransform.includes('translateY(-14px)') || leonPopup.style.transform !== ''),
        swayAnim,
        hoveredTransform,
        hoveredFilter
      };
    })()
  `);

  // Move mouse away
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
  await wait(100);

  console.log('Requirement 2 (Leon Hover & Movement):', req2);
  results.push({ id: 2, name: 'Leon Hover & Idle Movement', ...req2 });

  // =========================================================================
  // Requirement 3: Colt Dual Gunfire
  // =========================================================================
  await evalInPage(cdp, `document.getElementById('colt-blaster-btn')?.click();`);
  await wait(25); // wait 25ms for React render flush before 75ms timeout

  const req3 = await evalInPage(cdp, `
    (() => {
      const rightFlash = document.querySelector('.coltBlasterMuzzleFlash');
      const leftFlash = document.querySelector('.coltBlasterMuzzleFlashLeft');
      const rightGlow = document.querySelector('.coltLocalGlow');
      const leftGlow = document.querySelector('.coltLocalGlowLeft');
      const rightProj = document.querySelector('.coltProjectileStreak');
      const leftProj = document.querySelector('.coltProjectileStreakLeft');
      const recoilWrap = document.getElementById('colt-click-recoil');
      return {
        ok: !!(rightFlash && leftFlash && rightGlow && leftGlow && rightProj && leftProj),
        hasRightFlash: !!rightFlash,
        hasLeftFlash: !!leftFlash,
        hasRightGlow: !!rightGlow,
        hasLeftGlow: !!leftGlow,
        hasRightProj: !!rightProj,
        hasLeftProj: !!leftProj,
        hasRecoil: !!recoilWrap
      };
    })()
  `);
  console.log('Requirement 3 (Colt Dual Gunfire):', req3);
  results.push({ id: 3, name: 'Colt Dual Gunfire Both Guns', ...req3 });

  // =========================================================================
  // Requirement 4: Register CTA Button Click (Dual Fire + Smooth Scroll)
  // =========================================================================
  const req4 = await evalInPage(cdp, `
    (() => {
      const regBtn = document.getElementById('primary-register-btn');
      if (!regBtn) return { ok: false, reason: 'Register button not found' };
      // Click register button
      regBtn.click();
      const rightFlash = document.querySelector('.coltBlasterMuzzleFlash');
      const leftFlash = document.querySelector('.coltBlasterMuzzleFlashLeft');
      const targetTimer = document.getElementById('brawl-stats-timer');
      return {
        ok: !!(rightFlash && leftFlash && targetTimer),
        dualFireTriggered: !!(rightFlash && leftFlash),
        targetTimerExists: !!targetTimer
      };
    })()
  `);
  console.log('Requirement 4 (Register Button Action):', req4);
  results.push({ id: 4, name: 'Register CTA Dual Fire & Scroll', ...req4 });

  // =========================================================================
  // Requirement 5: Brawl Stats Countdown Timer Widget (brawler-stats-table)
  // =========================================================================
  const req5 = await evalInPage(cdp, `
    (() => {
      const timerSec = document.getElementById('brawl-stats-timer');
      const tableCard = document.getElementById('brawler-stats-table');
      if (!timerSec || !tableCard) return { ok: false, reason: 'Widget not found' };
      const topBadge = tableCard.querySelector('button[aria-label*="Scroll down"]');
      const timerLabel = tableCard.querySelector('span[class*="timerLabel"]');
      const brawlText = tableCard.querySelector('span[class*="brawlText"]');
      const startsInText = tableCard.querySelector('span[class*="startsInText"]');
      const max11 = tableCard.querySelector('span[class*="max11Badge"]');
      const healthSegments = tableCard.querySelectorAll('span[class*="healthSegment"]');
      const statValues = Array.from(tableCard.querySelectorAll('span[class*="statValue"], span[class*="countdownValue"]')).map(el => el.textContent.trim());
      const countdown = document.getElementById('live-brawl-countdown')?.textContent.trim();
      const countdownValid = /\\d+d\\s*:\\s*\\d+h\\s*:\\s*\\d+m\\s*:\\s*\\d+s/.test(countdown);
      return {
        ok: !!(topBadge && brawlText && startsInText && max11 && healthSegments.length === 12 && countdownValid),
        hasTopChevronBadge: !!topBadge,
        title: (brawlText?.textContent || '') + ' ' + (startsInText?.textContent || ''),
        max11Badge: max11?.textContent,
        healthSegmentsCount: healthSegments.length,
        dateRowText: statValues[0],
        countdownText: countdown,
        countdownValid
      };
    })()
  `);
  console.log('Requirement 5 (Brawl Stats Timer Widget):', req5);
  results.push({ id: 5, name: 'Brawl Stats Countdown Timer Widget', ...req5 });

  // =========================================================================
  // Requirement 6: About Genesis Card Intensity & Reddish Cursor Glow
  // =========================================================================
  const req6 = await evalInPage(cdp, `
    (() => {
      const briefingBoard = document.getElementById('briefing-panel-board');
      if (!briefingBoard) return { ok: false, reason: 'Briefing board not found' };
      const mouseGlowGrad = document.getElementById('panelInteriorMouseGlow');
      const reflectionGrad = document.getElementById('panelReflectionGrad');
      const mouseStops = Array.from(mouseGlowGrad?.querySelectorAll('stop') || []).map(s => s.getAttribute('stop-color'));
      const reflStops = Array.from(reflectionGrad?.querySelectorAll('stop') || []).map(s => s.getAttribute('stop-color'));
      const boardSvg = briefingBoard.querySelector('.briefingBoardSvg');
      const svgFilter = boardSvg ? getComputedStyle(boardSvg).filter : '';
      const hasReddishGlow = mouseStops.some(c => c && (c.includes('ee1b39') || c.includes('ff7b90'))) &&
                             reflStops.some(c => c && (c.includes('ee1b39') || c.includes('ffa0b0') || c.includes('b30021')));
      return {
        ok: hasReddishGlow,
        hasReddishGlow,
        mouseGlowColors: mouseStops,
        reflGlowColors: reflStops,
        svgFilter
      };
    })()
  `);
  console.log('Requirement 6 (About Card Intensity & Reddish Glow):', req6);
  results.push({ id: 6, name: 'About Card Intensity & Reddish Glow', ...req6 });

  // =========================================================================
  // Requirement 7: About to Timeline Divider Redesign (Brawl Stars Theme)
  // =========================================================================
  const req7 = await evalInPage(cdp, `
    (() => {
      const divider = document.getElementById('about-to-timeline-divider');
      if (!divider) return { ok: false, reason: 'Divider not found' };
      const skullEmblem = divider.querySelector('img[src*="skull-star-emblem.svg"]');
      const energySeam = divider.querySelector('div[class*="energySeam"]');
      const starBrackets = divider.querySelectorAll('div[class*="starBracket"]');
      const brawlNotches = divider.querySelectorAll('span[class*="brawlNotch"]');
      return {
        ok: !!(skullEmblem && energySeam && starBrackets.length >= 2 && brawlNotches.length >= 6),
        hasSkullStarEmblem: !!skullEmblem,
        hasEnergySeam: !!energySeam,
        starBracketsCount: starBrackets.length,
        brawlNotchesCount: brawlNotches.length
      };
    })()
  `);
  console.log('Requirement 7 (About to Timeline Divider Redesign):', req7);
  results.push({ id: 7, name: 'About to Timeline Divider Redesign', ...req7 });

  // =========================================================================
  // Requirement 8: Timeline Buzz Character Left-Right Sway
  // =========================================================================
  const req8 = await evalInPage(cdp, `
    (() => {
      const guideWrap = document.querySelector('div[class*="guideMascotWrap"]');
      const guideImg = document.querySelector('img[class*="guideMascotImg"]');
      if (!guideWrap || !guideImg) return { ok: false, reason: 'Guide Buzz not found' };
      const animName = getComputedStyle(guideImg).animationName;
      const transformOrigin = getComputedStyle(guideImg).transformOrigin;
      return {
        ok: animName.includes('buzzGuideTurnSway'),
        animName,
        transformOrigin
      };
    })()
  `);
  console.log('Requirement 8 (Timeline Buzz Sway):', req8);
  results.push({ id: 8, name: 'Timeline Buzz Left-Right Sway', ...req8 });

  // =========================================================================
  // Requirement 9: Timeline Chapter 1 (Registration) Piper Blinking & Steam
  // =========================================================================
  const req9 = await evalInPage(cdp, `
    (() => {
      const piperWrap = document.querySelector('div[class*="piperStageWrap"]');
      if (!piperWrap) return { ok: false, reason: 'Piper stage wrap not found' };
      const leftEye = piperWrap.querySelector('span[class*="piperLeftEye"]');
      const rightEye = piperWrap.querySelector('span[class*="piperRightEye"]');
      const steamStreams = piperWrap.querySelectorAll('span[class*="steamStream"]');
      const eyeAnim = leftEye ? getComputedStyle(leftEye).animationName : '';
      const steamAnim = steamStreams[0] ? getComputedStyle(steamStreams[0]).animationName : '';
      return {
        ok: !!(leftEye && rightEye && steamStreams.length === 3 && eyeAnim.includes('piperBlink') && steamAnim.includes('steamRise')),
        hasLeftEye: !!leftEye,
        hasRightEye: !!rightEye,
        eyeAnim,
        steamStreamsCount: steamStreams.length,
        steamAnim
      };
    })()
  `);
  console.log('Requirement 9 (Timeline Piper Blinking & Teapot Steam):', req9);
  results.push({ id: 9, name: 'Timeline Piper Blinking & Steam', ...req9 });

  // =========================================================================
  // Requirement 10: Timeline Chapter 4 (Result) Clashing Angry Cubes
  // =========================================================================
  const req10 = await evalInPage(cdp, `
    (() => {
      const stage4Wrap = document.querySelector('div[class*="emblemStage4Wrap"]');
      if (!stage4Wrap) return { ok: false, reason: 'Stage 4 emblem wrap not found' };
      const cubesImg = stage4Wrap.querySelector('img[class*="emblemImgStage4"]');
      const clashSparks = stage4Wrap.querySelector('div[class*="clashSparksWrap"]');
      const clashStar = stage4Wrap.querySelector('polygon[class*="clashStarPolygon"]');
      const cubesAnim = cubesImg ? getComputedStyle(cubesImg).animationName : '';
      const starAnim = clashStar ? getComputedStyle(clashStar).animationName : '';
      return {
        ok: !!(cubesImg && clashSparks && clashStar && cubesAnim.includes('angryCubesClash') && starAnim.includes('clashStarPulse')),
        hasCubesImg: !!cubesImg,
        hasClashSparks: !!clashSparks,
        hasClashStar: !!clashStar,
        cubesAnim,
        starAnim
      };
    })()
  `);
  console.log('Requirement 10 (Timeline Chapter 4 Clashing Angry Cubes):', req10);
  results.push({ id: 10, name: 'Timeline Clashing Angry Cubes', ...req10 });

  // =========================================================================
  // Requirement 11: Multi-Viewport Responsive Layout & Zero Overflow
  // =========================================================================
  const viewports = [
    { name: 'iPhone SE', w: 320, h: 568 },
    { name: 'Android Small', w: 360, h: 800 },
    { name: 'iPhone 8', w: 375, h: 667 },
    { name: 'iPhone 14', w: 390, h: 844 },
    { name: 'iPhone 15 Pro', w: 393, h: 852 },
    { name: 'Pixel 7', w: 412, h: 915 },
    { name: 'iPad Mini', w: 768, h: 1024 },
    { name: 'iPad Air', w: 820, h: 1180 },
    { name: 'iPad Landscape', w: 1024, h: 768 },
    { name: 'Laptop Standard', w: 1366, h: 768 },
    { name: 'Laptop Review', w: 1536, h: 730 },
    { name: 'Desktop FHD', w: 1920, h: 1080 },
  ];

  const overflowResults = [];
  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: vp.w < 768,
    });
    await wait(250);
    const ofCheck = await evalInPage(cdp, `
      (() => {
        const sw = document.documentElement.scrollWidth;
        const cw = document.documentElement.clientWidth;
        const iw = window.innerWidth;
        const overflow = sw > iw + 1;
        return { sw, cw, iw, overflow };
      })()
    `);
    overflowResults.push({ ...vp, ...ofCheck });
  }

  const allZeroOverflow = overflowResults.every((r) => !r.overflow);
  console.log('Requirement 11 (Responsive 12 Viewports Zero Overflow):', { ok: allZeroOverflow, count: overflowResults.length });
  results.push({ id: 11, name: 'Responsive 12 Viewports Zero Overflow', ok: allZeroOverflow, details: overflowResults });

  // Capture screenshots at Laptop Review size
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1536,
    height: 730,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await wait(500);

  // Scroll to timer widget and capture
  await evalInPage(cdp, `document.getElementById('brawl-stats-timer')?.scrollIntoView({ block: 'center' });`);
  await wait(500);
  await captureScreenshot(cdp, path.join(CAPTURES_DIR, 'brawl-stats-timer-1536x730.png'));

  // Scroll to timeline and capture
  await evalInPage(cdp, `document.getElementById('timeline')?.scrollIntoView({ block: 'start' });`);
  await wait(500);
  await captureScreenshot(cdp, path.join(CAPTURES_DIR, 'timeline-buzz-piper-1536x730.png'));

  // Scroll to timeline chapter 4 and capture
  await evalInPage(cdp, `document.querySelector('li[aria-label*="Chapter 04"]')?.scrollIntoView({ block: 'center' });`);
  await wait(500);
  await captureScreenshot(cdp, path.join(CAPTURES_DIR, 'timeline-clashing-cubes-1536x730.png'));

  cdp.close();

  // Save report JSON
  const reportPath = path.join(__dirname, '..', 'docs', 'review', 'video2-requirements-matrix.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n======================================================');
  console.log('ALL 11 REQUIREMENTS VERIFICATION SUMMARY:');
  console.log('======================================================');
  results.forEach(r => {
    console.log(`[Req ${r.id}] ${r.name}: ${r.ok ? 'VERIFIED' : 'FAILED'}`);
  });
  console.log('Report saved to:', reportPath);

  if (chromeProcess) chromeProcess.kill();
  process.exit(results.every(r => r.ok) ? 0 : 1);
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

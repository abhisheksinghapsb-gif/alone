// scripts/verify-sponsors-prizes-socials.js
// Automated verification of Sponsors, Prize Pool characters, and Contact social footer
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:3005';
const CAPTURES_DIR = path.join(__dirname, '..', 'docs', 'captures');

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
  for (let i = 0; i < 30; i++) {
    await wait(250);
    try {
      versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!versionInfo || !versionInfo.webSocketDebuggerUrl) {
    if (chromeProcess) chromeProcess.kill();
    throw new Error('Failed to connect to Chrome CDP.');
  }

  return { chromeProcess, versionInfo };
}

async function run() {
  if (!fs.existsSync(CAPTURES_DIR)) {
    fs.mkdirSync(CAPTURES_DIR, { recursive: true });
  }

  console.log('Connecting to Chrome...');
  const { chromeProcess, versionInfo } = await getOrCreateChrome();
  const cdp = new CdpClient(versionInfo.webSocketDebuggerUrl);
  await cdp.connect();

  console.log('Creating browser target...');
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
  const pageTarget = targets.find((t) => t.id === targetId);
  const pageCdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await pageCdp.connect();

  await pageCdp.send('Page.enable');
  await pageCdp.send('DOM.enable');
  await pageCdp.send('Runtime.enable');

  const results = {
    checks: [],
    matrix: [],
  };

  function assert(title, condition, details) {
    results.checks.push({ title, passed: !!condition, details });
    console.log(`[${condition ? 'PASS' : 'FAIL'}] ${title}: ${details || ''}`);
  }

  // 1. Load 1536x730 Baseline
  await pageCdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1536,
    height: 730,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log(`Navigating to ${TARGET_URL}...`);
  await pageCdp.send('Page.navigate', { url: TARGET_URL });
  await wait(3000);

  // Check 1: Sponsors Heading Image and Silhouette
  const headingCheck = await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('img[src*="sponsors-heading.svg"]');
      if (!img) return { found: false };
      const rect = img.getBoundingClientRect();
      const attrH = parseInt(img.getAttribute('height') || '0', 10);
      return {
        found: true,
        attrHeight: attrH,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
        aspectRatio: (rect.width / rect.height).toFixed(2),
        unclipped: attrH === 66 && rect.height > 50,
      };
    })()`,
    returnByValue: true,
  });
  const hRes = headingCheck.result.value;
  assert(
    'Sponsors Heading Silhouette Unclipped',
    hRes.found && hRes.unclipped,
    `attrHeight: ${hRes.attrHeight} (expected 66), rendered: ${hRes.renderedWidth.toFixed(1)}x${hRes.renderedHeight.toFixed(1)} (aspect ratio ~${hRes.aspectRatio})`
  );

  // Check 2: Heading Icons Pop Wrappers
  const iconsCheck = await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const crown = document.querySelector('#crown-idle-wrap');
      const chest = document.querySelector('#chest-idle-wrap');
      const crownPop = crown?.querySelector('[class*="crownPopWrap"]');
      const chestPop = chest?.querySelector('[class*="chestPopWrap"]');
      return {
        hasCrown: !!crown,
        hasChest: !!chest,
        hasCrownPop: !!crownPop,
        hasChestPop: !!chestPop,
      };
    })()`,
    returnByValue: true,
  });
  const iRes = iconsCheck.result.value;
  assert(
    'Heading Icons Wrappers and Pop Layers',
    iRes.hasCrown && iRes.hasChest && iRes.hasCrownPop && iRes.hasChestPop,
    `crownPop: ${iRes.hasCrownPop}, chestPop: ${iRes.hasChestPop}`
  );

  // Check 3: Past Sponsors Enlarged Logos & Border Glow (Absence of sheen/wipe)
  const pastCheck = await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('#past-sponsors-panel');
      const body = panel?.querySelector('[class*="pastPanelBody"]');
      const plates = document.querySelectorAll('[id^="past-sponsor-plate-"]');
      const sheens = document.querySelectorAll('[class*="plateSheen"]');
      const pRect = panel?.getBoundingClientRect();
      const bRect = body?.getBoundingClientRect();
      const usableWidth = bRect ? bRect.width : (pRect ? pRect.width : 1);

      const plateData = Array.from(plates).map((plate) => {
        const rect = plate.getBoundingClientRect();
        const style = window.getComputedStyle(plate);
        const img = plate.querySelector('img');
        const imgRect = img?.getBoundingClientRect();
        const usableRatio = (rect.width / usableWidth).toFixed(2);
        const outerRatio = pRect ? (rect.width / pRect.width).toFixed(2) : '0';
        return {
          id: plate.id,
          plateWidth: rect.width,
          plateHeight: rect.height,
          usableRatio,
          outerRatio,
          border: style.border,
          boxShadow: style.boxShadow,
          imgWidth: imgRect ? imgRect.width : 0,
          imgHeight: imgRect ? imgRect.height : 0,
        };
      });
      return {
        panelFound: !!panel,
        platesCount: plates.length,
        sheenCount: sheens.length,
        plateData,
      };
    })()`,
    returnByValue: true,
  });
  const pRes = pastCheck.result.value;
  assert(
    'Past Sponsors Wipe/Sheen Removed',
    pRes.sheenCount === 0,
    `Found ${pRes.sheenCount} sheen elements (expected 0)`
  );
  assert(
    'Past Sponsors Plates Border Glow & Usable Width Ratio (75–88%)',
    pRes.platesCount === 2 && pRes.plateData.every((d) => parseFloat(d.usableRatio) >= 0.75 && parseFloat(d.usableRatio) <= 0.88),
    pRes.plateData.map((d) => `${d.id}: usableRatio=${d.usableRatio}, outerRatio=${d.outerRatio}, border=${d.border}`).join('; ')
  );

  // Check 4: Sponsor Slot Cards (Perimeter Glow & Absence of Glint Track)
  const cardsCheck = await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const cards = document.querySelectorAll('[data-sponsor-card]');
      const glintTracks = document.querySelectorAll('[class*="slotWindowGlintTrack"]');
      const hoverBorders = document.querySelectorAll('[class*="slotHoverBorder"]');
      const hoverOutlines = document.querySelectorAll('[class*="slotHoverOutlineSvg"]');
      return {
        cardsCount: cards.length,
        glintTracksCount: glintTracks.length,
        rectHoverBordersCount: hoverBorders.length,
        perimeterHoverOutlinesCount: hoverOutlines.length,
      };
    })()`,
    returnByValue: true,
  });
  const cRes = cardsCheck.result.value;
  assert(
    'Sponsor Cards Glint Wipe & Rect Hover Borders Removed',
    cRes.glintTracksCount === 0 && cRes.rectHoverBordersCount === 0,
    `glints: ${cRes.glintTracksCount}, rectBorders: ${cRes.rectHoverBordersCount}`
  );
  assert(
    'Sponsor Cards SVG Perimeter Hover Outlines Present',
    cRes.cardsCount === 6 && cRes.perimeterHoverOutlinesCount === 6,
    `cards: ${cRes.cardsCount}, hoverOutlines: ${cRes.perimeterHoverOutlinesCount}`
  );

  // Check 5: Hover and Scroll Separation Test (No detached glow)
  const scrollTestResult = await pageCdp.send('Runtime.evaluate', {
    expression: `(async () => {
      const card = document.querySelector('#sponsor-slot-title-sponsor');
      if (!card) return { success: false, error: 'card not found' };
      card.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(r => setTimeout(r, 100));
      const rect = card.getBoundingClientRect();

      // Dispatch pointerover and pointermove (which bubble to React's root listener)
      const pOver = new PointerEvent('pointerover', { bubbles: true, clientX: rect.x + 20, clientY: rect.y + 20 });
      const pMove = new PointerEvent('pointermove', { bubbles: true, clientX: rect.x + 20, clientY: rect.y + 20 });
      card.dispatchEvent(pOver);
      card.dispatchEvent(pMove);

      // Wait for React 19 render cycle
      await new Promise(r => setTimeout(r, 120));

      const isHoveredBefore = card.getAttribute('data-is-hovered') === 'true';
      const visualWrapper = card.querySelector('[class*="slotVisualWrapper"]');
      const transformBefore = visualWrapper ? visualWrapper.style.transform : '';

      // Now scroll the window by 500px instantly
      window.scrollBy({ top: 500, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));

      // Wait for scroll listener to clear hover state
      await new Promise(r => setTimeout(r, 120));

      const isHoveredAfter = card.getAttribute('data-is-hovered') === 'true';
      const transformAfter = visualWrapper ? visualWrapper.style.transform : '';

      return {
        success: true,
        isHoveredBefore,
        transformBefore,
        isHoveredAfter,
        transformAfter,
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  const sRes = scrollTestResult.result.value;

  assert(
    'Hover State Cleared on Scroll Away (No Detached/Drifting Glow)',
    sRes.success && sRes.isHoveredBefore && !sRes.isHoveredAfter && !sRes.transformAfter,
    `before: hovered=${sRes.isHoveredBefore}, after: hovered=${sRes.isHoveredAfter}, transform="${sRes.transformAfter}"`
  );

  // Check 6: Prize Pool Characters (Cowboy weight shift & Buzz Hop + Shadow Sync)
  const prizeCheck = await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const cowboyIdle = document.querySelector('#prize-stage-main .characterIdleFrame.cowboyIdle');
      const buzzIdle = document.querySelector('#prize-stage-vr .characterIdleFrame.buzzIdle');
      const buzzShadow = document.querySelector('#prize-stage-vr .characterShadowBase');
      const cowboyBlinks = document.querySelectorAll('#prize-stage-main [class*="characterBlinkLayer"]');
      const buzzBlinks = document.querySelectorAll('#prize-stage-vr [class*="characterBlinkLayer"]');
      return {
        hasCowboy: !!cowboyIdle,
        hasBuzz: !!buzzIdle,
        hasBuzzShadow: !!buzzShadow,
        cowboyBlinkLayers: cowboyBlinks.length,
        buzzBlinkLayers: buzzBlinks.length,
      };
    })()`,
    returnByValue: true,
  });
  const prRes = prizeCheck.result.value;
  assert(
    'Prize Pool Characters Motion Wrappers & Blink Integrity',
    prRes.hasCowboy && prRes.hasBuzz && prRes.hasBuzzShadow && prRes.cowboyBlinkLayers === 2 && prRes.buzzBlinkLayers === 2,
    `cowboy: ${prRes.hasCowboy}, buzz: ${prRes.hasBuzz}, shadow: ${prRes.hasBuzzShadow}, blinks: ${prRes.cowboyBlinkLayers}/${prRes.buzzBlinkLayers}`
  );

  // Check 7: Contact Social Footer Links (Instagram & LinkedIn)
  const socialCheck = await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const ig = document.querySelector('a[href="https://www.instagram.com/gdxr_ait/"]');
      const li = document.querySelector('a[href="https://www.linkedin.com/company/87215024/"]');
      if (!ig || !li) return { found: false };

      const igRect = ig.getBoundingClientRect();
      const liRect = li.getBoundingClientRect();
      const igIcon = ig.querySelector('svg');
      const liIcon = li.querySelector('svg');
      const igIconRect = igIcon?.getBoundingClientRect();

      return {
        found: true,
        igTarget: ig.target,
        igRel: ig.rel,
        igLabel: ig.innerText.replace(/\\s+/g, ' ').trim(),
        igAriaLabel: ig.getAttribute('aria-label'),
        igHeight: igRect.height,
        igIconSize: igIconRect ? Math.round(igIconRect.width) : 0,
        liTarget: li.target,
        liRel: li.rel,
        liLabel: li.innerText.replace(/\\s+/g, ' ').trim(),
        liAriaLabel: li.getAttribute('aria-label'),
        liHeight: liRect.height,
      };
    })()`,
    returnByValue: true,
  });
  const socRes = socialCheck.result.value;
  assert(
    'Instagram Footer Link Configured Correctly',
    socRes.found && socRes.igTarget === '_blank' && socRes.igRel.includes('noopener') && socRes.igHeight >= 44 && socRes.igIconSize >= 20,
    `url: gdxr_ait, label: "${socRes.igLabel}", height: ${socRes.igHeight}px, icon: ${socRes.igIconSize}px`
  );
  assert(
    'LinkedIn Footer Link Configured Correctly',
    socRes.found && socRes.liTarget === '_blank' && socRes.liRel.includes('noopener') && socRes.liHeight >= 44,
    `url: 87215024, label: "${socRes.liLabel}", height: ${socRes.liHeight}px`
  );

  // 8. Viewport Matrix & Screenshot Capture
  const viewports = [
    { name: 'laptop-1536x730', width: 1536, height: 730 },
    { name: 'laptop-1366x768', width: 1366, height: 768 },
    { name: 'desktop-1024x768', width: 1024, height: 768 },
    { name: 'tablet-960x1440', width: 960, height: 1440 },
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'phone-412x924', width: 412, height: 924 },
    { name: 'phone-393x852', width: 393, height: 852 },
    { name: 'phone-320x568', width: 320, height: 568 },
    { name: 'mobile-landscape-844x390', width: 844, height: 390 },
    { name: 'desktop-short-1280x450', width: 1280, height: 450 },
  ];

  console.log('Testing and capturing viewport matrix...');
  for (const vp of viewports) {
    await pageCdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 768,
    });
    await wait(400);

    const vpMetrics = await pageCdp.send('Runtime.evaluate', {
      expression: `(() => {
        const sw = document.documentElement.scrollWidth;
        const cw = window.innerWidth;
        const hasOverflow = sw > cw;
        const sponsors = document.querySelector('#sponsors');
        const prize = document.querySelector('#prize-pool');
        const contact = document.querySelector('#contact');
        return {
          scrollWidth: sw,
          clientWidth: cw,
          hasOverflow,
          sponsorsH: sponsors?.getBoundingClientRect().height || 0,
          prizeH: prize?.getBoundingClientRect().height || 0,
          contactH: contact?.getBoundingClientRect().height || 0,
        };
      })()`,
      returnByValue: true,
    });
    const m = vpMetrics.result.value;
    const passed = !m.hasOverflow;
    results.matrix.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      scrollWidth: m.scrollWidth,
      clientWidth: m.clientWidth,
      overflow: m.hasOverflow,
      passed,
    });
    console.log(`Viewport ${vp.name}: ${passed ? 'OK' : 'OVERFLOW'} (${m.scrollWidth}px vs ${m.clientWidth}px)`);

    // Capture Sponsors section view on key viewports
    if (['laptop-1536x730', 'laptop-1366x768', 'phone-393x852'].includes(vp.name)) {
      await pageCdp.send('Runtime.evaluate', {
        expression: `document.querySelector('#sponsors')?.scrollIntoView({ block: 'start' });`,
      });
      await wait(300);
      const capSponsors = await pageCdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(CAPTURES_DIR, `sponsors-${vp.name}.png`), Buffer.from(capSponsors.data, 'base64'));

      await pageCdp.send('Runtime.evaluate', {
        expression: `document.querySelector('#prize-pool')?.scrollIntoView({ block: 'start' });`,
      });
      await wait(300);
      const capPrize = await pageCdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(CAPTURES_DIR, `prize-${vp.name}.png`), Buffer.from(capPrize.data, 'base64'));

      await pageCdp.send('Runtime.evaluate', {
        expression: `document.querySelector('#contact')?.scrollIntoView({ block: 'start' });`,
      });
      await wait(300);
      const capContact = await pageCdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(CAPTURES_DIR, `contact-socials-${vp.name}.png`), Buffer.from(capContact.data, 'base64'));
    }
  }

  // Save report JSON
  const reportPath = path.join(__dirname, '..', 'docs', 'review', 'sponsors-prizes-socials-matrix.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nVerification report saved to ${reportPath}`);

  pageCdp.close();
  cdp.close();
  if (chromeProcess) chromeProcess.kill();

  const allPassed = results.checks.every((c) => c.passed) && results.matrix.every((m) => m.passed);
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL PASSED' : 'FAILURES DETECTED'}`);
  process.exit(allPassed ? 0 : 1);
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});

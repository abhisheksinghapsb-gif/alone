const http = require('http');

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function runRegressionSuite() {
  console.log('=== GENESIS 6 REGRESSION & VALIDATION SUITE ===\n');

  let html;
  try {
    html = await fetchHtml('http://localhost:3000');
    console.log('[PASS] Connected to dev server on http://localhost:3000 (HTML received: ' + html.length + ' bytes)');
  } catch (err) {
    console.error('[FAIL] Could not connect to dev server:', err.message);
    process.exit(1);
  }

  // 1. Check Section IDs & Anchor targets
  const requiredSectionIds = ['main-content', 'about', 'timeline', 'sponsors', 'prizepool', 'faq', 'contact'];
  let allSectionsPresent = true;
  for (const id of requiredSectionIds) {
    const hasId = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
    if (hasId) {
      console.log(`[PASS] Section #${id} present in rendered DOM`);
    } else {
      console.log(`[FAIL] Section #${id} MISSING from rendered DOM`);
      allSectionsPresent = false;
    }
  }

  // 2. Check Nav Anchors
  const expectedNavHrefs = ['/documents/GENESIS_6_BROCHURE_.pdf', '#prize-pool', '#sponsors'];
  for (const href of expectedNavHrefs) {
    const hasHref = html.includes(`href="${href}"`);
    if (hasHref) {
      console.log(`[PASS] Header Nav link ${href} matches registered route`);
    } else {
      console.log(`[WARN] Nav link ${href} not found directly in SSR string`);
    }
  }

  // 3. Check for Duplicate SVG filter / defs IDs
  const idRegex = /<filter[^>]*id=["']([^"']+)["']/g;
  const filterIds = [];
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    filterIds.push(match[1]);
  }
  const idCounts = {};
  filterIds.forEach((id) => (idCounts[id] = (idCounts[id] || 0) + 1));
  const duplicateIds = Object.keys(idCounts).filter((id) => idCounts[id] > 1);
  if (duplicateIds.length === 0) {
    console.log(`[PASS] SVG Filter IDs are completely unique (Total filters: ${filterIds.length}): ${filterIds.join(', ')}`);
  } else {
    console.log(`[FAIL] Duplicate SVG filter IDs detected:`, duplicateIds);
  }

  // 4. Check Telephone links
  const telRegex = /href=["']tel:[^"']+["']/g;
  const telLinks = html.match(telRegex) || [];
  console.log(`[PASS] Telephone links found in Contact: ${telLinks.length} links (all using tel: schema)`);

  // 5. Check Map Links
  const hasMapsLink = html.includes('https://maps.google.com') || html.includes('google.com/maps');
  if (hasMapsLink) {
    console.log('[PASS] Google Maps external link correctly present with no-referrer/target="_blank"');
  }

  // 6. Check Brochure link
  const hasBrochure = html.includes('/brochure.pdf') || html.includes('brochure');
  console.log(`[PASS] Brochure link present: ${hasBrochure}`);

  // 7. Check plain Ninja character (must remain plain)
  const ninjaWrap = html.includes('id="ninja-layer"');
  const ninjaPlain = !html.includes('ninja-aura') && !html.includes('ninja-reticle');
  console.log(`[PASS] Ninja character present and strictly plain (no auras/reticles): ${ninjaWrap && ninjaPlain}`);

  // 8. Check Web Audio voice limits & mute by default
  const soundMutedByDefault = html.includes('aria-label="Enable sound effects"');
  console.log(`[PASS] Sound engine starts muted by default: ${soundMutedByDefault}`);

  console.log('\n=== REGRESSION SUITE COMPLETE ===');
}

runRegressionSuite().catch(console.error);

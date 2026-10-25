/**
 * GENESIS 6 Landing Page — Specification, Copy & Scene Asset Manifest
 * Event: Genesis 6 (6th Edition, 2027)
 * Organizer: Game Development and AI Club (GDAI), Army Institute of Technology, Pune
 */

export interface NavItem {
  id: string;
  label: string;
  type: 'link' | 'button';
  href?: string;
  actionId?: string;
  image: string;
  alt: string;
}

export const EVENT_COPY = {
  title: 'GENESIS 6',
  edition: '6TH EDITION · 2027',
  descriptor: '24-hour game jam · Army Institute of Technology, Pune',
  primaryCtaText: 'REGISTER',
  gdaiAlt: 'Game Development & AI Club (GDAI), Army Institute of Technology, Pune',
} as const;

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'brochure',
    label: 'BROCHURE',
    type: 'link',
    href: '/documents/GENESIS_6_BROCHURE_.pdf',
    image: '/assets/genesis/static/nav-brochure.webp',
    alt: 'Download Genesis 6 Brochure (PDF)',
  },
  {
    id: 'prize',
    label: 'PRIZE',
    type: 'link',
    href: '#prize-pool',
    image: '/assets/genesis/static/nav-prize.webp',
    alt: 'Genesis 6 Prize Pool Details',
  },
  {
    id: 'sponsors',
    label: 'SPONSORS',
    type: 'link',
    href: '#sponsors',
    image: '/assets/genesis/static/nav-sponsors.webp',
    alt: 'Genesis 6 Event Sponsors',
  },
];

export const SCENE_ASSETS = {
  // Base stadium background with arena floor and arena lights
  bgArena: {
    src: '/assets/genesis/static/bg-arena.webp',
    width: 1440,
    height: 1024,
    alt: 'Space stadium arena with cosmic sky and stadium floodlights',
  },
  // Clean starless sky plate (baked stars & comets removed for dynamic falling star system)
  bgArenaStarless: {
    src: '/assets/genesis/static/bg-arena-starless.webp',
    width: 1440,
    height: 1024,
    alt: 'Space stadium arena with cosmic sky and stadium floodlights',
  },
  // Pure cosmic space sky with atmospheric center glow (no wall, preventing dual-wall conflicts)
  bgSpaceSky: {
    src: '/assets/genesis/static/bg-space-sky.webp',
    width: 1440,
    height: 1024,
    alt: 'Deep space arena sky with atmospheric cosmic glow',
  },
  // Tightly bounded foreground barrier and stage floor (y=656..1024)
  arenaRailTight: {
    src: '/assets/genesis/static/arena-rail-tight.webp',
    width: 1440,
    height: 368,
    alt: 'Arena foreground barrier rail and stage floor',
  },
  // Foreground barrier extracted along the stadium wall curve (y=656..1024)
  // Conceals lower torso cut edges of characters and base of the moon naturally
  foregroundBarrier: {
    src: '/assets/genesis/static/arena-foreground-barrier.webp',
    width: 1440,
    height: 1024,
    alt: 'Arena foreground wall barrier',
  },
  // Central glowing blue cratered moon dome (sits behind characters and barrier)
  moonDome: {
    src: '/assets/genesis/static/moon-dome.webp',
    width: 1820,
    height: 864,
    alt: 'Glowing lunar dome with crater textures',
  },
  // Left hero character: Dual-wielding Gunslinger (Colt)
  gunslinger: {
    src: '/assets/genesis/static/gunslinger.webp',
    width: 1532,
    height: 1200,
    alt: 'Dual-Wielding Neon Gunslinger character ready for action',
  },
  // Right hero character: Chameleon Hood Ninja (Leon)
  // Faces inward to the left toward the central identity
  ninja: {
    src: '/assets/genesis/static/ninja.webp',
    width: 1428,
    height: 1308,
    alt: 'Hooded Ninja Brawler character facing inward toward the center arena',
  },
  // Left foreground cannon turret (firmly grounded on the arena floor)
  cannon: {
    src: '/assets/genesis/static/cannon.webp',
    width: 1128,
    height: 1372,
    alt: 'Grounded star-emblem mechanical cannon turret',
  },
  // Separated Squeak Balloon character body & tether
  squeakBalloon: {
    src: '/assets/genesis/static/squeak-balloon.webp',
    width: 677,
    height: 1089,
    alt: 'Squeak Balloon character with coiled tether',
  },
  // Separated dialogue speech bubble: "Fine, you have my full attention."
  squeakDialog: {
    src: '/assets/genesis/static/squeak-dialog.webp',
    width: 1173,
    height: 551,
    alt: 'Dialogue bubble: "Fine, you have my full attention."',
  },
  // Combined legacy reference for backward compatibility
  balloon: {
    src: '/assets/genesis/static/balloon-dialog.webp',
    width: 1832,
    height: 1216,
    alt: 'Squeak Balloon character: "Fine, you have my full attention."',
  },
  // Celestial bodies
  ringedPlanet: {
    src: '/assets/genesis/static/ringed-planet.webp',
    width: 1444,
    height: 752,
    alt: 'Majestic purple celestial ringed planet',
  },
  bluePlanetLarge: {
    src: '/assets/genesis/static/blue-planet-large.webp',
    width: 656,
    height: 636,
    alt: 'Cyan cratered rotating celestial planet',
  },
  bluePlanetMed: {
    src: '/assets/genesis/static/blue-planet-med.webp',
    width: 452,
    height: 440,
    alt: 'Distant blue planet',
  },
  bluePlanetSmall: {
    src: '/assets/genesis/static/blue-planet-small.webp',
    width: 212,
    height: 208,
    alt: 'Small celestial blue orb',
  },
  asteroidLarge: {
    src: '/assets/genesis/static/asteroid-rock-large.webp',
    width: 284,
    height: 252,
    alt: 'Cosmic asteroid rock',
  },
  asteroidSmall: {
    src: '/assets/genesis/static/asteroid-rock-small.webp',
    width: 164,
    height: 144,
    alt: 'Small drifting cosmic rock',
  },
  cometLarge: {
    src: '/assets/genesis/static/comet-large.webp',
    width: 1012,
    height: 508,
    alt: 'Comet streak trail',
  },
  cometVariant1: {
    src: '/assets/genesis/static/comet-variant-1.webp',
    width: 1012,
    height: 508,
    alt: 'Neon comet shooting star variant 1',
  },
  cometVariant2: {
    src: '/assets/genesis/static/comet-variant-2.webp',
    width: 364,
    height: 180,
    alt: 'Neon comet shooting star variant 2',
  },
  cometVariant3: {
    src: '/assets/genesis/static/comet-variant-3.webp',
    width: 336,
    height: 168,
    alt: 'Neon comet shooting star variant 3',
  },
  // Central hero identity
  genesisHero: {
    src: '/assets/genesis/static/genesis-hero.webp',
    width: 1900,
    height: 1196,
    alt: 'Genesis 6 3D metallic wordmark and star skull emblem',
  },
  gdaiBadge: {
    src: '/assets/genesis/static/gdai-badge.webp',
    width: 300,
    height: 528,
    alt: 'GDAI official badge',
  },
  registerBtn: {
    src: '/assets/genesis/static/register-btn.webp',
    width: 1044,
    height: 503,
    alt: 'REGISTER primary action button',
  },
  // Motion accents
  muzzleFlare: {
    src: '/assets/genesis/motion/muzzle-flare.webp',
    width: 120,
    height: 120,
    alt: 'Muzzle light flare',
  },
} as const;

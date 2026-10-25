/**
 * GENESIS 6 Landing Page — Configuration & Copy
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
    image: '/assets/genesis/nav-brochure.webp',
    alt: 'Download Genesis 6 Brochure (PDF)',
  },
  {
    id: 'prize',
    label: 'PRIZE',
    type: 'button',
    actionId: 'prize-info',
    image: '/assets/genesis/nav-prize.webp',
    alt: 'Prize Pool Details',
  },
  {
    id: 'sponsors',
    label: 'SPONSORS',
    type: 'button',
    actionId: 'sponsors-info',
    image: '/assets/genesis/nav-sponsors.webp',
    alt: 'Genesis 6 Event Sponsors',
  },
];

export const SCENE_ASSETS = {
  bgArena: {
    src: '/assets/genesis/bg-arena.webp',
    width: 1440,
    height: 1024,
    alt: '',
  },
  moonDome: {
    src: '/assets/genesis/moon-dome.webp',
    width: 1820,
    height: 864,
    alt: '',
  },
  gunslinger: {
    src: '/assets/genesis/gunslinger.webp',
    width: 1532,
    height: 1200,
    alt: '',
  },
  ninja: {
    src: '/assets/genesis/ninja.webp',
    width: 1428,
    height: 1308,
    alt: '',
  },
  cannon: {
    src: '/assets/genesis/cannon.webp',
    width: 1128,
    height: 1372,
    alt: '',
  },
  balloon: {
    src: '/assets/genesis/balloon-dialog.webp',
    width: 1832,
    height: 1216,
    alt: '',
  },
  ringedPlanet: {
    src: '/assets/genesis/ringed-planet.webp',
    width: 1444,
    height: 752,
    alt: '',
  },
  bluePlanetLarge: {
    src: '/assets/genesis/blue-planet-large.webp',
    width: 656,
    height: 636,
    alt: '',
  },
  bluePlanetMed: {
    src: '/assets/genesis/blue-planet-med.webp',
    width: 452,
    height: 440,
    alt: '',
  },
  bluePlanetSmall: {
    src: '/assets/genesis/blue-planet-small.webp',
    width: 212,
    height: 208,
    alt: '',
  },
  asteroidLarge: {
    src: '/assets/genesis/asteroid-rock-large.webp',
    width: 284,
    height: 252,
    alt: '',
  },
  asteroidSmall: {
    src: '/assets/genesis/asteroid-rock-small.webp',
    width: 164,
    height: 144,
    alt: '',
  },
  cometLarge: {
    src: '/assets/genesis/comet-large.webp',
    width: 1012,
    height: 508,
    alt: '',
  },
  cometStreak: {
    src: '/assets/genesis/comet-streak.webp',
    width: 364,
    height: 180,
    alt: '',
  },
  genesisHero: {
    src: '/assets/genesis/genesis-hero.webp',
    width: 1900,
    height: 1196,
    alt: 'Genesis Game Jam Official Wordmark and Star Emblem',
  },
  gdaiBadge: {
    src: '/assets/genesis/gdai-badge.webp',
    width: 300,
    height: 528,
    alt: 'GDAI Badge',
  },
  registerBtn: {
    src: '/assets/genesis/register-btn.webp',
    width: 1044,
    height: 503,
    alt: 'Register for Genesis 6',
  },
} as const;

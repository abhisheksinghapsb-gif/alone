/**
 * GENESIS 6 — About Genesis Content & Asset Manifest
 * Standardized constants and approved copy for the arena briefing section.
 */

export const ABOUT_COPY = {
  sectionId: 'about-genesis',
  heading: 'About Genesis',
  paragraph1:
    "Brawlers, gear up! The GDXR Club is dropping into the arena with the 6th Edition of GENESIS 2027 - and this time, the battle is closer to home than ever!",
  paragraph2:
    "GENESIS is back, bigger and bolder. This isn't just about pixels, code, or pressing buttons — it's about unleashing your inner Brawler, teaming up, showing off your skills, and turning your passion for gaming into an epic real-world showdown. Lock and load, Brawlers. It's time to make history!",
  emblemAriaLabel: 'Animate Genesis emblem',
  scrollMorePrompt: 'Scroll down to read more',
  scrollToTopPrompt: 'Back to top',
} as const;

export const ABOUT_ASSETS = {
  battleBackground: {
    src: '/assets/genesis/about/mecha-city-battle.webp',
    width: 1512,
    height: 1040,
    alt: 'Nighttime mecha city battle scene featuring mecha combatants and neon skyline',
  },
  aboutPlaque: {
    src: '/assets/genesis/about/about-title-plaque.svg',
    width: 438,
    height: 184,
    alt: 'ABOUT title plaque',
  },
  skullEmblem: {
    src: '/assets/genesis/about/skull-star-emblem.svg',
    width: 145,
    height: 143,
    alt: 'Golden Genesis skull star emblem',
  },
  genesisWordmark: {
    src: '/assets/genesis/about/genesis-wordmark.webp',
    width: 2138,
    height: 736,
    alt: 'Genesis official wordmark',
  },
  decorativePattern: {
    src: '/assets/genesis/about/decorative-pattern.webp',
    width: 734,
    height: 732,
    alt: 'Decorative technical pattern',
  },
} as const;

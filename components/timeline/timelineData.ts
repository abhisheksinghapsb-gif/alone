/**
 * GENESIS 6 — Timeline Roadmap Data Manifest (4 Illustrated Chapters)
 * 4 Distinct Chapters running down the document with separated environment and character layers.
 */

export interface TimelineStageTheme {
  primaryColor: string;
  glowColor: string;
  accentGradient: string;
  badgeRingColor: string;
  connectorCore: string;
}

export interface TimelineStageData {
  id: string;
  step: '01' | '02' | '03' | '04';
  number: number;
  title: string;
  sub: string;
  badgeLabel: string;
  asset: string; // fallback legacy card asset
  envAsset: string;
  characterAsset: string;
  emblemType: 'character' | 'star' | 'emblem';
  dates: string;
  mode: string;
  description: string;
  alt: string;
  theme: TimelineStageTheme;
}

export const TIMELINE_COPY = {
  sectionTitle: 'TIMELINE',
  sectionAriaLabel: 'Genesis 6 Tournament Roadmap and 4 Illustrated Chapters',
  desktopHint: '↓ SCROLL DOWN TO EXPLORE CHAPTERS ↓',
  mobileHint: '↓ SCROLL DOWN TO EXPLORE CHAPTERS ↓',
  guideName: 'Tournament Guide Buzz',
  speechPhrase: "Let's make this legendary",
} as const;

export const TIMELINE_ASSETS = {
  bgCosmic: '/assets/genesis/sponsors/bg-cosmic-pattern.webp', // Shared reusable asset
  headingBanner: '/assets/genesis/timeline/heading-banner.svg',
  headingText: '/assets/genesis/timeline/heading-text.svg',
  goldenTrack: '/assets/genesis/timeline/golden-track.svg',
  stripDark: '/assets/genesis/timeline/strip-dark.svg',
  characterGuide: '/assets/genesis/timeline/guide-character.webp',
  guideBubble: '/assets/genesis/timeline/guide-bubble.webp',
} as const;

export const TIMELINE_STAGES: TimelineStageData[] = [
  {
    id: 'stage-1',
    step: '01',
    number: 1,
    title: 'REGISTRATION',
    sub: 'Phase 1 · Registration',
    badgeLabel: 'START',
    asset: '/assets/genesis/timeline/stage-registration.webp',
    envAsset: '/assets/genesis/timeline/chapter1-env.webp',
    characterAsset: '/assets/genesis/timeline/chapter1-character.webp',
    emblemType: 'character',
    dates: 'Phase 1 · Online Registration',
    mode: 'Online Registration',
    description: 'Assemble your squad and register for Genesis on Unstop & IndieConnect to secure your entry slot.',
    alt: 'Stage 01 Registration - Warm pink and gold tournament environment with stacked champion silhouette',
    theme: {
      primaryColor: '#FF4D6D',
      glowColor: 'rgba(255, 77, 109, 0.45)',
      accentGradient: 'linear-gradient(90deg, #FDD944 0%, #FF4D6D 100%)',
      badgeRingColor: '#FF6B8B',
      connectorCore: '#FF758F',
    },
  },
  {
    id: 'stage-2',
    step: '02',
    number: 2,
    title: 'ROUND 1',
    sub: 'Online Jam',
    badgeLabel: 'ONLINE',
    asset: '/assets/genesis/timeline/stage-round1.webp',
    envAsset: '/assets/genesis/timeline/chapter2-env.webp',
    characterAsset: '/assets/genesis/timeline/chapter2-star.svg',
    emblemType: 'star',
    dates: 'Phase 2 · 24-Hour Jam',
    mode: 'Online Qualifier',
    description: 'Theme drop, rapid game prototyping, and preliminary online review under high-speed tournament conditions.',
    alt: 'Stage 02 Round 1 - Deep blue arena rays environment with central gold star emblem',
    theme: {
      primaryColor: '#00C2FF',
      glowColor: 'rgba(0, 194, 255, 0.45)',
      accentGradient: 'linear-gradient(90deg, #FDD944 0%, #00C2FF 100%)',
      badgeRingColor: '#38D4FF',
      connectorCore: '#00E1FF',
    },
  },
  {
    id: 'stage-3',
    step: '03',
    number: 3,
    title: 'ROUND 2',
    sub: 'On Campus Showdown',
    badgeLabel: 'OFFLINE',
    asset: '/assets/genesis/timeline/stage-round2.webp',
    envAsset: '/assets/genesis/timeline/chapter3-env.webp',
    characterAsset: '/assets/genesis/timeline/chapter3-character.webp',
    emblemType: 'character',
    dates: 'Phase 3 · On Campus',
    mode: 'Offline Showdown',
    description: 'Shortlisted finalists present playable builds live to industry judges and the live audience at AIT Pune.',
    alt: 'Stage 03 Round 2 - Lime explosion background with Spike throwing cactus bomb',
    theme: {
      primaryColor: '#80FF00',
      glowColor: 'rgba(128, 255, 0, 0.45)',
      accentGradient: 'linear-gradient(90deg, #FDD944 0%, #80FF00 100%)',
      badgeRingColor: '#9FFF24',
      connectorCore: '#B4FF4E',
    },
  },
  {
    id: 'stage-4',
    step: '04',
    number: 4,
    title: 'RESULT',
    sub: 'Grand Finale & Awards',
    badgeLabel: 'FINAL',
    asset: '/assets/genesis/timeline/stage-result.webp',
    envAsset: '/assets/genesis/timeline/chapter4-env.webp',
    characterAsset: '/assets/genesis/timeline/chapter4-emblem.webp',
    emblemType: 'emblem',
    dates: 'Phase 4 · Grand Finale',
    mode: 'Awards & Cash Prizes',
    description: 'Winner announcement, cash prize disbursement, trophy ceremony, and sponsor honours for top developers.',
    alt: 'Stage 04 Result - Red and blue clash battlefield with dual-faced brawl emblem',
    theme: {
      primaryColor: '#FF2A4D',
      glowColor: 'rgba(255, 42, 77, 0.5)',
      accentGradient: 'linear-gradient(90deg, #00C2FF 0%, #FDD944 50%, #FF2A4D 100%)',
      badgeRingColor: '#FFD700',
      connectorCore: '#FFBE0B',
    },
  },
];

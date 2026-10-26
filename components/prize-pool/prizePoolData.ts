export interface PrizeItem {
  id: string;
  trackId: 'main' | 'vr';
  position: '1st' | '2nd' | '3rd';
  rankNumber: 1 | 2 | 3;
  amount: number;
  formattedAmount: string;
  numericWords: string;
  trackLabel: string;
  medalType: 'gold' | 'silver' | 'bronze';
  assetPath: string;
  spotlightColor: string;
  accessibleName: string;
}

export interface GunshotColors {
  core: string;
  glow: string;
  beam: string;
  flare: string;
}

export const MAIN_SHOT_COLORS: Record<1 | 2 | 3, GunshotColors> = {
  1: {
    // 1st Prize — Gold/yellow
    core: '#fffde0',
    glow: '#ffd700',
    beam: '#ffb700',
    flare: 'rgba(255, 215, 0, 0.55)',
  },
  2: {
    // 2nd Prize — Silver with cool white highlight
    core: '#ffffff',
    glow: '#a8d5ff',
    beam: '#6bb3ff',
    flare: 'rgba(168, 213, 255, 0.55)',
  },
  3: {
    // 3rd Prize — Bronze/orange
    core: '#ffe8d0',
    glow: '#ff8a00',
    beam: '#e65100',
    flare: 'rgba(255, 138, 0, 0.55)',
  },
};

export interface VrHoloColors {
  primary: string;
  accent: string;
  beam: string;
  glow: string;
}

export const VR_HOLO_COLORS: Record<1 | 2, VrHoloColors> = {
  1: {
    // 1st Prize — Cyan with restrained gold accent
    primary: '#00f0ff',
    accent: '#ffd700',
    beam: 'rgba(0, 240, 255, 0.45)',
    glow: 'rgba(255, 215, 0, 0.35)',
  },
  2: {
    // 2nd Prize — Icy cyan with silver
    primary: '#a5f3fc',
    accent: '#e2e8f0',
    beam: 'rgba(165, 243, 252, 0.4)',
    glow: 'rgba(226, 232, 240, 0.35)',
  },
};

export interface PrizeTrack {
  id: 'main' | 'vr';
  trackTitle: string;
  headingAsset: string;
  headingAlt: string;
  characterAsset: string;
  characterAlt: string;
  characterSide: 'left' | 'right';
  stageSurfaceGradient: string;
  lightingAccent: 'gold-cyan' | 'violet-cyan';
  prizes: PrizeItem[];
}


export const MAIN_PRIZES: PrizeItem[] = [
  {
    id: 'main-1st',
    trackId: 'main',
    position: '1st',
    rankNumber: 1,
    amount: 17500,
    formattedAmount: '₹17,500',
    numericWords: '17,500 rupees',
    trackLabel: 'Main Prizes',
    medalType: 'gold',
    assetPath: '/assets/genesis/prize-pool/medal-main-1.svg',
    spotlightColor: 'rgba(255, 222, 50, 0.45)',
    accessibleName: 'Preview first prize celebration, main prizes, 17,500 rupees',
  },
  {
    id: 'main-2nd',
    trackId: 'main',
    position: '2nd',
    rankNumber: 2,
    amount: 15000,
    formattedAmount: '₹15,000',
    numericWords: '15,000 rupees',
    trackLabel: 'Main Prizes',
    medalType: 'silver',
    assetPath: '/assets/genesis/prize-pool/medal-main-2.svg',
    spotlightColor: 'rgba(200, 222, 255, 0.45)',
    accessibleName: 'Preview second prize celebration, main prizes, 15,000 rupees',
  },
  {
    id: 'main-3rd',
    trackId: 'main',
    position: '3rd',
    rankNumber: 3,
    amount: 12500,
    formattedAmount: '₹12,500',
    numericWords: '12,500 rupees',
    trackLabel: 'Main Prizes',
    medalType: 'bronze',
    assetPath: '/assets/genesis/prize-pool/medal-main-3.svg',
    spotlightColor: 'rgba(233, 125, 21, 0.45)',
    accessibleName: 'Preview third prize celebration, main prizes, 12,500 rupees',
  },
];

export const VR_PRIZES: PrizeItem[] = [
  {
    id: 'vr-1st',
    trackId: 'vr',
    position: '1st',
    rankNumber: 1,
    amount: 10000,
    formattedAmount: '₹10,000',
    numericWords: '10,000 rupees',
    trackLabel: 'VR Track',
    medalType: 'gold',
    assetPath: '/assets/genesis/prize-pool/medal-vr-1.svg',
    spotlightColor: 'rgba(255, 222, 50, 0.45)',
    accessibleName: 'Preview first prize celebration, VR track, 10,000 rupees',
  },
  {
    id: 'vr-2nd',
    trackId: 'vr',
    position: '2nd',
    rankNumber: 2,
    amount: 5000,
    formattedAmount: '₹5,000',
    numericWords: '5,000 rupees',
    trackLabel: 'VR Track',
    medalType: 'silver',
    assetPath: '/assets/genesis/prize-pool/medal-vr-2.svg',
    spotlightColor: 'rgba(187, 187, 240, 0.45)',
    accessibleName: 'Preview second prize celebration, VR track, 5,000 rupees',
  },
];

export const PRIZE_TRACKS: PrizeTrack[] = [
  {
    id: 'main',
    trackTitle: 'Main Prizes',
    headingAsset: '/assets/genesis/prize-pool/heading-prizes.svg',
    headingAlt: 'PRIZES',
    characterAsset: '/assets/genesis/prize-pool/woody.webp',
    characterAlt: 'Cowboy brawler character',
    characterSide: 'left',
    stageSurfaceGradient: 'linear-gradient(90deg, #105DE5 0%, #09347F 100%)',
    lightingAccent: 'gold-cyan',
    prizes: MAIN_PRIZES,
  },
  {
    id: 'vr',
    trackTitle: 'VR Track',
    headingAsset: '/assets/genesis/prize-pool/heading-vr-track.svg',
    headingAlt: 'VR TRACK',
    characterAsset: '/assets/genesis/prize-pool/buzzlight.webp',
    characterAlt: 'Space ranger brawler character',
    characterSide: 'right',
    stageSurfaceGradient: 'linear-gradient(90deg, #09347F 0%, #105DE5 100%)',
    lightingAccent: 'violet-cyan',
    prizes: VR_PRIZES,
  },
];

/**
 * Genesis 6 Sponsors Section — Data Specification & Asset Manifest
 * Event: Genesis 6 (6th Edition, 2027)
 * Organizer: Game Development and AI Club (GDAI), Army Institute of Technology, Pune
 */

export interface SponsorSlotData {
  id: string;
  order: number;
  categoryLabel: string;
  categoryName: string;
  status: string;
  captionText: string;
  accentColor: string;
  svgPath: string;
  viewBox: string;
  perimeterPath: string;
  bannerSrc: string;
  iconSrc: string;
  badgeLabel: string;
  ariaLabel: string;
}

export interface PastSponsorData {
  id: string;
  name: string;
  logo: string;
  alt: string;
  width: number;
  height: number;
}

export const SPONSORS_COPY = {
  sectionId: 'sponsors',
  heading: 'SPONSORS',
  pastHeading: 'PAST SPONSORS',
  defaultSlotId: 'title-sponsor',
  defaultCaption: 'Title Sponsor · Partner to be announced',
  unspecifiedCaption: 'Sponsor slot · To be announced',
} as const;

export const SPONSOR_SLOTS: SponsorSlotData[] = [
  {
    id: 'title-sponsor',
    order: 1,
    categoryLabel: 'TITLE SPONSOR',
    categoryName: 'Title Sponsor',
    status: 'Partner to be announced',
    captionText: 'Title Sponsor · Partner to be announced',
    accentColor: '#82D724',
    svgPath: '/assets/genesis/sponsors/slots/slot-1-title-sponsor.svg',
    viewBox: '15 20 315 185',
    perimeterPath: 'M45.2997 54.9917H326.54L313.913 199.138H31.8008L45.2997 54.9917Z',
    bannerSrc: '/assets/genesis/sponsors/banner-title-sponsor.webp',
    iconSrc: '/assets/genesis/sponsors/icons/slot1_skull.svg',
    badgeLabel: 'TITLE SPONSOR',
    ariaLabel: 'Title Sponsor slot — Partner to be announced',
  },
  {
    id: 'event-partner',
    order: 2,
    categoryLabel: 'EVENT PARTNER',
    categoryName: 'Event Partner',
    status: 'Partner to be announced',
    captionText: 'Event Partner · Partner to be announced',
    accentColor: '#9C3EF4',
    svgPath: '/assets/genesis/sponsors/slots/slot-2-event-partner.svg',
    viewBox: '325 20 315 185',
    perimeterPath: 'M347.427 54.9917H628.667L616.04 199.138H333.928L347.427 54.9917Z',
    bannerSrc: '/assets/genesis/sponsors/banner-event-partner.webp',
    iconSrc: '/assets/genesis/sponsors/icons/slot2_gem.svg',
    badgeLabel: 'EVENT PARTNER',
    ariaLabel: 'Event Partner slot — Partner to be announced',
  },
  {
    id: 'platform-sponsor',
    order: 3,
    categoryLabel: 'PLATFORM SPONSOR',
    categoryName: 'Platform Sponsor',
    status: 'Partner to be announced',
    captionText: 'Platform Sponsor · Partner to be announced',
    accentColor: '#FF3838',
    svgPath: '/assets/genesis/sponsors/slots/slot-3-platform-sponsor.svg',
    viewBox: '630 20 315 185',
    perimeterPath: 'M649.558 54.9917H930.798L918.171 199.138H636.059L649.558 54.9917Z',
    bannerSrc: '/assets/genesis/sponsors/slot-banner-2.webp',
    iconSrc: '/assets/genesis/sponsors/icons/slot3_target.svg',
    badgeLabel: 'PLATFORM SPONSOR',
    ariaLabel: 'Platform Sponsor slot — Partner to be announced',
  },
  {
    id: 'slot-4',
    order: 4,
    categoryLabel: 'TO BE ANNOUNCED',
    categoryName: 'Sponsor slot',
    status: 'To be announced',
    captionText: 'Sponsor slot · To be announced',
    accentColor: '#2373FF',
    svgPath: '/assets/genesis/sponsors/slots/slot-4-slot-4.svg',
    viewBox: '15 210 315 185',
    perimeterPath: 'M30.4599 243.931H310.888L298.297 388.077H17L30.4599 243.931Z',
    bannerSrc: '/assets/genesis/sponsors/slot-banner-3.webp',
    iconSrc: '/assets/genesis/sponsors/icons/slot4_ball.svg',
    badgeLabel: 'TO BE ANNOUNCED',
    ariaLabel: 'Sponsor slot 4 — To be announced',
  },
  {
    id: 'slot-5',
    order: 5,
    categoryLabel: 'TO BE ANNOUNCED',
    categoryName: 'Sponsor slot',
    status: 'To be announced',
    captionText: 'Sponsor slot · To be announced',
    accentColor: '#FF7A00',
    svgPath: '/assets/genesis/sponsors/slots/slot-5-slot-5.svg',
    viewBox: '325 210 315 185',
    perimeterPath: 'M332.589 243.931H613.017L600.426 388.077H319.129L332.589 243.931Z',
    bannerSrc: '/assets/genesis/sponsors/slot-banner-3.webp',
    iconSrc: '/assets/genesis/sponsors/icons/slot5_5v5.svg',
    badgeLabel: 'TO BE ANNOUNCED',
    ariaLabel: 'Sponsor slot 5 — To be announced',
  },
  {
    id: 'slot-6',
    order: 6,
    categoryLabel: 'TO BE ANNOUNCED',
    categoryName: 'Sponsor slot',
    status: 'To be announced',
    captionText: 'Sponsor slot · To be announced',
    accentColor: '#FFB800',
    svgPath: '/assets/genesis/sponsors/slots/slot-6-slot-6.svg',
    viewBox: '630 210 315 185',
    perimeterPath: 'M634.716 243.931H915.144L902.553 388.077H621.256L634.716 243.931Z',
    bannerSrc: '/assets/genesis/sponsors/slot-banner-3.webp',
    iconSrc: '/assets/genesis/sponsors/icons/slot6_knockout.svg',
    badgeLabel: 'TO BE ANNOUNCED',
    ariaLabel: 'Sponsor slot 6 — To be announced',
  },
];

export const PAST_SPONSORS: PastSponsorData[] = [
  {
    id: 'gamecloud',
    name: 'GameCloud Technologies Private Limited',
    logo: '/assets/genesis/sponsors/logo-gamecloud.webp',
    alt: 'GameCloud Technologies Private Limited — Past Sponsor',
    width: 1598,
    height: 372,
  },
  {
    id: 'gamedoora',
    name: 'GAMEDOORA',
    logo: '/assets/genesis/sponsors/logo-gamedoora.webp',
    alt: 'GAMEDOORA — Past Sponsor',
    width: 1599,
    height: 376,
  },
];

export const SPONSORS_ASSETS = {
  bgCosmic: {
    src: '/assets/genesis/sponsors/bg-cosmic-pattern.webp',
    width: 1487,
    height: 1058,
    alt: 'Dark cosmic pattern with game symbols',
  },
  wordmark: {
    src: '/assets/genesis/sponsors/sponsors-heading.svg',
    width: 327,
    height: 66,
    alt: 'SPONSORS',
  },
  crownedIcon: {
    src: '/assets/genesis/sponsors/icon-crowned-royal.webp',
    width: 71,
    height: 90,
    alt: 'Crowned royal game emblem',
  },
  creditsChest: {
    src: '/assets/genesis/sponsors/icon-credits-chest.webp',
    width: 139,
    height: 111,
    alt: 'Credits chest emblem',
  },
  characterSpike: {
    src: '/assets/genesis/sponsors/character-spike.webp',
    width: 195,
    height: 239,
    alt: 'Spike champion decorative accent',
  },
} as const;

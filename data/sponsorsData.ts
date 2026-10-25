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
  bannerSrc: string;
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
    bannerSrc: '/assets/genesis/sponsors/slot-banner-1.webp',
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
    bannerSrc: '/assets/genesis/sponsors/slot-banner-1.webp',
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
    bannerSrc: '/assets/genesis/sponsors/slot-banner-2.webp',
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
    bannerSrc: '/assets/genesis/sponsors/slot-banner-3.webp',
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
    bannerSrc: '/assets/genesis/sponsors/slot-banner-3.webp',
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
    bannerSrc: '/assets/genesis/sponsors/slot-banner-3.webp',
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
    width: 370,
    height: 167,
  },
  {
    id: 'gamedoora',
    name: 'GAMEDOORA',
    logo: '/assets/genesis/sponsors/logo-gamedoora.webp',
    alt: 'GAMEDOORA — Past Sponsor',
    width: 355,
    height: 154,
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
    height: 50,
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

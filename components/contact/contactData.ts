/**
 * Genesis 6 Contact Section Configuration & Data
 * Sourced directly from Figma reference (node-id=360-1131) and approved project records.
 *
 * Contact digits and names:
 * - Apoorva: 8851065577 -> tel:+918851065577
 * - Anjali: 92533 56424 -> tel:+919253356424
 *
 * Venue:
 * - Host: Army Institute of Technology, Pune
 * - Offline schedule & detailed entry instructions will be announced.
 */

export interface ContactPerson {
  id: string;
  name: string;
  phoneDisplay: string;
  telHref: string;
  ariaLabel: string;
}

export interface VenueInfo {
  heading: string;
  institution: string;
  subLocation?: string;
  address: string;
  city: string;
  statusNote: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectUrl: string;
  sourceReference: string;
}

export const CONTACT_PERSONS: ContactPerson[] = [
  {
    id: 'apoorva',
    name: 'APOORVA',
    phoneDisplay: '8851065577',
    telHref: 'tel:+918851065577',
    ariaLabel: 'Call Apoorva at 8851065577',
  },
  {
    id: 'anjali',
    name: 'ANJALI',
    phoneDisplay: '92533 56424',
    telHref: 'tel:+919253356424',
    ariaLabel: 'Call Anjali at 92533 56424',
  },
];

export const VENUE_INFO: VenueInfo = {
  heading: 'VENUE',
  institution: 'Army Institute of Technology, Pune',
  subLocation: 'AIT Campus, Dighi',
  address: 'Alandi Road, Dighi, Pune, Maharashtra 411015',
  city: 'Pune, Maharashtra',
  statusNote: 'AIT Campus, Dighi, Pune',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.2635957099453!2d73.87325507599292!3d18.60724896651817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c70090000001%3A0x160a20f3d0273495!2sArmy%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1714000000000!5m2!1sen!2sin',
  googleMapsDirectUrl: 'https://www.google.com/maps/search/?api=1&query=Army+Institute+of+Technology,+Dighi,+Pune',
  sourceReference: 'Approved Project Data & Brochure Page 2',
};

export const CONTACT_METRICS = {
  columnMaxWidth: 440,
  plateWidth: 258,
  plateHeight: 73,
  hoverLiftPx: 3,
  pressCompressPx: 2,
  parallaxMaxShiftPx: 4,
} as const;

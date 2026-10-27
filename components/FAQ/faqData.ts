/**
 * GENESIS 6 — FAQ Section Data Specification & Content Manifest
 * Strictly grounded in official event materials:
 * - Genesis 6 Approved Brochure (GENESIS_6_BROCHURE_.pdf)
 * - Genesis 6 Arena Briefing & Timeline Data (aboutGenesis.ts, timelineData.ts)
 * - Genesis 6 Prize Pool Manifest (prizePoolData.ts)
 *
 * Rules:
 * - Any information not confirmed by official sources contains "Details will be announced."
 * - Internal metadata (isPending, sourceReference) is never exposed to the user interface.
 */

export type FAQCategoryId = 'general' | 'technical' | 'prizes' | 'logistics';

export interface FAQQuestionItem {
  id: string;
  question: string;
  answer: string;
  isPending: boolean;
  sourceReference: string;
}

export interface FAQCategory {
  id: FAQCategoryId;
  label: string;
  headingText: string;
  questions: FAQQuestionItem[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'general',
    label: 'GENERAL',
    headingText: 'GENERAL',
    questions: [
      {
        id: 'faq-gen-1',
        question: 'What is Genesis?',
        answer:
          "Genesis 2027 marks the 6th Edition of Army Institute of Technology's premier student-driven Game Jam, powered by the AR-VR Club (GDXR / GDAI). It is a high-energy 24-hour hackathon blending coding, creativity, and game design, where developers assemble to turn bold ideas into pitch-ready games and level up through interactive speaker sessions.",
        isPending: false,
        sourceReference: 'Brochure Page 2 (About Genesis 2027) & aboutGenesis.ts',
      },
      {
        id: 'faq-gen-2',
        question: 'When and where is Genesis happening?',
        answer:
          'Genesis kicks off with an intense 24-hour online game jam qualifier (Round 1), followed by the grand on-campus showdown (Round 2) hosted live at the Army Institute of Technology (AIT) campus in Pune. Exact tournament dates and operational schedule details will be announced.',
        isPending: true,
        sourceReference: 'Brochure Page 2 & 3; Timeline Stages 1-3. Specific calendar dates pending.',
      },
      {
        id: 'faq-gen-3',
        question: 'Who can participate in Genesis?',
        answer:
          'Genesis welcomes passionate game developers, student programmers, digital artists, and storytellers. Registration opens online across Unstop and IndieConnect. Detailed eligibility guidelines, squad compositions, and team-size limits details will be announced.',
        isPending: true,
        sourceReference: 'Timeline Stage 1; Brochure Page 4. Team-size rules pending confirmation.',
      },
      {
        id: 'faq-gen-4',
        question: 'Is there a registration fee?',
        answer: 'Details will be announced.',
        isPending: true,
        sourceReference: 'Pending official registration portal announcement.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'TECHNICAL',
    headingText: 'TECHNICAL',
    questions: [
      {
        id: 'faq-tech-1',
        question: 'What game engines are allowed?',
        answer: 'Details will be announced.',
        isPending: true,
        sourceReference: 'Pending game jam technical committee guidelines release.',
      },
      {
        id: 'faq-tech-2',
        question: 'Can I use pre-made assets?',
        answer: 'Details will be announced.',
        isPending: true,
        sourceReference: 'Pending asset licensing and attribution rules publication.',
      },
      {
        id: 'faq-tech-3',
        question: 'What platforms can we develop for?',
        answer:
          'Genesis features dual competition tracks: the Main Track supporting standard platforms, and a specialized VR Track for immersive experiences. Complete hardware targets, build submission requirements, and platform specifications details will be announced.',
        isPending: true,
        sourceReference: 'prizePoolData.ts (Main & VR Tracks). Specific device targets pending.',
      },
      {
        id: 'faq-tech-4',
        question: 'Will there be workshops or mentorship?',
        answer:
          'Yes! Genesis provides hands-on mentorship from seasoned industry professionals alongside engaging speaker sessions and interactive challenges designed to level up your development skills and soft skills throughout the tournament.',
        isPending: false,
        sourceReference: 'Brochure Page 2 & 6 (Mentorship by industry professionals, Speaker Sessions).',
      },
    ],
  },
  {
    id: 'prizes',
    label: 'PRIZES',
    headingText: 'PRIZES',
    questions: [
      {
        id: 'faq-prize-1',
        question: 'What are the prizes?',
        answer:
          'Genesis 6 boasts a total prize pool exceeding ₹120,000! Cash prizes are distributed across the Main Prizes (1st: ₹17,500, 2nd: ₹15,000, 3rd: ₹12,500) and the VR Track (1st: ₹10,000, 2nd: ₹5,000). Winning and participating brawlers also receive exclusive custom merchandise, gadgets, goodies, and official certificates.',
        isPending: false,
        sourceReference: 'Brochure Page 4, 5 & 6; prizePoolData.ts.',
      },
      {
        id: 'faq-prize-2',
        question: 'How will winners be selected?',
        answer:
          'All game prototypes submitted during the jam undergo preliminary evaluation by expert reviewers. Shortlisted finalists then present playable builds live to an esteemed panel of industry judges and audience members at AIT Pune. Detailed scoring rubrics and evaluation criteria details will be announced.',
        isPending: true,
        sourceReference: 'Timeline Stage 2, 3 & 4. Rubric criteria pending.',
      },
    ],
  },
  {
    id: 'logistics',
    label: 'LOGISTICS',
    headingText: 'LOGISTICS',
    questions: [
      {
        id: 'faq-log-1',
        question: 'Will food be provided?',
        answer: 'Details will be announced.',
        isPending: true,
        sourceReference: 'Pending campus hospitality and catering schedule confirmation.',
      },
      {
        id: 'faq-log-2',
        question: 'Can I sleep at the venue?',
        answer: 'Details will be announced.',
        isPending: true,
        sourceReference: 'Pending AIT Pune campus overnight accommodation policies.',
      },
      {
        id: 'faq-log-3',
        question: 'What should I bring?',
        answer:
          'Finalists attending the on-campus round at AIT Pune must bring their personal laptops or development rigs, power chargers, necessary test devices or VR gear, and valid student identification. Comprehensive check-in requirements and packing list details will be announced.',
        isPending: true,
        sourceReference: 'Brochure Page 2 ("Fire up your rigs"). Full checklist pending.',
      },
    ],
  },
];

export const FAQ_STATIC_METRICS = {
  // Sizing reference: roomy laptop 1440x1024
  panelWidthDesktop: 960,
  minPanelContentHeightDesktop: 490, // ensures 4 rows or expanded answer fit with zero geometric jumping
  rowMinHeightDesktop: 72,
  transitionDurationMs: 280,
  staggerMs: 40,
} as const;

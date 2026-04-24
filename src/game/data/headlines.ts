import type { Color, SegmentKey } from '../types';

export const SEGMENT_CITIZENS: Record<SegmentKey, string> = {
  industrial: 'Factory Workers',
  urban: 'The Creative Class',
  agricultural: 'Farmers and Settlers',
  financial: 'Analysts and Investors',
  periphery: 'Local Residents',
};

export type IronicEntry = {
  segmentKey: SegmentKey;
  colors: Color[];      // stored sorted alphabetically for deterministic lookup
  headline: string;
};

// Verbatim from projectInfo/colorlition_segments_and_headlines.md section 3.
// Colors are pre-sorted alphabetically so lookup just compares sorted sets.
export const IRONIC_DICTIONARY: IronicEntry[] = [
  {
    segmentKey: 'financial',
    colors: ['green', 'purple', 'red'],
    headline:
      "Hedge funds rebrand as 'People's Carbon Trusts' to survive the Occupy Wall St. blockade.",
  },
  {
    segmentKey: 'industrial',
    colors: ['blue', 'orange', 'yellow'],
    headline:
      'Steel mills privatized as military drones guard the new high-speed harvest rail.',
  },
  {
    segmentKey: 'periphery',
    colors: ['blue', 'grey', 'yellow'],
    headline:
      "Gig-workers forced into 'Traditional Value' contracts monitored by private security AI.",
  },
  {
    segmentKey: 'agricultural',
    colors: ['grey', 'orange', 'yellow'],
    headline:
      'The Triple B Alliance (Boi, Bala, Bíblia) locks down the Frontier with new property immunity.',
  },
  {
    segmentKey: 'urban',
    colors: ['blue', 'green', 'purple'],
    headline:
      'The Technocratic Enlightenment: Luxury high-rises reach net-zero as rent quotas take effect.',
  },
  {
    segmentKey: 'urban',
    colors: ['grey', 'orange', 'red'],
    headline:
      'Creative hubs repurposed for urban farming as traditionalist labor laws take effect.',
  },
];

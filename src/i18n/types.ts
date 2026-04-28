import type {
  Color,
  HeadlineKind,
  HeadlineTemplateKey,
  LabelKey,
  SegmentKey,
} from '../game/types';

export type Locale = 'en' | 'pt-BR';

export const LOCALES: readonly Locale[] = ['en', 'pt-BR'] as const;

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  'pt-BR': 'PT',
};

// Narrative content. Templates use {token} placeholders the renderer fills in.
export type GameDict = {
  blocNames: Record<Color, string>;
  demands: Record<Color, string[]>;
  pivotDemands: string[];
  grantDemands: string[];
  exitPollDemand: string;
  // Resolved by labelFor() — keeps non-bloc kinds out of BLOC_NAMES.
  pivotLabel: string;
  grantLabel: string;
  exitPollLabel: string;
  // {segment} is replaced with the segment label at render time.
  headlineTemplates: Record<HeadlineTemplateKey, Record<HeadlineKind, string>>;
  segmentLabels: Record<SegmentKey, string>;
  singleTitles: Record<Color, string>;
  dualTitles: Record<string, string>;
  tripleTitles: Record<string, string>;
  // Fallbacks used by deriveVictoryTitle when no entry matches.
  unclassifiedLeaderTitle: string;
  reluctantCandidateTitle: string;
  // Lobby ticker ambient newsroom one-liners.
  ambientHeadlines: string[];
  // {name} replaced at render time.
  readyTemplates: string[];
  // Big-screen ticker pre-game / between-headlines ambient lines.
  openingHeadlines: string[];
  // {name} replaced at render time.
  nextVariations: string[];
  finalRoundMessage: string;
  // Static UI bits sitting alongside narrative content (red "Headlines" chip,
  // candidate fallback name) — they share the same locale boundary as the rest
  // of the ticker copy so they live here, not in the UI dict.
  newsroomChip: string;
  // {id} replaced at render time.
  candidateFallback: string;
};

// UI dictionary shape is inferred from `ui/en.ts` so adding a key there grows
// `UIKey` automatically and TS flags pt-BR as missing it.
// See ui/en.ts for the live shape.
export type { UIKey, UIDict } from './ui/en';

// Re-export label-key helpers so consumers can import everything from here.
export type { LabelKey };


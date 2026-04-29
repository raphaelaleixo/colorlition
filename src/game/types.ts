import type { COLORS, SEGMENT_NAMES } from './constants';

export type Color = (typeof COLORS)[number];
export type SegmentKey = (typeof SEGMENT_NAMES)[number]['key'];

export type CardKind = 'bloc' | 'grant' | 'pivot' | 'exitPoll';

export type BlocCard = { id: string; kind: 'bloc'; color: Color; value: number };
export type GrantCard = { id: string; kind: 'grant' };
export type PivotCard = { id: string; kind: 'pivot' };
export type ExitPollCard = { id: string; kind: 'exitPoll' };

export type Card = BlocCard | GrantCard | PivotCard | ExitPollCard;

// `label` is resolved from the active locale's GameDict at render time, so
// game state stays language-neutral and locale switches don't strand prior
// segment labels in their original language.
export type Segment = {
  key: SegmentKey;
  cards: Card[];
  claimedBy: string | null;
  capacity: number;
};

export type Phase =
  | 'lobby'
  | 'turn'
  | 'roundEnd'
  | 'finalRound'
  | 'scoring'
  | 'ended';

export type PlayerRoundStatus = 'active' | 'claimed';

export type PerPlayerState = {
  base: Card[];
  roundStatus: PlayerRoundStatus;
};

export type ScoreBreakdown = {
  playerId: string;
  colorCounts: Record<Color, number>;
  // Bloc counts excluding pivot assignments — used by the victory title so
  // wilds don't flip a player's identity to a color they never drafted.
  rawColorCounts: Record<Color, number>;
  pivotAssignments: Color[];
  positiveColors: Color[];
  negativeColors: Color[];
  positive: number;
  negative: number;
  grants: number;
  total: number;
};

export type HeadlineKind = 'spark' | 'movement' | 'friction';

// templateKey identifies the narrative thread (color / pivot / grant); kind
// identifies the position-driven variation. Together they index into
// GameDict.headlineTemplates. Stored language-neutral so locale switches
// re-render correctly.
export type HeadlineTemplateKey =
  | Color
  | 'pivot'
  | 'grant';

// Coalition-row / chip label key — bloc colors plus the non-bloc kinds that
// can appear in a player's base (pivot, grant) or as a card chip (exitPoll).
export type LabelKey = Color | 'pivot' | 'grant' | 'exitPoll';

export type Headline = {
  id: string;
  kind: HeadlineKind;
  templateKey: HeadlineTemplateKey;
  segmentKey: SegmentKey;
  roundNumber: number;
};

export type ScoreSnapshot = {
  roundNumber: number;
  scores: Record<string, number>;
};

// A card the active player drew but hasn't placed yet. Lives on shared state
// (not local mobile state) so the big screen can render the medium-card
// reveal during the gap between draw and placement.
export type PendingDraw = {
  playerId: string;
  card: Card;
  exitPollTriggered: boolean;
};

export type ColorlitionGameState = {
  phase: Phase;
  deck: Card[];
  exitPollDrawn: boolean;
  // Flips true once the active player taps Continue on the Exit Poll reveal.
  // Gates the Big Screen's ExitPollReveal departure and the deferred next-card
  // draw, keeping the reveal and the subsequent DrawCardReveal sequential.
  exitPollAcknowledged: boolean;
  segments: Segment[];
  turnOrder: string[];
  currentPlayerIndex: number;
  roundLeadIndex: number;
  roundNumber: number;
  playerState: Record<string, PerPlayerState>;
  winnerIds: string[] | null;
  scoreBreakdown: ScoreBreakdown[] | null;
  lastHeadline: Headline | null;
  scoreHistory: ScoreSnapshot[];
  pendingDraw: PendingDraw | null;
};

export type ColorlitionPlayerData = Record<string, never>; // empty in v1

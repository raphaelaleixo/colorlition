import type { COLORS, SEGMENT_NAMES } from './constants';

export type Color = (typeof COLORS)[number];
export type SegmentKey = (typeof SEGMENT_NAMES)[number]['key'];

export type CardKind = 'bloc' | 'grant' | 'pivot' | 'exitPoll';

export type BlocCard = { id: string; kind: 'bloc'; color: Color; value: number };
export type GrantCard = { id: string; kind: 'grant' };
export type PivotCard = { id: string; kind: 'pivot' };
export type ExitPollCard = { id: string; kind: 'exitPoll' };

export type Card = BlocCard | GrantCard | PivotCard | ExitPollCard;

export type Segment = {
  key: SegmentKey;
  label: string;
  cards: Card[];
  claimedBy: string | null;
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
  pivotAssignments: Color[];
  positiveColors: Color[];
  negativeColors: Color[];
  positive: number;
  negative: number;
  grants: number;
  total: number;
};

export type ColorlitionGameState = {
  phase: Phase;
  deck: Card[];
  exitPollDrawn: boolean;
  segments: Segment[];
  turnOrder: string[];
  currentPlayerIndex: number;
  roundLeadIndex: number;
  roundNumber: number;
  playerState: Record<string, PerPlayerState>;
  winnerIds: string[] | null;
  scoreBreakdown: ScoreBreakdown[] | null;
};

export type ColorlitionPlayerData = Record<string, never>; // empty in v1

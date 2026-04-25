import type { RoomState } from 'react-gameroom';
import type { GameContextValue } from '../contexts/GameContext';
import type {
  Card,
  ColorlitionGameState,
  ColorlitionPlayerData,
  Color,
} from '../game/types';

function blocs(color: Color, values: number[]): Card[] {
  return values.map((value) => ({
    id: `bloc-${color}-${value}`,
    kind: 'bloc',
    color,
    value,
  }));
}

function grants(indices: number[]): Card[] {
  return indices.map((i) => ({ id: `grant-${i}`, kind: 'grant' }));
}

function pivots(indices: number[]): Card[] {
  return indices.map((i) => ({ id: `pivot-${i}`, kind: 'pivot' }));
}

const PLAYERS = [
  { id: 1, name: 'Maria Costa' },
  { id: 2, name: 'James Reed' },
  { id: 3, name: 'Ana Silva' },
  { id: 4, name: 'Tom Park' },
  { id: 5, name: 'Linda Hall' },
] as const;

export const MOCK_GAME_STATE: ColorlitionGameState = {
  phase: 'turn',
  deck: [],
  exitPollDrawn: false,
  segments: [
    {
      key: 'industrial',
      label: 'Industrial Belt',
      cards: [
        ...blocs('purple', [4]),
        ...blocs('green', [6]),
        ...blocs('blue', [5]),
      ],
      claimedBy: null,
    },
    {
      key: 'urban',
      label: 'Urban Professionals',
      cards: [...blocs('orange', [3, 4])],
      claimedBy: null,
    },
    {
      key: 'agricultural',
      label: 'Agricultural Frontier',
      cards: [...blocs('red', [5])],
      claimedBy: null,
    },
    {
      key: 'financial',
      label: 'Financial District',
      cards: [],
      claimedBy: null,
    },
    {
      key: 'periphery',
      label: 'Periphery',
      cards: [],
      claimedBy: '2',
    },
  ],
  turnOrder: ['1', '2', '3', '4', '5'],
  currentPlayerIndex: 2,
  roundLeadIndex: 0,
  roundNumber: 4,
  playerState: {
    '1': {
      base: [
        ...blocs('green', [0, 1, 2, 3, 4]),
        ...blocs('blue', [0, 1, 2]),
        ...blocs('red', [0, 1]),
        ...grants([0]),
        ...pivots([0]),
      ],
      roundStatus: 'active',
    },
    '2': {
      base: [
        ...blocs('purple', [0, 1, 2, 3]),
        ...blocs('orange', [0, 1, 2]),
        ...blocs('yellow', [0, 1]),
        ...grants([1, 2]),
      ],
      roundStatus: 'claimed',
    },
    '3': {
      base: [
        ...blocs('red', [2, 3, 4]),
        ...blocs('grey', [0, 1]),
        ...blocs('green', [5]),
        ...pivots([1]),
        ...grants([3]),
      ],
      roundStatus: 'active',
    },
    '4': {
      base: [
        ...blocs('yellow', [2, 3]),
        ...blocs('blue', [3, 4]),
      ],
      roundStatus: 'active',
    },
    '5': {
      base: [
        ...blocs('grey', [2]),
        ...grants([4]),
        ...pivots([2]),
      ],
      roundStatus: 'active',
    },
  },
  winnerIds: null,
  scoreBreakdown: null,
  lastHeadline: {
    id: 'h-mock-industrial-full',
    kind: 'segment_full',
    segmentKey: 'industrial',
    roundNumber: 4,
    text: 'Industrial Belt locks in a fragile three-way coalition.',
  },
};

export const MOCK_ROOM_STATE: RoomState<ColorlitionPlayerData> = {
  roomId: 'MOCK1',
  status: 'started',
  config: { minPlayers: 3, maxPlayers: 5, requireFull: false },
  players: PLAYERS.map((p) => ({
    id: p.id,
    status: 'ready' as const,
    name: p.name,
    data: {},
  })),
};

const NOOP_ASYNC = async () => {};
const NOOP_ASYNC_STR = async () => '';
const NOOP_ASYNC_NUM = async () => 0;

export function buildMockGameContextValue(
  gameState: ColorlitionGameState = MOCK_GAME_STATE,
): GameContextValue {
  return {
    roomState: MOCK_ROOM_STATE,
    gameState,
    loading: false,
    createRoom: NOOP_ASYNC_STR,
    loadRoom: () => {},
    joinRoom: NOOP_ASYNC_NUM,
    claimSlot: NOOP_ASYNC,
    startTheGame: NOOP_ASYNC,
    drawAndPlace: NOOP_ASYNC,
    claim: NOOP_ASYNC,
  };
}

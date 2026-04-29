# 2-Player Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 2-player variant where the deck loses 2 colors (one warm-ish, one neutral-ish), each player starts with 2 globally-distinct colors, and 3 segments hold 1/2/3 cards respectively. Branching is a pure function of `turnOrder.length`.

**Architecture:** Extend existing helpers — `buildDeck` accepts an array of excluded colors instead of one optional, `pickStartingHands` deals N cards per player, segments carry per-row `capacity`, headline logic compares against `segment.capacity` instead of a `=== 3` constant. Two new helpers (`excludedColorsFor`, `segmentLayoutFor`) own the per-arity rules so the branching never spreads into call sites. No game-mode enum, no Firebase schema flag.

**Tech Stack:** TypeScript, React 19, MUI, Firebase RTDB, react-gameroom 0.11.0. No test framework — verification is `tsc -b` + `eslint` + manual play.

---

## File Touch List

- `src/game/constants.ts` — add helpers, drop `CARDS_PER_SEGMENT` + `EXCLUDE_COLOR_AT_PLAYERS`, lower `MIN_PLAYERS`.
- `src/game/types.ts` — add `Segment.capacity`.
- `src/game/deck.ts` — `buildDeck(excluded: Color[])`, `pickStartingHands(..., cardsPerPlayer)`.
- `src/game/actions.ts` — `canPlaceInSegment` uses `segment.capacity`, `buildInitialGameState` takes a layout array and `Record<string, Card[]>` starting hands.
- `src/game/headlines.ts` — full-segment check is `n === segmentAfter.capacity`.
- `src/contexts/GameContext.tsx` — `startTheGame` uses the new helpers + multi-card hands.
- `src/components/big-screen/VoterSegments.tsx` — empty-slot count from `segment.capacity`.
- `src/i18n/ui/en.ts`, `src/i18n/ui/pt-BR.ts` — update tagline ("3 to 5" → "2 to 5").
- `src/pages/HowToPlayPage.tsx` — append a 2-player call-out.

---

## Task 1: Add `excludedColorsFor` + `segmentLayoutFor` helpers, lower `MIN_PLAYERS`

**Files:**
- Modify: `src/game/constants.ts`

This is an additive change (plus `MIN_PLAYERS: 3 → 2`). Existing constants stay so downstream files keep compiling.

- [ ] **Step 1: Replace `src/game/constants.ts` contents**

```ts
import type { Color, SegmentKey } from './types';
// `import type` is required: types.ts imports COLORS/SEGMENT_KEYS from this
// file, so a value-level import would create a runtime circular dependency.
export const COLORS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

// Segment keys are stable IDs; user-visible labels are resolved from the
// active locale's GameDict at render time (see i18n/game/*.ts segmentLabels).
export const SEGMENT_KEYS = [
  { key: 'industrial' },
  { key: 'urban' },
  { key: 'agricultural' },
  { key: 'financial' },
  { key: 'periphery' },
] as const;

// Backwards-compat alias — many call sites still import SEGMENT_NAMES.
export const SEGMENT_NAMES = SEGMENT_KEYS;

export const CARDS_PER_COLOR = 9;
export const CARDS_PER_SEGMENT = 3;
export const GRANTS_IN_DECK = 10;
export const PIVOTS_IN_DECK = 3;
export const GRANT_VALUE = 2;
export const EXIT_POLL_BOTTOM_WINDOW = 15;
export const MIN_PLAYERS = 2;
export const EXCLUDE_COLOR_AT_PLAYERS = 3;
export const MAX_PLAYERS = 5;
export const TOP_POSITIVE_COLORS = 3;

const WARM_GROUP: Color[] = ['red', 'green', 'purple'];
const COOL_GROUP: Color[] = ['blue', 'orange', 'yellow', 'grey'];

function pickOne<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

// Per-arity color exclusion rule. 2 players drops two colors (one from each
// group) so the deck doesn't tilt entirely warm or entirely cool. 3 players
// drops one random color (existing rule). 4+ keep the full deck.
export function excludedColorsFor(playerCount: number): Color[] {
  if (playerCount === 2) return [pickOne(WARM_GROUP), pickOne(COOL_GROUP)];
  if (playerCount === 3) return [pickOne([...COLORS])];
  return [];
}

// Per-arity segment layout. 2 players use a tapered 1/2/3 capacity across
// the first three named segments; 3+ use the existing uniform-3 rows, one
// per player.
export function segmentLayoutFor(
  playerCount: number,
): { key: SegmentKey; capacity: number }[] {
  if (playerCount === 2) {
    return [
      { key: SEGMENT_KEYS[0].key, capacity: 1 },
      { key: SEGMENT_KEYS[1].key, capacity: 2 },
      { key: SEGMENT_KEYS[2].key, capacity: 3 },
    ];
  }
  return SEGMENT_KEYS.slice(0, playerCount).map((s) => ({
    key: s.key,
    capacity: CARDS_PER_SEGMENT,
  }));
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b`
Expected: clean exit, no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/game/constants.ts
git commit -m "feat(2p): add excludedColorsFor + segmentLayoutFor; lower MIN_PLAYERS"
```

---

## Task 2: Add `capacity` to `Segment` type

**Files:**
- Modify: `src/game/types.ts`

- [ ] **Step 1: Add the field**

Edit `src/game/types.ts`. Replace the `Segment` type (around line 18):

```ts
export type Segment = {
  key: SegmentKey;
  cards: Card[];
  claimedBy: string | null;
  capacity: number;
};
```

- [ ] **Step 2: Verify it surfaces the expected errors**

Run: `npx tsc -b`
Expected: errors at the call sites that build segments (`src/game/actions.ts:225-229` `buildInitialGameState`, plus `src/contexts/GameContext.tsx` segment normalization in `normalizeGameState`). These are fixed in Tasks 3 + 5.

Do not commit yet — leave the broken state on the working tree until Task 3 closes the type errors. (If you prefer green commits only, defer this step's commit into Task 3.)

---

## Task 3: Capacity-aware `canPlaceInSegment` + capacity-aware empty slots + capacity-aware `buildInitialGameState`

**Files:**
- Modify: `src/game/actions.ts`
- Modify: `src/components/big-screen/VoterSegments.tsx`
- Modify: `src/contexts/GameContext.tsx` (just `normalizeGameState` segment branch — preserves capacity from raw)

This task closes every call site that touches segment shape, so the typechecker goes green again.

- [ ] **Step 1: Update `canPlaceInSegment` and `buildInitialGameState` in `src/game/actions.ts`**

Replace the import line at the top:

```ts
import type { ColorlitionGameState, SegmentKey, Card, Segment, ScoreSnapshot } from './types';
```

(removes the `CARDS_PER_SEGMENT` import — we still need it elsewhere, so leave it in `constants.ts`).

Replace `canPlaceInSegment` (around line 26):

```ts
export function canPlaceInSegment(segment: Segment): boolean {
  return segment.cards.length < segment.capacity && segment.claimedBy === null;
}
```

Replace `buildInitialGameState` signature + segment construction (around lines 218-252):

```ts
export function buildInitialGameState(
  deck: Card[],
  turnOrder: string[],
  layout: ReadonlyArray<{ key: SegmentKey; capacity: number }>,
  startingHands: Record<string, Card[]> = {},
): ColorlitionGameState {
  const segments: Segment[] = layout.map((s) => ({
    key: s.key,
    cards: [],
    claimedBy: null,
    capacity: s.capacity,
  }));
  const playerState: ColorlitionGameState['playerState'] = {};
  for (const pid of turnOrder) {
    const starters = startingHands[pid] ?? [];
    playerState[pid] = { base: [...starters], roundStatus: 'active' };
  }
  return {
    phase: 'turn',
    deck,
    exitPollDrawn: false,
    exitPollAcknowledged: false,
    segments,
    turnOrder,
    currentPlayerIndex: 0,
    roundLeadIndex: 0,
    roundNumber: 1,
    playerState,
    winnerIds: null,
    scoreBreakdown: null,
    lastHeadline: null,
    scoreHistory: [snapshotScores(turnOrder, playerState, 0)],
    pendingDraw: null,
  };
}
```

Two semantic changes:
- `layout` replaces both `segmentKeys` and the implicit slice-by-`playerCount` step (callers compute the layout now).
- `startingHands` is now `Record<string, Card[]>` instead of `Record<string, Card>`; player base initialised by spreading the array.

- [ ] **Step 2: Update `normalizeGameState` in `src/contexts/GameContext.tsx`**

Find the `segments` map block (around lines 53-57) and add capacity preservation. Replace:

```ts
  const segments: Segment[] = (raw.segments ?? []).map((s) => ({
    key: s.key,
    cards: s.cards ?? [],
    claimedBy: s.claimedBy ?? null,
    capacity: s.capacity ?? 3,
  }));
```

The `?? 3` fallback covers any in-flight game written before this change — they all used the uniform-3 layout, so the default is correct.

- [ ] **Step 3: Update empty-slot rendering in `src/components/big-screen/VoterSegments.tsx`**

Open `src/components/big-screen/VoterSegments.tsx`. Remove the `CARDS_PER_SEGMENT` import (line 26):

```ts
// delete this line:
import { CARDS_PER_SEGMENT } from '../../game/constants';
```

Replace the two references (lines 230, 233) with `segment.capacity`. Find:

```ts
const emptySlots = Math.max(0, CARDS_PER_SEGMENT - segment.cards.length);
```

Replace with:

```ts
const emptySlots = Math.max(0, segment.capacity - segment.cards.length);
```

And on line 233:

```ts
CARDS_PER_SEGMENT - snapshotRef.current.length,
```

Replace with:

```ts
segment.capacity - snapshotRef.current.length,
```

- [ ] **Step 4: Drop `CARDS_PER_SEGMENT` from `src/game/constants.ts`**

Now no consumer references it. Delete the line:

```ts
export const CARDS_PER_SEGMENT = 3;
```

…and replace the `segmentLayoutFor` 3+ branch (which still references the constant) with a literal `3`:

```ts
  return SEGMENT_KEYS.slice(0, playerCount).map((s) => ({
    key: s.key,
    capacity: 3,
  }));
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b`
Expected: only one remaining error — `GameContext.startTheGame` still calls `buildInitialGameState(finalDeck, turnOrder, SEGMENT_NAMES, hands)` with the old shape, plus `pickStartingHands` returning `Record<string, Card>` instead of `Record<string, Card[]>`. Both fixed in Task 5.

Stop at this checkpoint; the next task fixes deck.ts before we wire startTheGame.

---

## Task 4: Update `buildDeck` + `pickStartingHands` signatures

**Files:**
- Modify: `src/game/deck.ts`

- [ ] **Step 1: Replace `buildDeck` to accept a list**

In `src/game/deck.ts`, replace `buildDeck` (lines 10-31):

```ts
export function buildDeck(excluded: Color[] = []): Card[] {
  const skip = new Set(excluded);
  const deck: Card[] = [];
  for (const color of COLORS) {
    if (skip.has(color as Color)) continue;
    for (let value = 0; value < CARDS_PER_COLOR; value++) {
      deck.push({
        id: `bloc-${color}-${value}`,
        kind: 'bloc',
        color: color as Color,
        value,
      });
    }
  }
  for (let i = 0; i < GRANTS_IN_DECK; i++) {
    deck.push({ id: `grant-${i}`, kind: 'grant' });
  }
  for (let i = 0; i < PIVOTS_IN_DECK; i++) {
    deck.push({ id: `pivot-${i}`, kind: 'pivot' });
  }
  // 7 colors × 9 = 63 blocs full deck. 5 colors → 45, 6 colors → 54.
  return deck;
}
```

- [ ] **Step 2: Replace `pickStartingHands` to deal N cards per player**

Replace `pickStartingHands` (lines 41-65):

```ts
export function pickStartingHands(
  deck: Card[],
  playerIds: string[],
  excluded: Color[] = [],
  cardsPerPlayer = 1,
): { deck: Card[]; hands: Record<string, Card[]> } {
  const skip = new Set(excluded);
  const available = COLORS.filter((c) => !skip.has(c as Color)) as Color[];
  const required = playerIds.length * cardsPerPlayer;
  if (required > available.length) {
    throw new Error(
      `pickStartingHands: ${playerIds.length} players × ${cardsPerPlayer} cards = ${required} colors needed, only ${available.length} available`,
    );
  }
  const shuffledColors = shuffle(available).slice(0, required);
  const remaining = deck.slice();
  const hands: Record<string, Card[]> = {};
  playerIds.forEach((pid, playerIdx) => {
    hands[pid] = [];
    for (let cardIdx = 0; cardIdx < cardsPerPlayer; cardIdx++) {
      const color = shuffledColors[playerIdx * cardsPerPlayer + cardIdx];
      const idx = remaining.findIndex(
        (c) => c.kind === 'bloc' && c.color === color,
      );
      if (idx === -1) {
        throw new Error(`pickStartingHands: no ${color} bloc left in deck`);
      }
      const [card] = remaining.splice(idx, 1);
      hands[pid].push(card);
    }
  });
  return { deck: remaining, hands };
}
```

- [ ] **Step 3: Drop the now-unused `pickRandomColor` export**

`pickRandomColor` is currently used only by `GameContext.startTheGame`, which we replace in Task 5 with `excludedColorsFor`. Delete `pickRandomColor` (lines 33-36):

```ts
// delete:
export function pickRandomColor(excludedColor?: Color): Color {
  const pool = COLORS.filter((c) => c !== excludedColor);
  return pool[Math.floor(Math.random() * pool.length)] as Color;
}
```

If a grep for `pickRandomColor` returns hits outside `GameContext.tsx`, restore it. (`grep -rn "pickRandomColor" src/`)

- [ ] **Step 4: Typecheck**

Run: `npx tsc -b`
Expected: errors only in `GameContext.startTheGame` (referenced in Task 5).

Stop. Task 5 closes the remaining errors.

---

## Task 5: Wire `startTheGame` to use the new helpers

**Files:**
- Modify: `src/contexts/GameContext.tsx`

- [ ] **Step 1: Update imports**

At the top of `src/contexts/GameContext.tsx` (around lines 28-35), replace:

```ts
import { MIN_PLAYERS, MAX_PLAYERS, SEGMENT_NAMES, EXCLUDE_COLOR_AT_PLAYERS } from '../game/constants';
import {
  buildDeck,
  shuffle,
  placeExitPoll,
  pickStartingHands,
  pickRandomColor,
} from '../game/deck';
```

with:

```ts
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  excludedColorsFor,
  segmentLayoutFor,
} from '../game/constants';
import {
  buildDeck,
  shuffle,
  placeExitPoll,
  pickStartingHands,
} from '../game/deck';
```

- [ ] **Step 2: Replace the `startTheGame` body**

Find `startTheGame` (around lines 209-234). Replace the body of the callback (everything inside the arrow function — keep the `useCallback` wrapper and dependency array):

```ts
  const startTheGame = useCallback(async () => {
    if (!roomState) return;
    const roomId = roomState.roomId;
    const started = startGameRoom(roomState);
    const readyPlayers = roomState.players.filter((p) => p.status === 'ready');
    const turnOrder = readyPlayers.map((p) => String(p.id));
    if (turnOrder.length < MIN_PLAYERS) {
      throw new Error(`Need at least ${MIN_PLAYERS} players to start`);
    }

    const excluded = excludedColorsFor(turnOrder.length);
    const cardsPerPlayer = turnOrder.length === 2 ? 2 : 1;
    const layout = segmentLayoutFor(turnOrder.length);

    const fullDeck = buildDeck(excluded);
    const { deck: afterDealing, hands } = pickStartingHands(
      fullDeck,
      turnOrder,
      excluded,
      cardsPerPlayer,
    );
    const finalDeck = placeExitPoll(shuffle(afterDealing));

    const newGameState = buildInitialGameState(finalDeck, turnOrder, layout, hands);

    await set(ref(database, `rooms/${roomId}/room`), started);
    await set(ref(database, `rooms/${roomId}/game`), newGameState);
  }, [roomState]);
```

- [ ] **Step 3: Drop `EXCLUDE_COLOR_AT_PLAYERS` from constants**

Open `src/game/constants.ts` and delete:

```ts
export const EXCLUDE_COLOR_AT_PLAYERS = 3;
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc -b`
Expected: clean.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 6: Commit Tasks 2-5 together**

The four tasks form a coupled type/signature migration; commit them as one cohesive change (they break compilation between tasks).

```bash
git add src/game/types.ts src/game/actions.ts src/game/deck.ts src/contexts/GameContext.tsx src/components/big-screen/VoterSegments.tsx src/game/constants.ts
git commit -m "feat(2p): per-segment capacity + multi-color exclusion + N-card hands"
```

---

## Task 6: Capacity-aware "segment full" headline rule

**Files:**
- Modify: `src/game/headlines.ts`

For capacity-1 segments: skip "Rising Demand", fire the "friction" (full-segment ironic) headline directly. For capacity-2 segments: fire "spark" then "friction" (no "movement"). For capacity-3: unchanged.

- [ ] **Step 1: Replace `deriveHeadline`**

In `src/game/headlines.ts`, replace the body (lines 30-52):

```ts
export function deriveHeadline(
  _segmentBefore: Segment,
  segmentAfter: Segment,
  placedCard: Card,
  roundNumber: number,
  seq: number,
): Headline | null {
  const n = segmentAfter.cards.length;
  if (n < 1) return null;

  const key = templateKey(placedCard);
  if (!key) return null;

  // Full-segment placement always fires the ironic-dictionary "friction"
  // variant, regardless of how many cards the segment held. Capacity-1 rows
  // collapse spark+friction into friction-only.
  let variation: HeadlineKind;
  if (n >= segmentAfter.capacity) {
    variation = 'friction';
  } else if (n === 1) {
    variation = 'spark';
  } else if (n === 2) {
    variation = 'movement';
  } else {
    return null;
  }

  return {
    id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
    kind: variation,
    templateKey: key,
    segmentKey: segmentAfter.key,
    roundNumber,
  };
}
```

The `VARIATION_BY_POSITION` lookup table is no longer used — delete the `const VARIATION_BY_POSITION` declaration at lines 24-28.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc -b && npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/game/headlines.ts
git commit -m "feat(2p): headline keyed off segment.capacity, not constant 3"
```

---

## Task 7: i18n tagline copy

**Files:**
- Modify: `src/i18n/ui/en.ts`
- Modify: `src/i18n/ui/pt-BR.ts`

- [ ] **Step 1: Update English tagline**

In `src/i18n/ui/en.ts:17`, change:

```ts
'A real-time card draft for 3 to 5 players, dressed up as 2026 politics.',
```

to:

```ts
'A real-time card draft for 2 to 5 players, dressed up as 2026 politics.',
```

- [ ] **Step 2: Update Portuguese tagline**

In `src/i18n/ui/pt-BR.ts:19`, change:

```ts
'Um draft de cartas em tempo real para 3 a 5 jogadores, vestido com a roupagem da política de 2026.',
```

to:

```ts
'Um draft de cartas em tempo real para 2 a 5 jogadores, vestido com a roupagem da política de 2026.',
```

- [ ] **Step 3: Search for any other "3" or "three" copy that references the player range**

Run: `grep -rn "3 to 5\|3 a 5\|three.*five\|três a cinco" src/`
Expected: no other hits beyond the two updated above. If there are, update them.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc -b && npm run lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/ui/en.ts src/i18n/ui/pt-BR.ts
git commit -m "i18n(2p): tagline 3-5 → 2-5"
```

---

## Task 8: How-to-play 2-player call-out

**Files:**
- Read: `src/pages/HowToPlayPage.tsx` (full file — locate the right insertion point)
- Modify: `src/pages/HowToPlayPage.tsx`
- Maybe modify: `src/i18n/ui/en.ts`, `src/i18n/ui/pt-BR.ts`, `src/i18n/types.ts` (if you add new i18n keys)

The HowToPlayPage already exists and uses the i18n system. Look at its current structure first to decide whether to add a new section via i18n keys or inline (if the page already has hardcoded English copy as a stopgap).

- [ ] **Step 1: Read the page to determine the i18n pattern**

Run: `cat src/pages/HowToPlayPage.tsx`

Note whether sections come from `t('howToPlay.something')` keys or are inline JSX. If keyed, you'll add a new key per locale. If inline, append a new section block matching the existing visual rhythm.

- [ ] **Step 2: Add the 2-player call-out**

The copy should cover the four rule changes. Suggested English:

> **Two-Player Variant.** When only two candidates run, the deck drops two colors (one from red/green/purple, one from blue/orange/yellow/grey). Each campaign opens with two starting blocs, all four globally distinct. Three voter segments hold 1, 2, and 3 blocs respectively — the round ends when both candidates claim, and any blocs left in the unclaimed segment are discarded.

Suggested Portuguese:

> **Variante para Dois Jogadores.** Com apenas dois candidatos, o baralho perde duas cores (uma entre vermelho/verde/roxo, outra entre azul/laranja/amarelo/cinza). Cada campanha começa com dois blocos iniciais, todos os quatro de cores distintas. Três segmentos de eleitores comportam 1, 2 e 3 blocos respectivamente — a rodada termina quando ambos reivindicam, e quaisquer blocos no segmento não reivindicado são descartados.

Place the call-out as the last item in whatever "rules / variants" section the page already has. If the page is fully keyed, add a `howToPlay.twoPlayerVariant.{title,body}` pair to both locales and a matching entry in `src/i18n/types.ts` if one exists.

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc -b && npm run lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HowToPlayPage.tsx src/i18n/
git commit -m "docs(2p): how-to-play call-out for the 2-player variant"
```

---

## Task 9: Manual smoke test

No automated tests exist. The user verifies by playing. This task is the play-through script — run it before declaring done.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Open the URL in two browser windows (one will play candidate 1, one candidate 2).

- [ ] **Step 2: Create a room with 2 candidates**

In window A: home page → create room. In window B: scan/visit the join URL → join. Confirm the lobby now allows starting at 2 players (the "needs N more" copy should disappear once both are ready).

- [ ] **Step 3: Verify starting hands**

Tap "Launch Campaign". On each player's controller, confirm the Coalition shows **two** starting blocs of **two different colors**, and that **all four starting colors are distinct** across both players.

- [ ] **Step 4: Verify segment layout**

On the big screen, confirm exactly **three segment rows**, the first showing **1 empty slot**, the second **2**, the third **3**. The segment labels should be the first three from the named list (Industrial Belt, Urban Professionals, Agricultural Frontier).

- [ ] **Step 5: Verify capacity enforcement**

Take turns drawing cards. Try to add a second bloc to the capacity-1 segment — the placement option should be disabled. Try to add a fourth bloc to the capacity-3 segment — should also be disabled. Capacity-2 should accept exactly 2.

- [ ] **Step 6: Verify "segment full" headline on capacity-1 placement**

Have a player draw a bloc and place it in the empty capacity-1 segment. The big-screen headline feed should fire a "friction"-variant ironic headline (the ones from `segments_and_headlines.md`'s segment×color dictionary). It should **not** fire a "Rising Demand" headline first.

- [ ] **Step 7: Verify round end + unclaimed-segment discard**

Play out the round until both players claim. Confirm: (a) round-end pause shows all segments in their final state, (b) after the pause, every segment is empty (including the unclaimed one — its cards are discarded, not retained).

- [ ] **Step 8: Verify Exit Poll path**

Play through enough rounds to draw the Exit Poll. Confirm the final round triggers, scoring page renders, victory title is sensible.

- [ ] **Step 9: Verify 3-player path is unbroken**

Open a third tab, kill the room, create a new one with 3 candidates. Confirm: starting hands are **1 card each, all distinct colors**; segments are **3 rows, all capacity 3**; one (and only one) random color is missing from play; gameplay proceeds normally.

- [ ] **Step 10: Verify 4-5 player paths are unbroken**

Same, with 4 and 5 candidates. No colors excluded; one segment per player; all rows capacity 3.

- [ ] **Step 11: If smoke test passes, no extra commit needed**

This task produces no code change. If you find a regression, fix it in a follow-up task and re-run the smoke test from step 1.

---

## Self-Review Notes

**Spec coverage:** Every numbered section of the spec maps to a task: (1) deck exclusion → Task 1 (`excludedColorsFor`) + Task 4 (signature) + Task 5 (wiring). (2) starting hands → Task 4 + Task 5. (3) segments → Task 1 (`segmentLayoutFor`) + Task 2 (type) + Task 3 (consumers) + Task 5 (wiring). (4) round end → no change required (verified in Task 9 smoke test). (5) headlines → Task 6. (6) UI copy → Tasks 7 + 8. (7) `MIN_PLAYERS` → Task 1.

**Type consistency check:** `excludedColorsFor` returns `Color[]` everywhere. `segmentLayoutFor` returns `{ key: SegmentKey; capacity: number }[]`. `pickStartingHands` returns `{ deck, hands: Record<string, Card[]> }`. `buildInitialGameState` accepts `ReadonlyArray<{ key: SegmentKey; capacity: number }>` for layout and `Record<string, Card[]>` for hands. `Segment.capacity: number`. All consistent.

**Ordering caveat:** Tasks 2-5 break compilation in the middle. They commit as one bundle (Task 5 step 6) rather than individually. If you want green commits between every task, reorder so all type/signature additions happen before any removals — but the proposed bundling is faster and keeps the diff coherent.

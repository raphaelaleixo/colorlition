# 2-Player Mode — Design

## Goal

Add a 2-player variant to Colorlition. Activated automatically when exactly 2 players start the game. The variant tightens the deck, doubles the starting hand, and replaces the uniform 3-card segment layout with a tapered 1/2/3 layout across 3 segments.

## Trigger

Mode is a pure function of `turnOrder.length`. No mode enum, no UI toggle, no Firebase schema flag. `MIN_PLAYERS` drops from 3 to 2.

## Rules (the four player-facing changes)

1. **Two colors removed from the deck.** One randomly drawn from `['red', 'green', 'purple']`, one from `['blue', 'orange', 'yellow', 'grey']`. Generalizes today's "exclude one color at 3 players" rule.
2. **Each player starts with 2 different colors.** All 4 starting cards are distinct colors across both players (global constraint, not per-player).
3. **Three segments, tapered capacities.** First segment holds 1 card, second holds 2, third holds 3. Segments are the first 3 of the 5 named segments (consistent with today's first-N slicing).
4. **Round ends when both players claim.** Already the default round-end trigger; no behavior change. The third (unclaimed) segment's cards are discarded with the rest at round reset — same path as the existing `commitRoundEnd` clear.

## Implementation

### 1. Constants (`src/game/constants.ts`)

- `MIN_PLAYERS`: `3 → 2`.
- Remove `CARDS_PER_SEGMENT` (now per-segment, see Segment type below).
- Remove `EXCLUDE_COLOR_AT_PLAYERS` (replaced by the layout helper below).
- Add `segmentLayoutFor(playerCount: number): { key: SegmentKey; capacity: number }[]`:
  - `playerCount === 2` → first 3 named segments with capacities `[1, 2, 3]`.
  - `playerCount >= 3` → first N named segments, each with capacity 3.
- Add `excludedColorsFor(playerCount: number): Color[]`:
  - `playerCount === 2` → one random from `['red','green','purple']` + one random from `['blue','orange','yellow','grey']`.
  - `playerCount === 3` → one random from all 7 colors (matches today).
  - `playerCount >= 4` → empty array.

### 2. Deck (`src/game/deck.ts`)

- `buildDeck(excluded: Color[] = [])`: replace the single optional `excludedColor` with a list. Loop skips any color in the list.
- `pickStartingHands(deck, playerIds, excluded, cardsPerPlayer = 1)`: extend with `cardsPerPlayer`. Returns `{ deck, hands: Record<string, Card[]> }` instead of `Record<string, Card>`. Selects `playerIds.length × cardsPerPlayer` distinct colors from the available pool, then dispenses `cardsPerPlayer` of them per player. Throws if available colors < required.

### 3. Types (`src/game/types.ts`)

- `Segment`: add `capacity: number`.

### 4. Game logic (`src/game/actions.ts`)

- `canPlaceInSegment(segment)`: compare against `segment.capacity` instead of the removed `CARDS_PER_SEGMENT` constant.
- `buildInitialGameState(deck, turnOrder, layout, startingHands)`:
  - `layout` is now `{ key, capacity }[]` instead of `{ key }[]`.
  - Build segments with `{ key, cards: [], claimedBy: null, capacity }`.
  - `startingHands` becomes `Record<string, Card[]>`; player base initialized to `[...startingHands[pid] ?? []]`.

### 5. Headlines (`src/game/headlines.ts`)

When the placed card causes `seg.cards.length === seg.capacity`, fire only the **full-segment ironic-dictionary headline** — never the "Rising Demand" / "Tense Alliance" variants. Today the same condition is gated by `=== 3`; replace with the dynamic capacity comparison. Capacity-1 segments collapse the spark and full-segment events into a single full-segment headline (per design discussion).

### 6. Game start (`src/contexts/GameContext.tsx`)

In `startTheGame`:
- Replace the inline `excludedColor` ternary with `excludedColorsFor(turnOrder.length)`.
- Compute `cardsPerPlayer = turnOrder.length === 2 ? 2 : 1`.
- Pass `excluded` (array) and `cardsPerPlayer` to `buildDeck` and `pickStartingHands`.
- Compute `layout = segmentLayoutFor(turnOrder.length)` and pass to `buildInitialGameState` (replaces today's `SEGMENT_NAMES` constant).

### 7. UI / copy

- Lobby `MIN_PLAYERS` text: "Need 2–5 candidates" (was 3–5).
- Big screen segment row layout: already maps over `state.segments`. Verify the existing layout breathes correctly with 3 rows where capacities differ — the row component should reserve N card slots based on `segment.capacity`, not a hardcoded 3. Audit `SegmentRow.tsx` for hardcoded slot counts.
- "How to Play" page: append a 2-player call-out describing the four rule changes above.

## Out of scope

- Exit Poll bottom window stays at 15. The 2-player deck is 59 cards (vs. 67 at 3p, 76 at 5p); final-round timing shifts but is not broken.
- No tiebreaker changes, no scoring formula changes, no Pivot/Grant changes.
- No 6-player mode (still capped at 5 by named-segment count).

## Files touched (estimated)

- `src/game/constants.ts` — add layout/exclusion helpers, drop two constants.
- `src/game/deck.ts` — `buildDeck` + `pickStartingHands` signature changes.
- `src/game/types.ts` — `Segment.capacity`.
- `src/game/actions.ts` — `canPlaceInSegment`, `buildInitialGameState` layout.
- `src/game/headlines.ts` — capacity-aware "segment full" check.
- `src/contexts/GameContext.tsx` — `startTheGame` wiring.
- Lobby copy / `MIN_PLAYERS` references — wherever the "3–5" string appears.
- `src/components/shared/SegmentRow.tsx` — capacity-aware slot rendering, if hardcoded.
- "How to Play" page — 2-player call-out.

## Open questions resolved during brainstorming

- **Starting hand semantics**: globally distinct colors across both players (Option B).
- **Unclaimed third segment**: cards discarded at round end (Option A).
- **Capacity-1 headline collision**: fire the full-segment ironic headline, skip "Rising Demand".

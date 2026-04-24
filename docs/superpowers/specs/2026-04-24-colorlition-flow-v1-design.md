# Color-lition — Flow v1 Design

**Date:** 2026-04-24
**Status:** Draft for review
**Scope:** First playable prototype. Game loop end-to-end, no narrative polish, no styling.

---

## 1. Stack & scope

**Stack** (mirrors krimi and react-unmatched):

- Vite + React 19 + TypeScript
- MUI + Emotion (unstyled — `createTheme({})` placeholder; bare `sx` only where layout requires)
- Firebase Realtime Database for cross-device sync
- react-gameroom 0.10.x for lobby primitives (room creation, player slots, QR code, start transitions, fullscreen)
- React Router 7 with `createBrowserRouter` + lazy-loaded routes
- Single `GameContext` pattern (wraps RoomState + GameState + actions)
- Deploy: Vercel, SPA fallback via `vercel.json`

**v1 scope (in):**

- Lobby → start → turn loop (draw/place OR claim) → round reset → Exit Poll final round → scoring → winner screen
- Big Screen and Mobile views, real multi-device via Firebase
- Projected Mandate live leaderboard
- Brute-force Pivot optimization in scoring

**v1 scope (out):** see Section 7.

**Defaults baked in:**

- Min 2, max 5 players. Segments per game = player count, drawn from the 5 named segments (Industrial Belt, Urban Professionals, Agricultural Frontier, Financial District, Periphery — first N taken in that order).
- Deck and Exit Poll position shuffled once by the host at game start and written to Firebase. Exit Poll position is randomized within bottom 15 cards at shuffle time and then fixed. No re-randomization.
- Scoring tiebreakers: (1) more Public Grants, (2) fewer total cards in Coalition, (3) earliest slot id. Co-winners possible if all three still tie.
- Turn order = slot order from react-gameroom's RoomState. Round lead rotates: `roundLeadIndex = (roundLeadIndex + 1) % turnOrder.length` per round.

## 2. Routes & folder layout

### Routes

| Path | Purpose | Device |
|---|---|---|
| `/` | Home. "Create Game" button generates room id, redirects to `/room/:id`. | Big Screen |
| `/room/:id` | Lobby (react-gameroom `PlayerSlotsGrid` + QR). Transitions to Big Screen game view once `room.status === "started"`. | Big Screen |
| `/join` or `/join/:id?` | Name entry. Claims an empty slot via `joinPlayer()`, redirects to the player page. | Mobile |
| `/room/:id/player/:playerId` | Mobile Controller (Coalition base, Draw/Claim buttons, turn state). | Mobile |

All routes lazy-loaded via `React.lazy` + `<Suspense>`, like krimi.

### `src/` folder layout

```
src/
  main.tsx
  App.tsx
  firebase.ts              // init, exports db
  router/
    index.tsx              // createBrowserRouter config
  contexts/
    GameContext.tsx        // roomState + gameState subscriptions + actions
  pages/
    HomePage.tsx
    LobbyPage.tsx          // /room/:id before start
    BigScreenPage.tsx      // /room/:id after start
    JoinPage.tsx           // /join
    PlayerPage.tsx         // /room/:id/player/:playerId
  components/
    big-screen/
      VoterSegments.tsx
      DrawPile.tsx
      Leaderboard.tsx
      PublicCoalitions.tsx
      WinnerScreen.tsx
    mobile/
      CoalitionBase.tsx
      TurnActions.tsx
      WaitingView.tsx
    shared/
      Card.tsx
      SegmentRow.tsx
  game/
    types.ts               // ColorlitionGameState, PlayerData, Card, Color, Segment
    deck.ts                // buildDeck (assigns bloc.value 0..8 per color), shuffle, placeExitPoll
    actions.ts             // pure fns: drawAndPlace, claim, advanceTurn, endRound
    scoring.ts             // triangular, pivot brute-force, tiebreaker, projectedMandate
    constants.ts           // COLORS, SEGMENT_NAMES, CARDS_PER_SEGMENT, MIN_PLAYERS, MAX_PLAYERS
```

### Boundaries

- `game/` is pure — no React, no Firebase. Deterministic functions over state. Directly testable.
- `GameContext` is the only layer that talks to Firebase. It subscribes to `rooms/{id}/room` (react-gameroom) and `rooms/{id}/game` (app state), exposes actions that compute next state via `game/` functions, and writes back via a single `update()` per action.
- Components read from `useGame()` and call its actions. No direct Firebase access from components.

## 3. Firebase data model

Two sibling nodes per room (matches krimi):

```
rooms/
  {roomId}/
    room/     ← react-gameroom's RoomState<ColorlitionPlayerData>
    game/     ← ColorlitionGameState
```

### Types

```ts
type ColorlitionPlayerData = {
  // intentionally empty in v1 — react-gameroom already carries slotId, name, status
  // reserved for v2: avatar color, party label, etc.
};

type Color = "red" | "purple" | "green" | "blue" | "orange" | "yellow" | "grey";
type CardKind = "bloc" | "grant" | "pivot" | "exitPoll";

type Card =
  | { id: string; kind: "bloc"; color: Color; value: number }   // value 0..8, unique per color
  | { id: string; kind: "grant" }       // +2 flat
  | { id: string; kind: "pivot" }       // wild
  | { id: string; kind: "exitPoll" };   // final-round trigger

// `value` is the demand-lookup index used by v2's narrative engine to match
// Interest Blocs to specific "We want…" strings. In v1 it's assigned but unused.
// Range: 0–8 (9 bloc cards per color). v2's demand list covers 0–6 (7 per color);
// indexes 7–8 will be filled in or aliased in v2. Only present on bloc cards.

type SegmentKey =
  | "industrial" | "urban" | "agricultural" | "financial" | "periphery";

type Segment = {
  key: SegmentKey;
  cards: Card[];              // length 0..3
  claimedBy: string | null;   // playerId once claimed — marks segment used this round
};

type Phase =
  | "lobby"
  | "turn"
  | "roundEnd"
  | "finalRound"
  | "scoring"
  | "ended";

type ColorlitionGameState = {
  phase: Phase;
  deck: Card[];
  exitPollDrawn: boolean;
  segments: Segment[];              // N segments where N = playerCount
  turnOrder: string[];              // playerIds
  currentPlayerIndex: number;
  roundLeadIndex: number;
  roundNumber: number;              // 1-indexed
  playerState: {
    [playerId: string]: {
      base: Card[];                 // Coalition: captured cards across all rounds
      roundStatus: "active" | "claimed";
    };
  };
  winnerIds: string[] | null;
  scoreBreakdown: ScoreBreakdown[] | null;
};

type ScoreBreakdown = {
  playerId: string;
  colorCounts: Record<Color, number>;   // after pivot assignment
  pivotAssignments: Color[];            // length = pivots in base
  positiveColors: Color[];              // top 3
  negativeColors: Color[];              // the rest
  positive: number;
  negative: number;
  grants: number;
  total: number;
};
```

### Design notes

- Segments are authoritative state in Firebase — not derived.
- `deck` is the remaining deck. `deck[0]` is top; drawing = `deck.shift()`. Shuffled once at game start including Exit Poll position.
- `currentPlayerIndex` always points to an active player; `advanceTurn()` skips claimed players.
- No optimistic updates in v1. Every action writes to Firebase and waits for the listener to re-render. Matches krimi.
- When a segment is claimed, its cards flush immediately into the claimer's `base`; segment becomes `{ cards: [], claimedBy: playerId }` until round end.

## 4. Turn loop state machine

```
on TURN for player P:
  P chooses either:

    (a) DRAW
        card = deck.shift()
        if card.kind === "exitPoll":
          exitPollDrawn = true
          phase = "finalRound"
          card = deck.shift()                 // re-draw; replacement is what P places
          if replacement undefined:           // Exit Poll was literally last card
            advanceTurn()                     // round will end naturally
            return
        P picks segment s where s.cards.length < 3 AND s.claimedBy === null
        s.cards.push(card)
        advanceTurn()

    (b) CLAIM s
        requires s.cards.length > 0 AND s.claimedBy === null
        playerState[P].base.push(...s.cards)
        s.cards = []
        s.claimedBy = P
        playerState[P].roundStatus = "claimed"
        advanceTurn()

advanceTurn():
  find next i in turnOrder with playerState[turnOrder[i]].roundStatus === "active"
  if none → endRound()
  else currentPlayerIndex = i

endRound():
  // flush already happened at claim time — no flush here
  reset every segment: cards = [], claimedBy = null
  reset every playerState[*].roundStatus = "active"
  if exitPollDrawn:
    phase = "scoring"
    compute scoreBreakdowns, winnerIds
    phase = "ended"
  else:
    roundLeadIndex = (roundLeadIndex + 1) % turnOrder.length
    currentPlayerIndex = roundLeadIndex
    roundNumber += 1
    phase = "turn"
```

### Validity rules (enforced on mobile; Big Screen is reactive only)

- **Valid placement target:** `s.cards.length < 3 && s.claimedBy === null`
- **Valid claim target:** `s.cards.length > 0 && s.claimedBy === null`
- **Draw available:** always (while it's your turn and `deck.length > 0`).
- **Claim available:** when at least one segment is a valid claim target.

### Edge cases

- **Only one active player left:** they still take turns until they draw-and-place into the last valid slot, at which point `advanceTurn()` finds no active player and ends the round.
- **Draw with no valid placement target:** unreachable if segments = playerCount. Defensive fallback: force claim. Noted, not coded around in v1 unless observed.
- **Deck empty mid-round before Exit Poll drawn:** extremely unlikely at 88 cards. v1 rule: treat as implicit Exit Poll — round completes normally, then phase → scoring.
- **Player disconnects mid-turn:** out of scope for v1. Game stalls.
- **Exit Poll as last card:** handled explicitly in draw flow above.

## 5. Scoring

Pure functions in `game/scoring.ts`. Called once when transitioning to `phase === "scoring"`. Input: `playerState[id].base: Card[]`.

```
scorePlayer(base: Card[]): ScoreBreakdown
  blocs        = cards where kind === "bloc"   (grouped by color)
  grants       = count where kind === "grant"
  pivots       = count where kind === "pivot"
  baseCounts   = Record<Color, number>         // bloc counts per color

  best = null
  for each assignment of pivots across 7 colors (7^pivots combos; ≤ 343):
    counts   = baseCounts + assignment
    sorted   = colors sorted by counts[c] desc, tiebreak alphabetical
    top3     = first 3 colors in sorted where counts[c] > 0
    rest     = remaining colors where counts[c] > 0
    positive = sum(triangular(counts[c])) for c in top3
    negative = sum(triangular(counts[c])) for c in rest
    net      = positive - negative
    prefer higher net; tiebreak on higher positive
    if this beats best → best = {assignment, top3, rest, positive, negative}

  total = best.positive - best.negative + grants * 2
  return {playerId, colorCounts: counts, pivotAssignments: best.assignment,
          positiveColors: best.top3, negativeColors: best.rest,
          positive: best.positive, negative: best.negative,
          grants: grants * 2, total}
```

**Triangular:** `n(n+1)/2` → 0/1/3/6/10/15/21/28/…

**Why brute-force:** Pushing a pivot into a 4th color can demote a weaker top-3 member and net more. "Assign to top 3" is a good heuristic but not optimal in edge cases. Brute-force is correct and cheap (7^3 = 343 max).

**Projected Mandate (live leaderboard during play):** same `scorePlayer` called each render against current `playerState[*].base`. Not persisted until `phase === "scoring"`. Since claims flush to base immediately (Section 4), the leaderboard is always accurate.

**Winner determination:**

1. `maxTotal = max(breakdowns.total)`
2. Candidates: everyone with `total === maxTotal`
3. Tiebreaker chain:
   1. Most `grants` (raw card count, not scored value)
   2. Fewest total cards in base
   3. Earliest slot id in `turnOrder`
4. `winnerIds` = all candidates still tied after step 3. Typically 1; can be 2+.

## 6. Component tree

### Big Screen — `LobbyPage` (`/room/:id` before start)

```
LobbyPage
├── header      — roomId + [FullscreenToggle]
├── RoomQRCode
├── PlayerSlotsGrid
└── StartGameButton
```

### Big Screen — `BigScreenPage` (`/room/:id` after start)

```
BigScreenPage
├── header              — roundNumber, phase, "FINAL ROUND" banner, [FullscreenToggle]
├── DrawPile            — shows deck.length; no peek
├── VoterSegments       — grid of N SegmentRow
│     └── SegmentRow × N
│           ├── segment name
│           ├── Card × up to 3 (face up)
│           └── claimedBy marker (when claimedBy !== null)
├── PublicCoalitions    — row per player, face-up base
│     └── PlayerCoalition × N (color counts, grants, pivots)
├── Leaderboard         — Projected Mandate, sorted totals, live
└── WinnerScreen        — shown only when phase === "ended"
      └── winner name(s), score breakdown table
```

### Mobile — `PlayerPage` (`/room/:id/player/:playerId`)

```
PlayerPage
├── header           — my name, turn indicator ("Your turn" / "Waiting for Alice…")
├── CoalitionBase    — my captured cards (mirror of Big Screen PublicCoalitions for me)
├── SegmentsReadonly — compact segments view; helps target picking
└── TurnActions      — interactive only when currentPlayerIndex resolves to me
      ├── State A (idle):     [Draw]  +  [Claim k] × N (enabled on valid targets)
      ├── State B (drawn card pending placement):
      │                       drawn card, "FINAL ROUND" flash if just triggered,
      │                       [Place in k] × N (enabled on valid placement targets)
      └── State C (claimed / round over / game over): disabled message
```

### Shared

- `Card.tsx` renders all four kinds identically across screens. v1: text labels only — "Red Bloc", "Pivot", "Public Grant", "Exit Poll". MUI `Card` / `Chip`, unstyled.
- `GameContext` actions: `drawAndPlace(segmentKey)` and `claim(segmentKey)`.

### Draw-to-place: two UX clicks, one Firebase write

The UX is two interactions (click Draw → pick segment), but the state transition is atomic. On click Draw, the client pops `deck` locally (in memory, not Firebase yet), shows the card, and waits for the segment pick. When the player picks a segment, we `update()` Firebase with the new `deck` (shorter by 1 or 2 depending on Exit Poll), the updated `segments[k].cards`, and `exitPollDrawn` / `phase` if applicable — all in a single write.

Disconnect behavior:

- **Disconnect after click Draw, before pick:** nothing was written; state stays pre-draw. On rejoin, player simply draws again.
- **Disconnect after pick but before write lands:** Firebase write either completed or didn't; no partial state possible because the update is a single write.

Alternative considered: persist a "drawn card pending placement" node in Firebase between the two clicks. Rejected — adds a phase, adds reconciliation, buys nothing v1 cares about.

## 7. Out of scope for v1

- No "We want…" private demand text on mobile or big screen.
- No headline engine — no Rising Demand / Tense Alliance / segment-full ironic headlines.
- No victory-title lookup from the color-DNA table. Winner screen shows name(s) + score table only.
- No Economist/journalism styling. `createTheme({})` placeholder; bare MUI, inline `sx` only for layout where needed (flex/grid).
- No animations, no card-flip choreography, no private card-reveal moment.
- No reconnect UX. Disconnected players stall the game.
- No scoring tiebreaker UI beyond co-winner display. Tiebreaker chain runs silently.
- No i18n, no locale files. English strings inline.
- No mock routes, no dev-only pages.
- No code-splitting config beyond Vite defaults.
- No test suite in v1. `game/` is pure and therefore test-ready for v2.
- No authentication. Anyone with the URL is in.

### Accepted risks

1. **Concurrent writes from multiple clients could corrupt state.** Mitigated by only rendering interactive controls for `currentPlayer`. Not bulletproof; acceptable for friends-playing-a-game threat model.
2. **Host shuffles the deck client-side.** The host's browser writes the shuffled deck + Exit Poll position to Firebase. Trust model = "friends".
3. **Draw-and-place atomicity depends on one client staying online between the two UX clicks.** Drop mid-draw → state stays pre-draw → redraw on rejoin. Noted above.

## 8. Open follow-ups for v2 planning

Not questions blocking v1, but should be resolved before v2:

- How to surface the "We want…" demand privately on the drawer's mobile during placement (requires adding a pending-draw node to Firebase game state). Lookup uses `Card.value` (already present in v1 data) to index the demand string for that color.
- How to fill or alias demand indexes 7–8 (currently only 0–6 have strings in `colorlition_interest_bloc_demands.md`).
- Whether the headline feed lives on Big Screen only or also mirrors to mobile.
- Reconnect UX: rejoin room via `/join/:id` already handled by react-gameroom; game-state reconnect (resume mid-turn) is new design.
- Victory title lookup table structure (parse markdown spec into JSON at build time?).

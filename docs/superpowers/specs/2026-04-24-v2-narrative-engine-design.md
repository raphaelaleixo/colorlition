# Color-lition v2 — Narrative Engine Design

**Date:** 2026-04-24
**Status:** Draft for review
**Scope:** Add the narrative layer on top of the v1 playable game loop: private demand reveal, public demand attachment, live headline feed, and personality-driven victory titles. No styling, no tests, no reconnect.

**Prior art:** v1 shipped. Game loop works end-to-end via Firebase + react-gameroom. See `docs/superpowers/specs/2026-04-24-colorlition-flow-v1-design.md`. v1 rules drifted in several places during implementation (see project memory `v1_complete.md`); v2 builds on *current code*, not on that v1 spec.

---

## 1. Data porting

Three new files under `src/game/data/`, hand-ported once from the three spec markdowns. Markdown files stay as the human-editable source; TS files are what the code reads. No runtime markdown parser.

```
src/game/data/
  demands.ts
  titles.ts
  headlines.ts
```

### `demands.ts`
```ts
export const DEMANDS: Record<Color, string[]>;   // length 9 per color, indexed by card.value
export const BLOC_NAMES: Record<Color, string>;  // e.g. red -> "Labor & Unions"
```

`DEMANDS` comes from `projectInfo/colorlition_interest_bloc_demands.md` (sections numbered 1–9 per color, cite tags already stripped). `BLOC_NAMES` comes from the section headers in that same file (`### 🚩 Labor & Unions (Red)` → `red: "Labor & Unions"`).

### `titles.ts`
```ts
export const SINGLE_TITLES: Record<Color, string>;          // 7 entries
export const DUAL_TITLES: Record<string, string>;           // 21 entries, keys "colorA+colorB" sorted
export const TRIPLE_TITLES: Record<string, string>;         // 35 entries, keys "colorA+colorB+colorC" sorted
```

From `projectInfo/colorlition_victory_titles_headlines.md`. Keys are built from sorted color names joined by `+` (e.g. `"blue+green+red"`), to give deterministic lookup regardless of input order.

### `headlines.ts`
```ts
export const SEGMENT_CITIZENS: Record<SegmentKey, string>;  // "Factory Workers", etc., for Rising Demand template
export type IronicEntry = { segmentKey: SegmentKey; colors: Color[]; headline: string };
export const IRONIC_DICTIONARY: IronicEntry[];              // the 6 entries from the spec
```

From `projectInfo/colorlition_segments_and_headlines.md`. `colors` is sorted; lookup compares sorted sets.

## 2. State shape

One new field on `ColorlitionGameState`:

```ts
export type Headline = {
  id: string;                 // `h-${roundNumber}-${segmentKey}-${seq}` — stable React key
  kind: 'rising_demand' | 'tense_alliance' | 'segment_full';
  segmentKey: SegmentKey;
  roundNumber: number;
  text: string;               // fully rendered, ready to display
};

export type ColorlitionGameState = {
  // …existing v1 fields unchanged…
  headlines: Headline[];      // append-only during the game
};
```

### Lifecycle
- `buildInitialGameState` initializes `headlines: []`.
- `drawAndPlace` appends at most 1 headline per call.
- `endRound` does **not** clear headlines — the feed persists across rounds for the life of the game.
- `normalizeGameState` in `src/contexts/GameContext.tsx` must add `headlines: raw.headlines ?? []` to guard against Firebase's empty-array drop.
- No new Firebase node. Headlines ride along in the existing `rooms/{id}/game` object.

## 3. Headline derivation

New pure module `src/game/headlines.ts` (distinct from the *data* module `src/game/data/headlines.ts`):

```ts
export function deriveHeadline(
  segmentBefore: Segment,
  segmentAfter: Segment,
  placedCard: Card,
  roundNumber: number,
  seq: number,
): Headline | null;
```

### Trigger rules (checked in order; first match wins)

1. **Segment full** (`segmentAfter.cards.length === 3`). Classify by the composition of the 3 placed cards:
   - **Dictionary hit** — all 3 are blocs, and `{segmentKey, sortedColors}` matches an `IRONIC_DICTIONARY` entry → use that ironic headline verbatim.
   - **Uniform** — all 3 are blocs, same color:
     `"The {Segment} speaks with one voice as {BlocName} dominates."`
   - **Duopoly** — all 3 are blocs, 2+1 colors:
     `"{MajorityBlocName} dominates the {Segment}, with {MinorityBlocName} clinging on."`
   - **Coalition (unknown)** — 3 different bloc colors, no dictionary hit:
     `"An unlikely coalition forms in the {Segment}: {A}, {B}, and {C}."`
   - **Mixed** — one or more cards are non-bloc (Grant/Pivot):
     `"A mixed coalition of interests claims the {Segment}."`

2. **Tense Alliance** (`segmentAfter.cards.length === 2`, both bloc cards, different colors):
   `"{Segment} Headline: A tense alliance forms as {BlocA} and {BlocB} interests collide."`

3. **Rising Demand** (`segmentAfter.cards.length === 1`, card is a bloc):
   `"{Segment} Headline: Demands for {BlocName} begin to rise among {Citizens}."`

4. **Otherwise** — return `null` (e.g. Grant/Pivot placed first or second, no Rising Demand or Tense Alliance trigger).

Template placeholder substitution:
- `{Segment}` → segment label (e.g. `"Industrial Belt"`)
- `{BlocName}` / `{A}` / etc. → `BLOC_NAMES[color]`
- `{Citizens}` → `SEGMENT_CITIZENS[segmentKey]`

### Integration

Inside `drawAndPlace` in `src/game/actions.ts`, right before appending the card:

```ts
const before = deepClone(seg);
seg.cards.push(card);
const seq = next.headlines.length;
const headline = deriveHeadline(before, seg, card, next.roundNumber, seq);
if (headline) next.headlines.push(headline);
```

Note: `seq` is just `headlines.length` at derive-time, used to build a unique `id`. This gives stable keys across concurrent plays within the same round.

### Non-bloc nuances
- Grant/Pivot placed in an empty segment: no Rising Demand.
- Grant/Pivot as the second card: no Tense Alliance.
- Grant/Pivot still count toward segment-full; they land in the `Mixed` bucket.

## 4. Victory titles

New pure module `src/game/titles.ts`:

```ts
export function deriveVictoryTitle(positiveColors: Color[]): string;
```

Lookup logic:

- `positiveColors.length === 0` → `"the Reluctant Candidate"` (edge: winner had no bloc cards).
- `positiveColors.length === 1` → `SINGLE_TITLES[positiveColors[0]]`.
- `positiveColors.length === 2` → `DUAL_TITLES[sortedColors.join('+')]`.
- `positiveColors.length === 3` → `TRIPLE_TITLES[sortedColors.join('+')]`.

Any lookup miss (shouldn't happen since the tables are complete) falls back to `"the Unclassified Leader"`.

Called from `src/components/big-screen/WinnerScreen.tsx` using the winner's already-computed `ScoreBreakdown.positiveColors`. No state change; derivation happens at render time.

## 5. UI changes

### `src/components/shared/Card.tsx`
New optional prop:
```ts
{ card: GameCard; showDemand?: boolean }
```
When `showDemand === true` AND `card.kind === 'bloc'`, wrap the chip with a small `<Typography variant="caption">` below it containing `DEMANDS[card.color][card.value]`. Default `false` so existing call sites (coalition summary chips) are unaffected.

### `src/components/shared/SegmentRow.tsx`
Accepts a `showDemand?: boolean` prop and passes it through to each `<Card>`. Default `false`.

### `src/components/big-screen/VoterSegments.tsx`
Pass `showDemand={true}` when rendering `SegmentRow`s.

### `src/components/mobile/SegmentsReadonly.tsx`
Pass `showDemand={true}` — mobile players also see the demand text under each placed card.

### `src/components/mobile/TurnActions.tsx`
When the pending-draw preview shows and `pending.card.kind === 'bloc'`, display the demand caption below the chip:
```
You drew: [chip]
We want: "<DEMANDS[color][value]>"
```
Italic formatting on the demand sentence. Only rendered for bloc cards. Grant/Pivot/Exit-Poll re-draw cases keep the existing minimal preview.

### `src/components/big-screen/HeadlineFeed.tsx` (new)
Renders `gameState.headlines` newest-first as a plain MUI `Stack` of `<Typography>` lines. No truncation, no pagination, no timestamp display. Each entry is one line; `Typography` variant `body2`. Empty state: render a subtle `"No headlines yet."` placeholder.

### `src/components/big-screen/WinnerScreen.tsx`
Replace the header:
```
Winner: Alice
```
with:
```
Alice, the Green Syndicalist
```
Co-winners:
```
Co-winners: Alice (the Green Syndicalist), Bob (the Rural Autocrat)
```
Title derived via `deriveVictoryTitle(breakdown.positiveColors)` for each winner id's breakdown entry.

### `src/pages/BigScreenPage.tsx`
Add `<HeadlineFeed />` between `<VoterSegments />` and `<PublicCoalitions />`. Vertical layout:

```
header (round, final-round banner, fullscreen)
DrawPile
VoterSegments           ← now with demand captions under each card
HeadlineFeed            ← NEW
PublicCoalitions
Leaderboard
WinnerScreen (if ended) ← now with title
```

No changes to `HomePage`, `LobbyPage`, `JoinPage`, `PlayerPage` structural layout. `PlayerPage` inherits demand captions indirectly via the `SegmentsReadonly` → `SegmentRow` → `Card` chain.

## 6. Out of scope for v2

- No styling pass. Unstyled MUI throughout; feed and demand captions are plain text. Visual aesthetic is v3.
- No animations. Card-place, headline-pop-in, demand reveal — all instant.
- No additional ironic headlines. Sparse dictionary (6 entries) + templates fill the gap. Content expansion is v2.5.
- No i18n. English only.
- No test suite for `game/` pure functions. Still test-ready but deferred.
- No reconnect UX, no auth, no Firebase security rules. "Friends playing a game" threat model.
- No headline feed truncation or pagination. Full list renders; worst case ~60 entries fits.

### Accepted risks

1. **Dictionary coverage** — only ~3–5% of segment-full events hit an ironic headline; the rest use templates. If games feel repetitive, expansion is a quick content-only task.
2. **Demand caption crowding** — mobile screens may need tighter typography in v3. Captions under each segment card will stack; if a segment has 3 cards, that's 3 caption lines per row. Tolerable for v2, but a typography concern for v3.
3. **Bloc-name mapping hardcoded** — if the bloc names get rewritten later (e.g. "Labor & Unions" → "Organized Labor"), update `BLOC_NAMES` in one place.

## 7. Open follow-ups for v3 and beyond

- Expand `IRONIC_DICTIONARY` to cover more segment-color combos.
- Styling pass (Economist-style typography, layout, animations).
- `game/` test suite — scoring first, then headlines derivation, then actions.
- Reconnect UX and locked-down Firebase rules.
- Headline feed auto-scroll / ticker animation, timestamp display, per-segment filter.

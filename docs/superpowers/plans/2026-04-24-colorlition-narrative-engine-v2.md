# Color-lition v2 — Narrative Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the narrative layer on top of v1: private "We want…" demand reveal, public demand captions on placed cards, a running headline feed on the Big Screen, and personality-driven victory titles.

**Architecture:** Pure-data TS modules (`src/game/data/`) ported once from the existing spec markdown. Pure derivation modules (`src/game/headlines.ts`, `src/game/titles.ts`). One `headlines: Headline[]` field added to `ColorlitionGameState`, appended inside `drawAndPlace`. UI changes are additive — prop passthroughs on shared components plus one new `<HeadlineFeed />` panel.

**Tech Stack:** Same as v1 — Vite + React 19 + TS + MUI + Firebase RTDB + react-gameroom. No new deps.

**Spec:** `docs/superpowers/specs/2026-04-24-v2-narrative-engine-design.md`

**Testing note:** Per spec §6, no test suite in v2. Correctness verified by playing through at Task 15. Pure `game/` modules remain test-ready for v3.

**Commit cadence:** One commit per task.

---

## File structure

New files:
```
src/game/
  data/
    demands.ts          // DEMANDS, BLOC_NAMES
    titles.ts           // SINGLE_TITLES, DUAL_TITLES, TRIPLE_TITLES
    headlines.ts        // SEGMENT_CITIZENS, IRONIC_DICTIONARY
  headlines.ts          // deriveHeadline (pure)
  titles.ts             // deriveVictoryTitle (pure)

src/components/
  big-screen/
    HeadlineFeed.tsx    // new panel
```

Modified files:
```
src/game/
  types.ts              // add Headline type, extend ColorlitionGameState
  actions.ts            // drawAndPlace emits headlines, buildInitialGameState inits []
src/contexts/
  GameContext.tsx       // normalizeGameState guards headlines
src/components/
  shared/
    Card.tsx            // new showDemand prop
    SegmentRow.tsx      // forward showDemand
  big-screen/
    VoterSegments.tsx   // pass showDemand=true
    WinnerScreen.tsx    // render title via deriveVictoryTitle
  mobile/
    SegmentsReadonly.tsx  // pass showDemand=true
    TurnActions.tsx     // show demand in pending-draw
src/pages/
  BigScreenPage.tsx     // add <HeadlineFeed />
```

---

## Task 1: Extend `ColorlitionGameState` with `headlines` field (type + init + normalizer)

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/actions.ts`
- Modify: `src/contexts/GameContext.tsx`

**Why combined:** Adding the type field alone breaks TypeScript because `buildInitialGameState` and `normalizeGameState` return `ColorlitionGameState` values missing the new field. Doing all three edits together keeps the build green at every commit.

- [ ] **Step 1: Add Headline type and extend ColorlitionGameState**

Edit `src/game/types.ts`. After the existing `ScoreBreakdown` type and before `ColorlitionGameState`, insert:

```ts
export type HeadlineKind = 'rising_demand' | 'tense_alliance' | 'segment_full';

export type Headline = {
  id: string;
  kind: HeadlineKind;
  segmentKey: SegmentKey;
  roundNumber: number;
  text: string;
};
```

Then add `headlines: Headline[];` as the last field of `ColorlitionGameState`:

```ts
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
  headlines: Headline[];
};
```

- [ ] **Step 2: Initialize `headlines: []` in `buildInitialGameState`**

Edit `src/game/actions.ts`. In `buildInitialGameState`, find the `return { ... }` block. Append `headlines: [],` as the final field:

```ts
  return {
    phase: 'turn',
    deck,
    exitPollDrawn: false,
    segments,
    turnOrder,
    currentPlayerIndex: 0,
    roundLeadIndex: 0,
    roundNumber: 1,
    playerState,
    winnerIds: null,
    scoreBreakdown: null,
    headlines: [],
  };
```

- [ ] **Step 3: Guard `headlines` in `normalizeGameState`**

Edit `src/contexts/GameContext.tsx`. Find `normalizeGameState`. Append `headlines: raw.headlines ?? [],` as the final field of its return object:

```ts
  return {
    ...raw,
    deck: raw.deck ?? [],
    segments,
    turnOrder: raw.turnOrder ?? [],
    playerState,
    exitPollDrawn: raw.exitPollDrawn ?? false,
    winnerIds: raw.winnerIds ?? null,
    scoreBreakdown: raw.scoreBreakdown ?? null,
    headlines: raw.headlines ?? [],
  };
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/raphaelavellar/Documents/Projects/colorlition
npm run build
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/game/types.ts src/game/actions.ts src/contexts/GameContext.tsx
git commit -m "feat(state): add headlines field to game state with default init + normalizer guard"
```

---

## Task 2: Data file — `demands.ts` (port from markdown)

**Files:**
- Create: `src/game/data/demands.ts`
- Source: `projectInfo/colorlition_interest_bloc_demands.md`

- [ ] **Step 1: Read the source file**

Read `projectInfo/colorlition_interest_bloc_demands.md`. It has 7 color sections; each section has 9 numbered demand strings. Section headers encode the bloc name, e.g. `### 🚩 Labor & Unions (Red)`.

- [ ] **Step 2: Create `src/game/data/demands.ts`**

File structure:

```ts
import type { Color } from '../types';

// Verbatim from projectInfo/colorlition_interest_bloc_demands.md. Each array has
// exactly 9 entries, indexed by Card.value (0..8).
export const DEMANDS: Record<Color, string[]> = {
  red: [
    'We want the expropriation of vacant luxury buildings',
    'We want a 90% windfall tax on all banking profits',
    'We want a permanent ban on all outsourcing and gig-work',
    'We want state control of all strategic national industries',
    'We want worker-led boards for every major company',
    'We want a total jubilee on all consumer debts',
    'We want a maximum wealth cap for all citizens',
    'We want all rental properties seized for public housing',
    'We want a total ban on inherited wealth',
  ],
  purple: [
    'We want compulsory land redistribution for reparations',
    'We want unconditional citizenship for all undocumented residents',
    'We want the abolition of traditional police units',
    'We want mandatory gender and racial quotas in all hiring',
    'We want the removal of all colonial-era monuments',
    'We want autonomous zones for indigenous self-governance',
    'We want the legalization of all personal-use substances',
    'We want the national flag and anthem replaced',
    'We want a monthly reparations check for all',
  ],
  green: [
    'We want the cattle industry shuttered in the Amazon',
    'We want a permanent ban on short-haul domestic flights',
    'We want meat and dairy taxed as luxury harmful goods',
    'We want private land seized for mandatory nature corridors',
    'We want a total ban on chemical fertilizers nationwide',
    "We want life sentences for the crime of 'Ecocide'",
    'We want hydroelectric dams dismantled to restore our rivers',
    'We want a total ban on private jets and yachts',
    'We want denial of climate science criminalized',
  ],
  blue: [
    'We want the privatization of all water and healthcare',
    'We want the minimum wage abolished for market flexibility',
    'We want all state-owned lands sold to the highest bidder',
    'We want welfare replaced with a single digital voucher',
    'We want zero corporate taxes for the next ten years',
    'We want AI-governance to replace the federal bureaucracy',
    'We want the inheritance tax zeroed-out to protect families',
    'We want the central bank privatized',
    'We want all labor unions abolished',
  ],
  orange: [
    'We want legalized private militias for property defense',
    'We want an amnesty for all high-yield pesticide use',
    'We want Indigenous Reserves opened for mineral mining',
    'We want total legal immunity for rural landowners',
    'We want urban water diverted to our crop irrigation',
    'We want zero environmental licensing for new farms',
    'We want the arming of all rural workers for self-defense',
    'We want the right to sell land to foreign buyers',
    'We want environmental laws removed from farms',
  ],
  yellow: [
    'We want total legal immunity for police actions on duty',
    'We want the criminal age lowered to 12 years old',
    'We want full-spectrum facial recognition in all public spaces',
    'We want extrajudicial raids authorized in conflict zones',
    'We want offshore prison colonies for gang leadership',
    'We want a mandatory digital ID for all public travel',
    'We want the military deployed against strikes and protests',
    'We want a public loyalty score for every citizen',
    'We want all private encryption banned',
  ],
  grey: [
    "We want all 'Gender-Ideology' banned from public libraries",
    'We want mandatory religious education in all schools',
    'We want all forms of abortion criminalized without exception',
    'We want secular arts defunded to protect our heritage',
    'We want mandatory prayer before every legislative session',
    'We want a tax on childless couples to fund large families',
    'We want a withdrawal from all international treaties',
    'We want marriage restricted to religious union',
    "We want all 'anti-traditional' media censored",
  ],
};

export const BLOC_NAMES: Record<Color, string> = {
  red: 'Labor & Unions',
  purple: 'Social Equality',
  green: 'Sustainability',
  blue: 'The Market',
  orange: 'Agribusiness',
  yellow: 'Security & Order',
  grey: 'Traditionalists',
};
```

- [ ] **Step 3: Verify**

Read back the source file and confirm every demand string matches byte-for-byte. If the source has changed since this plan was written, prefer the *source* markdown content.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: build succeeds (no consumers yet).

- [ ] **Step 5: Commit**

```bash
git add src/game/data/demands.ts
git commit -m "feat(data): port demand strings and bloc names from spec markdown"
```

---

## Task 3: Data file — `titles.ts` (port from markdown)

**Files:**
- Create: `src/game/data/titles.ts`
- Source: `projectInfo/colorlition_victory_titles_headlines.md`

- [ ] **Step 1: Read source**

Read `projectInfo/colorlition_victory_titles_headlines.md`. It has three sections:
- **1. Single-Bloc Mandates** — 7 entries (one per color).
- **2. Dual-Bloc Alliances** — 21 entries keyed by two colors.
- **3. Triple-Bloc Coalition Leaders** — 35 entries keyed by three colors.

All titles begin with `"...the "` or `"..."` followed by the title phrase. Preserve the lead ellipsis (`…the X` or `…X`) exactly as in the source.

- [ ] **Step 2: Create `src/game/data/titles.ts`**

The keys for dual and triple tables use **alphabetical** color order joined by `+` — i.e. always reorder the color pair/trio into alphabetical order before lookup. Example: `Red + Purple` in the spec becomes key `"purple+red"` (alphabetical).

```ts
import type { Color } from '../types';

// Verbatim titles from projectInfo/colorlition_victory_titles_headlines.md.
// The leading ellipsis is preserved intentionally — rendered as
// `<playerName>, …the <Title>` or `<playerName>, …<Title>`.

export const SINGLE_TITLES: Record<Color, string> = {
  red: '…the Workers’ Champion',
  purple: '…the Social Revolutionary',
  green: '…the Eco-Radical',
  blue: '…the Market Architect',
  orange: '…the Rural Autocrat',
  yellow: '…the Iron Prefect',
  grey: '…the Holy Patriarch/Matriarch',
};

// Keys are the two colors joined alphabetically with '+'. Example:
// red+purple -> "the Socialist Vanguard"
export const DUAL_TITLES: Record<string, string> = {
  'purple+red': '…the Socialist Vanguard',
  'green+red': '…the Green Syndicalist',
  'blue+red': '…the State Capitalist',
  'orange+red': '…the Rural Laborer',
  'red+yellow': '…the Orderly Unionist',
  'grey+red': '…the National Worker',
  'green+purple': '…the Progressive Guardian',
  'blue+purple': '…the Liberal Reformist',
  'orange+purple': '…the Agrarian Liberator',
  'purple+yellow': '…the Inclusive Enforcer',
  'grey+purple': '…the Moral Reformer',
  'blue+green': '…the Tech-Environmentalist',
  'green+orange': '…the Sustainable Planter',
  'green+yellow': '…the Eco-Watchman',
  'green+grey': '…the Sacred Conservationist',
  'blue+orange': '…the Export Tycoon',
  'blue+yellow': '…the Fiscal Hawk',
  'blue+grey': '…the Old Money Gentry',
  'orange+yellow': '…the Frontier Defender',
  'grey+orange': '…the Traditional Harvester',
  'grey+yellow': '…the Divine Sentinel',
};

// Keys are three colors joined alphabetically with '+'.
export const TRIPLE_TITLES: Record<string, string> = {
  'green+purple+red': '…Architect of the Social-Ecological Pact',
  'blue+purple+red': '…Mediator of the Modern Welfare State',
  'orange+purple+red': '…Voice of the People’s Heartland',
  'purple+red+yellow': '…Guardian of the Inclusive Peace',
  'grey+purple+red': '…Unity Leader of the National Front',
  'blue+green+red': '…Strategist of the Sustainable Economy',
  'green+orange+red': '…Champion of the Rural-Green Alliance',
  'green+red+yellow': '…Commander of the Ecological Defense',
  'green+grey+red': '…Steward of the Ancestral Earth',
  'blue+green+purple': '…Visionary of the Tech-Equity Era',
  'green+orange+purple': '…Liberator of the Shared Harvest',
  'green+purple+yellow': '…Protector of the Safe Transition',
  'green+grey+purple': '…Custodian of the Pluralist Legacy',
  'blue+orange+red': '…Director of the Industrial-Agri Complex',
  'blue+red+yellow': '…Sentinel of National Productivity',
  'blue+grey+red': '…Anchor of the Institutional Core',
  'blue+orange+purple': '…Broker of the Global Trade Reform',
  'blue+purple+yellow': '…Reformer of the Constitutional Guard',
  'blue+grey+purple': '…Statesman of the Civil Establishment',
  'blue+green+orange': '…Manager of the Resource Sovereignty',
  'blue+green+yellow': '…Operator of the Strategic Green Market',
  'blue+green+grey': '…Preserver of the Sustainable Heritage',
  'blue+orange+yellow': '…Architect of the Export Fortress',
  'blue+grey+orange': '…Patron of the Aristocratic Landed-Class',
  'blue+grey+yellow': '…Strongman of the Capital-Order Pact',
  'orange+red+yellow': '…Commander of the Rural Worker-Defense',
  'grey+orange+red': '…Icon of the Workers’ Heartland',
  'grey+red+yellow': '…Sovereign of the Patriotic Laborers',
  'orange+purple+yellow': '…Shield of the Frontier Communities',
  'grey+orange+purple': '…Representative of the Diverse Interior',
  'grey+purple+yellow': '…Voice of the Moral Majority',
  'green+orange+yellow': '…Scout of the Environmental Frontier',
  'green+grey+orange': '…Shepherd of the Sacred Soil',
  'green+grey+yellow': '…Enforcer of the Ecological Tradition',
  'grey+orange+yellow': '…Grandmaster of the Conservative Heartland',
};
```

- [ ] **Step 3: Self-check key count**

Open the file in your editor. Confirm:
- `SINGLE_TITLES` has exactly 7 keys
- `DUAL_TITLES` has exactly 21 keys
- `TRIPLE_TITLES` has exactly 35 keys

If counts mismatch, diff against the source markdown and fix.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add src/game/data/titles.ts
git commit -m "feat(data): port victory titles from spec markdown"
```

---

## Task 4: Data file — `headlines.ts` (port from markdown)

**Files:**
- Create: `src/game/data/headlines.ts`
- Source: `projectInfo/colorlition_segments_and_headlines.md`

- [ ] **Step 1: Read source**

Read `projectInfo/colorlition_segments_and_headlines.md`. Section 1 is the segments table with "Segment Citizens" column; section 3 is the ironic dictionary (6 entries).

- [ ] **Step 2: Create `src/game/data/headlines.ts`**

```ts
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
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/game/data/headlines.ts
git commit -m "feat(data): port segment citizens and ironic dictionary from spec"
```

---

## Task 5: Pure module — `src/game/headlines.ts` (deriveHeadline)

**Files:**
- Create: `src/game/headlines.ts`

- [ ] **Step 1: Create file**

```ts
import { BLOC_NAMES } from './data/demands';
import { IRONIC_DICTIONARY, SEGMENT_CITIZENS, type IronicEntry } from './data/headlines';
import type { Card, Color, Headline, Segment } from './types';

function isBloc(card: Card): card is Extract<Card, { kind: 'bloc' }> {
  return card.kind === 'bloc';
}

function sortedColors(cards: Card[]): Color[] {
  const colors: Color[] = [];
  for (const c of cards) {
    if (isBloc(c)) colors.push(c.color);
  }
  return colors.slice().sort();
}

function findDictionaryEntry(
  segmentKey: Segment['key'],
  colors: Color[],
): IronicEntry | null {
  const sorted = colors.slice().sort();
  return (
    IRONIC_DICTIONARY.find(
      (e) =>
        e.segmentKey === segmentKey &&
        e.colors.length === sorted.length &&
        e.colors.every((c, i) => c === sorted[i]),
    ) ?? null
  );
}

function renderSegmentFull(segment: Segment): string {
  const cards = segment.cards;
  const allBlocs = cards.every(isBloc);

  if (!allBlocs) {
    return `A mixed coalition of interests claims the ${segment.label}.`;
  }

  // All three are blocs. Group by color.
  const blocs = cards.filter(isBloc);
  const counts: Partial<Record<Color, number>> = {};
  for (const b of blocs) {
    counts[b.color] = (counts[b.color] ?? 0) + 1;
  }
  const entries = Object.entries(counts) as [Color, number][];

  // Uniform: one color with count 3.
  if (entries.length === 1) {
    const [color] = entries[0];
    return `The ${segment.label} speaks with one voice as ${BLOC_NAMES[color]} dominates.`;
  }

  // Duopoly: two colors with counts 2 + 1.
  if (entries.length === 2) {
    const sorted = entries.slice().sort((a, b) => b[1] - a[1]);
    const [majority] = sorted[0];
    const [minority] = sorted[1];
    return `${BLOC_NAMES[majority]} dominates the ${segment.label}, with ${BLOC_NAMES[minority]} clinging on.`;
  }

  // Three different colors. Try dictionary first.
  const colors = sortedColors(cards);
  const dict = findDictionaryEntry(segment.key, colors);
  if (dict) return dict.headline;

  // Coalition fallback.
  const [a, b, c] = colors;
  return `An unlikely coalition forms in the ${segment.label}: ${BLOC_NAMES[a]}, ${BLOC_NAMES[b]}, and ${BLOC_NAMES[c]}.`;
}

function renderRisingDemand(segment: Segment, card: Card): string | null {
  if (!isBloc(card)) return null;
  return `${segment.label} Headline: Demands for ${BLOC_NAMES[card.color]} begin to rise among ${SEGMENT_CITIZENS[segment.key]}.`;
}

function renderTenseAlliance(segment: Segment): string | null {
  if (segment.cards.length !== 2) return null;
  const [a, b] = segment.cards;
  if (!isBloc(a) || !isBloc(b)) return null;
  if (a.color === b.color) return null;
  // Order by alphabetical color for a stable sentence.
  const [first, second] = [a, b].sort((x, y) => (x.color < y.color ? -1 : 1));
  return `${segment.label} Headline: A tense alliance forms as ${BLOC_NAMES[first.color]} and ${BLOC_NAMES[second.color]} interests collide.`;
}

export function deriveHeadline(
  segmentBefore: Segment,
  segmentAfter: Segment,
  placedCard: Card,
  roundNumber: number,
  seq: number,
): Headline | null {
  const n = segmentAfter.cards.length;

  // Rule 1: segment full.
  if (n === 3) {
    const text = renderSegmentFull(segmentAfter);
    return {
      id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
      kind: 'segment_full',
      segmentKey: segmentAfter.key,
      roundNumber,
      text,
    };
  }

  // Rule 2: tense alliance on the second card.
  if (n === 2) {
    const text = renderTenseAlliance(segmentAfter);
    if (!text) return null;
    return {
      id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
      kind: 'tense_alliance',
      segmentKey: segmentAfter.key,
      roundNumber,
      text,
    };
  }

  // Rule 3: rising demand on the first card.
  if (n === 1 && segmentBefore.cards.length === 0) {
    const text = renderRisingDemand(segmentAfter, placedCard);
    if (!text) return null;
    return {
      id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
      kind: 'rising_demand',
      segmentKey: segmentAfter.key,
      roundNumber,
      text,
    };
  }

  return null;
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/game/headlines.ts
git commit -m "feat(game): add pure headline derivation logic"
```

---

## Task 6: Pure module — `src/game/titles.ts` (deriveVictoryTitle)

**Files:**
- Create: `src/game/titles.ts`

- [ ] **Step 1: Create file**

```ts
import { SINGLE_TITLES, DUAL_TITLES, TRIPLE_TITLES } from './data/titles';
import type { Color } from './types';

export function deriveVictoryTitle(positiveColors: Color[]): string {
  if (positiveColors.length === 0) return '…the Reluctant Candidate';

  if (positiveColors.length === 1) {
    return SINGLE_TITLES[positiveColors[0]] ?? '…the Unclassified Leader';
  }

  const key = positiveColors.slice().sort().join('+');

  if (positiveColors.length === 2) {
    return DUAL_TITLES[key] ?? '…the Unclassified Leader';
  }

  if (positiveColors.length === 3) {
    return TRIPLE_TITLES[key] ?? '…the Unclassified Leader';
  }

  return '…the Unclassified Leader';
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/game/titles.ts
git commit -m "feat(game): add pure victory title lookup"
```

---

## Task 7: Wire `drawAndPlace` to emit headlines

**Files:**
- Modify: `src/game/actions.ts`

Task 1 already initialized `headlines: []` in `buildInitialGameState` and guarded reads in `normalizeGameState`. This task wires the derivation call into the draw-and-place action.

- [ ] **Step 1: Import `deriveHeadline`**

At the top of `src/game/actions.ts`, alongside the existing imports, add:

```ts
import { deriveHeadline } from './headlines';
```

- [ ] **Step 2: Capture `segmentBefore`, push card, derive headline**

Find the body of `drawAndPlace`. Currently it contains:

```ts
  // Place into segment.
  const seg = next.segments.find((s) => s.key === segmentKey);
  if (!seg || !canPlaceInSegment(seg)) {
    throw new Error(`drawAndPlace: invalid segment target ${segmentKey}`);
  }
  seg.cards.push(card);

  // Implicit Exit Poll: if deck is empty after a non-exit-poll draw, mark final round.
  if (next.deck.length === 0 && !next.exitPollDrawn) {
    next.exitPollDrawn = true;
    next.phase = 'finalRound';
  }

  return advanceTurn(next);
```

Change to:

```ts
  // Place into segment.
  const seg = next.segments.find((s) => s.key === segmentKey);
  if (!seg || !canPlaceInSegment(seg)) {
    throw new Error(`drawAndPlace: invalid segment target ${segmentKey}`);
  }
  const segmentBefore = { ...seg, cards: seg.cards.slice(), claimedBy: seg.claimedBy };
  seg.cards.push(card);
  const seq = next.headlines.length;
  const headline = deriveHeadline(segmentBefore, seg, card, next.roundNumber, seq);
  if (headline) next.headlines.push(headline);

  // Implicit Exit Poll: if deck is empty after a non-exit-poll draw, mark final round.
  if (next.deck.length === 0 && !next.exitPollDrawn) {
    next.exitPollDrawn = true;
    next.phase = 'finalRound';
  }

  return advanceTurn(next);
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/game/actions.ts
git commit -m "feat(game): emit headlines from drawAndPlace"
```

---

## Task 8: `Card.tsx` — add `showDemand` prop

**Files:**
- Modify: `src/components/shared/Card.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { chipSxFor } from '../../theme/colors';
import { DEMANDS } from '../../game/data/demands';
import type { Card as GameCard } from '../../game/types';

type Props = { card: GameCard; showDemand?: boolean };

export function Card({ card, showDemand = false }: Props) {
  let chip: React.ReactNode;
  if (card.kind === 'bloc') {
    chip = <Chip label={`${card.color} #${card.value}`} sx={chipSxFor(card.color)} />;
  } else if (card.kind === 'grant') {
    chip = <Chip label="Public Grant" sx={chipSxFor('grant')} />;
  } else if (card.kind === 'pivot') {
    chip = <Chip label="Pivot" sx={chipSxFor('pivot')} />;
  } else {
    chip = <Chip label="Exit Poll" sx={chipSxFor('exitPoll')} />;
  }

  if (!showDemand || card.kind !== 'bloc') return <>{chip}</>;

  const demand = DEMANDS[card.color]?.[card.value];
  if (!demand) return <>{chip}</>;

  return (
    <Stack spacing={0.25} sx={{ maxWidth: 160 }}>
      {chip}
      <Typography variant="caption" sx={{ fontStyle: 'italic', lineHeight: 1.2 }}>
        "{demand}"
      </Typography>
    </Stack>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Card.tsx
git commit -m "feat(card): support optional demand caption under bloc chips"
```

---

## Task 9: `SegmentRow.tsx` — forward `showDemand`

**Files:**
- Modify: `src/components/shared/SegmentRow.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from './Card';
import type { Segment } from '../../game/types';

type Props = { segment: Segment; showDemand?: boolean };

export function SegmentRow({ segment, showDemand = false }: Props) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ p: 1, border: '1px solid #ccc', alignItems: 'flex-start' }}
    >
      <Typography sx={{ minWidth: 200, pt: 0.5 }}>{segment.label}</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {segment.cards.map((c) => (
          <Card key={c.id} card={c} showDemand={showDemand} />
        ))}
      </Stack>
      {segment.claimedBy !== null && (
        <Typography sx={{ ml: 2, pt: 0.5 }}>— claimed by #{segment.claimedBy}</Typography>
      )}
    </Stack>
  );
}
```

Note: `alignItems` changed from `center` to `flex-start` so tall cards (chip + caption) don't push the row label off-center.

- [ ] **Step 2: Build + commit**

```bash
npm run build && git add src/components/shared/SegmentRow.tsx && git commit -m "feat(segment-row): forward showDemand prop to each card"
```

Expected: passes.

---

## Task 10: Enable `showDemand` on Big Screen + Mobile segments

**Files:**
- Modify: `src/components/big-screen/VoterSegments.tsx`
- Modify: `src/components/mobile/SegmentsReadonly.tsx`

- [ ] **Step 1: `VoterSegments.tsx`**

Replace the file:

```tsx
import Stack from '@mui/material/Stack';
import { SegmentRow } from '../shared/SegmentRow';
import type { Segment } from '../../game/types';

export function VoterSegments({ segments }: { segments: Segment[] }) {
  return (
    <Stack spacing={1}>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Stack>
  );
}
```

- [ ] **Step 2: `SegmentsReadonly.tsx`**

Replace the file:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SegmentRow } from '../shared/SegmentRow';
import type { Segment } from '../../game/types';

export function SegmentsReadonly({ segments }: { segments: Segment[] }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Voter Segments</Typography>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Stack>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build && git add src/components/big-screen/VoterSegments.tsx src/components/mobile/SegmentsReadonly.tsx && git commit -m "feat(segments): show demand captions under placed cards on both views"
```

---

## Task 11: `TurnActions.tsx` — show "We want:" in pending-draw preview

**Files:**
- Modify: `src/components/mobile/TurnActions.tsx`

- [ ] **Step 1: Add DEMANDS import**

Near the top of `src/components/mobile/TurnActions.tsx`, add:

```tsx
import { DEMANDS } from '../../game/data/demands';
```

- [ ] **Step 2: Show demand below the drawn-card chip**

Find the `if (pending)` branch. Currently it renders:

```tsx
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>You drew:</Typography>
          <Card card={pending.card} />
        </Stack>
        <Typography>Place in which segment?</Typography>
```

Change to:

```tsx
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>You drew:</Typography>
          <Card card={pending.card} />
        </Stack>
        {pending.card.kind === 'bloc' && (
          <Typography sx={{ fontStyle: 'italic' }}>
            We want: "{DEMANDS[pending.card.color]?.[pending.card.value]}"
          </Typography>
        )}
        <Typography>Place in which segment?</Typography>
```

- [ ] **Step 3: Build + commit**

```bash
npm run build && git add src/components/mobile/TurnActions.tsx && git commit -m "feat(player): show We-want demand caption in pending-draw preview"
```

---

## Task 12: `HeadlineFeed.tsx` — new Big Screen panel

**Files:**
- Create: `src/components/big-screen/HeadlineFeed.tsx`

- [ ] **Step 1: Create file**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Headline } from '../../game/types';

export function HeadlineFeed({ headlines }: { headlines: Headline[] }) {
  const newestFirst = headlines.slice().reverse();
  return (
    <Stack spacing={1} sx={{ p: 1, border: '1px solid #ccc' }}>
      <Typography variant="h6">Headlines</Typography>
      {newestFirst.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No headlines yet.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {newestFirst.map((h) => (
            <Typography key={h.id} variant="body2">
              {h.text}
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build && git add src/components/big-screen/HeadlineFeed.tsx && git commit -m "feat(big-screen): add headline feed panel"
```

---

## Task 13: Wire `HeadlineFeed` into `BigScreenPage`

**Files:**
- Modify: `src/pages/BigScreenPage.tsx`

- [ ] **Step 1: Add import**

Near the existing component imports at the top of `src/pages/BigScreenPage.tsx`, add:

```tsx
import { HeadlineFeed } from '../components/big-screen/HeadlineFeed';
```

- [ ] **Step 2: Place the feed in the layout**

In the return block, find the line:

```tsx
      <VoterSegments segments={gameState.segments} />
      <PublicCoalitions rows={rows} />
```

Insert `<HeadlineFeed headlines={gameState.headlines} />` between them:

```tsx
      <VoterSegments segments={gameState.segments} />
      <HeadlineFeed headlines={gameState.headlines} />
      <PublicCoalitions rows={rows} />
```

- [ ] **Step 3: Build + commit**

```bash
npm run build && git add src/pages/BigScreenPage.tsx && git commit -m "feat(big-screen): place headline feed between segments and coalitions"
```

---

## Task 14: `WinnerScreen.tsx` — render victory titles

**Files:**
- Modify: `src/components/big-screen/WinnerScreen.tsx`

- [ ] **Step 1: Add import**

Near the top, add:

```tsx
import { deriveVictoryTitle } from '../../game/titles';
```

- [ ] **Step 2: Update the winner heading**

Find the winner heading. Currently:

```tsx
      <Typography variant="h4">
        {winnerIds.length === 1 ? `Winner: ${winnerNames}` : `Co-winners: ${winnerNames}`}
      </Typography>
```

Replace with:

```tsx
      <Typography variant="h4">
        {(() => {
          const lines = winnerIds.map((id) => {
            const breakdown = breakdowns.find((b) => b.playerId === id);
            const title = breakdown
              ? deriveVictoryTitle(breakdown.positiveColors)
              : '…the Unclassified Leader';
            return `${nameFor(id)}, ${title}`;
          });
          return winnerIds.length === 1 ? lines[0] : `Co-winners: ${lines.join(' • ')}`;
        })()}
      </Typography>
```

Note the existing local variable `winnerNames` that computes just the name list is no longer used by the heading — leave it if anything else uses it in the file, otherwise it can be removed (it's dead code if only the heading uses it, which is the current case).

- [ ] **Step 3: Remove dead variable if unused**

Find and delete the now-unused line:
```tsx
  const winnerNames = winnerIds.map(nameFor).join(', ');
```

Only delete it if TypeScript flags it as unused; leave it if any other code path uses it.

- [ ] **Step 4: Build + commit**

```bash
npm run build && git add src/components/big-screen/WinnerScreen.tsx && git commit -m "feat(winner): render personality-driven victory title"
```

---

## Task 15: Manual end-to-end verification

**Files:** None.

- [ ] **Step 1: Run dev server**

```bash
cd /Users/raphaelavellar/Documents/Projects/colorlition
npm run dev
```

- [ ] **Step 2: Three-player smoke**

Open three tabs (Big Screen + two mobile). Create a game, have both mobiles claim slots, start the game.

Verify:
- Each player's Coalition starts with one colored-chip card + its demand caption.
- When a mobile clicks Draw, the "You drew: [chip]" preview shows `We want: "<demand>"` for bloc cards.
- On place, the Big Screen segment row shows the chip + demand caption inline.
- The **Headlines** panel appears below the VoterSegments block.
- The first placement in an empty segment adds a `"{Segment} Headline: Demands for {Bloc} begin to rise among {Citizens}."` line to the feed.
- A second, different-color bloc added to that segment prepends a Tense Alliance line.
- A third card that fills the segment prepends a segment-full line (Uniform / Duopoly / Coalition / Mixed — or the ironic dictionary headline for matching combos).

- [ ] **Step 3: Exercise dictionary entries**

To confirm the ironic dictionary wiring, try to fill a segment with one of the 6 spec combinations, for instance:
- Industrial Belt with `blue + orange + yellow` → expected: "Steel mills privatized as military drones guard the new high-speed harvest rail."
- Urban Professionals with `blue + green + purple` → expected: "The Technocratic Enlightenment: Luxury high-rises reach net-zero as rent quotas take effect."

(Card order within the segment is irrelevant; lookup uses a sorted color set.)

- [ ] **Step 4: Verify non-bloc behavior**

Intentionally place a Grant or Pivot first in an empty segment:
- No Rising Demand should fire (feed stays empty).
- Subsequent bloc placement to 2 cards should NOT fire Tense Alliance.
- When the segment fills, the Mixed fallback `"A mixed coalition of interests claims the {Segment}."` should fire.

- [ ] **Step 5: Verify victory title**

Play the game through. When the Exit Poll triggers the final round and the winner screen appears:
- Single winner: heading reads `<Name>, …<title phrase>` (e.g. `Alice, …the Green Syndicalist`).
- Co-winners: heading reads `Co-winners: Alice, …the X • Bob, …the Y`.
- Spot-check the title against the spec's table for the winner's `positiveColors` combination.

- [ ] **Step 6: Refresh-across-devices sanity**

With a game in progress and several headlines fired, refresh both the Big Screen tab and a mobile tab. Confirm:
- Feed re-renders with the same entries in the same order.
- Demand captions re-render under each placed card.

- [ ] **Step 7: Production build check**

```bash
npm run build
```

Expected: exits 0 with all v2 modules bundled.

- [ ] **Step 8: Fix any bugs that surfaced**

If any verification step fails, fix the responsible module and commit as `fix(scope): <summary>`. No plan changes needed — the spec + code are the truth.

---

## End of v2

At completion: narrative engine is live. Demands are surfaced publicly and privately, headlines narrate the round, winners get titles. The game feels thematic.

Next candidates (per spec §7):
- Expand `IRONIC_DICTIONARY` coverage.
- Economist-style styling pass (v3).
- `game/` test suite, scoring first.
- Reconnect UX and tightened Firebase rules.

# Color-lition Flow v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable end-to-end Color-lition prototype: lobby → turn loop (draw/place or claim) → Exit Poll final round → scoring → winner screen. No narrative polish, no styling.

**Architecture:** Vite + React 19 + TS SPA. Firebase Realtime Database for cross-device state. react-gameroom 0.10.x for lobby primitives (room creation, player slots, QR, start transitions, fullscreen). Single `GameContext` wraps room + game state; pure game logic in `src/game/` (no React, no Firebase).

**Tech Stack:** Vite 8, React 19, TypeScript 6, MUI 9 (unstyled), Emotion, Firebase 12, react-gameroom 0.10, react-router-dom 7. Deploys to Vercel.

**Spec:** `docs/superpowers/specs/2026-04-24-colorlition-flow-v1-design.md`

**Reference projects** (same author, same stack, readable verbatim):
- `/Users/raphaelavellar/Documents/Projects/krimi` — MUI + Firebase + react-gameroom + single GameContext. Mirror its shape.
- `/Users/raphaelavellar/Documents/Projects/react-unmatched` — older pattern (plain CSS, separate hooks). Reference only for Firebase subscription idioms.

**Testing note:** Per spec §7, no test suite in v1. Verification is manual (Task 20). Pure `game/` functions are designed to be test-ready for v2.

**Commit cadence:** Each task ends with a commit. Commit messages use the conventional format: `feat(scope): summary`, `chore(scope): summary`.

---

## File structure (what ends up on disk)

```
colorlition/
  .env.local                     // Firebase creds (not committed)
  .env.example                   // Shape for .env.local
  .gitignore
  package.json
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts
  vercel.json
  index.html
  public/
  src/
    main.tsx
    App.tsx
    firebase.ts
    contexts/
      GameContext.tsx
    pages/
      HomePage.tsx
      LobbyPage.tsx
      BigScreenPage.tsx
      JoinPage.tsx
      PlayerPage.tsx
    components/
      big-screen/
        VoterSegments.tsx
        DrawPile.tsx
        PublicCoalitions.tsx
        Leaderboard.tsx
        WinnerScreen.tsx
      mobile/
        CoalitionBase.tsx
        TurnActions.tsx
        WaitingView.tsx
        SegmentsReadonly.tsx
      shared/
        Card.tsx
        SegmentRow.tsx
    game/
      types.ts
      constants.ts
      deck.ts
      scoring.ts
      actions.ts
```

---

## Task 0: Initialize git repo and commit specs

**Files:**
- Create: `.gitignore`
- Commit: all existing files (CLAUDE.md, projectInfo/, docs/)

- [ ] **Step 1: Initialize git repo**

Run from project root:
```bash
cd /Users/raphaelavellar/Documents/Projects/colorlition
git init
```

- [ ] **Step 2: Create `.gitignore`**

Create `/Users/raphaelavellar/Documents/Projects/colorlition/.gitignore`:

```gitignore
node_modules
dist
dist-ssr
*.local
.env
.env.local
.env.*.local
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
node_modules/.tmp
```

- [ ] **Step 3: Initial commit**

```bash
git add .gitignore CLAUDE.md projectInfo/ docs/
git commit -m "chore: initialize repo with specs and design doc"
```

Expected: commit lands cleanly. No staged changes remaining.

---

## Task 1: Scaffold Vite + React + TS + MUI + Firebase

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `vercel.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.env.example`, `src/main.tsx`, `src/App.tsx` (placeholder), `public/`

- [ ] **Step 1: Create `package.json`**

Copy version set from krimi. At `/Users/raphaelavellar/Documents/Projects/colorlition/package.json`:

```json
{
  "name": "colorlition",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^9.0.0",
    "@mui/material": "^9.0.0",
    "firebase": "^12.12.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-gameroom": "^0.10.0",
    "react-router-dom": "^7.14.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.0",
    "vite": "^8.0.4"
  }
}
```

- [ ] **Step 2: Create tsconfigs (copy from krimi verbatim)**

At `tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

At `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

At `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase';
          if (id.includes('/@mui/') || id.includes('/@emotion/')) return 'mui';
          if (id.includes('/react-router') || id.includes('/react-dom/') || id.match(/\/react\/[^/]+$/)) return 'react';
        },
      },
    },
  },
});
```

- [ ] **Step 4: Create `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Color-lition</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `.env.example`**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

The engineer sets up `.env.local` with real Firebase credentials locally — do not commit it.

- [ ] **Step 7: Create `public/` directory**

```bash
mkdir -p /Users/raphaelavellar/Documents/Projects/colorlition/public
touch /Users/raphaelavellar/Documents/Projects/colorlition/public/.gitkeep
```

- [ ] **Step 8: Create placeholder `src/main.tsx` and `src/App.tsx`**

At `src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

At `src/App.tsx`:
```tsx
export default function App() {
  return <div>Color-lition — scaffold</div>;
}
```

- [ ] **Step 9: Install deps and verify dev server runs**

```bash
npm install
npm run dev
```

Expected: Vite dev server starts without errors. Visit the shown URL and see "Color-lition — scaffold". Kill the server with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig*.json vite.config.ts vercel.json index.html .env.example public/ src/
git commit -m "chore: scaffold vite + react + ts + mui + firebase project"
```

---

## Task 2: Firebase init module

**Files:**
- Create: `src/firebase.ts`

- [ ] **Step 1: Create Firebase init module**

At `src/firebase.ts` (same shape as krimi):

```ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export default app;
```

- [ ] **Step 2: Verify typecheck passes**

```bash
npm run build
```

Expected: build succeeds (empty app still, but typecheck passes).

- [ ] **Step 3: Commit**

```bash
git add src/firebase.ts
git commit -m "feat(firebase): add database init module"
```

---

## Task 3: Router + placeholder pages

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/HomePage.tsx`, `src/pages/LobbyPage.tsx`, `src/pages/BigScreenPage.tsx`, `src/pages/JoinPage.tsx`, `src/pages/PlayerPage.tsx`

- [ ] **Step 1: Create five placeholder pages**

At `src/pages/HomePage.tsx`:
```tsx
export default function HomePage() {
  return <div>HomePage</div>;
}
```

At `src/pages/LobbyPage.tsx`:
```tsx
import { useParams } from 'react-router-dom';

export default function LobbyPage() {
  const { id } = useParams();
  return <div>LobbyPage — room {id}</div>;
}
```

At `src/pages/BigScreenPage.tsx`:
```tsx
import { useParams } from 'react-router-dom';

export default function BigScreenPage() {
  const { id } = useParams();
  return <div>BigScreenPage — room {id}</div>;
}
```

At `src/pages/JoinPage.tsx`:
```tsx
import { useParams } from 'react-router-dom';

export default function JoinPage() {
  const { id } = useParams();
  return <div>JoinPage {id ? `— room ${id}` : ''}</div>;
}
```

At `src/pages/PlayerPage.tsx`:
```tsx
import { useParams } from 'react-router-dom';

export default function PlayerPage() {
  const { id, playerId } = useParams();
  return <div>PlayerPage — room {id}, player {playerId}</div>;
}
```

- [ ] **Step 2: Wire router in `App.tsx`**

Replace `src/App.tsx`:

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, type RouteObject } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const HomePage = lazy(() => import('./pages/HomePage'));
const LobbyPage = lazy(() => import('./pages/LobbyPage'));
const BigScreenPage = lazy(() => import('./pages/BigScreenPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));

const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/join', element: <JoinPage /> },
  { path: '/join/:id', element: <JoinPage /> },
  { path: '/room/:id', element: <LobbyPage /> },
  { path: '/room/:id/play', element: <BigScreenPage /> },
  { path: '/room/:id/player/:playerId', element: <PlayerPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
];

const router = createBrowserRouter(routes);
const theme = createTheme({});

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<RouteFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  );
}
```

**Note:** route layout differs slightly from the spec to keep lobby and big-screen on separate URLs while both living under `/room/:id`. The lobby lives at `/room/:id`; once started, `GameContext` will navigate the Big Screen device to `/room/:id/play`. Mobile players land at `/room/:id/player/:playerId` directly. If the spec author prefers `/room/:id` to swap content based on `roomState.status` instead of navigating, the LobbyPage and BigScreenPage can be merged later — not required for v1.

- [ ] **Step 3: Verify routes render**

```bash
npm run dev
```

Visit each route manually:
- `/` → "HomePage"
- `/room/abc` → "LobbyPage — room abc"
- `/room/abc/play` → "BigScreenPage — room abc"
- `/join` → "JoinPage"
- `/join/abc` → "JoinPage — room abc"
- `/room/abc/player/1` → "PlayerPage — room abc, player 1"

Expected: all render their placeholder text without errors. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/
git commit -m "feat(routing): add router and placeholder pages"
```

---

## Task 4: Game constants and types

**Files:**
- Create: `src/game/constants.ts`, `src/game/types.ts`

- [ ] **Step 1: Create `src/game/constants.ts`**

```ts
export const COLORS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

export const SEGMENT_NAMES = [
  { key: 'industrial', label: 'Industrial Belt' },
  { key: 'urban', label: 'Urban Professionals' },
  { key: 'agricultural', label: 'Agricultural Frontier' },
  { key: 'financial', label: 'Financial District' },
  { key: 'periphery', label: 'Periphery' },
] as const;

export const CARDS_PER_COLOR = 9;
export const CARDS_PER_SEGMENT = 3;
export const GRANTS_IN_DECK = 10;
export const PIVOTS_IN_DECK = 3;
export const GRANT_VALUE = 2;
export const EXIT_POLL_BOTTOM_WINDOW = 15;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const TOP_POSITIVE_COLORS = 3;
```

- [ ] **Step 2: Create `src/game/types.ts`**

```ts
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
```

- [ ] **Step 3: Verify typecheck**

```bash
npm run build
```

Expected: typecheck passes.

- [ ] **Step 4: Commit**

```bash
git add src/game/constants.ts src/game/types.ts
git commit -m "feat(game): add constants and state types"
```

---

## Task 5: Deck builder, shuffle, Exit Poll placement

**Files:**
- Create: `src/game/deck.ts`

- [ ] **Step 1: Create `src/game/deck.ts`**

```ts
import {
  COLORS,
  CARDS_PER_COLOR,
  GRANTS_IN_DECK,
  PIVOTS_IN_DECK,
  EXIT_POLL_BOTTOM_WINDOW,
} from './constants';
import type { Card, Color } from './types';

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const color of COLORS) {
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
  return deck; // 63 blocs + 10 grants + 3 pivots = 76 cards. Exit Poll added by placeExitPoll.
}

export function shuffle<T>(array: T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function placeExitPoll(shuffledDeck: Card[]): Card[] {
  const result = shuffledDeck.slice();
  const window = Math.min(EXIT_POLL_BOTTOM_WINDOW, result.length);
  // Pick an insertion index in the bottom `window` positions of the final deck.
  // Since we insert one card, the final deck length is result.length + 1.
  // We want the Exit Poll to sit at some index in [finalLen - window, finalLen - 1].
  const finalLen = result.length + 1;
  const minIdx = Math.max(0, finalLen - window);
  const maxIdx = finalLen - 1;
  const insertAt = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
  const exitPoll: Card = { id: 'exit-poll', kind: 'exitPoll' };
  result.splice(insertAt, 0, exitPoll);
  return result;
}

export function createShuffledDeck(): Card[] {
  return placeExitPoll(shuffle(buildDeck()));
}
```

- [ ] **Step 2: Quick sanity check via browser console**

Edit `src/App.tsx` temporarily (just for this step — will be reverted):

Add at the top:
```tsx
import { createShuffledDeck, buildDeck } from './game/deck';

if (import.meta.env.DEV) {
  const raw = buildDeck();
  const shuffled = createShuffledDeck();
  console.log('[deck] raw length:', raw.length, '(expected 76)');
  console.log('[deck] shuffled length:', shuffled.length, '(expected 77)');
  const exitIdx = shuffled.findIndex((c) => c.kind === 'exitPoll');
  console.log('[deck] exit poll index:', exitIdx, '(expected in [62, 76])');
  const blocs = shuffled.filter((c) => c.kind === 'bloc');
  console.log('[deck] bloc count:', blocs.length, '(expected 63)');
  const grants = shuffled.filter((c) => c.kind === 'grant');
  console.log('[deck] grant count:', grants.length, '(expected 10)');
  const pivots = shuffled.filter((c) => c.kind === 'pivot');
  console.log('[deck] pivot count:', pivots.length, '(expected 3)');
}
```

Run `npm run dev`, open the browser devtools console on `/`, verify all five numbers match the expected values. Repeat 3 times (refresh) to spot-check that Exit Poll index varies within the bottom window.

- [ ] **Step 3: Revert the sanity check**

Remove the added import and `if (import.meta.env.DEV)` block from `src/App.tsx` so it's back to the state after Task 3. Verify with `git diff src/App.tsx` — should show no changes.

- [ ] **Step 4: Commit**

```bash
git add src/game/deck.ts
git commit -m "feat(game): add deck builder, shuffle, and exit poll placement"
```

---

## Task 6: Scoring (triangular + brute-force pivot + tiebreakers)

**Files:**
- Create: `src/game/scoring.ts`

- [ ] **Step 1: Create `src/game/scoring.ts`**

```ts
import { COLORS, TOP_POSITIVE_COLORS, GRANT_VALUE } from './constants';
import type { Card, Color, ScoreBreakdown } from './types';

export function triangular(n: number): number {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
}

type ScoredAssignment = {
  assignment: Color[];
  counts: Record<Color, number>;
  positiveColors: Color[];
  negativeColors: Color[];
  positive: number;
  negative: number;
};

function emptyCounts(): Record<Color, number> {
  const out = {} as Record<Color, number>;
  for (const c of COLORS) out[c] = 0;
  return out;
}

function* enumerateAssignments(pivots: number): Generator<Color[]> {
  if (pivots === 0) {
    yield [];
    return;
  }
  // Combinations with repetition (multisets) of size `pivots` over COLORS.
  // Using indices to avoid duplicates like [red, blue] / [blue, red].
  const n = COLORS.length;
  const idx = Array(pivots).fill(0);
  while (true) {
    yield idx.map((i) => COLORS[i] as Color);
    let i = pivots - 1;
    while (i >= 0 && idx[i] === n - 1) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < pivots; j++) idx[j] = idx[i];
  }
}

function scoreAssignment(baseCounts: Record<Color, number>, assignment: Color[]): ScoredAssignment {
  const counts = { ...baseCounts };
  for (const c of assignment) counts[c] += 1;

  const nonZero = COLORS.filter((c) => counts[c] > 0) as Color[];
  // Sort by count desc, tiebreak alphabetical for determinism.
  nonZero.sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

  const positiveColors = nonZero.slice(0, TOP_POSITIVE_COLORS);
  const negativeColors = nonZero.slice(TOP_POSITIVE_COLORS);

  const positive = positiveColors.reduce((sum, c) => sum + triangular(counts[c]), 0);
  const negative = negativeColors.reduce((sum, c) => sum + triangular(counts[c]), 0);

  return { assignment, counts, positiveColors, negativeColors, positive, negative };
}

export function scorePlayer(playerId: string, base: Card[]): ScoreBreakdown {
  const baseCounts = emptyCounts();
  let pivots = 0;
  let grantsRaw = 0;
  for (const card of base) {
    if (card.kind === 'bloc') baseCounts[card.color] += 1;
    else if (card.kind === 'pivot') pivots += 1;
    else if (card.kind === 'grant') grantsRaw += 1;
  }

  let best: ScoredAssignment | null = null;
  for (const assignment of enumerateAssignments(pivots)) {
    const scored = scoreAssignment(baseCounts, assignment);
    if (!best) {
      best = scored;
      continue;
    }
    const netNew = scored.positive - scored.negative;
    const netBest = best.positive - best.negative;
    if (netNew > netBest || (netNew === netBest && scored.positive > best.positive)) {
      best = scored;
    }
  }

  // `best` can only be null when COLORS is empty, which is unreachable in v1.
  if (!best) throw new Error('scoring: no assignment evaluated');

  const grants = grantsRaw * GRANT_VALUE;
  return {
    playerId,
    colorCounts: best.counts,
    pivotAssignments: best.assignment,
    positiveColors: best.positiveColors,
    negativeColors: best.negativeColors,
    positive: best.positive,
    negative: best.negative,
    grants,
    total: best.positive - best.negative + grants,
  };
}

export type WinnerResult = {
  winnerIds: string[];
  breakdowns: ScoreBreakdown[];
};

function countRaw(base: Card[], kind: Card['kind']): number {
  return base.filter((c) => c.kind === kind).length;
}

export function computeWinners(
  turnOrder: string[],
  playerBases: Record<string, Card[]>,
): WinnerResult {
  const breakdowns = turnOrder.map((id) => scorePlayer(id, playerBases[id] ?? []));
  const maxTotal = Math.max(...breakdowns.map((b) => b.total));
  let candidates = breakdowns.filter((b) => b.total === maxTotal).map((b) => b.playerId);

  if (candidates.length > 1) {
    // Tiebreaker 1: more grants (raw count).
    const grantCount = (id: string) => countRaw(playerBases[id] ?? [], 'grant');
    const maxGrants = Math.max(...candidates.map(grantCount));
    candidates = candidates.filter((id) => grantCount(id) === maxGrants);
  }
  if (candidates.length > 1) {
    // Tiebreaker 2: fewer total cards in base.
    const baseLen = (id: string) => (playerBases[id] ?? []).length;
    const minLen = Math.min(...candidates.map(baseLen));
    candidates = candidates.filter((id) => baseLen(id) === minLen);
  }
  if (candidates.length > 1) {
    // Tiebreaker 3: earliest slot in turnOrder.
    const firstIdx = Math.min(...candidates.map((id) => turnOrder.indexOf(id)));
    candidates = [turnOrder[firstIdx]];
  }

  return { winnerIds: candidates, breakdowns };
}

export function projectedMandate(base: Card[]): number {
  return scorePlayer('__tmp__', base).total;
}
```

- [ ] **Step 2: Sanity check known cases via temporary console script**

Temporarily add to `src/App.tsx` for a manual check (revert after):

```tsx
import { scorePlayer, computeWinners } from './game/scoring';
import type { Card } from './game/types';

if (import.meta.env.DEV) {
  // Case 1: pure top-3 beats mixed.
  // base = [red×3, blue×3, green×3, purple×1] + 0 pivots + 0 grants
  // top3 = red, blue, green = 6+6+6 = 18; negative = purple triangular(1) = 1; total = 17
  const base1: Card[] = [
    { id: 'a', kind: 'bloc', color: 'red', value: 0 },
    { id: 'b', kind: 'bloc', color: 'red', value: 1 },
    { id: 'c', kind: 'bloc', color: 'red', value: 2 },
    { id: 'd', kind: 'bloc', color: 'blue', value: 0 },
    { id: 'e', kind: 'bloc', color: 'blue', value: 1 },
    { id: 'f', kind: 'bloc', color: 'blue', value: 2 },
    { id: 'g', kind: 'bloc', color: 'green', value: 0 },
    { id: 'h', kind: 'bloc', color: 'green', value: 1 },
    { id: 'i', kind: 'bloc', color: 'green', value: 2 },
    { id: 'j', kind: 'bloc', color: 'purple', value: 0 },
  ];
  console.log('[scoring] case 1 total (expected 17):', scorePlayer('p1', base1).total);

  // Case 2: pivot to demote.
  // base = [red×3, blue×3, green×2, purple×2] + 1 pivot
  // naive top3 (before pivot): red=3, blue=3, green=2 → pos=6+6+3=15; neg=purple(2)=3 + pivot? (if assigned to green: green=3, pos=6+6+6=18, neg=purple(2)=3 → 15)
  // optimal: assign pivot to PURPLE → top3=red(3)=6, blue(3)=6, purple(3)=6 → pos=18; green(2)=3 → neg=3; net=15
  // Actually that's tied with assign-to-green. Both give 15.
  // Case 2b: 2 pivots can push a 4th color into top-3 to demote a weaker current top-3.
  // base = [red×4, blue×3, green×1, purple×1] + 2 pivots
  // naive (pivots to red): red=6 tri=21, blue=3 tri=6, green+purple neg = 1+1 = 2. Top3 picks top3 non-zero counts: red=6, blue=3, green=1 → pos=21+6+1=28, neg=purple(1)=1; net=27.
  // Try assigning pivots to green+purple: counts red=4, blue=3, green=2, purple=2. Top3 by count: red, blue, then green/purple tied=2; alphabetical tiebreak → green. pos=tri(4)+tri(3)+tri(2)=10+6+3=19; neg=tri(2)=3; net=16. Worse.
  // Try 1 pivot to red, 1 to blue: red=5, blue=4, green=1, purple=1. top3=red,blue,green → tri(5)+tri(4)+tri(1)=15+10+1=26; neg=tri(1)=1; net=25. Worse than 27.
  // So best here is naive (pivots→red): 27.
  const base2: Card[] = [
    { id: 'a', kind: 'bloc', color: 'red', value: 0 },
    { id: 'b', kind: 'bloc', color: 'red', value: 1 },
    { id: 'c', kind: 'bloc', color: 'red', value: 2 },
    { id: 'd', kind: 'bloc', color: 'red', value: 3 },
    { id: 'e', kind: 'bloc', color: 'blue', value: 0 },
    { id: 'f', kind: 'bloc', color: 'blue', value: 1 },
    { id: 'g', kind: 'bloc', color: 'blue', value: 2 },
    { id: 'h', kind: 'bloc', color: 'green', value: 0 },
    { id: 'i', kind: 'bloc', color: 'purple', value: 0 },
    { id: 'j', kind: 'pivot' },
    { id: 'k', kind: 'pivot' },
  ];
  console.log('[scoring] case 2 total (expected 27):', scorePlayer('p2', base2).total);

  // Case 3: grants count.
  const base3: Card[] = [
    { id: 'a', kind: 'bloc', color: 'red', value: 0 },
    { id: 'b', kind: 'grant' },
    { id: 'c', kind: 'grant' },
  ];
  // pos=tri(1)=1, neg=0, grants=2*2=4 → total 5
  console.log('[scoring] case 3 total (expected 5):', scorePlayer('p3', base3).total);

  // Winner + tiebreaker sanity.
  const bases = {
    alice: base1,  // 17
    bob: base3,    // 5
  };
  const winners = computeWinners(['alice', 'bob'], bases);
  console.log('[scoring] winner (expected [alice]):', winners.winnerIds);
}
```

Run `npm run dev`, check console, confirm all three numbers match and winner is `["alice"]`.

- [ ] **Step 3: Revert the temporary script**

Remove the added imports and DEV block from `src/App.tsx`. Verify with `git diff src/App.tsx` — should show no net changes.

- [ ] **Step 4: Commit**

```bash
git add src/game/scoring.ts
git commit -m "feat(game): add scoring with brute-force pivot optimization and tiebreakers"
```

---

## Task 7: Turn action pure functions

**Files:**
- Create: `src/game/actions.ts`

- [ ] **Step 1: Create `src/game/actions.ts`**

```ts
import { CARDS_PER_SEGMENT } from './constants';
import { computeWinners } from './scoring';
import type { ColorlitionGameState, SegmentKey, Card, Segment } from './types';

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function currentPlayerId(state: ColorlitionGameState): string {
  return state.turnOrder[state.currentPlayerIndex];
}

export function canPlaceInSegment(segment: Segment): boolean {
  return segment.cards.length < CARDS_PER_SEGMENT && segment.claimedBy === null;
}

export function canClaimSegment(segment: Segment): boolean {
  return segment.cards.length > 0 && segment.claimedBy === null;
}

export function advanceTurn(state: ColorlitionGameState): ColorlitionGameState {
  const next = deepClone(state);
  const n = next.turnOrder.length;
  let found = -1;
  for (let step = 1; step <= n; step++) {
    const idx = (state.currentPlayerIndex + step) % n;
    const pid = next.turnOrder[idx];
    if (next.playerState[pid].roundStatus === 'active') {
      found = idx;
      break;
    }
  }
  if (found === -1) {
    // Round is over — no active players left.
    return endRound(next);
  }
  next.currentPlayerIndex = found;
  return next;
}

export function endRound(state: ColorlitionGameState): ColorlitionGameState {
  const next = deepClone(state);
  // Flush already happened at claim time (see claim()). Here we just reset.
  for (const seg of next.segments) {
    seg.cards = [];
    seg.claimedBy = null;
  }
  for (const pid of next.turnOrder) {
    next.playerState[pid].roundStatus = 'active';
  }

  if (next.exitPollDrawn) {
    next.phase = 'scoring';
    const bases: Record<string, Card[]> = {};
    for (const pid of next.turnOrder) bases[pid] = next.playerState[pid].base;
    const result = computeWinners(next.turnOrder, bases);
    next.scoreBreakdown = result.breakdowns;
    next.winnerIds = result.winnerIds;
    next.phase = 'ended';
    return next;
  }

  next.roundLeadIndex = (next.roundLeadIndex + 1) % next.turnOrder.length;
  next.currentPlayerIndex = next.roundLeadIndex;
  next.roundNumber += 1;
  next.phase = 'turn';
  return next;
}

export function drawAndPlace(
  state: ColorlitionGameState,
  segmentKey: SegmentKey,
): ColorlitionGameState {
  const next = deepClone(state);
  if (next.deck.length === 0) return next; // nothing to do; caller shouldn't invoke

  // Pop first card.
  let card = next.deck.shift() as Card;

  // Exit Poll: trigger final round, re-draw.
  if (card.kind === 'exitPoll') {
    next.exitPollDrawn = true;
    next.phase = 'finalRound';
    if (next.deck.length === 0) {
      // Exit Poll was literally last card: skip placement, advance turn.
      return advanceTurn(next);
    }
    card = next.deck.shift() as Card;
  }

  // Place into segment.
  const seg = next.segments.find((s) => s.key === segmentKey);
  if (!seg || !canPlaceInSegment(seg)) {
    // Invalid placement target. Caller should prevent this via UI, but if
    // it happens, surface via error rather than silently corrupting state.
    throw new Error(`drawAndPlace: invalid segment target ${segmentKey}`);
  }
  seg.cards.push(card);

  return advanceTurn(next);
}

export function claim(
  state: ColorlitionGameState,
  segmentKey: SegmentKey,
): ColorlitionGameState {
  const next = deepClone(state);
  const pid = currentPlayerId(next);
  const seg = next.segments.find((s) => s.key === segmentKey);
  if (!seg || !canClaimSegment(seg)) {
    throw new Error(`claim: invalid claim target ${segmentKey}`);
  }
  next.playerState[pid].base.push(...seg.cards);
  seg.cards = [];
  seg.claimedBy = pid;
  next.playerState[pid].roundStatus = 'claimed';
  return advanceTurn(next);
}

export function buildInitialGameState(
  deck: Card[],
  turnOrder: string[],
  segmentKeys: ReadonlyArray<{ key: SegmentKey; label: string }>,
): ColorlitionGameState {
  const playerCount = turnOrder.length;
  const segments: Segment[] = segmentKeys.slice(0, playerCount).map((s) => ({
    key: s.key,
    label: s.label,
    cards: [],
    claimedBy: null,
  }));
  const playerState: ColorlitionGameState['playerState'] = {};
  for (const pid of turnOrder) {
    playerState[pid] = { base: [], roundStatus: 'active' };
  }
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
  };
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run build
```

Expected: typecheck passes.

- [ ] **Step 3: Commit**

```bash
git add src/game/actions.ts
git commit -m "feat(game): add pure turn action functions"
```

---

## Task 8: GameContext skeleton — createRoom, loadRoom, joinRoom

**Files:**
- Create: `src/contexts/GameContext.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/contexts/GameContext.tsx`**

Minimum viable context that subscribes to Firebase. Mirrors krimi's `GameContext.tsx` but with our types and trimmed actions (the rest come in Task 9).

```tsx
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  ref,
  set,
  onValue,
  get,
  type Unsubscribe,
} from 'firebase/database';
import {
  createInitialRoom,
  joinPlayer,
  findFirstEmptySlot,
  deserializeRoom,
  type RoomState,
} from 'react-gameroom';
import { database } from '../firebase';
import { MIN_PLAYERS, MAX_PLAYERS } from '../game/constants';
import type { ColorlitionGameState, ColorlitionPlayerData } from '../game/types';

export interface GameContextValue {
  roomState: RoomState<ColorlitionPlayerData> | null;
  gameState: ColorlitionGameState | null;
  loading: boolean;
  createRoom: () => Promise<string>;
  loadRoom: (roomId: string) => void;
  joinRoom: (roomId: string, name: string) => Promise<number>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState<ColorlitionPlayerData> | null>(null);
  const [gameState, setGameState] = useState<ColorlitionGameState | null>(null);
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const loadRoom = useCallback((roomId: string) => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setLoading(true);
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsub = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setLoading(false);
          return;
        }
        if (data.room) {
          try {
            setRoomState(deserializeRoom<ColorlitionPlayerData>(data.room));
          } catch {
            setRoomState(data.room as RoomState<ColorlitionPlayerData>);
          }
        }
        setGameState((data.game as ColorlitionGameState | null) ?? null);
        setLoading(false);
      },
      (err) => {
        console.error('[colorlition] Firebase listener error:', err);
        setLoading(false);
      },
    );
    unsubRef.current = unsub;
  }, []);

  const createRoom = useCallback(async () => {
    const room = createInitialRoom<ColorlitionPlayerData>({
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      requireFull: false,
    });
    const roomId = room.roomId;
    const roomRef = ref(database, `rooms/${roomId}`);
    await set(roomRef, {
      room: JSON.parse(JSON.stringify(room)),
      game: null,
    });
    return roomId;
  }, []);

  const joinRoom = useCallback(async (roomId: string, name: string) => {
    const roomRef = ref(database, `rooms/${roomId}/room`);
    const snapshot = await get(roomRef);
    const currentRoom = snapshot.val();
    if (!currentRoom) throw new Error('Room not found');

    let room: RoomState<ColorlitionPlayerData>;
    try {
      room = deserializeRoom<ColorlitionPlayerData>(currentRoom);
    } catch {
      room = currentRoom as RoomState<ColorlitionPlayerData>;
    }

    if (room.status === 'started') throw new Error('Game has already started');

    const emptySlot = findFirstEmptySlot(room.players);
    if (!emptySlot) throw new Error('Room is full');

    const updated = joinPlayer(room, emptySlot.id, name);
    await set(ref(database, `rooms/${roomId}/room`), updated);
    return emptySlot.id;
  }, []);

  return (
    <GameContext.Provider
      value={{ roomState, gameState, loading, createRoom, loadRoom, joinRoom }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
```

- [ ] **Step 2: Wrap App in `GameProvider`**

Modify `src/App.tsx`: add the import and wrap the `<Suspense>` in `<GameProvider>`.

Replace the export:
```tsx
import { GameProvider } from './contexts/GameContext';

// ... (rest unchanged)

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameProvider>
        <Suspense fallback={<RouteFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </GameProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
npm run build
```

Expected: typecheck passes.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/GameContext.tsx src/App.tsx
git commit -m "feat(context): add GameContext skeleton with room lifecycle actions"
```

---

## Task 9: GameContext — startTheGame, drawAndPlace, claim

**Files:**
- Modify: `src/contexts/GameContext.tsx`

- [ ] **Step 1: Extend `GameContextValue` and imports**

In `src/contexts/GameContext.tsx`, extend the interface:

```tsx
import { update } from 'firebase/database';
import { startGame as startGameRoom } from 'react-gameroom';
import { SEGMENT_NAMES } from '../game/constants';
import { createShuffledDeck } from '../game/deck';
import {
  buildInitialGameState,
  drawAndPlace as drawAndPlacePure,
  claim as claimPure,
} from '../game/actions';
import type { SegmentKey } from '../game/types';

export interface GameContextValue {
  roomState: RoomState<ColorlitionPlayerData> | null;
  gameState: ColorlitionGameState | null;
  loading: boolean;
  createRoom: () => Promise<string>;
  loadRoom: (roomId: string) => void;
  joinRoom: (roomId: string, name: string) => Promise<number>;
  startTheGame: () => Promise<void>;
  drawAndPlace: (segmentKey: SegmentKey) => Promise<void>;
  claim: (segmentKey: SegmentKey) => Promise<void>;
}
```

(Add the three new imports at the top of the file alongside existing imports; they replace/extend the existing set.)

- [ ] **Step 2: Implement `startTheGame`**

Inside `GameProvider`, after `joinRoom`:

```tsx
const startTheGame = useCallback(async () => {
  if (!roomState) return;
  const roomId = roomState.roomId;
  const started = startGameRoom(roomState);
  const readyPlayers = roomState.players.filter((p) => p.status === 'ready');
  const turnOrder = readyPlayers.map((p) => String(p.id));
  if (turnOrder.length < MIN_PLAYERS) {
    throw new Error(`Need at least ${MIN_PLAYERS} players to start`);
  }
  const deck = createShuffledDeck();
  const newGameState = buildInitialGameState(deck, turnOrder, SEGMENT_NAMES);

  await set(ref(database, `rooms/${roomId}/room`), started);
  await set(ref(database, `rooms/${roomId}/game`), newGameState);
}, [roomState]);
```

- [ ] **Step 3: Implement `drawAndPlace` and `claim`**

```tsx
const drawAndPlace = useCallback(async (segmentKey: SegmentKey) => {
  if (!roomState || !gameState) return;
  if (gameState.phase !== 'turn' && gameState.phase !== 'finalRound') return;
  const nextGame = drawAndPlacePure(gameState, segmentKey);
  await update(ref(database, `rooms/${roomState.roomId}/game`), nextGame);
}, [roomState, gameState]);

const claim = useCallback(async (segmentKey: SegmentKey) => {
  if (!roomState || !gameState) return;
  if (gameState.phase !== 'turn' && gameState.phase !== 'finalRound') return;
  const nextGame = claimPure(gameState, segmentKey);
  await update(ref(database, `rooms/${roomState.roomId}/game`), nextGame);
}, [roomState, gameState]);
```

**Note:** `update()` on the full state object effectively replaces all keys at the top level; this is what krimi does when writing a full new game state. If Firebase rejects due to undefined keys, switch to `set(ref(database, \`rooms/${roomState.roomId}/game\`), nextGame)`.

- [ ] **Step 4: Include new actions in the context value**

Update the `<GameContext.Provider value={...}>` block to include:

```tsx
value={{
  roomState,
  gameState,
  loading,
  createRoom,
  loadRoom,
  joinRoom,
  startTheGame,
  drawAndPlace,
  claim,
}}
```

- [ ] **Step 5: Verify typecheck**

```bash
npm run build
```

Expected: typecheck passes.

- [ ] **Step 6: Commit**

```bash
git add src/contexts/GameContext.tsx
git commit -m "feat(context): add startTheGame, drawAndPlace, and claim actions"
```

---

## Task 10: HomePage — "Create Game" button

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Replace HomePage**

```tsx
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useGame } from '../contexts/GameContext';

export default function HomePage() {
  const { createRoom } = useGame();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleCreate = useCallback(async () => {
    setBusy(true);
    try {
      const roomId = await createRoom();
      navigate(`/room/${roomId}`);
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }, [createRoom, navigate]);

  return (
    <Stack spacing={2} sx={{ p: 4, alignItems: 'flex-start' }}>
      <Typography variant="h3">Color-lition</Typography>
      <Typography>Create a new game. Players join by scanning the QR code on the next screen.</Typography>
      <Button variant="contained" onClick={handleCreate} disabled={busy}>
        {busy ? 'Creating…' : 'Create Game'}
      </Button>
    </Stack>
  );
}
```

- [ ] **Step 2: Set up `.env.local` and verify round trip**

The engineer must create `.env.local` with real Firebase Realtime Database credentials before this step. Either use an existing Firebase project (e.g., the one used for krimi) or create a new one at `https://console.firebase.google.com`.

```bash
npm run dev
```

Visit `/`, click "Create Game". Expected:
1. Page navigates to `/room/<6-character-id>`.
2. Firebase console shows a new node under `rooms/<id>/room` with the initial RoomState.
3. No console errors.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): add create game button"
```

---

## Task 11: LobbyPage — slots, QR, start button, fullscreen

**Files:**
- Modify: `src/pages/LobbyPage.tsx`

- [ ] **Step 1: Replace LobbyPage**

```tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {
  PlayerSlotsGrid,
  RoomQRCode,
  FullscreenToggle,
  buildPlayerUrl,
} from 'react-gameroom';
import { useGame } from '../contexts/GameContext';

export default function LobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roomState, loadRoom, startTheGame } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  useEffect(() => {
    if (roomState?.status === 'started' && id) {
      navigate(`/room/${id}/play`);
    }
  }, [roomState?.status, id, navigate]);

  if (!id) return <Typography>Missing room id.</Typography>;
  if (!roomState) return <Typography>Loading room…</Typography>;

  const readyCount = roomState.players.filter((p) => p.status === 'ready').length;
  const canStart = readyCount >= roomState.minPlayers;

  return (
    <Stack spacing={3} sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Room {id}</Typography>
        <FullscreenToggle />
      </Stack>

      <Stack direction="row" spacing={4} alignItems="flex-start">
        <RoomQRCode roomId={id} />
        <Stack spacing={1}>
          <Typography variant="h6">Players</Typography>
          <PlayerSlotsGrid
            players={roomState.players}
            buildSlotHref={(slotId) => buildPlayerUrl(id, slotId)}
          />
        </Stack>
      </Stack>

      <Button
        variant="contained"
        onClick={() => startTheGame().catch(console.error)}
        disabled={!canStart}
      >
        Start Game ({readyCount}/{roomState.maxPlayers})
      </Button>
    </Stack>
  );
}
```

**Note:** `buildPlayerUrl` from react-gameroom returns a URL like `/room/<id>/player/<slotId>`, matching our route. The player list grid links each slot to that URL — so scanning the QR takes someone to `/join/<id>` (room-level QR) and clicking a specific slot in the grid takes them to `/room/<id>/player/<slotId>`. The join flow is implemented in Task 12.

- [ ] **Step 2: Verify lobby renders**

```bash
npm run dev
```

From `/`, click "Create Game". Expect:
1. Lobby renders with room id, QR code, 5 empty player slots, a disabled "Start Game (0/5)" button.
2. FullscreenToggle button is visible and functional.
3. No console errors.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LobbyPage.tsx
git commit -m "feat(lobby): add slots grid, qr, start button, and fullscreen"
```

---

## Task 12: JoinPage — name entry and slot claim

**Files:**
- Modify: `src/pages/JoinPage.tsx`

- [ ] **Step 1: Replace JoinPage**

```tsx
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useGame } from '../contexts/GameContext';

export default function JoinPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinRoom, loadRoom, roomState } = useGame();
  const [roomIdInput, setRoomIdInput] = useState(id ?? '');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  const handleJoin = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const finalRoomId = (id ?? roomIdInput).trim();
      if (!finalRoomId) throw new Error('Enter a room id');
      if (!name.trim()) throw new Error('Enter your name');
      const slotId = await joinRoom(finalRoomId, name.trim());
      navigate(`/room/${finalRoomId}/player/${slotId}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }, [id, roomIdInput, name, joinRoom, navigate]);

  return (
    <Stack spacing={2} sx={{ p: 4, maxWidth: 480 }}>
      <Typography variant="h4">Join Game</Typography>
      {!id && (
        <TextField
          label="Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
        />
      )}
      {id && roomState && <Typography>Joining room {id}</Typography>}
      <TextField
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleJoin} disabled={busy}>
        {busy ? 'Joining…' : 'Join'}
      </Button>
    </Stack>
  );
}
```

- [ ] **Step 2: Verify multi-device join in two browser tabs**

```bash
npm run dev
```

- Tab 1 (Big Screen simulation): visit `/`, click "Create Game". Note the room id shown in the URL.
- Tab 2 (Mobile simulation): visit `/join/<room-id>`, enter a name, click "Join".
- Back in Tab 1: expect the lobby slot grid to update, showing the new player in a slot. "Start Game" button's ready count increments.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/JoinPage.tsx
git commit -m "feat(join): add name entry and slot claim"
```

---

## Task 13: Shared Card component + BigScreenPage skeleton + VoterSegments

**Files:**
- Create: `src/components/shared/Card.tsx`, `src/components/shared/SegmentRow.tsx`, `src/components/big-screen/VoterSegments.tsx`, `src/components/big-screen/DrawPile.tsx`
- Modify: `src/pages/BigScreenPage.tsx`

- [ ] **Step 1: Create `src/components/shared/Card.tsx`**

```tsx
import Chip from '@mui/material/Chip';
import type { Card as GameCard } from '../../game/types';

export function Card({ card }: { card: GameCard }) {
  if (card.kind === 'bloc') return <Chip label={`${card.color} #${card.value}`} />;
  if (card.kind === 'grant') return <Chip label="Public Grant" />;
  if (card.kind === 'pivot') return <Chip label="Pivot" />;
  return <Chip label="Exit Poll" />;
}
```

- [ ] **Step 2: Create `src/components/shared/SegmentRow.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from './Card';
import type { Segment } from '../../game/types';

export function SegmentRow({ segment }: { segment: Segment }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1, border: '1px solid #ccc' }}>
      <Typography sx={{ minWidth: 200 }}>{segment.label}</Typography>
      <Stack direction="row" spacing={1}>
        {segment.cards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </Stack>
      {segment.claimedBy !== null && (
        <Typography sx={{ ml: 2 }}>— claimed by #{segment.claimedBy}</Typography>
      )}
    </Stack>
  );
}
```

- [ ] **Step 3: Create `src/components/big-screen/VoterSegments.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import { SegmentRow } from '../shared/SegmentRow';
import type { Segment } from '../../game/types';

export function VoterSegments({ segments }: { segments: Segment[] }) {
  return (
    <Stack spacing={1}>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} />
      ))}
    </Stack>
  );
}
```

- [ ] **Step 4: Create `src/components/big-screen/DrawPile.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function DrawPile({ remaining }: { remaining: number }) {
  return (
    <Stack sx={{ p: 1, border: '1px solid #ccc', display: 'inline-flex' }}>
      <Typography>Draw Pile: {remaining} cards</Typography>
    </Stack>
  );
}
```

- [ ] **Step 5: Replace BigScreenPage**

```tsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FullscreenToggle } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { VoterSegments } from '../components/big-screen/VoterSegments';
import { DrawPile } from '../components/big-screen/DrawPile';

export default function BigScreenPage() {
  const { id } = useParams();
  const { gameState, loadRoom, roomState } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  if (!gameState || !roomState) return <Typography>Loading game…</Typography>;

  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
  const currentPlayer = roomState.players.find((p) => String(p.id) === currentPlayerId);

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Color-lition — Round {gameState.roundNumber}</Typography>
        <FullscreenToggle />
      </Stack>
      {gameState.exitPollDrawn && (
        <Typography variant="h5" color="warning.main">FINAL ROUND</Typography>
      )}
      <Typography>
        {gameState.phase === 'ended'
          ? 'Game over'
          : `Turn: ${currentPlayer?.name ?? currentPlayerId}`}
      </Typography>
      <DrawPile remaining={gameState.deck.length} />
      <VoterSegments segments={gameState.segments} />
    </Stack>
  );
}
```

- [ ] **Step 6: Verify end-to-end so far**

```bash
npm run dev
```

- Tab 1 (Big Screen): `/`, click Create Game.
- Tab 2 (Mobile): `/join/<room>`, enter name, join. Repeat for Tab 3 with a different name (2 players min).
- Tab 1: click "Start Game". Expect the lobby to redirect to `/room/<id>/play` showing the Big Screen game view: header with round 1, draw pile count (should be 77), and empty segment rows for 2 segments (since 2 players).

Stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/ src/components/big-screen/VoterSegments.tsx src/components/big-screen/DrawPile.tsx src/pages/BigScreenPage.tsx
git commit -m "feat(big-screen): render header, draw pile, and voter segments"
```

---

## Task 14: PublicCoalitions + Leaderboard

**Files:**
- Create: `src/components/big-screen/PublicCoalitions.tsx`, `src/components/big-screen/Leaderboard.tsx`
- Modify: `src/pages/BigScreenPage.tsx`

- [ ] **Step 1: Create `src/components/big-screen/PublicCoalitions.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import type { Card as GameCard } from '../../game/types';

export type CoalitionRow = {
  playerId: string;
  name: string;
  base: GameCard[];
};

export function PublicCoalitions({ rows }: { rows: CoalitionRow[] }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Coalitions</Typography>
      {rows.map((row) => (
        <Stack
          key={row.playerId}
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ p: 1, border: '1px solid #ccc' }}
        >
          <Typography sx={{ minWidth: 160 }}>{row.name}</Typography>
          {row.base.length === 0 && <Typography sx={{ color: 'text.secondary' }}>(empty)</Typography>}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {row.base.map((c) => (
              <Card key={c.id} card={c} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
```

- [ ] **Step 2: Create `src/components/big-screen/Leaderboard.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { projectedMandate } from '../../game/scoring';
import type { Card } from '../../game/types';

export type LeaderRow = {
  playerId: string;
  name: string;
  base: Card[];
};

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const scored = rows
    .map((r) => ({ ...r, total: projectedMandate(r.base) }))
    .sort((a, b) => b.total - a.total);
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Projected Mandate</Typography>
      {scored.map((r, idx) => (
        <Stack
          key={r.playerId}
          direction="row"
          justifyContent="space-between"
          sx={{ p: 1, border: '1px solid #ccc' }}
        >
          <Typography>
            {idx + 1}. {r.name}
          </Typography>
          <Typography>{r.total}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
```

- [ ] **Step 3: Wire into BigScreenPage**

Modify `src/pages/BigScreenPage.tsx` to build coalition/leader rows and render both components. Replace the return block of the component:

```tsx
const rows = gameState.turnOrder.map((pid) => ({
  playerId: pid,
  name: roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`,
  base: gameState.playerState[pid]?.base ?? [],
}));

return (
  <Stack spacing={2} sx={{ p: 4 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h4">Color-lition — Round {gameState.roundNumber}</Typography>
      <FullscreenToggle />
    </Stack>
    {gameState.exitPollDrawn && (
      <Typography variant="h5" color="warning.main">FINAL ROUND</Typography>
    )}
    <Typography>
      {gameState.phase === 'ended'
        ? 'Game over'
        : `Turn: ${currentPlayer?.name ?? currentPlayerId}`}
    </Typography>
    <DrawPile remaining={gameState.deck.length} />
    <VoterSegments segments={gameState.segments} />
    <PublicCoalitions rows={rows} />
    <Leaderboard rows={rows} />
  </Stack>
);
```

Add the two imports at the top of the file:
```tsx
import { PublicCoalitions } from '../components/big-screen/PublicCoalitions';
import { Leaderboard } from '../components/big-screen/Leaderboard';
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Reuse the previous Tab setup. Start a game with 2 players. Expect BigScreen to now show empty Coalition rows per player and a Projected Mandate leaderboard with both at 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/big-screen/PublicCoalitions.tsx src/components/big-screen/Leaderboard.tsx src/pages/BigScreenPage.tsx
git commit -m "feat(big-screen): add public coalitions and projected mandate leaderboard"
```

---

## Task 15: WinnerScreen

**Files:**
- Create: `src/components/big-screen/WinnerScreen.tsx`
- Modify: `src/pages/BigScreenPage.tsx`

- [ ] **Step 1: Create `src/components/big-screen/WinnerScreen.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import type { ScoreBreakdown } from '../../game/types';

export function WinnerScreen({
  breakdowns,
  winnerIds,
  nameFor,
}: {
  breakdowns: ScoreBreakdown[];
  winnerIds: string[];
  nameFor: (playerId: string) => string;
}) {
  const winnerNames = winnerIds.map(nameFor).join(', ');
  return (
    <Stack spacing={2}>
      <Typography variant="h4">
        {winnerIds.length === 1 ? `Winner: ${winnerNames}` : `Co-winners: ${winnerNames}`}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Positive colors</TableCell>
            <TableCell align="right">Positive</TableCell>
            <TableCell>Negative colors</TableCell>
            <TableCell align="right">Negative</TableCell>
            <TableCell align="right">Grants</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {breakdowns
            .slice()
            .sort((a, b) => b.total - a.total)
            .map((b) => (
              <TableRow key={b.playerId}>
                <TableCell>{nameFor(b.playerId)}</TableCell>
                <TableCell>{b.positiveColors.join(', ') || '—'}</TableCell>
                <TableCell align="right">{b.positive}</TableCell>
                <TableCell>{b.negativeColors.join(', ') || '—'}</TableCell>
                <TableCell align="right">{b.negative}</TableCell>
                <TableCell align="right">{b.grants}</TableCell>
                <TableCell align="right">{b.total}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
```

- [ ] **Step 2: Wire into BigScreenPage**

In `src/pages/BigScreenPage.tsx`, add the import:
```tsx
import { WinnerScreen } from '../components/big-screen/WinnerScreen';
```

Add this block inside the main return, right after the `<Leaderboard>`:

```tsx
{gameState.phase === 'ended' && gameState.scoreBreakdown && gameState.winnerIds && (
  <WinnerScreen
    breakdowns={gameState.scoreBreakdown}
    winnerIds={gameState.winnerIds}
    nameFor={(pid) =>
      roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`
    }
  />
)}
```

- [ ] **Step 3: Verify typecheck**

```bash
npm run build
```

Expected: passes. (Full end-to-end verification is in Task 20.)

- [ ] **Step 4: Commit**

```bash
git add src/components/big-screen/WinnerScreen.tsx src/pages/BigScreenPage.tsx
git commit -m "feat(big-screen): add winner screen with score table"
```

---

## Task 16: PlayerPage skeleton + CoalitionBase + SegmentsReadonly + WaitingView

**Files:**
- Create: `src/components/mobile/CoalitionBase.tsx`, `src/components/mobile/SegmentsReadonly.tsx`, `src/components/mobile/WaitingView.tsx`
- Modify: `src/pages/PlayerPage.tsx`

- [ ] **Step 1: Create `src/components/mobile/CoalitionBase.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '../shared/Card';
import type { Card as GameCard } from '../../game/types';

export function CoalitionBase({ base }: { base: GameCard[] }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Your Coalition</Typography>
      {base.length === 0 && <Typography sx={{ color: 'text.secondary' }}>(empty)</Typography>}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {base.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </Stack>
    </Stack>
  );
}
```

- [ ] **Step 2: Create `src/components/mobile/SegmentsReadonly.tsx`**

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
        <SegmentRow key={s.key} segment={s} />
      ))}
    </Stack>
  );
}
```

- [ ] **Step 3: Create `src/components/mobile/WaitingView.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function WaitingView({ message }: { message: string }) {
  return (
    <Stack sx={{ p: 2, border: '1px dashed #ccc' }}>
      <Typography>{message}</Typography>
    </Stack>
  );
}
```

- [ ] **Step 4: Replace PlayerPage**

```tsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGame } from '../contexts/GameContext';
import { CoalitionBase } from '../components/mobile/CoalitionBase';
import { SegmentsReadonly } from '../components/mobile/SegmentsReadonly';
import { WaitingView } from '../components/mobile/WaitingView';

export default function PlayerPage() {
  const { id, playerId } = useParams();
  const { roomState, gameState, loadRoom } = useGame();

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  if (!id || !playerId) return <Typography>Missing room or player id.</Typography>;
  if (!roomState) return <Typography>Loading…</Typography>;

  const myName = roomState.players.find((p) => String(p.id) === playerId)?.name ?? `Player ${playerId}`;

  if (!gameState) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="h5">{myName}</Typography>
        <WaitingView message="Waiting for the host to start the game…" />
      </Stack>
    );
  }

  const isMyTurn =
    gameState.turnOrder[gameState.currentPlayerIndex] === playerId &&
    (gameState.phase === 'turn' || gameState.phase === 'finalRound');
  const myBase = gameState.playerState[playerId]?.base ?? [];
  const myRoundStatus = gameState.playerState[playerId]?.roundStatus ?? 'active';

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5">{myName}</Typography>
      <Typography>
        {gameState.phase === 'ended'
          ? 'Game over.'
          : isMyTurn
          ? 'Your turn.'
          : myRoundStatus === 'claimed'
          ? 'You claimed this round. Waiting…'
          : `Waiting for ${
              roomState.players.find(
                (p) => String(p.id) === gameState.turnOrder[gameState.currentPlayerIndex],
              )?.name ?? 'opponent'
            }…`}
      </Typography>
      {gameState.exitPollDrawn && (
        <Typography variant="h6" color="warning.main">FINAL ROUND</Typography>
      )}
      <CoalitionBase base={myBase} />
      <SegmentsReadonly segments={gameState.segments} />
      {/* TurnActions arrives in the next task */}
    </Stack>
  );
}
```

- [ ] **Step 5: Verify mobile view shows state**

```bash
npm run dev
```

With 2 players joined, start the game. On each mobile tab (`/room/<id>/player/<slotId>`), expect:
- Player name shown.
- "Your turn" for one player, "Waiting for X…" for the other.
- Empty Coalition.
- SegmentsReadonly showing 2 empty segments.

Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/components/mobile/CoalitionBase.tsx src/components/mobile/SegmentsReadonly.tsx src/components/mobile/WaitingView.tsx src/pages/PlayerPage.tsx
git commit -m "feat(player): add mobile skeleton with coalition, segments, and waiting view"
```

---

## Task 17: TurnActions — idle state (Draw + Claim)

**Files:**
- Create: `src/components/mobile/TurnActions.tsx`
- Modify: `src/pages/PlayerPage.tsx`

- [ ] **Step 1: Create `src/components/mobile/TurnActions.tsx` (idle state only for now)**

```tsx
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useGame } from '../../contexts/GameContext';
import { canPlaceInSegment, canClaimSegment } from '../../game/actions';
import type { ColorlitionGameState, Card as GameCard, SegmentKey } from '../../game/types';

type PendingDraw = { card: GameCard; exitPollTriggered: boolean };

export function TurnActions({ gameState }: { gameState: ColorlitionGameState }) {
  const { drawAndPlace, claim } = useGame();
  const [pending, setPending] = useState<PendingDraw | null>(null);
  const [busy, setBusy] = useState(false);

  const canDraw = gameState.deck.length > 0 && gameState.segments.some(canPlaceInSegment);

  const handleDraw = async () => {
    // Simulate client-side draw to preview the card; don't write yet.
    // We "peek" by copying the first card; the real write happens in handlePlace.
    const first = gameState.deck[0];
    if (!first) return;
    if (first.kind === 'exitPoll') {
      const second = gameState.deck[1];
      if (!second) {
        // Exit Poll is last card — no placement. Fire drawAndPlace with any key; actions.ts skips placement.
        setBusy(true);
        try {
          // Pass the first available segment key — drawAndPlace will short-circuit.
          await drawAndPlace(gameState.segments[0].key);
        } finally {
          setBusy(false);
        }
        return;
      }
      setPending({ card: second, exitPollTriggered: true });
    } else {
      setPending({ card: first, exitPollTriggered: false });
    }
  };

  const handlePlace = async (segmentKey: SegmentKey) => {
    setBusy(true);
    try {
      await drawAndPlace(segmentKey);
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  const handleClaim = async (segmentKey: SegmentKey) => {
    setBusy(true);
    try {
      await claim(segmentKey);
    } finally {
      setBusy(false);
    }
  };

  if (pending) {
    return (
      <Stack spacing={1} sx={{ p: 2, border: '1px solid #333' }}>
        {pending.exitPollTriggered && (
          <Typography color="warning.main">Exit Poll triggered — FINAL ROUND</Typography>
        )}
        <Typography>
          You drew: {pending.card.kind === 'bloc' ? `${pending.card.color} #${pending.card.value}` : pending.card.kind}
        </Typography>
        <Typography>Place in which segment?</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {gameState.segments.map((s) => (
            <Button
              key={s.key}
              variant="contained"
              disabled={busy || !canPlaceInSegment(s)}
              onClick={() => handlePlace(s.key)}
            >
              {s.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: 2, border: '1px solid #333' }}>
      <Button variant="contained" onClick={handleDraw} disabled={busy || !canDraw}>
        Draw
      </Button>
      <Typography>— or claim a segment:</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {gameState.segments.map((s) => (
          <Button
            key={s.key}
            variant="outlined"
            disabled={busy || !canClaimSegment(s)}
            onClick={() => handleClaim(s.key)}
          >
            Claim {s.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
```

**Implementation note:** "Peek" at `deck[0]` (and `deck[1]` for Exit Poll) is safe because we never mutate `gameState` here — we just read for UI preview. The actual state transition happens atomically in `drawAndPlace` (which pops from its own deep-cloned copy before writing to Firebase). If another client somehow races a draw in between our peek and our place, `drawAndPlacePure` uses the authoritative server state at write time and the preview might briefly show a stale card. Acceptable for v1.

- [ ] **Step 2: Wire into PlayerPage**

In `src/pages/PlayerPage.tsx`, import and render TurnActions conditionally:

```tsx
import { TurnActions } from '../components/mobile/TurnActions';
```

Replace the `{/* TurnActions arrives in the next task */}` comment with:

```tsx
{isMyTurn && <TurnActions gameState={gameState} />}
```

- [ ] **Step 3: Verify draw/claim round trip**

```bash
npm run dev
```

Create room, join 2 players, start game.

On the current player's mobile tab:
- Click "Draw". Expect the placement UI to appear showing the drawn card.
- Click a segment button. Expect the card to appear in that segment on all screens. Turn should advance to other player.
- Other player clicks "Claim" on that segment. Expect the card to flush into their Coalition on the Big Screen, segment empties, round ends (or turn passes to the last active player), and next round starts (or scoring if Exit Poll was drawn).

Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/components/mobile/TurnActions.tsx src/pages/PlayerPage.tsx
git commit -m "feat(player): add turn actions with draw/place and claim flows"
```

---

## Task 18: End-of-game handling + polish

**Files:**
- Modify: `src/pages/PlayerPage.tsx`

- [ ] **Step 1: Show game-over state clearly on mobile**

Modify `src/pages/PlayerPage.tsx` to show a prominent end-of-game block when `phase === 'ended'`. Replace the existing header Typography block (the one with all the turn indicators) with:

```tsx
if (gameState.phase === 'ended') {
  const didWin = gameState.winnerIds?.includes(playerId) ?? false;
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5">{myName}</Typography>
      <Typography variant="h4" color={didWin ? 'success.main' : 'text.primary'}>
        {didWin ? 'You won!' : 'Game over'}
      </Typography>
      <CoalitionBase base={myBase} />
    </Stack>
  );
}
```

Insert this block just after `const myRoundStatus = ...;` and before the main `return (`.

- [ ] **Step 2: Verify**

```bash
npm run build
```

Expected: typecheck passes. Full end-to-end covered in Task 20.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PlayerPage.tsx
git commit -m "feat(player): show win/loss state at end of game"
```

---

## Task 19: Auto-end partial rounds when deck empties mid-round

**Files:**
- Modify: `src/game/actions.ts`

- [ ] **Step 1: Detect deck exhaustion after a draw**

The spec (§4 edge cases) says: "Deck empty mid-round before Exit Poll drawn: treat as implicit Exit Poll — round completes normally, then phase → scoring." We need to set `exitPollDrawn = true` when the deck empties after a normal draw.

In `src/game/actions.ts`, inside `drawAndPlace`, after the `seg.cards.push(card);` line and before the `return advanceTurn(next);` line, add:

```ts
  // Implicit Exit Poll: if deck is empty after a non-exit-poll draw, mark final round.
  if (next.deck.length === 0 && !next.exitPollDrawn) {
    next.exitPollDrawn = true;
    next.phase = 'finalRound';
  }
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run build
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/game/actions.ts
git commit -m "fix(game): treat deck exhaustion as implicit exit poll"
```

---

## Task 20: Manual end-to-end verification

**Files:** None (verification only).

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Two-player full-game test**

Open three browser tabs (or windows):
- **Tab A (Big Screen):** `/`
- **Tab B (Mobile 1):** will become `/join/<room>`
- **Tab C (Mobile 2):** will become `/join/<room>`

In **Tab A**: click "Create Game". Note the room id.

In **Tab B**: visit `/join/<room-id>`, enter name "Alice", click Join. Confirm lobby updates in Tab A.

In **Tab C**: visit `/join/<room-id>`, enter name "Bob", click Join. Confirm lobby updates in Tab A.

In **Tab A**: click "Start Game". Tab A should redirect to `/room/<id>/play` and both mobile tabs should show their turn state.

Play a game to completion:
- Alternate between Tab B and Tab C for turns.
- Prefer Draw early, Claim late.
- Verify after each action: Big Screen segments update, turn indicator advances, Projected Mandate updates live when cards flush to bases on claim.

When Exit Poll is drawn, verify:
- "FINAL ROUND" banner appears on Big Screen and mobile.
- The drawing player still places their replacement card (not the Exit Poll itself).
- Current round completes normally.
- After the final round's `endRound`, Big Screen transitions to `phase === 'ended'` and WinnerScreen appears.
- Mobile of each player shows "You won!" / "Game over".

- [ ] **Step 3: Scoring sanity check**

In the WinnerScreen table, manually verify one player's total:
- Count bloc cards per color in their row.
- Pick the top 3 colors; apply triangular `n(n+1)/2` to each count; sum.
- Sum triangular for remaining colors; subtract.
- Count Grant cards × 2; add.
- Compare to the `Total` column. Should match.

If a Pivot is in the base, the brute-force optimizer may have assigned it non-obviously — trust the code on that one and move on.

- [ ] **Step 4: Five-player smoke test (optional but recommended)**

Repeat the full-game test with 5 players (5 mobile tabs + 1 big screen tab). Confirm:
- 5 segments are generated (Industrial Belt, Urban Professionals, Agricultural Frontier, Financial District, Periphery — first 5 from `SEGMENT_NAMES`).
- Game completes without errors.
- Winner screen shows all 5 rows.

- [ ] **Step 5: Edge-case verification**

- **Refresh mid-game:** refresh Tab A and one mobile tab. Confirm state restores correctly from Firebase.
- **Join attempt after start:** with a running game, open a new tab at `/join/<room>`, try to join. Expect "Game has already started" error.
- **Over-capacity:** try to join a 6th player in a fully-joined 5-player room. Expect "Room is full" error.

- [ ] **Step 6: Build verification**

```bash
npm run build
```

Expected: production build succeeds without errors.

- [ ] **Step 7: Commit nothing — this is a verification task**

If any issues surfaced, fix them and commit with clear bug-fix messages. If all passes, the plan is complete.

---

## End of v1

At this point the game is playable end-to-end. The surface that v2 adds on top:

- "We want…" private demand strings on mobile draw (spec open follow-ups §8)
- Headline engine on Big Screen
- Victory title lookup
- Journalism-style theming
- Reconnect UX and scoring tiebreaker indicators
- Test suite (scoring is the highest priority, then deck, then actions)

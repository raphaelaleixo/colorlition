# Route Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate colorlition's routes to match the `react-gameroom` convention used by `krimi` and `react-unmatched`: unified `/room/:id` (lobby + game), unified `/room/:id/player` (join + rejoin), explicit Room-not-found errors, and QR pointing at the player route.

**Architecture:** One `RoomPage` subscribes to the room and renders `LobbyView` or `BigScreenView` by status. One `PlayerJoinPage` subscribes and renders `NicknameJoinView` (status === 'lobby') or `RejoinView` (otherwise). Both fall through to a shared `RoomNotFound` if the first snapshot returned null. The existing `LobbyPage` and `BigScreenPage` modules are demoted to props-driven view components (no `useParams`, no `loadRoom`), and `JoinPage` is deleted.

**Tech Stack:** React 19, react-router-dom 7, MUI 9, react-gameroom 0.10, Firebase Realtime Database. No test runner — verification is `npm run lint` + `npm run build` (tsc strict) + manual browser smoke at `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-04-27-route-restructure-design.md`

**Working tree:** This plan executes directly on `main` (consistent with v1–v3 work in this repo). No worktree.

---

## File Structure

**Create:**
- `src/pages/RoomPage.tsx` — subscribes to room, dispatches to LobbyView or BigScreenView, or RoomNotFound
- `src/pages/PlayerJoinPage.tsx` — subscribes to room, dispatches to NicknameJoinView or RejoinView, or RoomNotFound; both views inline as subcomponents in this file
- `src/components/room/LobbyView.tsx` — pure(-ish) lobby UI; takes `{ roomId, roomState }`
- `src/components/room/BigScreenView.tsx` — pure(-ish) big-screen UI; takes `{ roomId, roomState }`
- `src/components/shared/RoomNotFound.tsx` — error view used by both pages

**Modify:**
- `src/contexts/GameContext.tsx` — clear `roomState` and `gameState` on null Firebase snapshot
- `src/App.tsx` — replace route table

**Delete:**
- `src/pages/LobbyPage.tsx`
- `src/pages/BigScreenPage.tsx`
- `src/pages/JoinPage.tsx`

The new `LobbyView` / `BigScreenView` files contain the same JSX bodies as the deleted page modules, with the subscription effects and `useParams` calls removed (props instead).

---

## Task 1: Fix stale `roomState` on null Firebase snapshot

**Why first:** Foundational. The unified `RoomPage` increases exposure to navigating between rooms (e.g., scan a bad QR after visiting a real room). Without this fix, `RoomPage` would never reach the `RoomNotFound` branch — it would render the previous room's data.

**Files:**
- Modify: `src/contexts/GameContext.tsx:122-125`

- [ ] **Step 1: Edit `loadRoom` to clear state on null snapshot**

In `src/contexts/GameContext.tsx`, find the snapshot handler:

```tsx
        if (!data) {
          setLoading(false);
          return;
        }
```

Replace with:

```tsx
        if (!data) {
          setRoomState(null);
          setGameState(null);
          setLoading(false);
          return;
        }
```

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/GameContext.tsx
git commit -m "fix(game-context): clear roomState/gameState on null Firebase snapshot"
```

---

## Task 2: Create `RoomNotFound` shared component

**Files:**
- Create: `src/components/shared/RoomNotFound.tsx`

- [ ] **Step 1: Create the component**

Write `src/components/shared/RoomNotFound.tsx`:

```tsx
import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface RoomNotFoundProps {
  roomId?: string;
}

export function RoomNotFound({ roomId }: RoomNotFoundProps) {
  return (
    <Stack
      spacing={3}
      sx={{
        p: 6,
        maxWidth: 560,
        minHeight: '100dvh',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h2">Room not found</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {roomId ? (
          <>
            No game with code{' '}
            <Typography
              component="span"
              sx={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}
            >
              {roomId}
            </Typography>
            . Check the code on the host's screen.
          </>
        ) : (
          <>No game at this address. Check the code on the host's screen.</>
        )}
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        sx={{ alignSelf: 'flex-start', px: 4, py: 1.5 }}
      >
        Back to home
      </Button>
    </Stack>
  );
}
```

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/RoomNotFound.tsx
git commit -m "feat(shared): add RoomNotFound error view"
```

---

## Task 3: Extract `LobbyView` from `LobbyPage`

**Files:**
- Create: `src/components/room/LobbyView.tsx`

The new `LobbyView` is the JSX body of today's `LobbyPage`, with these changes:
- Drop `useParams` and `useEffect(loadRoom)` — accepts `roomId` and `roomState` as props.
- Drop the `roomState?.status === 'started'` redirect effect entirely (RoomPage handles dispatch in place).
- Drop the early-return guards (`!id`, `!roomState`) — the parent guarantees both are present.
- Pass `url={buildJoinUrl(roomId)}` to `<RoomQRCode/>` so the QR points at the player route.
- Use `useGame` only for `startTheGame`.

- [ ] **Step 1: Create `src/components/room/LobbyView.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {
  PlayerSlotsGrid,
  RoomQRCode,
  FullscreenToggle,
  buildPlayerUrl,
  buildJoinUrl,
  type RoomState,
} from 'react-gameroom';
import type { ColorlitionPlayerData } from '../../game/types';
import { useGame } from '../../contexts/GameContext';

interface LobbyViewProps {
  roomId: string;
  roomState: RoomState<ColorlitionPlayerData>;
}

export function LobbyView({ roomId, roomState }: LobbyViewProps) {
  const { startTheGame } = useGame();

  const readyCount = roomState.players.filter((p) => p.status === 'ready').length;
  const canStart = readyCount >= roomState.config.minPlayers;

  return (
    <Stack spacing={3} sx={{ p: 4 }}>
      <Stack
        direction="row"
        spacing={3}
        sx={{
          alignItems: 'baseline',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'rule.ink',
        }}
      >
        <Stack direction="row" spacing={4} sx={{ alignItems: 'baseline' }}>
          <Typography variant="h1">Color-lition</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Room
            </Typography>
            <Typography
              variant="h2"
              sx={{ letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1" }}
            >
              {roomId}
            </Typography>
          </Stack>
        </Stack>
        <FullscreenToggle />
      </Stack>

      <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
        <RoomQRCode roomId={roomId} url={buildJoinUrl(roomId)} />
        <Stack spacing={1}>
          <Typography variant="h6">Players</Typography>
          <PlayerSlotsGrid
            players={roomState.players}
            buildSlotHref={(slotId) => buildPlayerUrl(roomId, slotId)}
          />
        </Stack>
      </Stack>

      <Button
        variant="contained"
        onClick={() => startTheGame().catch(console.error)}
        disabled={!canStart}
      >
        Start Game ({readyCount}/{roomState.config.maxPlayers})
      </Button>
    </Stack>
  );
}
```

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean. (LobbyPage.tsx still exists and still works for now — it imports the same MUI/react-gameroom symbols. We delete it in Task 8.)

- [ ] **Step 3: Commit**

```bash
git add src/components/room/LobbyView.tsx
git commit -m "feat(room): add LobbyView (props-driven extract of LobbyPage)"
```

---

## Task 4: Extract `BigScreenView` from `BigScreenPage`

**Files:**
- Create: `src/components/room/BigScreenView.tsx`

The new `BigScreenView` is the JSX body of today's `BigScreenPage`, with these changes:
- Drop `useParams` and `useEffect(loadRoom)` — accepts `roomId` as a prop.
- Use `useGame` only for `gameState` and `roomState` (still needed for the in-game state). Actually, since RoomPage already has `roomState`, we accept it as a prop too — but `gameState` is still pulled via `useGame()` because RoomPage didn't fetch it explicitly (it's auto-set by the same Firebase subscription).
- Drop the early-return guards on `roomState` (parent guarantees it). Keep the `!gameState` guard — `gameState` can legitimately be null until the first game write lands after `startTheGame`.

- [ ] **Step 1: Create `src/components/room/BigScreenView.tsx`**

Read the current body of `src/pages/BigScreenPage.tsx` for the JSX; the wrapper changes are minimal. Concretely:

```tsx
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FullscreenToggle, type RoomState } from 'react-gameroom';
import { useGame } from '../../contexts/GameContext';
import { VoterSegments } from '../big-screen/VoterSegments';
import { ExitPollReveal } from '../big-screen/ExitPollReveal';
import { DrawCardReveal } from '../big-screen/DrawCardReveal';
import { HeadlineTicker } from '../big-screen/HeadlineTicker';
import { Leaderboard } from '../big-screen/Leaderboard';
import { WinnerScreen } from '../big-screen/WinnerScreen';
import { ScoreChart } from '../big-screen/ScoreChart';
import { Logo } from '../shared/Logo';
import { PALETTE, PLAYER_LINE_PALETTE } from '../../theme/colors';
import type { ColorlitionPlayerData } from '../../game/types';

interface BigScreenViewProps {
  roomId: string;
  roomState: RoomState<ColorlitionPlayerData>;
}

export function BigScreenView({ roomId: _roomId, roomState }: BigScreenViewProps) {
  const { gameState } = useGame();
  const [exitPollRevealing, setExitPollRevealing] = useState(false);
  const [drawRevealing, setDrawRevealing] = useState(false);
  const handleExitPollRevealingChange = useCallback(
    (v: boolean) => setExitPollRevealing(v),
    [],
  );
  const handleDrawRevealingChange = useCallback(
    (v: boolean) => setDrawRevealing(v),
    [],
  );

  if (!gameState) return <Typography>Loading game…</Typography>;

  // ... copy the rest of the body verbatim from src/pages/BigScreenPage.tsx
  //     starting at the line after `if (!gameState || !roomState)` and continuing
  //     through the closing `</Stack>` and `}`.
}
```

**Important:** the body below `if (!gameState)` should be copied **verbatim** from `src/pages/BigScreenPage.tsx` (line ~38 onward — the `currentPlayerId`, `currentPlayer`, `nameFor`, `colorFor`, `rows`, and the returned `<Stack>` JSX). Do not modify any of that logic — only the wrapper imports/props/early-return change.

- `_roomId` is prefixed with `_` because the current BigScreenPage body doesn't actually use the room id (only `roomState` and `gameState`). Keep the prop in the interface for symmetry with `LobbyView` and so RoomPage can pass it without conditional logic. If lint complains about unused param, remove the underscore-prefix dance and just drop the `roomId` prop from the interface — there's no rule against asymmetry here.

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean. (BigScreenPage.tsx still exists — deleted in Task 8.)

- [ ] **Step 3: Commit**

```bash
git add src/components/room/BigScreenView.tsx
git commit -m "feat(room): add BigScreenView (props-driven extract of BigScreenPage)"
```

---

## Task 5: Create `RoomPage`

**Files:**
- Create: `src/pages/RoomPage.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useGame } from '../contexts/GameContext';
import { LobbyView } from '../components/room/LobbyView';
import { BigScreenView } from '../components/room/BigScreenView';
import { RoomNotFound } from '../components/shared/RoomNotFound';

export default function RoomPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { roomState, loading, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRoom(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSubscribed(true);
  }, [id, loadRoom]);

  if (!hasSubscribed || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roomState) return <RoomNotFound roomId={id} />;

  if (roomState.status === 'lobby') {
    return <LobbyView roomId={id} roomState={roomState} />;
  }

  return <BigScreenView roomId={id} roomState={roomState} />;
}
```

The `eslint-disable-next-line react-hooks/set-state-in-effect` is the same exemption used at `krimi/src/pages/PlayerJoin.tsx:45-46` — `hasSubscribed` can't be derived from render-time values because both `roomState` and `loading` start at `null`/`false` before the first snapshot.

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean.

- [ ] **Step 3: Commit**

```bash
git add src/pages/RoomPage.tsx
git commit -m "feat(room): add unified RoomPage (lobby + big-screen by status)"
```

---

## Task 6: Create `PlayerJoinPage`

**Files:**
- Create: `src/pages/PlayerJoinPage.tsx`

This page contains the page-level dispatch and two inline view subcomponents (`NicknameJoinView`, `RejoinView`). Inline because they're tightly coupled to the page's data flow (room state from `useGame`, the join handler) and aren't reused elsewhere.

- [ ] **Step 1: Create the page**

```tsx
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import {
  PlayerSlotsGrid,
  buildPlayerUrl,
  type RoomState,
} from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { RoomNotFound } from '../components/shared/RoomNotFound';
import type { ColorlitionPlayerData } from '../game/types';

export default function PlayerJoinPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { roomState, loading, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRoom(id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSubscribed(true);
  }, [id, loadRoom]);

  if (!hasSubscribed || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roomState) return <RoomNotFound roomId={id} />;

  if (roomState.status !== 'lobby') {
    return <RejoinView roomId={id} roomState={roomState} />;
  }

  return <NicknameJoinView roomId={id} />;
}

function NicknameJoinView({ roomId }: { roomId: string }) {
  const navigate = useNavigate();
  const { joinRoom } = useGame();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed) {
        setError('Enter your name');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const slotId = await joinRoom(roomId, trimmed);
        navigate(`/room/${roomId}/player/${slotId}`, { replace: true });
      } catch (e) {
        setError((e as Error).message);
        setBusy(false);
      }
    },
    [joinRoom, name, navigate, roomId],
  );

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
      sx={{ p: 4, maxWidth: 480, minHeight: '100dvh', justifyContent: 'center' }}
    >
      <Stack spacing={1}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Room
        </Typography>
        <Typography variant="h2" sx={{ letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1" }}>
          {roomId}
        </Typography>
      </Stack>
      <Typography variant="h1">Join the coalition</Typography>
      <TextField
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        autoComplete="off"
        disabled={busy}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained" disabled={busy || !name.trim()} sx={{ alignSelf: 'flex-start', px: 4, py: 1.5 }}>
        {busy ? 'Joining…' : 'Join'}
      </Button>
    </Stack>
  );
}

interface RejoinViewProps {
  roomId: string;
  roomState: RoomState<ColorlitionPlayerData>;
}

function RejoinView({ roomId, roomState }: RejoinViewProps) {
  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 480, minHeight: '100dvh', justifyContent: 'center' }}>
      <Stack spacing={1}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Room
        </Typography>
        <Typography variant="h2" sx={{ letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1" }}>
          {roomId}
        </Typography>
      </Stack>
      <Typography variant="h1">Tap your name</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        The game has started. Choose your spot to rejoin.
      </Typography>
      <PlayerSlotsGrid
        players={roomState.players}
        filterEmpty
        buildSlotHref={(slotId) => buildPlayerUrl(roomId, slotId)}
      />
      <Button component={RouterLink} to="/" variant="text" sx={{ alignSelf: 'flex-start' }}>
        Back to home
      </Button>
    </Stack>
  );
}
```

Notes:
- `joinRoom` (in `GameContext`) already does `findFirstEmptySlot` + `joinPlayer` + Firebase write + returns the slot id (`src/contexts/GameContext.tsx:159-180`). We just call it with the trimmed name.
- `joinRoom` throws `'Room not found'`, `'Game has already started'`, `'Room is full'` — caught and shown inline. The `'Game has already started'` case is mostly defensive: by then this view should have switched to `RejoinView`, but a race between snapshot and submit is possible.
- `PlayerSlotsGrid` with `filterEmpty` shows only ready (joined) players, exactly what's needed for rejoin.

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PlayerJoinPage.tsx
git commit -m "feat(player): add PlayerJoinPage (auto-slot join + rejoin list)"
```

---

## Task 7: Update `App.tsx` route table

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the route definitions and lazy imports**

In `src/App.tsx`, the current lazy imports are:

```tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage'));
const LobbyPage = lazy(() => import('./pages/LobbyPage'));
const BigScreenPage = lazy(() => import('./pages/BigScreenPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
```

Replace with:

```tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const PlayerJoinPage = lazy(() => import('./pages/PlayerJoinPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
```

The current routes are:

```tsx
const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/how-to-play', element: <HowToPlayPage /> },
  { path: '/join', element: <JoinPage /> },
  { path: '/join/:id', element: <JoinPage /> },
  { path: '/room/:id', element: <LobbyPage /> },
  { path: '/room/:id/play', element: <BigScreenPage /> },
  { path: '/room/:id/player/:playerId', element: <PlayerPage /> },
];
```

Replace with:

```tsx
const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/how-to-play', element: <HowToPlayPage /> },
  { path: '/room/:id', element: <RoomPage /> },
  { path: '/room/:id/player', element: <PlayerJoinPage /> },
  { path: '/room/:id/player/:playerId', element: <PlayerPage /> },
];
```

Leave the dev-only `MockBigScreen` push and the wildcard `Navigate to="/" replace` push exactly as they are — those still work.

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean.

(Build will still pass with the old `LobbyPage.tsx`, `BigScreenPage.tsx`, `JoinPage.tsx` files present but unreferenced — TypeScript doesn't complain about unused modules. They're deleted in Task 8.)

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): switch to /room/:id + /room/:id/player routes"
```

---

## Task 8: Delete obsolete page files

**Files:**
- Delete: `src/pages/LobbyPage.tsx`
- Delete: `src/pages/BigScreenPage.tsx`
- Delete: `src/pages/JoinPage.tsx`

These three files are no longer referenced (Task 7 swapped the imports). Deleting them removes dead code.

- [ ] **Step 1: Delete the files**

```bash
rm src/pages/LobbyPage.tsx src/pages/BigScreenPage.tsx src/pages/JoinPage.tsx
```

- [ ] **Step 2: Lint + typecheck**

Run: `npm run lint && npm run build`
Expected: both pass clean.

If anything fails to build, it means something still imports from one of the deleted files. Grep for the imports:

```bash
grep -rn "pages/LobbyPage\|pages/BigScreenPage\|pages/JoinPage" src
```

— and resolve. (Expected: zero matches.)

- [ ] **Step 3: Commit**

```bash
git add -A src/pages
git commit -m "chore(pages): delete obsolete LobbyPage / BigScreenPage / JoinPage"
```

---

## Task 9: Browser smoke test

**Files:** none modified.

Manual verification of the full user flow described in the spec. The build/typecheck only catches type errors and unreferenced symbols — Firebase round-trips, navigation, and QR routing must be eyeballed.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: vite prints a local URL (e.g. `http://localhost:5173`) and a network URL.

- [ ] **Step 2: Host flow — create + lobby**

In a browser tab on the **local URL**:
1. Navigate to `/`. Tap **Create Game**. URL should change to `/room/<5-char-code>`.
2. The lobby renders: room code visible, QR code present, empty player slots, **Start Game** button disabled.

- [ ] **Step 3: QR target sanity check**

Right-click the QR's underlying `<svg>` and inspect — its `value` (or scan it with a phone) should be `<origin>/room/<code>/player`, **not** `<origin>/room/<code>`.

- [ ] **Step 4: Player flow — join (in another tab/device)**

In a second tab (or on a phone via the network URL):
1. Navigate to `/room/<code>/player`. Nickname form renders, "Join" disabled.
2. Type a name, submit. URL should change to `/room/<code>/player/<slotId>` and the PlayerPage renders.
3. Back in the host tab: the lobby's player slot grid now shows the new player as ready.

- [ ] **Step 5: Start the game — in-place transition**

In the host tab: tap **Start Game** (now enabled).
The same `/room/<code>` URL should re-render to the big-screen game view with no navigation. URL bar unchanged.

- [ ] **Step 6: Rejoin flow**

In the player tab: navigate manually to `/room/<code>/player`. The page should now show the **Tap your name** rejoin list (not the nickname form), with the player's slot tappable. Tap it → returns to `/room/<code>/player/<slotId>`.

- [ ] **Step 7: Room-not-found**

In any tab, navigate to `/room/ZZZZZ` (a code that doesn't exist). Expected: brief spinner, then **Room not found** error with the code shown in mono and a **Back to home** button. Click it — should return to `/`.

Then `/room/ZZZZZ/player` — same error treatment.

- [ ] **Step 8: Removed routes — verify wildcard fallback**

Navigate to `/join` and `/room/<real-code>/play`. Both should redirect to `/` (the wildcard `<Navigate to="/" replace />` at the end of the route table).

- [ ] **Step 9: Stop dev server, commit nothing**

No code changes in this task. If smoke uncovered an issue, file it and fix in a follow-up commit before declaring done.

---

## Self-review checklist (run after writing the plan)

- [x] Spec coverage:
  - Routes after = §"Routes (after)" — covered by Tasks 5, 6, 7.
  - RoomPage status-driven — Task 5.
  - PlayerJoinPage join + rejoin — Task 6.
  - RoomNotFound — Task 2.
  - QR wiring — Task 3 (`buildJoinUrl` in LobbyView).
  - Adjacent fix in GameContext — Task 1.
  - Out-of-scope items (PlayerPage internals, GameContext API surface, react-gameroom changes, i18n, theming) — not in plan, correct.
- [x] Placeholder scan: no "TBD" / "TODO" / "implement later" / vague-handler text. Task 4's "copy the rest of the body verbatim" is a copy directive with an exact line reference, not a placeholder.
- [x] Type consistency: `LobbyView`, `BigScreenView`, `RoomNotFound`, `PlayerJoinPage`, `RoomPage` — names used the same way across all tasks. `useGame()` return shape used the same way (`roomState`, `loading`, `loadRoom`, `gameState`, `joinRoom`, `startTheGame`).

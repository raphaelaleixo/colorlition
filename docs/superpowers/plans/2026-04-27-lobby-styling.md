# Lobby Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-04-27-lobby-styling-design.md`

**Goal:** Restyle the big-screen lobby to use `RoomHeader`, a typographic dateline, a QR-as-hero body with a candidate roster, and a fixed-bottom press-bar Start action — bringing the lobby in line with the rest of the app.

**Architecture:** Pure presentational refactor. Five new components in a new `src/components/lobby/` folder, plus a restructured `LobbyView.tsx` that becomes a thin layout shell. No game logic, no routing, no `react-gameroom` interaction beyond using existing exports (`RoomQRCode`, `FullscreenToggle`, `isLikelyMobileHost`, `PlayerSlot`).

**Tech Stack:** Vite + React 19 + TypeScript + MUI v9 + `react-gameroom` ^0.10. Theme uses Playfair Display (serif) + Source Sans 3 (sans), already wired in `src/theme/typography.ts`.

## Verification model

This repo has **no test framework** (no `test` script in `package.json`, no test files in `src/`). The user iterates visually after MVP per project history. Verification per task is therefore:

1. **Type/build check:** `npm run build` — TypeScript compile + Vite production build. Catches type errors and broken imports.
2. **Lint check:** `npm run lint` — ESLint, must pass clean.
3. **Visual check:** `npm run dev`, open `http://localhost:5173/`, create a room from the home page, eyeball the lobby. Resize the window to xs (≤600px) to spot-check phone layout.

If you discover behavior worth locking in with tests, raise it with the user — don't unilaterally introduce a test framework as part of this plan.

## Deviation from spec: copy strings

The spec says all user-facing strings live in `LobbyView.tsx` as a single source of truth. This plan keeps each component's copy inline within the component (`DATELINE` in `LobbyDateline`, `STATUS_LABEL` + "Awaiting candidate" in `CandidateCard`, "Candidates" in `CandidateRoster`, the launch label template in `LaunchCampaignBar`). Only the QR caption sits in `LobbyView` because it interpolates props.

Rationale: each component stays self-contained — easier to read, test, and reuse. The cost is that tuning copy (which the spec optimised for) means touching multiple files.

If you want to honor the spec strictly: lift each string into a `LOBBY_COPY` const at the top of `LobbyView.tsx` and thread them as props. Cheap follow-up, but flag now so you can decide.

## Pattern note: section headings

The spec says "use `Section`" for the heading rules, but `src/components/shared/Section.tsx` is a *paneled* container with paper-white background and padding — heavier than what the lobby needs. The actual pattern that matches the big-screen "Voter Segments" / "Leaderboard" headings is *inline* in `src/components/room/BigScreenView.tsx:159-164`:

```tsx
<Stack spacing={1}>
  <Typography variant="h4" sx={{ fontWeight: 900 }}>Voter Segments</Typography>
  <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
</Stack>
```

Use this inline pattern in the lobby (for the "CANDIDATES" heading and anywhere else a heading-with-rule is needed). Treat the spec's `Section` reference as pointing at the *visual* result, not the literal component.

## File structure

| Path | Status | Responsibility |
|---|---|---|
| `src/components/lobby/LobbyDateline.tsx` | create | Static front-page dateline string with overline + hairline rule |
| `src/components/lobby/CandidateCard.tsx` | create | One candidate slot — filled (name + status) or empty (dashed placeholder) |
| `src/components/lobby/CandidateRoster.tsx` | create | Maps `PlayerSlot[]` to `CandidateCard`s under a "CANDIDATES" heading |
| `src/components/lobby/LaunchCampaignBar.tsx` | create | Fixed-bottom press bar with the launch action + ready count |
| `src/components/room/LobbyView.tsx` | modify (full rewrite) | Thin layout shell: RoomHeader → dateline → QR + roster → press bar |

No other files change.

---

### Task 1: Replace lobby's inline header with `RoomHeader`

**Files:**
- Modify: `src/components/room/LobbyView.tsx`

The current `LobbyView` builds its own header inline (custom title, room code, `FullscreenToggle`). Replace it with the shared `RoomHeader` so the masthead matches every other page. Reuse the same slot shape `BigScreenView` uses (`src/components/room/BigScreenView.tsx:75-122`) so the room-code styling stays identical.

- [ ] **Step 1.1: Replace `LobbyView.tsx` with the version below**

```tsx
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
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
import { RoomHeader } from '../shared/RoomHeader';

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
      <RoomHeader
        slot={
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Room
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontWeight: 900, letterSpacing: '0.15em', fontFeatureSettings: "'tnum' 1, 'lnum' 1" }}
              >
                {roomId}
              </Typography>
            </Stack>
            <Box
              sx={{
                '& button': {
                  fontFamily: 'inherit',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'text.primary',
                  background: 'transparent',
                  border: '1px solid',
                  borderColor: 'rule.strong',
                  borderRadius: 0,
                  px: 1.5,
                  py: 0.75,
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease, color 120ms ease',
                  '&:hover': {
                    backgroundColor: 'text.primary',
                    color: 'background.default',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'text.primary',
                    outlineOffset: 2,
                  },
                },
              }}
            >
              <FullscreenToggle />
            </Box>
          </Stack>
        }
      />

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

- [ ] **Step 1.2: Build + lint**

Run: `npm run build && npm run lint`
Expected: both pass clean.

- [ ] **Step 1.3: Visual check**

Run: `npm run dev`, open `http://localhost:5173/`, click through to create a room. The lobby should now show the stacked Logo + Room/code/Fullscreen masthead instead of the old custom header. Body (QR + players + Start button) is temporarily unchanged — that comes in later tasks.

- [ ] **Step 1.4: Commit**

```bash
git add src/components/room/LobbyView.tsx
git commit -m "refactor(lobby): use RoomHeader; drop inline header"
```

---

### Task 2: Add `LobbyDateline` component and wire it in

**Files:**
- Create: `src/components/lobby/LobbyDateline.tsx`
- Modify: `src/components/room/LobbyView.tsx`

Add the front-page dateline (`CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING`) between the masthead and the body. Pure presentational. The string is a constant inside the component so the component is self-contained — `LobbyView` won't need to thread copy.

- [ ] **Step 2.1: Create `src/components/lobby/LobbyDateline.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const DATELINE = 'CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING';

export function LobbyDateline() {
  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {DATELINE}
      </Typography>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
    </Stack>
  );
}
```

- [ ] **Step 2.2: Add `LobbyDateline` to `LobbyView.tsx`**

In `src/components/room/LobbyView.tsx`, add the import:

```tsx
import { LobbyDateline } from '../lobby/LobbyDateline';
```

Insert `<LobbyDateline />` between the `<RoomHeader>` block and the body `<Stack direction="row">`. The outer `<Stack spacing={3}>` keeps everything spaced consistently.

- [ ] **Step 2.3: Build + lint**

Run: `npm run build && npm run lint`
Expected: both pass clean.

- [ ] **Step 2.4: Visual check**

Run: `npm run dev`, open the lobby. Below the masthead's hairline you should now see `CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING` in the all-caps overline style, with its own hairline rule below.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/lobby/LobbyDateline.tsx src/components/room/LobbyView.tsx
git commit -m "feat(lobby): add front-page dateline below masthead"
```

---

### Task 3: Build `CandidateCard` + `CandidateRoster`, swap `PlayerSlotsGrid` out

**Files:**
- Create: `src/components/lobby/CandidateCard.tsx`
- Create: `src/components/lobby/CandidateRoster.tsx`
- Modify: `src/components/room/LobbyView.tsx`

Replace the default-styled `PlayerSlotsGrid` with the journalism roster. Empty slots become dashed-outline placeholders that read `AWAITING CANDIDATE`. Filled slots show the player's name in Playfair with a `FILED` or `READY` overline status.

`PlayerStatus` from `react-gameroom` is exactly `"empty" | "joining" | "ready"` (verified in `node_modules/react-gameroom/dist/index.d.ts:5`). No other states to handle.

The roster includes a "CANDIDATES" heading using the inline heading-with-rule pattern (see "Pattern note" above).

- [ ] **Step 3.1: Create `src/components/lobby/CandidateCard.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PlayerSlot } from 'react-gameroom';

interface CandidateCardProps {
  player: PlayerSlot;
}

const STATUS_LABEL: Record<'joining' | 'ready', string> = {
  joining: 'FILED',
  ready: 'READY',
};

export function CandidateCard({ player }: CandidateCardProps) {
  if (player.status === 'empty') {
    return (
      <Stack
        sx={{
          p: 2,
          minHeight: 72,
          border: '1px dashed',
          borderColor: 'rule.hair',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Awaiting candidate
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={0.5}
      sx={{
        p: 2,
        minHeight: 72,
        border: '1px solid',
        borderColor: 'rule.strong',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {STATUS_LABEL[player.status]}
      </Typography>
      <Typography variant="h4">{player.name ?? `Candidate ${player.id}`}</Typography>
    </Stack>
  );
}
```

- [ ] **Step 3.2: Create `src/components/lobby/CandidateRoster.tsx`**

```tsx
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { PlayerSlot } from 'react-gameroom';
import { CandidateCard } from './CandidateCard';

interface CandidateRosterProps {
  players: readonly PlayerSlot[];
}

export function CandidateRoster({ players }: CandidateRosterProps) {
  return (
    <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Candidates</Typography>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
      </Stack>
      <Stack spacing={1}>
        {players.map((p) => (
          <CandidateCard key={p.id} player={p} />
        ))}
      </Stack>
    </Stack>
  );
}
```

- [ ] **Step 3.3: Wire `CandidateRoster` into `LobbyView.tsx`**

In `src/components/room/LobbyView.tsx`:

1. Remove the `PlayerSlotsGrid` and `buildPlayerUrl` imports from `react-gameroom` (`PlayerSlotsGrid` no longer used; `buildPlayerUrl` was only feeding it).
2. Add: `import { CandidateRoster } from '../lobby/CandidateRoster';`
3. Replace the entire `<Stack spacing={1}><Typography variant="h6">Players</Typography><PlayerSlotsGrid .../></Stack>` block with: `<CandidateRoster players={roomState.players} />`

The body `<Stack direction="row" spacing={4}>` still wraps `<RoomQRCode .../>` and `<CandidateRoster .../>` side-by-side for now — the QR/grid layout overhaul is Task 4.

- [ ] **Step 3.4: Build + lint**

Run: `npm run build && npm run lint`
Expected: both pass clean. (If lint complains about an unused `buildPlayerUrl`, remove its import — covered in Step 3.3.)

- [ ] **Step 3.5: Visual check**

Run: `npm run dev`, open the lobby. The "Players" heading is now "CANDIDATES" with the heavy-rule treatment that matches big-screen. Empty slots show as dashed-outline placeholders reading "AWAITING CANDIDATE". Open `/join` on a phone (or another browser tab pointed at `/room/<code>/player`) to fill a slot — the dashed card should turn into a solid-bordered card with the joiner's name in Playfair and `FILED` overline.

- [ ] **Step 3.6: Commit**

```bash
git add src/components/lobby/CandidateCard.tsx src/components/lobby/CandidateRoster.tsx src/components/room/LobbyView.tsx
git commit -m "feat(lobby): replace PlayerSlotsGrid with CandidateRoster"
```

---

### Task 4: Restructure body — QR as hero, side-by-side grid, QR caption

**Files:**
- Modify: `src/components/room/LobbyView.tsx`

Promote the QR to ~400px on lg / ~240px on xs, anchor it left of the roster on lg, stack roster below QR on xs. Add the caption beneath the QR.

- [ ] **Step 4.1: Update body layout in `LobbyView.tsx`**

Replace the current body block:

```tsx
<Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start' }}>
  <RoomQRCode roomId={roomId} url={buildJoinUrl(roomId)} />
  <CandidateRoster players={roomState.players} />
</Stack>
```

With this two-column grid that collapses to a single column on xs, and an inline `RoomQRCode` size that picks 400 on sm+ / 240 on xs:

```tsx
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'auto 1fr' },
    columnGap: 6,
    rowGap: 4,
    alignItems: 'start',
  }}
>
  <Stack spacing={1.5} sx={{ alignItems: { xs: 'center', lg: 'flex-start' } }}>
    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
      <RoomQRCode roomId={roomId} url={buildJoinUrl(roomId)} size={240} />
    </Box>
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <RoomQRCode roomId={roomId} url={buildJoinUrl(roomId)} size={400} />
    </Box>
    <Typography
      variant="caption"
      sx={{ color: 'text.secondary', textAlign: { xs: 'center', lg: 'left' }, fontStyle: 'normal' }}
    >
      Scan to join · or visit {window.location.origin}/join · room {roomId}
    </Typography>
  </Stack>
  <CandidateRoster players={roomState.players} />
</Box>
```

(`window.location.origin` is read inline, not memoised — the lobby is short-lived and the origin doesn't change.)

You'll need `import Box from '@mui/material/Box';` if the import isn't already present from earlier tasks.

- [ ] **Step 4.2: Build + lint**

Run: `npm run build && npm run lint`
Expected: both pass clean.

- [ ] **Step 4.3: Visual check**

Run: `npm run dev`, open the lobby on a wide window (≥1200px). The QR should be the left-side hero (~400px) with the caption directly beneath it; the roster sits to the right. Resize the window narrow (≤900px) — the layout collapses to a single column with the QR centered and the roster stacked below. Caption stays readable in both states.

- [ ] **Step 4.4: Commit**

```bash
git add src/components/room/LobbyView.tsx
git commit -m "feat(lobby): QR as hero in two-column grid, add caption"
```

---

### Task 5: Add `LaunchCampaignBar` (fixed-bottom press bar) and replace the Start button

**Files:**
- Create: `src/components/lobby/LaunchCampaignBar.tsx`
- Modify: `src/components/room/LobbyView.tsx`

Replace the MUI `Button` Start action with a full-width fixed-bottom bar reading `LAUNCH CAMPAIGN · X OF Y CANDIDATES READY →`. The bar mirrors the positioning pattern from `HeadlineTicker` in `BigScreenView`. It's hidden on phones via `react-gameroom`'s `isLikelyMobileHost` so only the host TV gets the action affordance. Page bottom padding is added so the fixed bar never covers content.

- [ ] **Step 5.1: Create `src/components/lobby/LaunchCampaignBar.tsx`**

```tsx
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { isLikelyMobileHost } from 'react-gameroom';

interface LaunchCampaignBarProps {
  readyCount: number;
  maxCount: number;
  canStart: boolean;
  onLaunch: () => void;
}

export function LaunchCampaignBar({
  readyCount,
  maxCount,
  canStart,
  onLaunch,
}: LaunchCampaignBarProps) {
  // Cached once per mount — useragent doesn't change inside a session and
  // we want to avoid re-running the sniff on every render.
  const isPhone = useMemo(() => isLikelyMobileHost(), []);
  if (isPhone) return null;

  const label = `Launch Campaign · ${readyCount} of ${maxCount} candidates ready →`;

  return (
    <Box
      component="button"
      type="button"
      onClick={canStart ? onLaunch : undefined}
      disabled={!canStart}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        width: '100%',
        border: 'none',
        borderTop: '1px solid',
        borderColor: 'rule.strong',
        bgcolor: 'text.primary',
        color: 'background.default',
        py: 2.5,
        px: 3,
        textAlign: 'center',
        cursor: canStart ? 'pointer' : 'not-allowed',
        opacity: canStart ? 1 : 0.4,
        transition: 'opacity 160ms ease',
        '&:hover': canStart
          ? { opacity: 0.9 }
          : undefined,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'text.primary',
          outlineOffset: -4,
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
```

- [ ] **Step 5.2: Replace the Start button in `LobbyView.tsx`**

In `src/components/room/LobbyView.tsx`:

1. Remove the `Button` import: `import Button from '@mui/material/Button';`
2. Add: `import { LaunchCampaignBar } from '../lobby/LaunchCampaignBar';`
3. Replace the existing `<Button>` block at the bottom of the JSX:

```tsx
<Button
  variant="contained"
  onClick={() => startTheGame().catch(console.error)}
  disabled={!canStart}
>
  Start Game ({readyCount}/{roomState.config.maxPlayers})
</Button>
```

with:

```tsx
<LaunchCampaignBar
  readyCount={readyCount}
  maxCount={roomState.config.maxPlayers}
  canStart={canStart}
  onLaunch={() => startTheGame().catch(console.error)}
/>
```

4. Add bottom padding to the outer `<Stack spacing={3} sx={{ p: 4 }}>` so content above the fixed bar isn't covered. Change to:

```tsx
<Stack spacing={3} sx={{ p: 4, pb: '120px' }}>
```

(The bar is roughly `py: 2.5` × 2 + `~24px` text + `1px` border ≈ 96px tall; 120px provides comfortable clearance.)

- [ ] **Step 5.3: Build + lint**

Run: `npm run build && npm run lint`
Expected: both pass clean.

- [ ] **Step 5.4: Visual check (desktop)**

Run: `npm run dev`, open the lobby in a desktop browser. The bar should be pinned to the bottom of the viewport, reading `LAUNCH CAMPAIGN · 0 OF 5 CANDIDATES READY →` initially, dim and not clickable. Open `/join` in another tab and walk a player through join + ready — the count should update and the bar should brighten and become clickable once `readyCount >= minPlayers`. Click it: the game starts and the page transitions to `BigScreenView`.

- [ ] **Step 5.5: Visual check (mobile)**

Open the lobby in a phone-emulated browser tab (Chrome devtools → toggle device toolbar → iPhone). The bar should not render. The QR + roster should still be visible and stacked.

- [ ] **Step 5.6: Commit**

```bash
git add src/components/lobby/LaunchCampaignBar.tsx src/components/room/LobbyView.tsx
git commit -m "feat(lobby): replace Start button with fixed-bottom press bar"
```

---

## Final review

After Task 5, the lobby should be:
- Masthead via `RoomHeader` (matches every other page).
- Dateline below masthead (`CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING`).
- QR (~400px) and candidate roster side-by-side on lg, stacked on xs.
- Empty roster slots: dashed `AWAITING CANDIDATE` placeholders.
- Filled slots: name in Playfair, `FILED` / `READY` overline.
- Bottom-fixed `LaunchCampaignBar` on TV/desktop, hidden on phones.

If anything in the visual passes feels off, raise it before moving on rather than papering over with extra commits. Polish iterations belong in follow-up branches/passes.

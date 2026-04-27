# Home + Join Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four-element HomePage stub with an editorial-masthead Home that has personality (logo, tagline, CTAs, "What's at Stake" stat block, footer with credits) plus a parallel masthead `/join` page that handles two-action resume (as host / as player), pre-validated against Firebase.

**Architecture:** Four new presentational components (`Spectrum`, `Ludoratory`, `PageFooter`, `StakesGrid`) and one Firebase helper (`getRoomStatus`) compose into a redesigned `HomePage` and a new `JoinPage`. Layout reuses the project's existing "Modern Data Journalism" aesthetic — Playfair serif, Source Sans, paper cream, hair-rule dividers — already established in `HowToPlayPage`. No new design tokens. No animation logic (so no React-Compiler-aware lint pitfalls).

**Tech Stack:** React 19, MUI 9, react-router-dom 7, Firebase Realtime Database, `react-gameroom@0.10` (for `HostDeviceWarningModal` and `isLikelyMobileHost`). No test runner — verification is `npm run build` + `npm run lint` + manual browser smoke.

**Spec:** `docs/superpowers/specs/2026-04-27-home-join-redesign-design.md`

**Working tree:** Executes on `main` (consistent with prior session work).

---

## File Structure

**Create:**
- `src/components/shared/Spectrum.tsx` — 7-color full-bleed strip
- `src/components/shared/Ludoratory.tsx` — inline SVG mark
- `src/components/shared/PageFooter.tsx` — credits + license row
- `src/components/shared/StakesGrid.tsx` — "What's at Stake" stat block
- `src/utils/roomStatus.ts` — `getRoomStatus(code)` Firebase pre-validation helper
- `src/pages/JoinPage.tsx` — new masthead Join page

**Modify:**
- `src/pages/HomePage.tsx` — full rewrite into masthead layout
- `src/App.tsx` — add lazy `JoinPage` import + `/join` route

**Out of scope, flag only:**
- `src/pages/HowToPlayPage.tsx:53` says "2 to 5 players"; actual `MIN_PLAYERS = 3`. Pre-existing inconsistency. A one-line fix, but separate from this work — note in final smoke step.

---

## Task 1: `Spectrum` component

Pure presentational. Full-bleed horizontal strip of 7 hard-stop bloc colors. Used at the top of both Home and Join.

**Files:**
- Create: `src/components/shared/Spectrum.tsx`

- [ ] **Step 1: Write the file**

```tsx
import Box from '@mui/material/Box';
import type { ComponentProps } from 'react';
import { PALETTE } from '../../theme/colors';

const STRIP_COLORS = ['red', 'purple', 'green', 'blue', 'orange', 'yellow', 'grey'] as const;

interface SpectrumProps {
  height?: number;
  sx?: ComponentProps<typeof Box>['sx'];
}

export function Spectrum({ height = 6, sx }: SpectrumProps) {
  const stops = STRIP_COLORS.map((k, i) => {
    const start = (i / STRIP_COLORS.length) * 100;
    const end = ((i + 1) / STRIP_COLORS.length) * 100;
    return `${PALETTE[k]} ${start}%, ${PALETTE[k]} ${end}%`;
  }).join(', ');

  return (
    <Box
      role="presentation"
      sx={{
        height,
        background: `linear-gradient(90deg, ${stops})`,
        ...sx,
      }}
    />
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/shared/Spectrum.tsx --max-warnings 0
npm run build
```

Expected: clean (zero output from eslint, build succeeds).

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Spectrum.tsx
git commit -m "feat(shared): add Spectrum strip component"
```

---

## Task 2: `Ludoratory` component

Inline SVG mark using the path data from `react-unmatched/src/pages/HomePage.tsx:LudoratorySvg`. Inherits `currentColor`.

**Files:**
- Create: `src/components/shared/Ludoratory.tsx`

- [ ] **Step 1: Write the file**

```tsx
import Box from '@mui/material/Box';
import type { ComponentProps } from 'react';

interface LudoratoryProps {
  size?: number;
  sx?: ComponentProps<typeof Box>['sx'];
}

export function Ludoratory({ size = 24, sx }: LudoratoryProps) {
  return (
    <Box
      component="svg"
      role="img"
      aria-label="Ludoratory"
      width={(size * 39) / 49}
      height={size}
      viewBox="0 0 39 49"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={sx}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M38.3849 16.8356C38.0465 16.4765 37.2161 15.8751 36.5393 15.4977L28.6391 11.0933C27.9624 10.7158 27.4081 9.78967 27.4081 9.03433V2.79442H29.4033C30.1846 2.79442 30.8243 2.17714 30.8243 1.42279V1.37263C30.8243 0.617783 30.1846 0 29.4033 0H26.035C26.0262 0 26.0185 0.00148983 26.0108 0.00148983C26.003 0.00148983 25.9953 0 25.9871 0H25.9352C25.1536 0 24.5138 0.617783 24.5138 1.37263V7.42034C24.5138 8.17569 24.5138 9.41026 24.5138 10.1656V10.6488C24.5138 11.4032 25.0677 12.3293 25.7449 12.7068L33.644 17.1112C34.3212 17.4886 35.1518 18.0905 35.4902 18.4496C35.8286 18.8081 36.1057 20.4737 36.1057 21.2276V34.2556C36.1057 35.0105 35.9808 36.0057 35.8286 36.468C35.6764 36.9304 34.3212 37.9951 33.644 38.3725L21.961 44.8866C21.2842 45.264 20.3293 45.6568 19.8382 45.7606C19.3475 45.8644 17.7157 45.264 17.0385 44.8866L5.35551 38.3725C4.67823 37.9951 3.84821 37.3927 3.50931 37.0342C3.17094 36.6756 2.89426 35.0105 2.89426 34.2556V21.2276C2.89426 20.4737 3.01871 19.4775 3.17145 19.0152C3.32315 18.5528 4.67823 17.4881 5.35602 17.1112L13.1379 12.7723C13.8146 12.3944 14.3679 11.4682 14.3679 10.7144V10.2312C14.3679 9.47631 14.3679 8.24174 14.3679 7.48639V1.62987C14.3787 1.56233 14.386 1.49331 14.386 1.42328V1.37263C14.386 0.617783 13.7472 0 12.965 0H12.9471H12.8945H9.5961C8.81443 0 8.1752 0.617783 8.1752 1.37263V1.42328C8.1752 2.17763 8.81443 2.79492 9.5961 2.79492H11.4732V9.10038C11.4732 9.85522 10.9193 10.7819 10.242 11.1593L2.46125 15.4977C1.78449 15.8751 0.953953 16.4765 0.61557 16.8356C0.276672 17.1941 0 18.8598 0 19.6141V35.8686C0 36.6235 0.124451 37.6192 0.276672 38.082C0.428893 38.5439 1.78449 39.6091 2.46125 39.986L17.039 48.1131C17.7157 48.4905 18.6712 48.8853 19.1618 48.9881C19.653 49.0919 21.2842 48.4905 21.9615 48.1131L36.5398 39.986C37.2161 39.6086 38.0471 39.0062 38.3854 38.6477C38.7238 38.2896 39.0005 36.6235 39.0005 35.8686V19.6141C39 18.8598 38.7233 17.1941 38.3849 16.8356ZM18.2691 27.0076L6.26987 20.3178C5.5931 19.9404 5.03873 20.2493 5.03873 21.0036V34.3838C5.03873 35.1381 5.5931 36.0638 6.26987 36.4422L18.2691 43.1326C18.9459 43.51 20.0536 43.51 20.7303 43.1326L32.7301 36.4422C33.4059 36.0643 33.9608 35.1386 33.9608 34.3838V21.0036C33.9608 20.2493 33.4064 19.9404 32.7301 20.3178L20.7309 27.0076C20.0536 27.3851 18.9464 27.3851 18.2691 27.0076ZM8.68844 35.1039C7.97773 34.7091 7.40124 33.7585 7.40124 32.9823C7.40124 32.2056 7.97773 31.8968 8.68844 32.2926C9.39966 32.6879 9.97615 33.6379 9.97615 34.4151C9.97615 35.1913 9.39966 35.4997 8.68844 35.1039ZM15.7704 31.3108C15.0591 30.915 14.4826 29.9659 14.4826 29.1892C14.4826 28.4125 15.0591 28.1036 15.7704 28.499C16.481 28.8947 17.0575 29.8448 17.0575 30.6215C17.0575 31.3977 16.481 31.7061 15.7704 31.3108ZM29.8441 32.2921C30.5548 31.8963 31.1318 32.2052 31.1318 32.9818C31.1318 33.758 30.5548 34.7086 29.8441 35.1034C29.1334 35.4997 28.5569 35.1913 28.5569 34.4146C28.5569 33.6379 29.1334 32.6879 29.8441 32.2921ZM26.3034 30.3965C27.0141 30.0007 27.5906 30.3096 27.5906 31.0848C27.5906 31.8615 27.0141 32.8115 26.3034 33.2073C25.5922 33.6031 25.0157 33.2942 25.0157 32.5175C25.0162 31.7413 25.5927 30.7908 26.3034 30.3965ZM22.7628 28.499C23.474 28.1036 24.051 28.4125 24.051 29.1892C24.051 29.9654 23.474 30.915 22.7628 31.3108C22.052 31.7061 21.475 31.3977 21.475 30.622C21.475 29.8448 22.052 28.8947 22.7628 28.499ZM17.868 20.4737C18.6569 20.9142 19.924 20.9222 20.6974 20.4911C21.4714 20.0596 21.4585 19.3524 20.6697 18.9119C19.8802 18.4699 18.6132 18.4625 17.8397 18.894C17.0658 19.3246 17.0786 20.0327 17.868 20.4737Z"
        fill="currentColor"
      />
    </Box>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/shared/Ludoratory.tsx --max-warnings 0
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Ludoratory.tsx
git commit -m "feat(shared): add Ludoratory inline SVG mark"
```

---

## Task 3: `PageFooter` component

Credits + license row used at the bottom of `HomePage`. Depends on `Ludoratory`.

**Files:**
- Create: `src/components/shared/PageFooter.tsx`

- [ ] **Step 1: Write the file**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Ludoratory } from './Ludoratory';

export function PageFooter() {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'center', color: 'text.secondary', pt: 3, pb: 4 }}
    >
      <Ludoratory size={28} sx={{ flex: 'none', color: 'text.secondary' }} />
      <Stack spacing={0.25}>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          Made by{' '}
          <Link
            href="https://aleixo.me"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            Raphael Aleixo / Ludoratory
          </Link>
          .
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          Licensed under{' '}
          <Link
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            CC BY-NC-SA 4.0
          </Link>
          .
        </Typography>
      </Stack>
    </Stack>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/shared/PageFooter.tsx --max-warnings 0
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/PageFooter.tsx
git commit -m "feat(shared): add PageFooter (Ludoratory + credits + license)"
```

---

## Task 4: `StakesGrid` component

The "What's at Stake" data-journalism stat block. Self-contained — deletable as one file + a small block in `HomePage` if it doesn't land.

**Files:**
- Create: `src/components/shared/StakesGrid.tsx`

- [ ] **Step 1: Write the file**

```tsx
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const STATS: ReadonlyArray<{ value: string; label: string; caption: string }> = [
  { value: '3–5', label: 'Players',     caption: 'One Voter Segment per player.' },
  { value: '88',  label: 'Cards',       caption: '63 Blocs, 10 Allies, 3 Undecideds, 1 Exit Poll.' },
  { value: '7',   label: 'Voter blocs', caption: 'Industrial Belt to Periphery.' },
  { value: '3',   label: 'Coalition',   caption: 'Top three colors score; the rest subtract.' },
];

export function StakesGrid() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
        columnGap: { xs: 3, sm: 4 },
        rowGap: { xs: 3, sm: 0 },
      }}
    >
      {STATS.map((s) => (
        <Stack key={s.label} spacing={0.5}>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: 44, sm: 56 }, lineHeight: 1, fontWeight: 700 }}
          >
            {s.value}
          </Typography>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {s.label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            {s.caption}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/shared/StakesGrid.tsx --max-warnings 0
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/StakesGrid.tsx
git commit -m "feat(shared): add StakesGrid (What's at Stake stat block)"
```

---

## Task 5: `getRoomStatus` Firebase helper

Async helper that hits Firebase to check if a room exists and returns its status (or `null` if not found). Used by `JoinPage` to pre-validate before navigating.

**Files:**
- Create: `src/utils/roomStatus.ts`

- [ ] **Step 1: Verify the `src/utils/` directory exists** (might not — most utilities have lived in `src/game/` so far)

```bash
ls src/utils 2>&1
```

If the output is "No such file or directory", the next step's `Write` tool call creates the directory automatically. Proceed.

- [ ] **Step 2: Write the file**

```ts
import { ref, get } from 'firebase/database';
import { deserializeRoom, type RoomState, type RoomStatus } from 'react-gameroom';
import { database } from '../firebase';
import type { ColorlitionPlayerData } from '../game/types';

export async function getRoomStatus(roomId: string): Promise<RoomStatus | null> {
  const trimmed = roomId.trim().toUpperCase();
  if (!trimmed) return null;
  const snap = await get(ref(database, `rooms/${trimmed}/room`));
  const data = snap.val();
  if (!data) return null;
  try {
    return deserializeRoom<ColorlitionPlayerData>(data).status;
  } catch {
    return (data as RoomState<ColorlitionPlayerData>).status ?? null;
  }
}
```

The deserialize-with-fallback mirrors `GameContext.joinRoom` (`src/contexts/GameContext.tsx:165-170`) — older room records that pre-date the deserialize helper still parse correctly via the fallback.

- [ ] **Step 3: Verify**

```bash
npx eslint src/utils/roomStatus.ts --max-warnings 0
npm run build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/utils/roomStatus.ts
git commit -m "feat(utils): add getRoomStatus Firebase pre-validation helper"
```

---

## Task 6: `JoinPage`

Two-action resume page in the masthead idiom. Pre-validates the typed code via `getRoomStatus`. Resume-as-host gets the host-device modal on mobile.

**Files:**
- Create: `src/pages/JoinPage.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useCallback, useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { Spectrum } from '../components/shared/Spectrum';
import { getRoomStatus } from '../utils/roomStatus';

type SubmittingRole = 'host' | 'player' | null;

export default function JoinPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<SubmittingRole>(null);
  const [pendingHostCode, setPendingHostCode] = useState<string | null>(null);

  const trimmed = code.trim().toUpperCase();
  const disabled = submitting !== null || trimmed.length === 0;

  const resolveStatus = useCallback(
    async (role: SubmittingRole) => {
      setError(null);
      setSubmitting(role);
      const status = await getRoomStatus(trimmed);
      setSubmitting(null);
      if (status === null) {
        setError('Room not found. Check the code and try again.');
        return null;
      }
      return status;
    },
    [trimmed],
  );

  const handleResumeAsHost = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!trimmed) return;
      const status = await resolveStatus('host');
      if (status === null) return;
      if (isLikelyMobileHost()) {
        setPendingHostCode(trimmed);
        return;
      }
      navigate(`/room/${trimmed}`);
    },
    [trimmed, resolveStatus, navigate],
  );

  const handleResumeAsPlayer = useCallback(async () => {
    if (!trimmed) return;
    const status = await resolveStatus('player');
    if (status === null) return;
    navigate(`/room/${trimmed}/player`);
  }, [trimmed, resolveStatus, navigate]);

  return (
    <Box sx={{ p: { xs: 3, sm: 6 }, maxWidth: 560, mx: 'auto', minHeight: '100dvh' }}>
      <Spectrum sx={{ mx: { xs: -3, sm: -6 } }} />
      <Stack
        component="form"
        spacing={4}
        onSubmit={handleResumeAsHost}
        sx={{ pt: { xs: 4, sm: 6 } }}
      >
        <Stack spacing={1.5}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            variant="overline"
            sx={{ color: 'text.secondary' }}
          >
            ← Back
          </Link>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            The Newsdesk
          </Typography>
          <Typography variant="h1">Resume</Typography>
          <Divider sx={{ borderColor: 'rule.hair' }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Enter the room code your friends shared to jump back in.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          label="Room code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          fullWidth
          slotProps={{
            htmlInput: {
              autoCapitalize: 'characters',
              autoComplete: 'off',
              maxLength: 8,
              style: {
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontSize: '1.5rem',
              },
            },
          }}
        />

        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled}
            sx={{ px: 4, py: 1.5 }}
          >
            {submitting === 'host' ? 'Resuming…' : 'Resume as host'}
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={handleResumeAsPlayer}
            disabled={disabled}
            sx={{ color: 'text.secondary' }}
          >
            {submitting === 'player' ? 'Resuming…' : 'Resume as player →'}
          </Button>
        </Stack>
      </Stack>

      <HostDeviceWarningModal
        open={pendingHostCode !== null}
        onConfirm={() => {
          const c = pendingHostCode;
          setPendingHostCode(null);
          if (c) navigate(`/room/${c}`);
        }}
        onCancel={() => setPendingHostCode(null)}
        labels={{
          title: 'Heads up',
          body: "You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.",
          confirmLabel: 'Host anyway',
          cancelLabel: 'Cancel',
        }}
      />
    </Box>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx eslint src/pages/JoinPage.tsx --max-warnings 0
npm run build
```

Expected: clean. (`JoinPage` is not yet wired into App.tsx — that's Task 8 — so no runtime effect yet, just a type/build check.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/JoinPage.tsx
git commit -m "feat(join): add masthead JoinPage (resume as host / as player)"
```

---

## Task 7: Rewrite `HomePage`

Full rewrite into the editorial-masthead layout.

**Files:**
- Modify: `src/pages/HomePage.tsx` (full replace)

- [ ] **Step 1: Replace the file contents**

The current `src/pages/HomePage.tsx` is 44 lines (the four-element stub). Replace its entire contents with:

```tsx
import { useCallback, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { HostDeviceWarningModal, isLikelyMobileHost } from 'react-gameroom';
import { useGame } from '../contexts/GameContext';
import { Logo } from '../components/shared/Logo';
import { Spectrum } from '../components/shared/Spectrum';
import { StakesGrid } from '../components/shared/StakesGrid';
import { PageFooter } from '../components/shared/PageFooter';

export default function HomePage() {
  const { createRoom } = useGame();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [hostWarningOpen, setHostWarningOpen] = useState(false);

  const create = useCallback(async () => {
    setBusy(true);
    try {
      const roomId = await createRoom();
      navigate(`/room/${roomId}`);
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }, [createRoom, navigate]);

  const handleCreateClick = useCallback(() => {
    if (isLikelyMobileHost()) {
      setHostWarningOpen(true);
      return;
    }
    void create();
  }, [create]);

  return (
    <Box
      sx={{
        p: { xs: 3, sm: 6 },
        maxWidth: 760,
        mx: 'auto',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Spectrum sx={{ mx: { xs: -3, sm: -6 } }} />
      <Stack spacing={4} sx={{ flex: 1, pt: { xs: 4, sm: 6 } }}>
        <Stack spacing={3}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Issue 2026.04 · The Coalition Question
          </Typography>
          <Logo sx={{ fontSize: { xs: 64, sm: 96 }, lineHeight: 1 }} />
          <Divider sx={{ borderColor: 'rule.hair' }} />
          <Typography
            variant="h5"
            sx={{
              fontStyle: 'italic',
              fontWeight: 400,
              maxWidth: 520,
              color: 'text.primary',
            }}
          >
            <Box component="span" sx={{ fontWeight: 700 }}>
              Build a coalition. Mind the contradictions.
            </Box>{' '}
            A real-time card draft for 3 to 5 players, dressed up as 2026 politics.
          </Typography>
          <Box sx={{ pt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateClick}
              disabled={busy}
              sx={{ px: 4, py: 1.5 }}
            >
              {busy ? 'Creating…' : 'Create Game'}
            </Button>
          </Box>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Link
              component={RouterLink}
              to="/join"
              underline="hover"
              sx={{ color: 'text.secondary' }}
            >
              Join with code →
            </Link>
            <Link
              component={RouterLink}
              to="/how-to-play"
              underline="hover"
              sx={{ color: 'text.secondary' }}
            >
              How to play →
            </Link>
          </Stack>
        </Stack>

        {/* "What's at Stake" block — delete this Divider + Stack + Divider trio plus
            the StakesGrid import to remove the stat block from the page. */}
        <Divider sx={{ borderColor: 'rule.hair' }} />
        <Stack spacing={3}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            What's at Stake
          </Typography>
          <StakesGrid />
        </Stack>
        <Divider sx={{ borderColor: 'rule.hair' }} />

        <PageFooter />
      </Stack>

      <HostDeviceWarningModal
        open={hostWarningOpen}
        onConfirm={() => {
          setHostWarningOpen(false);
          void create();
        }}
        onCancel={() => setHostWarningOpen(false)}
        labels={{
          title: 'Heads up',
          body: "You're about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.",
          confirmLabel: 'Host anyway',
          cancelLabel: 'Cancel',
        }}
      />
    </Box>
  );
}
```

The inline comment on the "What's at Stake" block flags the deletion path. The user explicitly wanted "delete after if not good" to be one component file + a localized block.

- [ ] **Step 2: Verify**

```bash
npx eslint src/pages/HomePage.tsx --max-warnings 0
npm run build
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): redesign as editorial masthead with stakes grid + footer"
```

---

## Task 8: Wire `/join` route into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the lazy import**

In `src/App.tsx`, the current lazy imports section reads:

```tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const PlayerJoinPage = lazy(() => import('./pages/PlayerJoinPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
```

Add a `JoinPage` lazy import right after `HowToPlayPage`:

```tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const PlayerJoinPage = lazy(() => import('./pages/PlayerJoinPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
```

- [ ] **Step 2: Add the route**

The current `routes` array reads:

```tsx
const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/how-to-play', element: <HowToPlayPage /> },
  { path: '/room/:id', element: <RoomPage /> },
  { path: '/room/:id/player', element: <PlayerJoinPage /> },
  { path: '/room/:id/player/:playerId', element: <PlayerPage /> },
];
```

Insert the `/join` route after `/how-to-play` and before `/room/:id`:

```tsx
const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/how-to-play', element: <HowToPlayPage /> },
  { path: '/join', element: <JoinPage /> },
  { path: '/room/:id', element: <RoomPage /> },
  { path: '/room/:id/player', element: <PlayerJoinPage /> },
  { path: '/room/:id/player/:playerId', element: <PlayerPage /> },
];
```

Leave the dev-only `MockBigScreen` push and the wildcard `<Navigate to="/" replace />` push exactly as they are.

- [ ] **Step 3: Verify**

```bash
npx eslint src/App.tsx --max-warnings 0
npm run build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): wire /join route to JoinPage"
```

---

## Task 9: Final verification

After all eight implementation tasks, the project should still lint clean (the previous session drove it to 0/0; this work shouldn't regress that), build clean, and the user flows should work end-to-end.

**Files:** none modified.

- [ ] **Step 1: Full lint sweep**

```bash
npm run lint
```

Expected: `0 problems`. If any new errors surface, the cause is in this work — fix in a follow-up commit before declaring done.

- [ ] **Step 2: Full build**

```bash
npm run build
```

Expected: `tsc -b && vite build` both pass clean.

- [ ] **Step 3: Manual browser smoke**

Start the dev server (`npm run dev`) and walk through these flows. The user has explicitly authorized visual verification by them in prior tasks; the steps below are the canonical checklist:

1. **`/`** — Spectrum strip at the top, "ISSUE 2026.04 · THE COALITION QUESTION" overline, big italic Logo with random-color "color" span, hair-rule, italic Playfair deck (with first sentence bold: "Build a coalition. Mind the contradictions."), Create Game button, two text-links ("Join with code →" / "How to play →"), divider, "WHAT'S AT STAKE" overline, four stat columns (3–5 / 88 / 7 / 3) on desktop or 2×2 on mobile, divider, footer with Ludoratory mark + credits + license. Resize the window or use mobile devtools — stats reflow to 2×2, padding compresses.

2. **Reload the page a few times** — Logo's "color" span color changes on each load (it's randomized).

3. **Tap Create Game (desktop)** — navigates to `/room/<5-char>`, lobby renders. No host-device modal.

4. **Tap Create Game on mobile (Chrome devtools mobile preset, or a real phone)** — `HostDeviceWarningModal` opens. Tap Cancel: dismisses, no navigation. Reload, tap Create Game, tap Host anyway: proceeds to the lobby.

5. **From `/`, tap "Join with code →"** — navigates to `/join`. Page renders: Spectrum strip, "← Back" link, "THE NEWSDESK" overline, Resume h1, hair-rule, body copy, code input (auto-focus, characters auto-cap), Resume as host (primary), Resume as player → (text), no error visible.

6. **Type a fake code (e.g. "ZZZZZ") and tap Resume as host** — button text becomes "Resuming…", brief Firebase round-trip, error alert: "Room not found. Check the code and try again." Buttons re-enable.

7. **Type a real code (one created by Step 3) and tap Resume as host (desktop)** — navigates to `/room/<code>`, big-screen / lobby renders depending on the room's status.

8. **Type a real code and tap Resume as player** — navigates to `/room/<code>/player`. If the game hasn't started, nickname form. If started, rejoin list.

9. **Type a real code and tap Resume as host on mobile** — host-device modal appears. Cancel dismisses. Confirm proceeds to `/room/<code>`.

10. **Tap ← Back from `/join`** — returns to `/`.

11. **From `/`, tap "How to play →"** — `/how-to-play` renders (unchanged from prior work).

If anything regresses, the relevant task's commit reverts independently.

- [ ] **Step 4: Out-of-scope flag**

`src/pages/HowToPlayPage.tsx:53` reads "Color-lition is a real-time card-drafting game for 2 to 5 players, dressed up as 2026 coalition politics." This contradicts both `MIN_PLAYERS = 3` and the new HomePage deck copy ("3 to 5 players"). It is **out of scope** for this plan but is a one-line follow-up the user may want to bundle. Note in the final report; do not fix here unless explicitly asked.

- [ ] **Step 5: No commit for Task 9**

Verification only.

---

## Self-Review Checklist (after writing the plan)

**1. Spec coverage:**
- Spectrum (spec §`Spectrum.tsx`) — Task 1.
- Ludoratory (spec §`Ludoratory.tsx`) — Task 2.
- PageFooter (spec §`PageFooter.tsx`) — Task 3.
- StakesGrid (spec §`StakesGrid.tsx`) — Task 4.
- getRoomStatus (spec §`roomStatus.ts`) — Task 5.
- JoinPage (spec §Visual treatment / Join page + §Modified files / `JoinPage.tsx`) — Task 6.
- HomePage rewrite (spec §Visual treatment / Home page + §Modified files / `HomePage.tsx`) — Task 7.
- App.tsx route wiring (spec §Modified files / `App.tsx`) — Task 8.
- Manual smoke (spec §Verification) — Task 9.
- Out-of-scope flag for HowToPlayPage prose — Task 9 Step 4.

All spec sections covered.

**2. Placeholder scan:** No "TBD" / "TODO" / vague handler text. Every step shows the exact file content, exact diff, or exact command. The Task 9 Step 3 walkthrough is a manual checklist (not auto-runnable code), but is concrete enough to follow without judgment calls.

**3. Type consistency:** Component names (`Spectrum`, `Ludoratory`, `PageFooter`, `StakesGrid`, `Logo`), function names (`getRoomStatus`, `createRoom`, `useGame`), and import paths used identically across tasks. `RoomStatus` and `RoomState<ColorlitionPlayerData>` from `react-gameroom` used consistently. The `sx` prop typing (`ComponentProps<typeof Box>['sx']`) used the same way in `Spectrum.tsx` and `Ludoratory.tsx`.

# Lint Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drive `npm run lint` from 41 errors / 2 warnings to 0/0 by refactoring the cheap cases and adding justified `eslint-disable` comments where the flagged pattern is intentional.

**Architecture:** Two refactors (Logo's `Math.random` → `useState` lazy init, and extracting `RevealControlContext` to its own file) plus targeted `eslint-disable` comments with WHY explanations on render-time-transition-detection patterns that the React Compiler-aware lint rules flag. No animation behavior changes.

**Tech Stack:** React 19, `eslint-plugin-react-hooks@7` (the React-Compiler-aware version), TypeScript strict. No test runner — verification is `npm run lint` + `npm run build`.

**Spec:** `docs/superpowers/specs/2026-04-27-lint-cleanup-design.md`

**Working tree:** Executes on `main` (consistent with prior session work).

**Baseline before this plan (HEAD `33b45af`):** 41 errors, 2 warnings.

---

## File Structure

**Create:**
- `src/components/big-screen/revealControl.ts` — extracted `RevealControl` type + `RevealControlContext`

**Modify:**
- `src/components/shared/Logo.tsx` — refactor to `useState` lazy init
- `src/components/big-screen/VoterSegments.tsx` — drop local `RevealControl*` declarations, import from `./revealControl`, add file-header disable
- `src/components/big-screen/DrawCardReveal.tsx` — switch import to `./revealControl`, per-line disables
- `src/components/big-screen/ExitPollReveal.tsx` — switch import to `./revealControl`, per-line disables
- `src/components/big-screen/HeadlineTicker.tsx` — single per-line disable
- `src/components/big-screen/Leaderboard.tsx` — per-line disable on the `seenIds.current` read

---

## Task 1: Refactor `Logo.tsx`

`useMemo` with `Math.random` violates `react-hooks/purity`. Lazy `useState` initializer is the React-blessed escape hatch and runs the initializer exactly once on mount — same behavior.

**Files:**
- Modify: `src/components/shared/Logo.tsx`

- [ ] **Step 1: Apply the edit**

Current content (whole file):

```tsx
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { PALETTE } from '../../theme/colors';

const LOGO_COLOR_KEYS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

// Italic "color"-tinted logotype shared by the big screen and the player
// view. The "color" span hue is picked once per mount from the bloc palette
// so each device gets its own accent on load.
export function Logo({ variant = 'h1', sx }: { variant?: TypographyProps['variant']; sx?: TypographyProps['sx'] }) {
  const logoColor = useMemo(
    () =>
      PALETTE[
        LOGO_COLOR_KEYS[Math.floor(Math.random() * LOGO_COLOR_KEYS.length)]
      ],
    [],
  );
  return (
    <Typography
      variant={variant}
      sx={{ fontStyle: 'italic', fontWeight: 900, ...sx }}
    >
      <Box component="span" sx={{ color: logoColor }}>
        color
      </Box>
      lition
    </Typography>
  );
}
```

Replace with:

```tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { PALETTE } from '../../theme/colors';

const LOGO_COLOR_KEYS = [
  'red',
  'purple',
  'green',
  'blue',
  'orange',
  'yellow',
  'grey',
] as const;

// Italic "color"-tinted logotype shared by the big screen and the player
// view. The "color" span hue is picked once per mount from the bloc palette
// so each device gets its own accent on load.
export function Logo({ variant = 'h1', sx }: { variant?: TypographyProps['variant']; sx?: TypographyProps['sx'] }) {
  const [logoColor] = useState(
    () =>
      PALETTE[
        LOGO_COLOR_KEYS[Math.floor(Math.random() * LOGO_COLOR_KEYS.length)]
      ],
  );
  return (
    <Typography
      variant={variant}
      sx={{ fontStyle: 'italic', fontWeight: 900, ...sx }}
    >
      <Box component="span" sx={{ color: logoColor }}>
        color
      </Box>
      lition
    </Typography>
  );
}
```

Diff: `useMemo` import → `useState`. `useMemo(() => …, [])` → `useState(() => …)` destructured to `[logoColor]`.

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/shared/Logo.tsx --max-warnings 0
npm run build
```

Expected: zero output from eslint. Build passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Logo.tsx
git commit -m "refactor(logo): use useState lazy init instead of useMemo+Math.random"
```

---

## Task 2: Extract `RevealControl` to its own file

Removes the `react-refresh/only-export-components` warning and decouples the context from `VoterSegments.tsx` so the file becomes a single-component export.

**Files:**
- Create: `src/components/big-screen/revealControl.ts`
- Modify: `src/components/big-screen/VoterSegments.tsx` (lines around 1, 19-20)
- Modify: `src/components/big-screen/DrawCardReveal.tsx:4`
- Modify: `src/components/big-screen/ExitPollReveal.tsx:4`

- [ ] **Step 1: Create `src/components/big-screen/revealControl.ts`**

```ts
import { createContext } from 'react';

// Dev/mock helper for ExitPollReveal manual advance. The page-level medium-card
// reveal in BigScreenView handles the regular draw flow, so `advanceTick` only
// nudges the exit poll overlay through its centered phase.
export type RevealControl = { advanceTick: number };
export const RevealControlContext = createContext<RevealControl | null>(null);
```

(Note: comment text is updated to say `BigScreenView` — the previous comment in `VoterSegments.tsx` referred to `BigScreenPage`, which was deleted in the route restructure.)

- [ ] **Step 2: Strip the declarations from `VoterSegments.tsx`**

Open `src/components/big-screen/VoterSegments.tsx`. The current top of the file (around lines 1, 16-20) contains:

```tsx
import { /* … existing imports including createContext … */ } from 'react';
// …
// Dev/mock helper retained for ExitPollReveal manual advance. The page-level
// medium-card reveal in BigScreenPage now handles the regular draw flow, so
// `advanceTick` only nudges the exit poll overlay through its centered phase.
export type RevealControl = { advanceTick: number };
export const RevealControlContext = createContext<RevealControl | null>(null);
```

Make these edits:

a. **Remove `createContext` from the React imports** if it's no longer used elsewhere in the file. (Verify by grepping inside the file for `createContext` after the edit.)

b. **Delete lines containing the comment block + `RevealControl` type + `RevealControlContext` constant** (the 5-or-so lines shown above).

c. **Add an import** at the top of the file (next to the other relative imports):

```tsx
import { RevealControlContext } from './revealControl';
```

(`useContext(RevealControlContext)` lower in the file already exists and now resolves through the new import.)

- [ ] **Step 3: Update import in `DrawCardReveal.tsx`**

`src/components/big-screen/DrawCardReveal.tsx:4` currently reads:

```tsx
import { RevealControlContext } from './VoterSegments';
```

Change to:

```tsx
import { RevealControlContext } from './revealControl';
```

- [ ] **Step 4: Update import in `ExitPollReveal.tsx`**

`src/components/big-screen/ExitPollReveal.tsx:4` currently reads:

```tsx
import { RevealControlContext } from './VoterSegments';
```

Change to:

```tsx
import { RevealControlContext } from './revealControl';
```

- [ ] **Step 5: Verify**

```bash
grep -rn "from './VoterSegments'" src/components/big-screen
grep -rn "RevealControlContext\|RevealControl[^C]" src/components/big-screen
npm run build
```

Expected:
- First grep: ONLY `MockBigScreen` should still import `RevealControlContext` from `'../components/big-screen/VoterSegments'` — actually let me re-check: it imports it directly. Update if needed. (Run the grep yourself; if `MockBigScreen` still imports `RevealControlContext` from the old path, change that import to `'../components/big-screen/revealControl'` too, and include it in this commit.)
- Second grep: every `RevealControlContext` import should now come from `./revealControl` (or `'../components/big-screen/revealControl'` from `MockBigScreen`).
- `npm run build`: passes clean.

- [ ] **Step 6: Confirm the `react-refresh/only-export-components` warning is gone**

```bash
npx eslint src/components/big-screen/VoterSegments.tsx 2>&1 | grep -c "react-refresh/only-export-components"
```

Expected: `0`.

- [ ] **Step 7: Commit**

```bash
git add src/components/big-screen/revealControl.ts \
        src/components/big-screen/VoterSegments.tsx \
        src/components/big-screen/DrawCardReveal.tsx \
        src/components/big-screen/ExitPollReveal.tsx \
        src/pages/MockBigScreen.tsx
git commit -m "refactor(big-screen): extract RevealControl to its own file"
```

(If `MockBigScreen.tsx` didn't need an update, drop it from `git add`.)

---

## Task 3: File-header disable on `VoterSegments.tsx`

Now that `RevealControl*` is gone, `VoterSegments.tsx` is a pure component file. Add a file-header `eslint-disable` for `react-hooks/refs` with a clearly-documented WHY block. ~14 sites currently produce ~22 errors; one header silences them all.

**Files:**
- Modify: `src/components/big-screen/VoterSegments.tsx` (top of file)

- [ ] **Step 1: Add the file-header block**

At the very top of `src/components/big-screen/VoterSegments.tsx`, **before** the first import, add:

```tsx
/* eslint-disable react-hooks/refs --
 * SegmentRow detects unclaimed→claimed and claimed→unclaimed transitions during
 * render so the very first committed paint already includes the animated
 * overlay (no static-state flash). It also snapshots pre-claim cards into a ref
 * so the zoom-out animation can render the segment's frozen content while the
 * underlying state has already moved on.
 *
 * The render-time ref read/write pattern is intentional and load-bearing for
 * the no-flash animation behavior. Migrating to useEffect-based detection would
 * cause a visible one-frame flash on every claim. The risk window for this
 * pattern (discarded renders under Concurrent React, React Compiler) is not
 * relevant in this codebase today; revisit if either is adopted.
 */

import /* … existing first import line … */
```

(The `--` after the rule name is ESLint's syntax for a justification comment; the rest of the block is the WHY.)

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/big-screen/VoterSegments.tsx --max-warnings 0
npm run build
```

Expected: zero eslint output. Build passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/big-screen/VoterSegments.tsx
git commit -m "chore(voter-segments): justify render-time ref pattern with file-header eslint disable"
```

---

## Task 4: Per-line disables on `ExitPollReveal.tsx`

Three sites: lines 34 (read `prevDrawnRef.current`), 37 (write `prevDrawnRef.current`), 56 (`setPhase('departing')` in the manual-advance effect).

**Files:**
- Modify: `src/components/big-screen/ExitPollReveal.tsx` (lines 32-37, 53-58)

- [ ] **Step 1: Apply the edits**

Find this block (currently lines 32-37):

```tsx
  // Detect false→true transition during render so the overlay paints on the
  // very next commit.
  if (!prevDrawnRef.current && exitPollDrawn && phase === null) {
    setPhase('centered');
  }
  prevDrawnRef.current = exitPollDrawn;
```

Replace with:

```tsx
  // Detect false→true transition during render so the overlay paints on the
  // very next commit. Render-phase ref read/write is intentional — using
  // useEffect would cause a one-frame static flash before the centered
  // animation kicks in.
  // eslint-disable-next-line react-hooks/refs
  if (!prevDrawnRef.current && exitPollDrawn && phase === null) {
    setPhase('centered');
  }
  // eslint-disable-next-line react-hooks/refs
  prevDrawnRef.current = exitPollDrawn;
```

Find this block (currently lines 51-58):

```tsx
  // Manual-advance hook: when advanceTick changes during the centered phase,
  // kick the flow into departing.
  const advanceTick = revealControl?.advanceTick;
  useEffect(() => {
    if (advanceTick === undefined) return;
    if (phase === 'centered') setPhase('departing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTick]);
```

Replace with:

```tsx
  // Manual-advance hook (mock dev panel only): when advanceTick changes during
  // the centered phase, kick the flow into departing. The setState here IS the
  // effect's purpose.
  const advanceTick = revealControl?.advanceTick;
  useEffect(() => {
    if (advanceTick === undefined) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (phase === 'centered') setPhase('departing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTick]);
```

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/big-screen/ExitPollReveal.tsx --max-warnings 0
npm run build
```

Expected: zero eslint output. Build passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/big-screen/ExitPollReveal.tsx
git commit -m "chore(exit-poll-reveal): justify render-time transition detection + manual-advance setState"
```

---

## Task 5: Per-line disables + stale cleanup on `DrawCardReveal.tsx`

Two `set-state-in-effect` errors at lines 45 and 86. Plus one stale `eslint-disable-next-line react-hooks/exhaustive-deps` at line 89 reported as "Unused eslint-disable directive".

**Files:**
- Modify: `src/components/big-screen/DrawCardReveal.tsx` (lines around 39-50, 81-90)

- [ ] **Step 1: Apply the edits**

Find this block (currently lines 39-50):

```tsx
  // Start the reveal when a pending draw appears (and the exit poll overlay
  // isn't currently occupying the centered slot).
  useEffect(() => {
    if (reveal) return;
    if (!pendingDraw) return;
    if (exitPollRevealing) return;
    setReveal({
      card: pendingDraw.card,
      phase: 'centered',
      startedAt: Date.now(),
    });
  }, [pendingDraw, exitPollRevealing, reveal]);
```

Replace with:

```tsx
  // Start the reveal when a pending draw appears (and the exit poll overlay
  // isn't currently occupying the centered slot). Effect intentionally seeds
  // state in response to a prop change.
  useEffect(() => {
    if (reveal) return;
    if (!pendingDraw) return;
    if (exitPollRevealing) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal({
      card: pendingDraw.card,
      phase: 'centered',
      startedAt: Date.now(),
    });
  }, [pendingDraw, exitPollRevealing, reveal]);
```

Find this block (currently lines 81-90):

```tsx
  // Manual-advance hook (mock dev panel only): kick centered → departing on
  // tick changes, irrespective of pendingDraw clearing.
  const advanceTick = revealControl?.advanceTick;
  useEffect(() => {
    if (advanceTick === undefined) return;
    setReveal((prev) =>
      prev && prev.phase === 'centered' ? { ...prev, phase: 'departing' } : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTick]);
```

Replace with:

```tsx
  // Manual-advance hook (mock dev panel only): kick centered → departing on
  // tick changes, irrespective of pendingDraw clearing. The setState here IS
  // the effect's purpose.
  const advanceTick = revealControl?.advanceTick;
  useEffect(() => {
    if (advanceTick === undefined) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal((prev) =>
      prev && prev.phase === 'centered' ? { ...prev, phase: 'departing' } : prev,
    );
  }, [advanceTick]);
```

(Note: the previous `// eslint-disable-next-line react-hooks/exhaustive-deps` at the bottom of that effect is removed because lint reports it as unused. If after your edits lint surfaces an `exhaustive-deps` warning here, restore the comment — but the spec said to verify by removing first.)

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/big-screen/DrawCardReveal.tsx --max-warnings 0
npm run build
```

Expected: zero eslint output. Build passes. (If `react-hooks/exhaustive-deps` re-surfaces on the bottom effect, restore the disable comment immediately above the closing `}, [advanceTick]);` and re-verify.)

- [ ] **Step 3: Commit**

```bash
git add src/components/big-screen/DrawCardReveal.tsx
git commit -m "chore(draw-card-reveal): justify effect-driven setState + drop stale disable"
```

---

## Task 6: Single per-line disable on `HeadlineTicker.tsx`

One site: line 105, `setOpacity(0)` inside the fade-orchestration effect.

**Files:**
- Modify: `src/components/big-screen/HeadlineTicker.tsx` (lines 103-117)

- [ ] **Step 1: Apply the edit**

Find this block (currently lines 103-117):

```tsx
  useEffect(() => {
    if (desired === displayed) return;
    setOpacity(0);
    swapTimerRef.current = window.setTimeout(() => {
      setDisplayed(desired);
      setOpacity(1);
      swapTimerRef.current = null;
    }, FADE_MS);
    return () => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
    };
  }, [desired, displayed]);
```

Replace with:

```tsx
  // Headline fade animation: kick the fade-out, then swap text + fade back in
  // after FADE_MS. The setState IS the effect's purpose.
  useEffect(() => {
    if (desired === displayed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpacity(0);
    swapTimerRef.current = window.setTimeout(() => {
      setDisplayed(desired);
      setOpacity(1);
      swapTimerRef.current = null;
    }, FADE_MS);
    return () => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
    };
  }, [desired, displayed]);
```

(Only the immediate `setOpacity(0)` call is render-phase-relative-to-effect; the `setDisplayed` and `setOpacity(1)` inside `setTimeout` execute after the effect returns and are not flagged.)

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/big-screen/HeadlineTicker.tsx --max-warnings 0
npm run build
```

Expected: zero eslint output. Build passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/big-screen/HeadlineTicker.tsx
git commit -m "chore(headline-ticker): justify fade-kickoff setState in effect"
```

---

## Task 7: Per-line disable on `Leaderboard.tsx`

One site: line 41, `seenIds.current.has(c.id)` in the `useMemo` body. Two reported errors at the same line:col, one disable suppresses both.

**Files:**
- Modify: `src/components/big-screen/Leaderboard.tsx` (lines 38-46)

- [ ] **Step 1: Apply the edit**

Find this block (currently lines 38-46):

```tsx
  const seenIds = useRef<Set<string>>(new Set(visible.map((c) => c.id)));
  const newIds = useMemo(() => {
    const fresh = new Set<string>();
    for (const c of visible) if (!seenIds.current.has(c.id)) fresh.add(c.id);
    return fresh;
  }, [visible]);
  useEffect(() => {
    seenIds.current = new Set(visible.map((c) => c.id));
  });
```

Replace with:

```tsx
  const seenIds = useRef<Set<string>>(new Set(visible.map((c) => c.id)));
  // Track which card ids are new since the previous render to drive the
  // highlight animation. Reading the ref in useMemo is render-phase, but the
  // alternative (storing in state) would cause an extra re-render every time
  // `visible` changes, which is exactly what this ref pattern was chosen to
  // avoid.
  const newIds = useMemo(() => {
    const fresh = new Set<string>();
    // eslint-disable-next-line react-hooks/refs
    for (const c of visible) if (!seenIds.current.has(c.id)) fresh.add(c.id);
    return fresh;
  }, [visible]);
  useEffect(() => {
    seenIds.current = new Set(visible.map((c) => c.id));
  });
```

- [ ] **Step 2: Verify**

```bash
npx eslint src/components/big-screen/Leaderboard.tsx --max-warnings 0
npm run build
```

Expected: zero eslint output. Build passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/big-screen/Leaderboard.tsx
git commit -m "chore(leaderboard): justify render-phase ref read for new-card highlight"
```

---

## Task 8: Final verification

After all per-file commits, the whole project should lint clean.

**Files:** none modified.

- [ ] **Step 1: Run full lint**

```bash
npm run lint
```

Expected: `0 problems`. (Or, in lint's wording, no output and exit code 0.)

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: `tsc -b && vite build` both pass clean.

- [ ] **Step 3: Manual smoke (optional but recommended given no test coverage)**

The behavior-sensitive areas are the animations these patterns drive. Start the dev server (`npm run dev`), then in `/mock/big-screen/<any-id>`:

1. Watch the `<Logo>` accent — should be a random color from the palette on each reload (sanity check Task 1 didn't break the random pick).
2. Click "Draw & place (next turn)" → medium card overlay enters, holds, departs (DrawCardReveal animation intact).
3. Click "Draw exit poll" → centered exit-poll overlay enters, holds, departs (ExitPollReveal animation intact).
4. Click "Advance reveal" while exit poll is centered → it should depart immediately (manual-advance hook intact).
5. Click "Current player claims" → "Claimed by …" overlay slides in without static flash (VoterSegments transition detection intact).
6. Watch the leaderboard as bases grow — newly-arrived cards should still highlight (Leaderboard `newIds` intact).
7. Watch the headline ticker — change a phase to trigger a new headline; old fades out, new fades in (HeadlineTicker animation intact).

If any of these regress, the relevant task's commit can be reverted independently.

- [ ] **Step 4: No commit for Task 8**

This task is verification only.

---

## Self-Review Checklist (after writing the plan)

**1. Spec coverage:**
- Logo refactor (spec §`Logo.tsx`) — Task 1.
- `revealControl.ts` extraction (spec §`revealControl.ts` + §`VoterSegments.tsx` import update + downstream import updates) — Task 2.
- VoterSegments file-header disable (spec §`VoterSegments.tsx` second change) — Task 3.
- ExitPollReveal per-line disables (spec §`ExitPollReveal.tsx`) — Task 4.
- DrawCardReveal per-line disables + stale cleanup (spec §`DrawCardReveal.tsx`) — Task 5.
- HeadlineTicker per-line disable (spec §`HeadlineTicker.tsx`) — Task 6.
- Leaderboard per-line disable (spec §`Leaderboard.tsx`) — Task 7.
- Final verification (spec §Verification) — Task 8.

All spec sections covered.

**2. Placeholder scan:** No "TBD" / "TODO" / vague handler text. Every step shows the exact before/after code or the exact command. The `MockBigScreen.tsx` reference in Task 2 Step 5 is a verify-and-conditionally-include note, not a placeholder — it's an explicit instruction to grep first.

**3. Type consistency:** `RevealControl`, `RevealControlContext`, `useGame`, `roomState` — all used the same way across tasks. Import paths are consistent: `'./revealControl'` (within `big-screen/`) and `'../components/big-screen/revealControl'` (from `pages/MockBigScreen.tsx` if needed).

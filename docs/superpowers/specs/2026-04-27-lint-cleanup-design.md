# Lint cleanup: zero remaining `eslint-plugin-react-hooks@7` errors

**Date:** 2026-04-27
**Status:** Proposed
**Strategy:** Option A — refactor where cheap, justified `eslint-disable` where the pattern is intentional and load-bearing.

## Why

`eslint.config.js` enables `eslint-plugin-react-hooks@7` via `recommended`, which includes the React-Compiler-aware rules:

- `react-hooks/refs` — flags ref reads/mutations during render
- `react-hooks/purity` — flags impure calls during render (`Math.random` etc.)
- `react-hooks/set-state-in-effect` — flags synchronous `setState` inside `useEffect`

The codebase has 41 errors and 2 warnings (verified at HEAD `8a19951`, before any session work — and unchanged after it). All are in animation-heavy big-screen components plus `Logo`. They are pre-existing — none came from the route restructure.

The patterns these rules flag are **intentional** in this codebase. They detect transitions during render so the very first committed paint already includes the animation overlay (no static-state flash). Refactoring them to a `useEffect`-based equivalent risks visual regressions in tuned animations, and there is no test infrastructure to catch a regression.

The compromise: silence the rules where the pattern is intentional with a justified `eslint-disable` + WHY comment; refactor where the fix is genuinely cheap and behavior-preserving.

## Out of scope

- Adopting Concurrent React features (`useTransition`, `Suspense` around game state).
- Enabling `babel-plugin-react-compiler`.
- Any refactor of these files beyond what the lint cleanup requires.
- Loosening the eslint config — rules stay on so future code keeps getting checked.
- Migrating ref-during-render patterns to `useEffect`-based equivalents (that's option B; declined for the regression risk).

## Per-file treatment

### `src/components/shared/Logo.tsx` — refactor

Current:

```tsx
const logoColor = useMemo(
  () => PALETTE[LOGO_COLOR_KEYS[Math.floor(Math.random() * LOGO_COLOR_KEYS.length)]],
  [],
);
```

The `useMemo` with empty deps is being used as "compute once on mount". `Math.random()` is impure — flagged by `react-hooks/purity`. The intent ("pick a color once per mount") is exactly what `useState`'s lazy initializer is for:

```tsx
const [logoColor] = useState(() =>
  PALETTE[LOGO_COLOR_KEYS[Math.floor(Math.random() * LOGO_COLOR_KEYS.length)]],
);
```

Both forms run the initializer exactly once on mount. The new form satisfies the purity rule because lazy initializers are an explicitly allowed escape hatch for impure-during-init values. Drop the unused `useMemo` import.

**Impact:** -1 error. No behavior change.

### `src/components/big-screen/revealControl.ts` — new file

Extract from `VoterSegments.tsx:19-20`:

```ts
// Dev/mock helper for ExitPollReveal manual advance. The page-level medium-card
// reveal in BigScreenView now handles the regular draw flow, so `advanceTick`
// only nudges the exit poll overlay through its centered phase.
import { createContext } from 'react';

export type RevealControl = { advanceTick: number };
export const RevealControlContext = createContext<RevealControl | null>(null);
```

Update imports in:

- `src/components/big-screen/VoterSegments.tsx` — remove the local declarations + the `createContext` import
- `src/components/big-screen/DrawCardReveal.tsx:4` — change `from './VoterSegments'` to `from './revealControl'`
- `src/components/big-screen/ExitPollReveal.tsx:4` — same change

This isolates the context, removes the `react-refresh/only-export-components` warning, and lets `VoterSegments.tsx` go back to being a single-export component file.

**Impact:** -1 warning. No behavior change.

### `src/components/big-screen/VoterSegments.tsx` — file-header disable + extracted context

Two changes:

1. Remove the `RevealControl` and `RevealControlContext` declarations + the `createContext` import (now in `revealControl.ts`). Update the `useContext(RevealControlContext)` import to come from `./revealControl`.

2. Add a file-header block:

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
```

Reasoning for file-level (vs per-line): the file has ~30 ref accesses on this pattern across multiple methods. Per-line disables would be ~30 lines of comments — noisy and hard to scan. The file's identity *is* this pattern; one explicit acknowledgment at the top is more honest documentation.

**Impact:** -22 errors. No behavior change.

### `src/components/big-screen/ExitPollReveal.tsx` — per-line disables

Three sites:

**Lines 21, 34, 37 — `prevDrawnRef` read/write during render** for the false→true transition detection. Add WHY comment block above the pattern (lines 32-37) and per-line disables on the two render-phase usages.

```tsx
// Detect false→true transition during render so the overlay paints on the very
// next commit. Render-phase ref read/write is intentional — using useEffect
// would cause a one-frame static flash before the centered animation kicks in.
// eslint-disable-next-line react-hooks/refs
if (!prevDrawnRef.current && exitPollDrawn && phase === null) {
  setPhase('centered');
}
// eslint-disable-next-line react-hooks/refs
prevDrawnRef.current = exitPollDrawn;
```

**Line 56 — `setPhase('departing')` inside the `[advanceTick]` effect** for the manual-advance hook. The effect intentionally fires only when `advanceTick` changes (already has an `exhaustive-deps` disable). Add a `set-state-in-effect` disable + WHY:

```tsx
// Manual-advance hook (mock dev panel only): kick centered → departing on
// tick changes. The setState here IS the effect's purpose.
const advanceTick = revealControl?.advanceTick;
useEffect(() => {
  if (advanceTick === undefined) return;
  // eslint-disable-next-line react-hooks/set-state-in-effect
  if (phase === 'centered') setPhase('departing');
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [advanceTick]);
```

**Impact:** -3 errors (or however many line 34 actually contributes — it's reported multiple times for the same access in the lint output, but a single disable on that line covers all of them).

### `src/components/big-screen/DrawCardReveal.tsx` — per-line disables + stale-disable cleanup

Three sites + one cleanup:

**Lines 41-50 — `setReveal(...)` inside the start-of-reveal effect.** Effect-driven state machine reacting to `pendingDraw` arriving:

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

**Lines 56-69 — `setReveal(... phase: 'departing' ...)` inside the schedule-departure effect.** Same pattern — effect driving a state machine through phases, gated on `pendingDraw` clearing:

```tsx
// When the player places (pendingDraw clears) while we're still centered,
// schedule the exit. Effect-driven phase advance is intentional.
useEffect(() => {
  if (!reveal) return;
  if (reveal.phase !== 'centered') return;
  if (pendingDraw) return;
  if (departingScheduledRef.current) return;
  if (isManualReveal) return;
  // eslint-disable-next-line react-hooks/refs
  departingScheduledRef.current = true;
  const elapsed = Date.now() - reveal.startedAt;
  const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
  const t = setTimeout(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal((prev) => (prev ? { ...prev, phase: 'departing' } : null));
  }, remaining);
  return () => clearTimeout(t);
}, [reveal, pendingDraw, isManualReveal]);
```

Note: the `setReveal` inside `setTimeout` is technically scheduled outside the effect's render cycle. The `set-state-in-effect` rule may not actually flag it (timers escape the effect boundary). Verify with lint after applying — if not flagged, drop that disable.

**Lines 72-79 — `setReveal(null)` inside the departing→cleared effect.** Same pattern again:

```tsx
useEffect(() => {
  if (!reveal || reveal.phase !== 'departing') return;
  const t = setTimeout(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReveal(null);
    // eslint-disable-next-line react-hooks/refs
    departingScheduledRef.current = false;
  }, EXIT_MS);
  return () => clearTimeout(t);
}, [reveal]);
```

**Line 89 — stale `eslint-disable-next-line react-hooks/exhaustive-deps`.** Lint already reports this as an unused disable (the warning at the bottom of the lint output). Verify by removing it and re-running lint; if the underlying rule re-surfaces, restore. If not, leave removed.

**Impact:** -2 errors (the `set-state-in-effect` ones), -1 warning (the unused disable). Possibly more if the timer-scheduled setStates also count.

### `src/components/big-screen/HeadlineTicker.tsx` — per-line disable

**Line 105 — `setOpacity(0)` inside the headline-fade orchestration effect:**

```tsx
useEffect(() => {
  if (desired === displayed) return;
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setOpacity(0);
  swapTimerRef.current = window.setTimeout(() => {
    setDisplayed(desired);
    setOpacity(1);
    swapTimerRef.current = null;
  }, FADE_MS);
  // ...
}, [desired, displayed]);
```

WHY (one line above): "Headline fade animation: kick the fade-out, then swap text + fade back in after FADE_MS."

**Impact:** -1 error.

### `src/components/big-screen/Leaderboard.tsx` — per-line disables

**Lines 38-46 — `seenIds` ref read in `useMemo` + write in `useEffect`** to track which card ids weren't in the previous render (highlighted as new). Two render-phase reads (line 41) + one effect-phase write (line 45 — the effect-phase one isn't flagged, only the render-phase reads).

```tsx
const seenIds = useRef<Set<string>>(new Set(visible.map((c) => c.id)));
// Track which card ids are new since the previous render to drive the
// highlight animation. Reading the ref in useMemo is render-phase, but the
// alternative (storing in state) would cause an extra re-render every time
// `visible` changes, which is exactly what this ref pattern was chosen to avoid.
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

**Impact:** -2 errors.

## Verification

After all changes:

```bash
npm run lint
```

Expected: `0 problems`. (If any residual is surfaced, document it in the final commit message — but the design above accounts for all 41+2 originally reported.)

```bash
npm run build
```

Expected: clean.

**Behavior verification:** because no animation logic is altered (only ESLint comments + the Logo `useMemo`→`useState` rename + one context extraction), there should be no visible UI change. Recommended manual smoke after the full cleanup:

- Big screen during gameplay: claim a segment → "Claimed by …" overlay animates in without static flash.
- Big screen: exit poll triggers → centered overlay enters then departs, then segment-card reveal proceeds.
- Mock dev panel: "Advance reveal" still nudges the exit-poll overlay through its centered → departing transition.
- Leaderboard: a newly-arrived bloc on someone's base highlights briefly.
- Logo: each page reload picks a different (or same, with 1/7 chance) accent color.

## Rollback

Per-file commits. If any animation regression surfaces, the relevant commit reverts cleanly. The most likely regression vector is the `revealControl.ts` extraction (a wider blast radius — touches three files); commit it as its own task and verify the mock panel + ExitPollReveal still work before continuing.

## Implementation order

1. Logo.tsx — pure refactor, lowest risk, validates the workflow.
2. revealControl.ts extraction — touches 3 files atomically; commit before any per-file disable work to keep blast radius narrow.
3. VoterSegments.tsx — file-header disable (now that the context is gone, this file is just the segment rendering).
4. ExitPollReveal.tsx — per-line disables.
5. DrawCardReveal.tsx — per-line disables + stale-disable cleanup.
6. HeadlineTicker.tsx — single per-line disable.
7. Leaderboard.tsx — per-line disables.
8. Final lint + build verification.

This ordering puts the refactors first (lowest risk) and groups the comment-only changes by file. Each task is independently committable.

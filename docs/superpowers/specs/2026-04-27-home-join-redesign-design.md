# Home + Join page redesign — editorial masthead

**Date:** 2026-04-27
**Status:** Proposed
**Strategy:** Option B — editorial-masthead Home + parallel masthead Join, with a "What's at Stake" stat block below the fold on Home (kept isolated so it's a one-line delete if it doesn't land).

## Why

Today's `HomePage` is a four-element stub: title, blurb, "Create Game" button, "How to play" link. It has none of the personality of the other Ludoratory home pages (`krimi`, `react-unmatched`) — no tagline, no resume path, no credits, no host-device guard, no visual hook. The home is the front door; it should feel like the game and tell the user what's possible.

Both reference projects share the same content shape:

1. Logo / wordmark (visual centerpiece)
2. Tagline + descriptive sentence
3. Primary CTA: New game
4. Secondary CTAs: Resume game + How to play
5. Host-device warning modal for likely-mobile hosts
6. Footer with Ludoratory mark + credits + license link
7. A `/join` page with two actions (Resume as host / Resume as player), pre-validated against Firebase, with inline "Room not found" error

The "Modern Data Journalism" aesthetic the project has already committed to (paper cream, Playfair serif, Source Sans, hair-rules — see `HowToPlayPage`) gives us a clear translation: the **editorial masthead**. That's the design direction.

## Scope

In scope:
- Redesign `src/pages/HomePage.tsx`
- Re-introduce a `/join` page (deleted in the route restructure) that matches the krimi/unmatched two-action resume pattern
- New shared components: `Spectrum` (the 7-color strip), `Ludoratory` (inline SVG mark), `PageFooter` (credits row), `StakesGrid` (the "What's at Stake" stat block)
- New helper: `getRoomStatus(roomId)` for pre-validating a typed code against Firebase
- Add `/join` to the route table

Out of scope:
- i18n (colorlition has none today; copy stays English-only)
- Reconciling `HowToPlayPage`'s "2 to 5 players" copy with the actual `MIN_PLAYERS = 3` (separate fix; flag in plan but don't bundle)
- Any change to `BigScreenView`, `PlayerPage`, `RoomPage`, `PlayerJoinPage`
- Any new design tokens — everything reuses the existing theme (Playfair, Source Sans, paper cream, ink, hair/strong rules, bloc palette)

## Visual treatment

### Home page

```
┌───────────────────────────────────────────────────┐
│ [▮▮▮▮▮▮▮]  ← Spectrum strip: 7 bloc colors,        │
│             ~6px tall, full-bleed                  │
│                                                    │
│   ISSUE 2026.04 · THE COALITION QUESTION          │  ← overline
│                                                    │
│   color/lition                                     │  ← Logo (hero size)
│   ─────────────────                                │  ← rule.hair
│                                                    │
│   Build a coalition. Mind the contradictions.      │  ← Playfair italic deck
│   A real-time card draft for 3 to 5 players,      │     (display 1 line on
│   dressed up as 2026 politics.                    │      desktop, wraps on mobile)
│                                                    │
│   [  CREATE GAME  ]                                │  ← Button contained
│                                                    │
│   Join with code →   How to play →                 │  ← text links
│                                                    │
│   ─────────────────────────────────────            │  ← rule.hair
│                                                    │
│   WHAT'S AT STAKE                                  │  ← overline
│                                                    │
│   3–5         88          7           3            │  ← StakesGrid
│   PLAYERS    CARDS     VOTER BLOCS  COALITION      │     (giant Playfair
│                                                    │      numerals; small
│   one-line   one-line   one-line   one-line        │      caps caption + dim
│   caption    caption    caption    caption         │      caption underneath)
│                                                    │
│   ─────────────────────────────────────            │  ← rule.hair
│                                                    │
│   ▣  Made by Raphael Aleixo / Ludoratory.          │  ← PageFooter
│       Licensed under CC BY-NC-SA 4.0.              │
│                                                    │
└───────────────────────────────────────────────────┘
```

Layout details:

- **Container:** centered column, `maxWidth: 760` (matches `HowToPlayPage`), `mx: 'auto'`, padding `{ xs: 3, sm: 6 }`. Page background uses theme `background.default` (paper cream).
- **Spectrum strip:** full-bleed (`sx={{ mx: { xs: -3, sm: -6 } }}` to negate the container padding), 6px tall, equal-width segments, hard color stops. Order: red, purple, green, blue, orange, yellow, grey. Pure `<Box>` with a `linear-gradient` `background`.
- **Issue overline:** `Typography variant="overline"` with `color: 'text.secondary'`, top padding `pt: { xs: 4, sm: 6 }`.
- **Logo:** the existing `<Logo />` component (no API changes), sized via the `sx` prop: `{ fontSize: { xs: 64, sm: 96 }, lineHeight: 1 }`. Hero presence; the random-color "color" span continues to give each load its own accent.
- **Rule:** `<Divider sx={{ borderColor: 'rule.hair' }} />` (matches `HowToPlayPage`'s pattern).
- **Deck/subtitle:** `Typography variant="h5"` (Playfair, 18px) overridden to italic, regular weight, `maxWidth: 520` so it wraps for editorial rhythm. Two sentences; the first is the lede in slightly heavier weight (700) for the "tagline" effect, the second resumes regular weight.
- **Primary CTA:** `<Button variant="contained" color="primary">Create Game</Button>`. Same logic as today's HomePage (`useGame().createRoom()` → navigate). Plus host-device check — see below.
- **Secondary text links:** two `<Link component={RouterLink}>` inline, separated by a thin neutral pipe `·` or just gap. `Join with code →` (to `/join`) and `How to play →` (to `/how-to-play`). Underline-on-hover; `color: 'text.secondary'`. Matches the existing tertiary-link pattern.
- **"What's at Stake" overline + stat grid:** see `StakesGrid` below. Above the grid, a `Typography variant="overline"` reading `WHAT'S AT STAKE`.
- **Footer:** see `PageFooter` below. Bottom of the column, separated by a `rule.hair` divider.

### Join page

Same masthead idiom, narrower content:

```
┌───────────────────────────────────────────────────┐
│ [▮▮▮▮▮▮▮]   ← same Spectrum strip                  │
│                                                    │
│   ← Back                                           │  ← Link to "/"
│   THE NEWSDESK                                    │  ← overline
│   Resume                                           │  ← h1 (Playfair)
│   ─────────────────                                │
│                                                    │
│   Enter the room code your friends shared          │  ← body
│   to jump back in.                                 │
│                                                    │
│   [room code _____________]                        │  ← TextField, autoCap chars
│                                                    │
│   [  RESUME AS HOST  ]                             │  ← Button contained
│   Resume as player →                               │  ← text link button
│                                                    │
│   ⚠  Room not found. Check the code and try…      │  ← inline error (Alert/Typography
│                                                    │      severity error, when present)
│                                                    │
└───────────────────────────────────────────────────┘
```

No `WHAT'S AT STAKE` and no footer credits on Join (matches both krimi and react-unmatched conventions — credits live on Home only). The `<-Back` link and the spectrum strip are sufficient framing.

Behavior:
- Trim the input. Disabled state: `submitting !== null || trimmed.length === 0`.
- "Resume as host" submits the form: pre-validate via `getRoomStatus(trimmed)`. On `null` → set inline error. On non-null → if `isLikelyMobileHost()` open the host-device modal (deferred navigation); otherwise `navigate('/room/<code>')`.
- "Resume as player" button: pre-validate the same way. On non-null status → `navigate('/room/<code>/player')`. The `PlayerJoinPage` already dispatches between nickname-form (lobby) and rejoin-list (started) based on roomState, so no further branching needed here.
- Auto-focus the input. `autoCapitalize="characters"`, `autoComplete="off"`. Room codes are 5 uppercase chars.

## New components and helper

### `src/components/shared/Spectrum.tsx`

Stateless. Returns a thin horizontal strip of 7 hard-stop color blocks pulled from the bloc PALETTE. Default props give a 6px-tall full-bleed strip; props let it be sized differently if reused later.

```tsx
import Box from '@mui/material/Box';
import { PALETTE } from '../../theme/colors';
import type { ColorlitionPlayerData } from '../../game/types';

const STRIP_COLORS = ['red', 'purple', 'green', 'blue', 'orange', 'yellow', 'grey'] as const;

export function Spectrum({ height = 6, sx }: { height?: number; sx?: React.ComponentProps<typeof Box>['sx'] }) {
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

(Yes, `pivotStripes` in `theme/colors.ts` already does something similar for a stripe pattern — I'm not reusing it because that helper takes the actively-played bloc set, not a fixed full spectrum. A small purpose-specific component reads more clearly than parameterizing the existing helper.)

### `src/components/shared/Ludoratory.tsx`

Inline SVG mark (the path data is the same one already used in `react-unmatched/src/pages/HomePage.tsx:LudoratorySvg`). Sized via prop; defaults to 24px tall to fit footer scale. `currentColor` so it inherits text color.

```tsx
export function Ludoratory({ size = 24, sx }: { size?: number; sx?: React.ComponentProps<typeof Box>['sx'] }) {
  return (
    <Box component="svg"
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

### `src/components/shared/PageFooter.tsx`

Reusable bottom-of-column credits row. Used by Home only in this spec; isolated as a component because this is the right shape long-term and it's small enough not to overcommit.

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Ludoratory } from './Ludoratory';

export function PageFooter() {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', color: 'text.secondary', pt: 3, pb: 4 }}>
      <Ludoratory size={28} sx={{ flex: 'none', color: 'text.secondary' }} />
      <Stack spacing={0.25}>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          Made by{' '}
          <Link href="https://aleixo.me" target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit' }}>
            Raphael Aleixo / Ludoratory
          </Link>.
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
          </Link>.
        </Typography>
      </Stack>
    </Stack>
  );
}
```

### `src/components/shared/StakesGrid.tsx`

The "What's at Stake" data-journalism stat block. Four stats in a responsive grid (4 columns on desktop, 2×2 on mobile). Self-contained — if the user wants to remove it, delete this file and the `<StakesGrid />` line + its overline + the surrounding rule.

```tsx
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const STATS: ReadonlyArray<{ value: string; label: string; caption: string }> = [
  { value: '3–5',    label: 'Players',      caption: 'One Voter Segment per player.' },
  { value: '88',     label: 'Cards',        caption: '63 Blocs, 10 Allies, 3 Undecideds, 1 Exit Poll.' },
  { value: '7',      label: 'Voter blocs',  caption: 'Industrial Belt to Periphery.' },
  { value: '3',      label: 'Coalition',    caption: 'Top three colors score; the rest subtract.' },
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

The numbers are intentionally in Playfair (h1) — large editorial numerals. Captions are quiet text-secondary. The grid rhythm is the visual hook for the "data journalism" part of the language.

### `src/utils/roomStatus.ts`

Tiny helper that hits Firebase to check if a room exists and returns its status (or `null` if not found). Used by `JoinPage` to pre-validate before navigating.

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

Mirrors the pattern used by `GameContext.joinRoom` (`src/contexts/GameContext.tsx:159-180`) for the room read + deserialize + fallback.

## Modified files

### `src/pages/HomePage.tsx`

Full rewrite — the existing 4-element stub becomes the masthead layout described above. Imports the new components: `Spectrum`, `Logo` (existing), `StakesGrid`, `PageFooter`, plus `HostDeviceWarningModal` and `isLikelyMobileHost` from `react-gameroom`.

Behavior unchanged from today's HomePage on the primary CTA: call `createRoom()` from `useGame()` and navigate to `/room/<id>`. Wrapped now with the host-device check: if `isLikelyMobileHost()` returns true, open the modal first; on Confirm, proceed with create; on Cancel, dismiss. Same pattern as `krimi/src/pages/Home.tsx:30-35`.

Secondary text-links go to `/join` and `/how-to-play`.

### `src/pages/JoinPage.tsx`

New file (recreating the deleted `/join` page in the new pattern). Implements the two-action resume flow described above. The previous `JoinPage.tsx` (deleted in commit `5895954`) was a minimal name+code form that conflated "join" with "rejoin"; this new one is purely a resume entry point.

### `src/App.tsx`

Add lazy-loaded `JoinPage`:

```tsx
const JoinPage = lazy(() => import('./pages/JoinPage'));
```

And the route:

```tsx
{ path: '/join', element: <JoinPage /> },
```

Insert it after `/how-to-play` and before `/room/:id`.

## Verification

Per-task: `npm run build` and `npx eslint <file> --max-warnings 0` clean. After all tasks: `npm run lint` reports `0 problems` (the codebase was just driven to 0/0 by the lint cleanup; this work shouldn't regress that).

Manual smoke after the full implementation:

- Visit `/`. Spectrum strip, masthead overline, big italic Logo, deck, Create button, two text-links, divider, "What's at Stake" overline, four stats in a row (or 2×2 on mobile), divider, footer with Ludoratory mark + credits + license.
- Tap Create Game on a desktop browser → navigates to `/room/<5-char>`, lobby renders.
- Tap Create Game with the user-agent forced to mobile (or test on a phone) → host-device modal appears; Cancel dismisses; Confirm proceeds.
- Tap "Join with code →" → arrives at `/join` (masthead idiom; spectrum strip; Resume h1; code field; both buttons; back link).
- Type a real 5-char code and tap Resume as player → navigates to `/room/<code>/player`. If the game hasn't started, nickname form. If started, rejoin list.
- Type a real 5-char code and tap Resume as host on desktop → navigates to `/room/<code>` (lobby or big-screen depending on status).
- Type a real code and tap Resume as host on mobile → host-device modal.
- Type a fake code → inline "Room not found. Check the code and try again." Both buttons re-enable.
- Tap Back on Join → returns to `/`.
- Tap "How to play →" from Home → `/how-to-play`.

## Risks and mitigation

- **Visual mismatch between the Logo's randomized accent color and the Spectrum strip** — the Logo's "color" span hue is picked from the same 7-bloc palette the Spectrum displays, so it's always one of the strip's colors. That's a feature: the strip reads as the universe of possibilities; the Logo reads as today's pick.
- **The "WHAT'S AT STAKE" grid may feel like clutter** — explicit user concern ("delete after if not good"). Kept fully isolated as `StakesGrid.tsx` + a 5-line block in HomePage (overline, divider above, divider below, the component, the wrapping Stack item). Removal is a one-file-delete + one-block-delete revert.
- **`getRoomStatus` Firebase read is unauthenticated** — same as every other Firebase access in this app today (memory: "Firebase rules wide open"). No new attack surface. If/when rules tighten, this helper will need read access on `rooms/*/room`.
- **Host-device detection is a heuristic** — `isLikelyMobileHost()` from react-gameroom uses user-agent + viewport heuristics. False positives (laptop with narrow window) and false negatives (large tablet) are possible. The modal is dismissible, so the cost of a false positive is one extra tap. Same risk profile as krimi/unmatched accept.
- **`HowToPlayPage` says "2 to 5 players" but actual minimum is 3** — pre-existing bug, out of scope here. Worth a one-line follow-up commit; flag in the plan but don't bundle.
- **Deck copy uses "3 to 5 players" (corrected from the brainstorm draft)** — the brainstorm option #2 originally read "2 to 5 players" matching the (wrong) HowToPlayPage prose. Corrected to `3 to 5` for internal consistency with the StakesGrid `3–5` directly below it. The HowToPlayPage prose remains unchanged (out of scope), so the two pages will briefly disagree on player count until that follow-up lands.

## Implementation order

1. `Spectrum.tsx` — pure presentational, no deps. Validates the visual primitive before consumers exist.
2. `Ludoratory.tsx` — pure presentational, no deps.
3. `PageFooter.tsx` — depends on Ludoratory.
4. `StakesGrid.tsx` — pure presentational.
5. `roomStatus.ts` — utility, no UI dependencies.
6. `JoinPage.tsx` — depends on Spectrum + roomStatus + react-gameroom modal.
7. `HomePage.tsx` — depends on Spectrum + StakesGrid + PageFooter + react-gameroom modal.
8. `App.tsx` — wire the new `/join` route.
9. Manual smoke + final lint/build sweep.

This ordering builds the bottom of the dependency graph first; each step produces a passing build.

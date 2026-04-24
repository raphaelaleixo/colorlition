# Color-lition v3 — UI Theme & Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the "Modern Data Journalism" visual pass — Playfair + Source Sans typography, paper-cream palette, MUI theme with custom tokens, two-column Big Screen layout with no-scroll constraint, mobile parity with tight density, and one shared `<Section>` wrapper replacing the ad-hoc bordered panels.

**Architecture:** Build theme foundations first (fonts, palette, typography, components, module augmentation). Introduce one `<Section>` wrapper and retrofit existing segment/coalition/feed blocks onto it. Then restructure `BigScreenPage` into the masthead + two-column body + no-scroll frame, and `PlayerPage` into compact serif-on-cream. Home/Lobby/Join get typography only.

**Tech Stack:** Same as v1/v2 — Vite + React 19 + TS + MUI + Emotion. Two new runtime dependencies by reference (not package installs): Playfair Display + Source Sans 3 from Google Fonts CDN. No new npm packages.

**Spec:** `docs/superpowers/specs/2026-04-24-v3-ui-theme-design.md`

**Testing note:** v3 is a visual pass; no test suite. Manual verification at Task 13.

**Commit cadence:** One commit per task, per the established pattern.

---

## File structure (what lands on disk)

New:
```
src/theme/
  palette.ts
  typography.ts
  components.ts
  theme.ts
  augment.d.ts
src/components/shared/
  Section.tsx
```

Modified:
```
index.html                                      // add Google Fonts link
src/App.tsx                                     // swap createTheme({}) -> import theme
src/pages/BigScreenPage.tsx                     // masthead + two-column + no-scroll
src/pages/PlayerPage.tsx                        // masthead + turn indicator
src/pages/HomePage.tsx                          // typography
src/pages/LobbyPage.tsx                         // typography
src/pages/JoinPage.tsx                          // typography
src/components/big-screen/VoterSegments.tsx     // use <Section>
src/components/big-screen/PublicCoalitions.tsx  // use <Section>
src/components/big-screen/Leaderboard.tsx       // use <Section>
src/components/big-screen/HeadlineFeed.tsx      // use <Section>, scrollable body
src/components/big-screen/WinnerScreen.tsx      // use <Section>
src/components/big-screen/DrawPile.tsx          // reshape to compact numeral
src/components/shared/SegmentRow.tsx            // remove box border (Section owns framing)
src/components/mobile/SegmentsReadonly.tsx      // use <Section>
src/components/mobile/CoalitionBase.tsx         // use <Section>
src/components/mobile/TurnActions.tsx           // full-width stacked buttons + italic demand
src/components/mobile/WaitingView.tsx           // restyle borderless
```

---

## Task 1: Add Google Fonts to `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `<link>` tags to `<head>`**

Edit `/Users/raphaelavellar/Documents/Projects/colorlition/index.html`. Just before the existing `<title>` line, insert:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap"
      rel="stylesheet"
    />
```

The font request covers: Playfair Display regular/semibold/bold (each with italic), Source Sans 3 regular/semibold/bold (with italic for italic use). `display=swap` so rendering isn't blocked while fonts load.

- [ ] **Step 2: Verify dev server still boots**

```bash
cd /Users/raphaelavellar/Documents/Projects/colorlition
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
cd /Users/raphaelavellar/Documents/Projects/colorlition
git add index.html
git commit -m "chore(theme): add playfair display and source sans 3 via google fonts"
```

---

## Task 2: Create `src/theme/augment.d.ts` (TS module augmentation)

**Files:**
- Create: `src/theme/augment.d.ts`

Putting this first so subsequent files (palette, components) typecheck cleanly when they reference the custom palette keys.

- [ ] **Step 1: Create the file**

```ts
import '@mui/material/styles';
import '@mui/material/Button';

declare module '@mui/material/styles' {
  interface Palette {
    claim: Palette['primary'];
    rule: {
      hair: string;
      strong: string;
      ink: string;
    };
  }
  interface PaletteOptions {
    claim?: PaletteOptions['primary'];
    rule?: {
      hair: string;
      strong: string;
      ink: string;
    };
  }
}

// Allow <Button color="claim" /> usage.
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    claim: true;
  }
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0. (No consumers yet — just types.)

- [ ] **Step 3: Commit**

```bash
git add src/theme/augment.d.ts
git commit -m "feat(theme): augment mui types for claim + rule palette keys"
```

---

## Task 3: Create `src/theme/palette.ts`

**Files:**
- Create: `src/theme/palette.ts`

- [ ] **Step 1: Create the file**

```ts
// Paper-cream + ink palette for the Modern Data Journalism aesthetic.
// Built on MUI's built-in palette keys where they fit; adds `claim` and
// `rule` as custom keys (typed via src/theme/augment.d.ts).

import type { PaletteOptions } from '@mui/material/styles';

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1A1613',       // ink — Draw, Create Game, Start Game buttons
    dark: '#3B302A',       // hover
    contrastText: '#FAF8F3',
  },
  error: {
    main: '#8B1A1A',       // FINAL ROUND accent, error messages
  },
  background: {
    default: '#FAF8F3',    // page / paper cream
    paper: '#FFFFFF',      // panel / inner surface
  },
  text: {
    primary: '#1A1613',    // ink
    secondary: '#6B625A',  // muted warm grey
    disabled: '#B2A89C',
  },
  claim: {
    main: '#8B1A1A',
    contrastText: '#FFFFFF',
  },
  rule: {
    hair: '#E6DFD2',
    strong: '#C2B8A8',
    ink: '#1A1613',
  },
};
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0. If TS errors about `claim` / `rule` not in `PaletteOptions`, verify Task 2's `src/theme/augment.d.ts` exists and is picked up by the tsconfig (it should be; `tsconfig.app.json` includes `src`).

- [ ] **Step 3: Commit**

```bash
git add src/theme/palette.ts
git commit -m "feat(theme): add paper-cream and ink color palette"
```

---

## Task 4: Create `src/theme/typography.ts`

**Files:**
- Create: `src/theme/typography.ts`

- [ ] **Step 1: Create the file**

```ts
// Type scale from spec §1. Headlines are Playfair Display (serif),
// body/UI is Source Sans 3 (sans). Mobile scaling handled in
// src/theme/components.ts via MuiTypography breakpoint overrides.

import type { TypographyOptions } from '@mui/material/styles/createTypography';

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Source Sans 3", system-ui, sans-serif';

export const typography: TypographyOptions = {
  fontFamily: SANS,
  h1: { fontFamily: SERIF, fontWeight: 700, fontSize: 48, lineHeight: 1.15 },
  h2: { fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.15 },
  h3: { fontFamily: SERIF, fontWeight: 700, fontSize: 28, lineHeight: 1.2 },
  h4: { fontFamily: SERIF, fontWeight: 600, fontSize: 22, lineHeight: 1.25 },
  h5: { fontFamily: SERIF, fontWeight: 600, fontSize: 18, lineHeight: 1.3 },
  h6: {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    lineHeight: 1.4,
  },
  body1: { fontFamily: SANS, fontWeight: 400, fontSize: 16, lineHeight: 1.5 },
  body2: { fontFamily: SANS, fontWeight: 400, fontSize: 14, lineHeight: 1.5 },
  caption: {
    fontFamily: SANS,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 1.3,
  },
  overline: {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    lineHeight: 1.4,
  },
  button: {
    fontFamily: SANS,
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.02em',
  },
};

// Export the font stacks so other files (e.g. components.ts) can reference them.
export const FONT_SERIF = SERIF;
export const FONT_SANS = SANS;
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/theme/typography.ts
git commit -m "feat(theme): add playfair + source sans typography scale"
```

---

## Task 5: Create `src/theme/components.ts` (MUI component overrides)

**Files:**
- Create: `src/theme/components.ts`

- [ ] **Step 1: Create the file**

```ts
// MUI component overrides for the v3 theme. References palette tokens by
// string path ('primary.main', 'rule.hair', etc.) — resolved by MUI at
// runtime so no circular theme import.

import type { Components, Theme } from '@mui/material/styles';
import { FONT_SANS } from './typography';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#FAF8F3',
        color: '#1A1613',
        fontFamily: FONT_SANS,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      table: { fontFeatureSettings: "'tnum' 1" },
    },
  },

  MuiTypography: {
    styleOverrides: {
      root: ({ theme }) => ({
        [theme.breakpoints.down('sm')]: {
          // Single-override mobile down-scale per spec §1.
          '&.MuiTypography-h1': { fontSize: 32 },
          '&.MuiTypography-h2': { fontSize: 26 },
          '&.MuiTypography-h3': { fontSize: 22 },
          '&.MuiTypography-h4': { fontSize: 18 },
          '&.MuiTypography-h5': { fontSize: 16 },
          '&.MuiTypography-h6': { fontSize: 12 },
          '&.MuiTypography-body1': { fontSize: 14 },
          '&.MuiTypography-body2': { fontSize: 12 },
          '&.MuiTypography-caption': { fontSize: 11 },
          '&.MuiTypography-overline': { fontSize: 10 },
        },
      }),
    },
  },

  MuiChip: {
    defaultProps: { disableRipple: true },
    styleOverrides: {
      root: {
        borderRadius: 2,
        boxShadow: 'none',
        fontFamily: FONT_SANS,
        fontWeight: 600,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true, disableRipple: false },
    styleOverrides: {
      root: {
        borderRadius: 1,
        fontFamily: FONT_SANS,
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.02em',
      },
    },
    variants: [
      {
        props: { color: 'claim' },
        style: ({ theme }) => ({
          backgroundColor: theme.palette.claim.main,
          color: theme.palette.claim.contrastText,
          '&:hover': { backgroundColor: theme.palette.claim.main, opacity: 0.88 },
        }),
      },
    ],
  },

  MuiTextField: {
    defaultProps: { variant: 'outlined', size: 'small' },
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          '& fieldset': { borderColor: theme.palette.rule.strong },
        },
      }),
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.rule.hair}`,
      }),
      head: ({ theme }) => ({
        ...theme.typography.overline,
        color: theme.palette.text.secondary,
      }),
    },
  },
};
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/theme/components.ts
git commit -m "feat(theme): add mui component overrides for chips, buttons, typography, tables"
```

---

## Task 6: Assemble and wire the theme

**Files:**
- Create: `src/theme/theme.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/theme/theme.ts`**

```ts
import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

const theme = createTheme({
  palette,
  typography,
  components,
});

export default theme;
```

- [ ] **Step 2: Wire theme in `src/App.tsx`**

Replace the line:

```tsx
const theme = createTheme({});
```

with:

```tsx
import theme from './theme/theme';
```

And remove the now-unused `createTheme` import from `@mui/material/styles` if it's no longer used anywhere in the file. The `ThemeProvider` usage stays the same: `<ThemeProvider theme={theme}>`.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/theme/theme.ts src/App.tsx
git commit -m "feat(theme): assemble and wire v3 theme into app"
```

---

## Task 7: Create `<Section>` wrapper component

**Files:**
- Create: `src/components/shared/Section.tsx`

- [ ] **Step 1: Create the file**

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

type Props = {
  heading?: string;
  children: ReactNode;
  dense?: boolean;
  sx?: SxProps<Theme>;
};

// Shared panel used across big-screen and mobile. Renders an optional
// serif heading with a rule.hair underline, then the children inside a
// paper-white surface with airy (or dense) padding.
export function Section({ heading, children, dense = false, sx }: Props) {
  return (
    <Stack
      spacing={2}
      sx={[
        {
          p: dense ? 2 : 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'rule.hair',
        },
        ...(Array.isArray(sx) ? sx : [sx]).filter(Boolean),
      ]}
    >
      {heading && (
        <Stack spacing={1}>
          <Typography variant="h4">{heading}</Typography>
          <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
        </Stack>
      )}
      {children}
    </Stack>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0. (No consumers yet.)

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Section.tsx
git commit -m "feat(theme): add shared Section wrapper for paneled content"
```

---

## Task 8: Retrofit existing components to use `<Section>`

**Files:**
- Modify: `src/components/big-screen/VoterSegments.tsx`
- Modify: `src/components/big-screen/PublicCoalitions.tsx`
- Modify: `src/components/big-screen/Leaderboard.tsx`
- Modify: `src/components/big-screen/HeadlineFeed.tsx`
- Modify: `src/components/mobile/SegmentsReadonly.tsx`
- Modify: `src/components/mobile/CoalitionBase.tsx`
- Modify: `src/components/shared/SegmentRow.tsx`

This task replaces the ad-hoc `1px solid #ccc` box borders with the shared `<Section>` wrapper. Seven files, each a small edit.

- [ ] **Step 1: `SegmentRow.tsx` — drop its own border**

Replace `src/components/shared/SegmentRow.tsx` entirely with:

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
      spacing={2}
      sx={{
        alignItems: 'flex-start',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'rule.hair',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Typography variant="h5" sx={{ minWidth: 200, pt: 0.25 }}>
        {segment.label}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', flex: 1 }}>
        {segment.cards.map((c) => (
          <Card key={c.id} card={c} showDemand={showDemand} />
        ))}
      </Stack>
      {segment.claimedBy !== null && (
        <Typography variant="body2" sx={{ color: 'text.secondary', pt: 0.5 }}>
          claimed by #{segment.claimedBy}
        </Typography>
      )}
    </Stack>
  );
}
```

- [ ] **Step 2: `VoterSegments.tsx`**

Replace `src/components/big-screen/VoterSegments.tsx`:

```tsx
import { SegmentRow } from '../shared/SegmentRow';
import { Section } from '../shared/Section';
import type { Segment } from '../../game/types';

export function VoterSegments({ segments }: { segments: Segment[] }) {
  return (
    <Section heading="Voter Segments">
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Section>
  );
}
```

- [ ] **Step 3: `PublicCoalitions.tsx`**

Replace `src/components/big-screen/PublicCoalitions.tsx`:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { summarizeCoalition } from '../../game/summarize';
import { chipSxFor, type ChipKey } from '../../theme/colors';
import { labelFor, type LabelKey } from '../../game/data/demands';
import { Section } from '../shared/Section';
import type { Card as GameCard } from '../../game/types';

export type CoalitionRow = {
  playerId: string;
  name: string;
  base: GameCard[];
};

export function PublicCoalitions({ rows }: { rows: CoalitionRow[] }) {
  return (
    <Section heading="Coalitions">
      {rows.map((row) => {
        const summary = summarizeCoalition(row.base);
        return (
          <Stack
            key={row.playerId}
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'rule.hair',
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <Typography variant="h4" sx={{ minWidth: 160 }}>
              {row.name}
            </Typography>
            {summary.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                (empty)
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', flex: 1 }}>
              {summary.map((s) => (
                <Chip
                  key={s.label}
                  label={`${labelFor(s.label as LabelKey)} (${s.count})`}
                  sx={chipSxFor(s.label as ChipKey)}
                />
              ))}
            </Stack>
          </Stack>
        );
      })}
    </Section>
  );
}
```

- [ ] **Step 4: `Leaderboard.tsx`**

Replace `src/components/big-screen/Leaderboard.tsx`:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { projectedMandate } from '../../game/scoring';
import { Section } from '../shared/Section';
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
    <Section heading="Projected Mandate" dense>
      {scored.map((r, idx) => (
        <Stack
          key={r.playerId}
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'baseline',
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'rule.hair',
            '&:last-of-type': { borderBottom: 'none' },
          }}
        >
          <Typography variant="body1">
            {idx + 1}. {r.name}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontFeatureSettings: "'tnum' 1" }}
          >
            {r.total}
          </Typography>
        </Stack>
      ))}
    </Section>
  );
}
```

- [ ] **Step 5: `HeadlineFeed.tsx`**

Replace `src/components/big-screen/HeadlineFeed.tsx`:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Section } from '../shared/Section';
import type { Headline } from '../../game/types';

export function HeadlineFeed({ headlines }: { headlines: Headline[] }) {
  const newestFirst = headlines.slice().reverse();
  return (
    <Section heading="Headlines" dense sx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {newestFirst.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No headlines yet.
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Stack spacing={1}>
            {newestFirst.map((h, i) => (
              <Typography
                key={h.id}
                variant="h5"
                sx={{
                  color: i === 0 ? 'text.primary' : 'text.secondary',
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'rule.hair',
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                {h.text}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Section>
  );
}
```

- [ ] **Step 6: `SegmentsReadonly.tsx`**

Replace `src/components/mobile/SegmentsReadonly.tsx`:

```tsx
import { SegmentRow } from '../shared/SegmentRow';
import { Section } from '../shared/Section';
import type { Segment } from '../../game/types';

export function SegmentsReadonly({ segments }: { segments: Segment[] }) {
  return (
    <Section heading="Voter Segments" dense>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Section>
  );
}
```

- [ ] **Step 7: `CoalitionBase.tsx`**

Replace `src/components/mobile/CoalitionBase.tsx`:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { summarizeCoalition } from '../../game/summarize';
import { chipSxFor, type ChipKey } from '../../theme/colors';
import { labelFor, type LabelKey } from '../../game/data/demands';
import { Section } from '../shared/Section';
import type { Card as GameCard } from '../../game/types';

export function CoalitionBase({ base }: { base: GameCard[] }) {
  const rows = summarizeCoalition(base);
  return (
    <Section heading="Your Coalition" dense>
      {rows.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          (empty)
        </Typography>
      )}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {rows.map((r) => (
          <Chip
            key={r.label}
            label={`${labelFor(r.label as LabelKey)} (${r.count})`}
            sx={chipSxFor(r.label as ChipKey)}
          />
        ))}
      </Stack>
    </Section>
  );
}
```

- [ ] **Step 8: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 9: Commit**

```bash
git add src/components/big-screen/VoterSegments.tsx src/components/big-screen/PublicCoalitions.tsx src/components/big-screen/Leaderboard.tsx src/components/big-screen/HeadlineFeed.tsx src/components/shared/SegmentRow.tsx src/components/mobile/SegmentsReadonly.tsx src/components/mobile/CoalitionBase.tsx
git commit -m "feat(theme): retrofit paneled components to use shared Section wrapper"
```

---

## Task 9: BigScreenPage masthead

**Files:**
- Modify: `src/pages/BigScreenPage.tsx`
- Modify: `src/components/big-screen/DrawPile.tsx`
- Modify: `src/components/big-screen/WinnerScreen.tsx`

Reshape the masthead (logo + room code + meta strip) and tighten the DrawPile / WinnerScreen visuals. Layout (two-column body) comes in Task 10.

- [ ] **Step 1: Reshape `DrawPile.tsx`**

Replace `src/components/big-screen/DrawPile.tsx`:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function DrawPile({ remaining }: { remaining: number }) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'baseline', gap: 1.5, py: 1 }}
    >
      <Typography
        variant="h2"
        sx={{ fontFeatureSettings: "'tnum' 1", minWidth: 60 }}
      >
        {remaining}
      </Typography>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        cards remaining
      </Typography>
    </Stack>
  );
}
```

- [ ] **Step 2: Restyle `WinnerScreen.tsx` for paneled display**

Replace `src/components/big-screen/WinnerScreen.tsx`:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import type { ScoreBreakdown } from '../../game/types';
import { deriveVictoryTitle } from '../../game/titles';
import { labelFor } from '../../game/data/demands';
import { Section } from '../shared/Section';

export function WinnerScreen({
  breakdowns,
  winnerIds,
  nameFor,
}: {
  breakdowns: ScoreBreakdown[];
  winnerIds: string[];
  nameFor: (playerId: string) => string;
}) {
  return (
    <Section>
      <Stack spacing={3}>
        <Typography variant="h1">
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Positive blocs</TableCell>
              <TableCell align="right">Positive</TableCell>
              <TableCell>Negative blocs</TableCell>
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
                  <TableCell>{b.positiveColors.map(labelFor).join(', ') || '—'}</TableCell>
                  <TableCell align="right">{b.positive}</TableCell>
                  <TableCell>{b.negativeColors.map(labelFor).join(', ') || '—'}</TableCell>
                  <TableCell align="right">{b.negative}</TableCell>
                  <TableCell align="right">{b.grants}</TableCell>
                  <TableCell align="right">{b.total}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Stack>
    </Section>
  );
}
```

- [ ] **Step 3: Rebuild masthead in `BigScreenPage.tsx`**

Read `src/pages/BigScreenPage.tsx` first to see the current structure. The masthead is the `<Stack direction="row">` near the top that renders "Color-lition — Round N" and FullscreenToggle. Replace **only that masthead section** (not the body — that's Task 10) with this block. Leave everything else in the component intact for now.

Find the current masthead, for example:

```tsx
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
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
```

Replace that three-block region with:

```tsx
      <Stack
        direction="row"
        sx={{
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 3,
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
              {id}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Round {gameState.roundNumber}
          </Typography>
          {gameState.exitPollDrawn && (
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>
              FINAL ROUND
            </Typography>
          )}
          <FullscreenToggle />
        </Stack>
      </Stack>
      <Typography variant="h3">
        {gameState.phase === 'ended'
          ? 'Game over'
          : `${currentPlayer?.name ?? currentPlayerId}'s turn`}
      </Typography>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/big-screen/DrawPile.tsx src/components/big-screen/WinnerScreen.tsx src/pages/BigScreenPage.tsx
git commit -m "feat(big-screen): rebuild masthead with logo, room code, and meta strip"
```

---

## Task 10: BigScreenPage two-column body + no-scroll

**Files:**
- Modify: `src/pages/BigScreenPage.tsx`

Restructure the body into the two-column grid from spec §4. Masthead (from Task 9) stays. Layout uses CSS grid with `lg` breakpoint fallback to single-column.

- [ ] **Step 1: Replace the body + return block in BigScreenPage.tsx**

Read the current file. The goal is to wrap the entire component return in a flex container capped at `100vh`, then below the masthead (done in Task 9) have a grid with two columns.

Target structure:

```tsx
  return (
    <Stack
      spacing={2}
      sx={{ p: 4, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* masthead block from Task 9 — keep intact */}
      {/* turn indicator from Task 9 — keep intact */}

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          overflow: 'hidden',
        }}
      >
        <Stack spacing={2} sx={{ minHeight: 0, overflow: 'hidden' }}>
          <VoterSegments segments={gameState.segments} />
          <PublicCoalitions rows={rows} />
        </Stack>
        <Stack spacing={2} sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <DrawPile remaining={gameState.deck.length} />
          <Leaderboard rows={rows} />
          <HeadlineFeed headlines={gameState.headlines} />
        </Stack>
      </Box>

      {gameState.phase === 'ended' && gameState.scoreBreakdown && gameState.winnerIds && (
        <WinnerScreen
          breakdowns={gameState.scoreBreakdown}
          winnerIds={gameState.winnerIds}
          nameFor={(pid) =>
            roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`
          }
        />
      )}
    </Stack>
  );
```

Note: `Box` needs to be added to the imports. Near the existing MUI imports add:

```tsx
import Box from '@mui/material/Box';
```

The old page scroll is now replaced by the `height: '100vh'; overflow: 'hidden'` outer frame plus the HeadlineFeed's internal `overflow-y: auto` (set in Task 8 step 5).

Below `lg` breakpoint the grid collapses to single column automatically. Outer Stack still sets `height: 100vh; overflow: hidden`; on narrow screens where single-column may exceed viewport, change that fallback so page scrolls instead:

Add a `sx` media query override on the outer Stack:

```tsx
    <Stack
      spacing={2}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', lg: '100vh' },
        minHeight: '100vh',
        overflow: { xs: 'visible', lg: 'hidden' },
      }}
    >
```

This way small viewports page-scroll; large viewports lock height and rely on internal feed scroll.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/BigScreenPage.tsx
git commit -m "feat(big-screen): two-column layout with no-scroll at lg and above"
```

---

## Task 11: PlayerPage masthead and restyle

**Files:**
- Modify: `src/pages/PlayerPage.tsx`
- Modify: `src/components/mobile/WaitingView.tsx`

- [ ] **Step 1: Restyle `WaitingView.tsx`**

Replace `src/components/mobile/WaitingView.tsx`:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Section } from '../shared/Section';

export function WaitingView({ message }: { message: string }) {
  return (
    <Section dense>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {message}
      </Typography>
      <Stack />
    </Section>
  );
}
```

- [ ] **Step 2: Rewrite masthead and turn indicator in `PlayerPage.tsx`**

Read the current file. Targets: the opening of the return render blocks — places where the player name is shown as Typography h5.

The masthead is the part that currently renders `<Typography variant="h5">{myName}</Typography>`. Replace every instance of that line with the new masthead block:

```tsx
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'baseline',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'rule.hair',
        }}
      >
        <Typography variant="h5">Color-lition</Typography>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontFeatureSettings: "'tnum' 1",
          }}
        >
          {id} · Seat {playerId}
        </Typography>
      </Stack>
```

PlayerPage has three render paths (early-return branches):
1. The "Missing room or player id" branch — leave its plain Typography alone.
2. The "no gameState yet — waiting for host to start" branch — replace its `<Typography variant="h5">{myName}</Typography>` with the masthead block above.
3. The "empty slot — show name form" branch — leave that heading as-is (`<Typography variant="h5">Join Room {id}</Typography>` is fine).
4. The `gameState.phase === 'ended'` branch — replace its `<Typography variant="h5">{myName}</Typography>` with the masthead block.
5. The main in-game render — replace its `<Typography variant="h5">{myName}</Typography>` with the masthead block.

All three masthead-carrying branches get the same masthead.

Also: within the in-game branch, find the turn-indicator Typography that reads `"Your turn."` / `"Waiting for Alice…"` / `"Game over"` etc. Wrap it in a tighter styling:

```tsx
      <Typography
        variant="body1"
        sx={{
          fontWeight: isMyTurn ? 700 : 400,
          color: isMyTurn ? 'text.primary' : 'text.secondary',
        }}
      >
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
```

The outer Stack padding in PlayerPage should change from `p: 2` to `p: 2` with `spacing={2}` to `spacing={2.5}` for slightly better vertical rhythm.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PlayerPage.tsx src/components/mobile/WaitingView.tsx
git commit -m "feat(player): logo + room + seat masthead; restyle waiting and turn indicator"
```

---

## Task 12: `TurnActions` restyle — full-width stacked, italic demand

**Files:**
- Modify: `src/components/mobile/TurnActions.tsx`

- [ ] **Step 1: Replace `src/components/mobile/TurnActions.tsx`**

```tsx
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGame } from '../../contexts/GameContext';
import { canPlaceInSegment, canClaimSegment } from '../../game/actions';
import { DEMANDS } from '../../game/data/demands';
import { Card } from '../shared/Card';
import { Section } from '../shared/Section';
import type { ColorlitionGameState, Card as GameCard, SegmentKey } from '../../game/types';

type PendingDraw = { card: GameCard; exitPollTriggered: boolean };

function RuledDivider({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ flex: 1, borderTop: '1px solid', borderColor: 'rule.hair' }} />
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, borderTop: '1px solid', borderColor: 'rule.hair' }} />
    </Stack>
  );
}

export function TurnActions({ gameState }: { gameState: ColorlitionGameState }) {
  const { drawAndPlace, claim } = useGame();
  const [pending, setPending] = useState<PendingDraw | null>(null);
  const [busy, setBusy] = useState(false);

  const canDraw = gameState.deck.length > 0 && gameState.segments.some(canPlaceInSegment);

  const handleDraw = async () => {
    const first = gameState.deck[0];
    if (!first) return;
    if (first.kind === 'exitPoll') {
      const second = gameState.deck[1];
      if (!second) {
        setBusy(true);
        try {
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
      <Section dense>
        <Stack spacing={2}>
          {pending.exitPollTriggered && (
            <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 700 }}>
              Exit Poll triggered — FINAL ROUND
            </Typography>
          )}
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            You drew
          </Typography>
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Card card={pending.card} />
          </Box>
          {pending.card.kind === 'bloc' && (
            <Typography
              variant="body1"
              sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' }}
            >
              We want: "{DEMANDS[pending.card.color]?.[pending.card.value]}"
            </Typography>
          )}
          <RuledDivider label="place in" />
          <Stack spacing={1}>
            {gameState.segments.map((s) => (
              <Button
                key={s.key}
                variant="contained"
                color="primary"
                disabled={busy || !canPlaceInSegment(s)}
                onClick={() => handlePlace(s.key)}
                sx={{ py: 1.5 }}
              >
                {s.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Section>
    );
  }

  return (
    <Section dense>
      <Stack spacing={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDraw}
          disabled={busy || !canDraw}
          sx={{ py: 1.75 }}
        >
          Draw
        </Button>
        <RuledDivider label="or claim" />
        <Stack spacing={1}>
          {gameState.segments.map((s) => (
            <Button
              key={s.key}
              variant="contained"
              color="claim"
              disabled={busy || !canClaimSegment(s)}
              onClick={() => handleClaim(s.key)}
              sx={{ py: 1.5 }}
            >
              Claim {s.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0. If TypeScript complains that `color="claim"` isn't assignable, the augment.d.ts from Task 4 isn't being picked up — verify that file exists and is in the tsconfig includes.

- [ ] **Step 3: Commit**

```bash
git add src/components/mobile/TurnActions.tsx
git commit -m "feat(player): full-width stacked buttons, ruled dividers, playfair italic demand"
```

---

## Task 13: Home, Lobby, Join — typography pass

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/LobbyPage.tsx`
- Modify: `src/pages/JoinPage.tsx`

Typography only. No layout rework; buttons/text fields pick up the theme automatically.

- [ ] **Step 1: `HomePage.tsx`**

Replace `src/pages/HomePage.tsx`:

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
    <Stack spacing={4} sx={{ p: 6, alignItems: 'flex-start', maxWidth: 640 }}>
      <Typography variant="h1">Color-lition</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Create a new game. Players join by scanning the QR code on the next screen.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCreate} disabled={busy} sx={{ px: 4, py: 1.5 }}>
        {busy ? 'Creating…' : 'Create Game'}
      </Button>
    </Stack>
  );
}
```

- [ ] **Step 2: `LobbyPage.tsx`**

Read the current file first. The goal is only to upgrade the heading and button — keep the QR code + slot grid placement as-is.

Find this block:

```tsx
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Room {id}</Typography>
        <FullscreenToggle />
      </Stack>
```

Replace with:

```tsx
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
              {id}
            </Typography>
          </Stack>
        </Stack>
        <FullscreenToggle />
      </Stack>
```

And find:

```tsx
        <Stack spacing={1}>
          <Typography variant="h6">Players</Typography>
          <PlayerSlotsGrid
```

Leave the `Typography variant="h6">Players</Typography>` as-is (h6 renders as overline caps via the theme). The `<PlayerSlotsGrid>` is from react-gameroom; don't touch its internals.

- [ ] **Step 3: `JoinPage.tsx`**

Read the current file. Replace the `<Typography variant="h4">Join Game</Typography>` with:

```tsx
      <Typography variant="h2">Join Game</Typography>
```

Leave everything else unchanged. The TextField and Button pick up the new theme automatically.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/LobbyPage.tsx src/pages/JoinPage.tsx
git commit -m "feat(ui): typography pass on home, lobby, and join pages"
```

---

## Task 14: Manual end-to-end verification

**Files:** None.

- [ ] **Step 1: Run dev server**

```bash
cd /Users/raphaelavellar/Documents/Projects/colorlition
npm run dev
```

- [ ] **Step 2: Visit HomePage**

Visit `/`. Verify:
- Background is warm paper cream (not pure white).
- "Color-lition" is a large serif (Playfair Display) at 48px (or 32px on mobile).
- "Create Game" button is dark ink on cream, squared corners, no drop shadow.

- [ ] **Step 3: Verify Lobby (`/room/:id`)**

Click Create Game. Verify:
- Masthead has a thick ink line under it.
- "Color-lition" logo and "ROOM {id}" code sit on the same line, room code in wide-letter-spacing Playfair.
- Fullscreen toggle at right.
- QR code + slot grid + Start Game button render in their usual positions, but the button is flat dark-ink colored.

- [ ] **Step 4: Verify mobile (`/room/:id/player/:slotId`)**

Open a second tab at `/join/{id}`, enter a name, reach the PlayerPage. Verify:
- Masthead is one line: "COLOR-LITION" (small Playfair) + "{ROOM} · SEAT {N}" (overline caps, right aligned).
- "Your Coalition" heading is Playfair h4 with a thin rule underline.
- Chips in the Coalition show faction names, ordered by count desc.
- "Your turn" / "Waiting for X…" text reads correctly.
- Draw button is full-width ink; Claim buttons appear stacked full-width below a "— OR CLAIM —" ruled divider; they are crimson.

- [ ] **Step 5: Verify draw preview on mobile**

Click Draw. Verify:
- "YOU DREW" overline caps appears.
- Drawn chip appears large below.
- If the card is a bloc, `We want: "<demand>"` renders in italic Playfair (or Source Sans italic if Playfair italic looks broken at 11–13px — flag if it does).
- Placement buttons are stacked full-width, labeled with segment names in body1.

Place the card. Verify the segment updates on both mobile and Big Screen.

- [ ] **Step 6: Verify BigScreen in-game**

On the Big Screen tab (`/room/:id/play` after Start), verify:
- Masthead with logo, large ROOM code, small "Round N · FINAL ROUND (if applicable) · Fullscreen".
- Below, "<Name>'s turn" in Playfair h3.
- **Two-column body**. Left column (~2/3 width): Voter Segments and Coalitions stacked. Right column (~1/3): DrawPile big numeral, Projected Mandate table, Headlines feed.
- No page scrollbars at the viewport level.
- If the Headlines feed has many entries, it scrolls within its own panel (not the whole page).
- Demand captions render in italic small text below each placed chip.
- Segment rows separated by thin cream-grey rules (`rule.hair`), no heavy box borders.

- [ ] **Step 7: Verify end-of-game**

Play through to completion. When the winner screen appears:
- It replaces the body as a full-width paneled Section.
- The winner heading is Playfair h1 ("Alice, …the Green Syndicalist").
- Score table has tabular-figure alignment in number columns.

- [ ] **Step 8: Narrow-viewport fallback**

Resize the browser window below 1200px wide or open on a laptop ≤1200px. The two-column layout should collapse to single-column; page now scrolls vertically instead of locking to viewport height.

- [ ] **Step 9: Production build check**

```bash
cd /Users/raphaelavellar/Documents/Projects/colorlition
npm run build
```

Expected: exits 0.

- [ ] **Step 10: Fix any bugs that surfaced**

If any verification step fails, fix the responsible module and commit as `fix(ui): …`.

---

## End of v3

At completion: the game reads as a "Modern Data Journalism" broadcast — paper-cream surfaces, serif headlines, flat ink buttons, thin rules between sections, two-column Big Screen layout, mobile controller tight enough to feel compact but branded consistently.

Next candidates:
- Animations (v4) — card-place fade-in, headline ticker, turn-advance transition.
- Expand ironic dictionary content.
- `game/` test suite (scoring first).
- Reconnect UX, auth, locked Firebase rules.

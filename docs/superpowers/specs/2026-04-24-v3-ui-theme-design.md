# Color-lition v3 — UI Theme & Layout Design

**Date:** 2026-04-24
**Status:** Draft for review
**Scope:** Full "Modern Data Journalism" visual pass — typography, palette tokens, MUI theme, per-screen layouts. No animations, no new gameplay, no architecture changes.

**Prior art:** v1 (playable game loop) and v2 (narrative engine) shipped. Project memory `v1_complete.md` and `v2_complete.md` capture current behavior. The original v1 spec called for "Economist-style, minimalist, high-contrast, clean typography"; this spec delivers on that.

---

## 1. Typography

**Fonts:** Playfair Display (serif headlines) + Source Sans 3 (sans body/UI), both via Google Fonts `<link>` tags in `index.html`. Fallback: `Georgia, serif` and `system-ui, sans-serif`.

### MUI typography scale

| Variant | Font | Weight | Big Screen | Mobile | Used for |
|---|---|---|---|---|---|
| `h1` | Playfair | 700 | 48px | 32px | HomePage title, Winner heading |
| `h2` | Playfair | 700 | 36px | 26px | Big Screen masthead, room code |
| `h3` | Playfair | 700 | 28px | 22px | Turn indicator ("Alice's turn") |
| `h4` | Playfair | 600 | 22px | 18px | Section headings ("Voter Segments", "Coalitions") |
| `h5` | Playfair | 600 | 18px | 16px | Headline feed entries, segment names |
| `h6` | Source Sans | 600 | 14px caps + `0.1em` letter-spacing | 12px caps | Meta labels |
| `body1` | Source Sans | 400 | 16px | 14px | General UI text, segment labels |
| `body2` | Source Sans | 400 | 14px | 12px | Secondary text, fallback headlines |
| `caption` | Source Sans | 400 italic | 13px | 11px | Demand captions ("We want: …") |
| `overline` | Source Sans | 600 caps + `0.12em` letter-spacing | 11px | 10px | Chip labels, "ROOM", "SEAT" |

**Numeric columns** (Leaderboard, score table) use `font-feature-settings: 'tnum'` for alignment.

**Mobile scaling:** One media query in `theme.components.MuiTypography.styleOverrides.root` at `breakpoints.down('sm')` down-scales headlines ~30–35%, body ~10–15%. Not per-variant hand-tuning.

**Exception from original design:** demand captions use Playfair *italic* (read as pull quotes). If Playfair italic proves illegible at 11px mobile size during manual review, fall back to Source Sans italic for captions only.

## 2. Color tokens & surfaces

Extend `theme.palette`:

```
bg.page       #FAF8F3     body background — warm paper cream
bg.panel      #FFFFFF     inner panels (segments, coalitions, feed)
bg.raised     #F2EEE3     subtle hover / active surface

text.primary    #1A1613   ink, warm-tinted near-black
text.secondary  #6B625A   muted warm grey
text.disabled   #B2A89C
text.accent     #8B1A1A   "FINAL ROUND", errors

rule.hair     #E6DFD2     1px dividers between sections
rule.strong   #C2B8A8     heavier framing rule (coalition rows, tables)
rule.ink      #1A1613     full-ink rule (masthead underline only)

action.primary        #1A1613  Draw / Create Game / Start Game
action.primary.hover  #3B302A
action.claim          #8B1A1A  Claim buttons (crimson accent)
action.disabled       #DDD5C6
```

**Existing bloc chip palette** (`src/theme/colors.ts`) is untouched — it already passes WCAG AA with white chip text. Bloc colors are semantic game data, not theme tokens; keeping them separate.

**TypeScript augmentation** (`src/theme/augment.d.ts`): module-augment `@mui/material/styles` with the custom palette subkeys (`bg.page`, `rule.hair`, `action.claim`, etc.) so `sx` autocompletes them.

**No dark mode.** Light-only; paper inherently light.

## 3. Theme structure & component overrides

### File layout

```
src/theme/
  colors.ts          // EXISTING, unchanged — bloc chip palette + chipSxFor
  palette.ts         // NEW — cream/ink/rules tokens from §2
  typography.ts      // NEW — font stacks + variant scale from §1
  components.ts      // NEW — MUI component overrides (below)
  theme.ts           // NEW — assembles createTheme() with palette + typography + components
  augment.d.ts       // NEW — TS module augmentation for custom palette keys
```

`src/App.tsx` swap: `const theme = createTheme({})` → `import theme from './theme/theme'`. Single line change.

### Component overrides (`components.ts`)

- **`MuiCssBaseline`** — `body { background: bg.page; color: text.primary; font-family: Source Sans 3; -webkit-font-smoothing: antialiased; }`. Tabular figures on `table` / `td`.
- **`MuiTypography`** — variant overrides map to font families per the table in §1. Line-heights: headlines 1.15, body 1.5.
- **`MuiChip`** — `disableRipple: true`; `borderRadius: 2px` (tight, not pill); label uses `overline` typography. No shadow. `chipSxFor` still controls bg/fg per bloc.
- **`MuiButton`** — `disableElevation: true`; flat, no shadows. `borderRadius: 1px`.
  - Default `contained` → `action.primary` background, `bg.page` text.
  - New `claim` variant (via MUI 5/6 `variants` API) → `action.claim` background, white text.
- **`MuiTextField`** — `variant: 'outlined'` default; `borderColor: rule.strong`, `borderRadius: 0` (squared corners, editorial).
- **`MuiTable`** — `TableCell` uses `body1` on Big Screen / `body2` on mobile via breakpoint; `TableHead` uses `overline` typography; each row has `borderBottom: 1px solid rule.hair`.
- **`MuiDialog`** — if react-gameroom's `RoomInfoModal` / `HostDeviceWarningModal` surface (they may or may not render in v3), override their paper + backdrop to match cream tones.

### New `<Section>` wrapper component

One small component at `src/components/shared/Section.tsx`:

```tsx
<Section heading="Coalitions">
  {children}
</Section>
```

Renders the Playfair h4 heading, a `rule.hair` underline, and the children in a panel (`bg.panel` background, `p: 3` padding). Replaces the current ad-hoc `sx={{ p: 1, border: '1px solid #ccc' }}` blocks across `VoterSegments`, `PublicCoalitions`, `Leaderboard`, `HeadlineFeed`, `SegmentsReadonly`, `CoalitionBase`. One abstraction, used 6+ places.

## 4. Big Screen layout

### Masthead (full width, fixed height)

```
┌──────────────────────────────────────────────────────┐
│ COLOR-LITION    ROOM  A F D 3 K        Round 3 · FR ⛶│
└──────────────────────────────────────────────────────┘
```

- **"Color-lition"** — Playfair h1, left-anchored. The wordmark IS the logo.
- **"ROOM AFD3K"** — "ROOM" in overline caps, code itself in Playfair h2 with `letter-spacing: 0.15em`, tabular figures. Designed to be readable from across a living room.
- **"Round 3 · FR ⛶"** — meta strip in `body2`. "FR" replaced by red `text.accent` "FINAL ROUND" label when `gameState.exitPollDrawn`. Fullscreen toggle icon button at far right.
- Bottom edge: 2px `rule.ink` line — the masthead underline, classic newspaper nameplate.

### Body: two-column grid

```
┌──────────────────────────────┬─────────────────────┐
│                              │  Draw pile          │
│  Voter Segments              │  Turn indicator     │
│                              │  Projected Mandate  │
│  Coalitions                  │  Headlines          │
│                              │   (scrollable)      │
└──────────────────────────────┴─────────────────────┘
```

**Left column** (playfield) — 2/3 width (`flex: 2 1 0`):
- `<VoterSegments />` with `<Section heading="Voter Segments">` wrapper. Rows separated by `rule.hair`. Segment name in Playfair h5. Cards (with demand captions) wrap under each segment row.
- `<PublicCoalitions />` with `<Section heading="Coalitions">` wrapper. Each player row: name in Playfair h4 left, faction chips wrapping right.

**Right column** (brief) — 1/3 width (`flex: 1 1 0`):
- `<DrawPile />` — "N cards remaining" in overline caps + large Playfair numeral, no panel chrome (just flex layout inside an area).
- Turn indicator — Playfair h3 ("Alice's turn" / "Waiting…" / "Game over").
- `<Leaderboard />` with `<Section heading="Projected Mandate">`. Table with tabular numbers, `rule.hair` between rows, overline header cells.
- `<HeadlineFeed />` with `<Section heading="Headlines">`. **This is the only internally-scrollable panel on the Big Screen.** Constrained to remaining column height via `flex: 1 1 auto; min-height: 0; overflow-y: auto`. Entries: Playfair h5, separated by `rule.hair`, oldest fade to `text.secondary`.

### Winner overlay

When `gameState.phase === 'ended'`, replace the two-column body with a full-width `<Section>`:
- Winner heading in Playfair h1 ("Alice, …the Green Syndicalist" or co-winner list)
- Score table below, tabular numbers, generous padding
- Masthead stays visible

### No-scroll strategy

1. `html, body { height: 100%; overflow: hidden; }`.
2. Masthead: `flex: none` (fixed by content).
3. Body grid: `flex: 1 1 auto; min-height: 0; overflow: hidden`.
4. Each column: `flex` container with `min-height: 0`.
5. Within each column, fixed-height sections (`flex: none`) and one growable section (`flex: 1 1 auto; min-height: 0; overflow-y: auto`). Right column's growable = HeadlineFeed. Left column's growable = whichever of Segments/Coalitions would overflow (default: Coalitions, since segments are bounded by player count).
6. **Fallback:** `theme.breakpoints.down('lg')` (≈1200px width) collapses to single-column with `overflow-y: auto` on `body`. Page scroll is the safety net.

## 5. Mobile controller layout

Parity with Big Screen (paper cream, serif headlines, same chip palette) but **tight density** (B1 equivalent) — no airy padding on a phone screen.

### Masthead

```
┌──────────────────────────────┐
│ COLOR-LITION   AFD3K · SEAT 3│
└──────────────────────────────┘
```

- **Left:** "COLOR-LITION" in Playfair h5.
- **Right:** Room code + seat id, overline caps, tabular. Example: `AFD3K · SEAT 3`.
- No fullscreen toggle on mobile.
- No `rule.ink` underline on mobile — would feel heavy in a narrow viewport. Use `rule.hair` instead.

### Body (single column, vertical stack)

1. **Turn indicator strip** — single line of `body1`:
   - Your turn → `"Your turn."` in `text.primary` 600 weight
   - Claimed → `"You claimed. Waiting for the round to end."` in `text.secondary`
   - Waiting → `"Waiting for Bob…"` in `text.secondary`
2. **`<CoalitionBase />`** — "Your Coalition" in Playfair h4, chips wrap below (already sorted by count desc).
3. **`<SegmentsReadonly />`** — "Voter Segments" in Playfair h4. Each segment row inside:
   - Segment name: Playfair h5
   - Cards wrap beneath with demand captions (`caption` typography)
   - `rule.hair` between segment rows
4. **`<TurnActions />`** — when interactive:
   - **Idle:**
     - Primary `Draw` button — full-width `action.primary`, large.
     - Overline divider `— or claim —` with `rule.hair` on both sides.
     - One full-width stacked button per valid claim target. Uses the `claim` variant (crimson).
   - **Pending-draw:**
     - "YOU DREW" overline caps
     - Drawn card chip, large, centered
     - Demand sentence in Playfair italic `body1`: `"We want: …"` (or Source Sans italic if Playfair italic fails mobile legibility check)
     - "PLACE IN" overline caps
     - One full-width stacked button per valid placement target, labeled with segment name in Playfair h5

### Game-over state

Unchanged behavior (shown when `phase === 'ended'`):
- Playfair h1 "You won!" in `success.main` (or equivalent accent) if winner, "Game over" otherwise
- CoalitionBase beneath

## 6. Other screens

Home, Lobby, Join: **typography and colors only**, no layout rework.

- **HomePage** — "Color-lition" Playfair h1, tagline in `body1`, "Create Game" as `action.primary` button. Unstyled → styled with near-zero structural change.
- **LobbyPage** — Playfair h3 for "Room {id}". QR + slot grid + Start Game button keep their current positions; the `<StartGameButton />` picks up the new `MuiButton` styling automatically. Slots rendered by `<PlayerSlotsGrid />` from react-gameroom — if its appearance clashes with our theme, style via the grid's `className` / `slotClassName` props rather than forking the library.
- **JoinPage** — `TextField`s and `Button` inherit the new theme. Page heading in Playfair h3. Error messages in `text.accent`.

## 7. Out of scope for v3

- **No animations.** No card-flip, no fade-in, no transition beyond MUI defaults.
- **No dark mode.**
- **No breakpoints beyond what's needed.** Large → small viewport collapse only.
- **No custom icons / icon font.** MUI Material icons only (fullscreen, claim button icon if any). Wordmark is text.
- **No component library expansion** beyond the single `<Section>` wrapper.
- **No homepage / lobby layout rework** — typography pass only.
- **No reconnect UX, no auth, no locked Firebase rules.**
- **No tests.** Visual pass; manual verification only.
- **No styling for react-gameroom internals beyond what its public className props expose.**

### Accepted risks

1. **Playfair Display at small sizes can look rough.** Particularly 11px italic on mobile demand captions. Manual review will confirm; fallback to Source Sans italic if needed.
2. **No-scroll on Big Screen is ambitious.** At ≥ 5 players with many headlines, two-column layout may still run tight. Breakpoint fallback is the release valve.
3. **Cheap TV displays render cream as beige-yellow.** Can't control for display calibration.
4. **First load adds ~50KB of font data.** No offline concerns since Firebase is already required.
5. **`<Section>` abstraction may feel thin.** If after implementation it's only used in 6 places and doesn't earn its keep, we can inline. Low-risk refactor.

## 8. Open follow-ups for v4+

- Animations (card-place, headline-fade-in, turn-advance transition).
- Reconnect UX (disconnected player recovery).
- Firebase security rules for deployability.
- `game/` test suite (scoring first, then headlines derivation).
- Ironic dictionary content expansion.
- Tablet / landscape-phone optimization.

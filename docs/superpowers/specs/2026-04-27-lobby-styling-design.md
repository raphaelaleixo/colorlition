# Lobby Styling — Design

Date: 2026-04-27

## Context

The lobby (`LobbyView`) is the only page in the app still rendering its own ad-hoc header and a default-MUI body. Every other page — home, big-screen, join, how-to-play — has been moved onto `RoomHeader` with the stacked Logo and a slot. This pass brings the lobby in line and gives it a stronger "before the campaign launches" composition with a bit of thematic dressing.

The lobby is shown on the big-screen (TV/desktop) for 30–90 seconds while players join via QR. It must read at a glance, not demand attention, and reinforce the broadsheet/journalism dressing the rest of the app has settled into.

## Goals

- Replace the inline header with `RoomHeader` so the masthead is consistent across the app.
- Reframe the body around the QR code as the hero, with a secondary roster column.
- Give the lobby a typographic dateline so the page reads as a front-page slug, not a placeholder.
- Replace the default-MUI Start button with a fixed-bottom "press bar" that fits the journalism aesthetic.

## Non-goals

- Player-side bloc selection on join (would touch the join flow + starter-bloc logic; separate spec if desired).
- Any change to `/join`, `/room/:id/player`, `/room/:id/player/:playerId`, or `BigScreenView`.
- A reactive dateline that updates as players hit ready (could be a follow-up; keep static for now).
- A formal "is host" device concept in `react-gameroom` (worth raising with the library later if it keeps coming up; out of scope here).

## Layout

Single full-bleed column on the big-screen. Three vertical bands plus a bottom-fixed bar:

```
┌─────────────────────────────────────────────────────┐
│  [Logo stacked]                  Room  4F2A  [Full] │  ← RoomHeader
├─────────────────────────────────────────────────────┤
│  CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING    │  ← Dateline (overline + hairline rule)
├─────────────────────────────────────────────────────┤
│                                                     │
│      ┌──────────────┐     CANDIDATES                │
│      │              │     ─────────────────         │
│      │     QR       │     Raphael       FILED       │
│      │   (large)    │     Maria         FILED       │
│      │              │     ─ awaiting candidate ─    │
│      └──────────────┘     ─ awaiting candidate ─    │
│        Scan to join                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
│  LAUNCH CAMPAIGN  ·  2 OF 5 CANDIDATES READY    →   │  ← Press bar, fixed bottom
└─────────────────────────────────────────────────────┘
```

QR is `400px` on lg, `240px` on xs. Body grid is two columns (`lg`: QR | roster) collapsing to a single stack on `xs` in this order: dateline → QR (centered) → roster → press bar.

The bottom press bar uses the same `position: fixed` pattern `HeadlineTicker` uses inside `BigScreenView`, with a matching bottom inset on the page so content isn't covered.

## Components

### Reused

- **`RoomHeader`** with `slot` containing the room code + `FullscreenToggle`, mirroring the pattern in `BigScreenView` (`src/components/room/BigScreenView.tsx`). One shared masthead.
- **`RoomQRCode`** from `react-gameroom`. Pass `size={400}` on lg, `size={240}` on xs.
- **`Section`** (`src/components/shared/Section.tsx`) for the heading rules above the dateline and roster, so the typographic system matches the big-screen "Voter Segments" / "Leaderboard" headings.

### New (`src/components/lobby/`)

A new folder for lobby-only primitives so they don't pollute `shared/`.

- **`LobbyDateline.tsx`** — pure presentational. Renders the static dateline string with overline treatment and a hairline rule below. No props beyond optional `children` for future iteration.
- **`CandidateRoster.tsx`** — receives `players: PlayerSlot[]` from `roomState`. Maps each into `CandidateCard`. No game logic; only layout + status mapping.
- **`CandidateCard.tsx`** — one card. Variants based on `player.status` (which is `"empty" | "joining" | "ready"` per `react-gameroom`):
  - **Filled** (`'joining'` or `'ready'`) — name in Playfair (display variant), status overline in Source Sans (`FILED` for `'joining'`, `READY` for `'ready'`).
  - **Empty** (`'empty'`) — dashed-outline placeholder, label `AWAITING CANDIDATE` in the overline style.
- **`LaunchCampaignBar.tsx`** — bottom-fixed press bar.
  - Props: `readyCount: number`, `maxCount: number`, `canStart: boolean`, `onLaunch: () => void`.
  - Position: `position: fixed`, full width, `zIndex: theme.zIndex.appBar`.
  - Enabled: dark fill, all-caps Source Sans, hover state lifts.
  - Disabled (`!canStart`): same shape, lowered opacity, `cursor: not-allowed`, no hover.
  - Hidden on `xs` (see "Host vs player view" below).

### Restructured

- **`LobbyView.tsx`** shrinks to a thin layout shell:
  ```
  RoomHeader (slot = room code + FullscreenToggle)
  LobbyDateline
  Body grid:
    RoomQRCode + caption
    CandidateRoster
  LaunchCampaignBar
  ```
  Drops the inline `<Stack>` header it currently builds. All copy strings live in this file as constants so they're easy to tune in follow-up passes.

## Strings

Single source of truth in `LobbyView.tsx`:

- Dateline: `CAMPAIGN 2026 · DAY ZERO · CANDIDATES CONVENING`
- Roster heading: `CANDIDATES`
- Filled-card status: `FILED` (joined, not ready), `READY` (status === 'ready')
- Empty-card label: `AWAITING CANDIDATE`
- Press bar (enabled and disabled use the same template; only opacity differs):
  `LAUNCH CAMPAIGN · {readyCount} OF {maxCount} CANDIDATES READY →`
- QR caption (small, under QR): `Scan to join · or visit {origin}/join · room {code}` — `{origin}` is `window.location.origin` at runtime, `{code}` is `roomState.roomId`.

## Behavior and edge cases

### Host vs player view

`/room/:id` currently renders the lobby to any device that loads it, including phones. The expected flow is that phones land on `/join` → `/room/:id/player` → `/room/:id/player/:playerId` and never on `/room/:id` itself. Still, if a phone does load it, the lobby should not show the launch action.

`react-gameroom` exports `isLikelyMobileHost` (and a `HostDeviceWarningModal` built on it) — that is the canonical "this device is probably not the host TV" check and is the right proxy here. Hide `LaunchCampaignBar` when `isLikelyMobileHost()` returns true. The QR and roster still render on phones for graceful degradation.

If `isLikelyMobileHost` proves too coarse in practice, raise it as a library improvement (a richer "is host device" concept on `useRoomState`) rather than working around it locally.

### Empty roster

With zero joined players, the roster reads: heading + N dashed-outline `AWAITING CANDIDATE` cards, where N = `roomState.config.maxPlayers`. There is no "0 candidates" empty banner — the dashed cards are the empty state.

### Disabled press bar

When `readyCount < roomState.config.minPlayers`, the bar is on screen but inert (lowered opacity, no hover, `cursor: not-allowed`). Keeps layout stable as players join and signals where the action will appear.

### Reduced motion

No new animations introduced. Existing `PageTransition` still wraps the page. Nothing motion-sensitive to gate.

## Files touched

- `src/components/room/LobbyView.tsx` — restructured to thin layout shell.
- `src/components/lobby/LobbyDateline.tsx` — new.
- `src/components/lobby/CandidateRoster.tsx` — new.
- `src/components/lobby/CandidateCard.tsx` — new.
- `src/components/lobby/LaunchCampaignBar.tsx` — new.

No changes to game logic, routing, theme, or `react-gameroom` integration.

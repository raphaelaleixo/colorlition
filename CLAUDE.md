# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Pre-implementation. The repo currently contains only design specs in `projectInfo/`. No build/lint/test commands exist yet — add them here once tooling is chosen.

## What Color-lition Is

A real-time, multi-device (BYOD) web-based card-drafting game dressed up as 2026 coalition politics. Mechanics are adapted from Coloretto. Players are candidates drafting cards into voter segments, competing to build a governing coalition of at most 3 colors while avoiding "policy contradictions" that subtract points.

## Intended Architecture (from `projectInfo/colorlition_master_game_bible.md`)

- **Real-time sync**: handled by `react-gameroom` (see below), which is transport-agnostic — Firebase is a possible backend but not a requirement of the game layer. Don't hardcode Firebase assumptions into game code; talk to the library.
- **Dual-view, one game**:
  - **Big Screen** (`/room/[code]`): shared TV/monitor view — the 5 Voter Segments (rows), draw pile, live headline feed, "Projected Mandate" leaderboard.
  - **Mobile Controller** (`/join`): each player's private view — their "Coalition" (base) cards, Draw button, Claim Segment buttons, and the "We want..." demand text when a card is drawn.
- **UI aesthetic**: "Modern Data Journalism" (Economist-style) — minimalist, high-contrast, clean typography. Not cartoony.

## Required Library: `react-gameroom`

This project **must** be built on top of `react-gameroom` (the user's own library). It handles the room/join/real-time-sync primitives that would otherwise be reimplemented here.

- **Do not work around it.** If `react-gameroom`'s API doesn't fit a need, surface the gap to the user as a proposed improvement to the library itself — new hook, new prop, new event, extended type — rather than forking behavior or duplicating its responsibilities in this repo.
- Treat awkwardness or missing capability as a signal to improve the library, not to bypass it.
- When you hit such a gap, pause and describe the proposed change (shape, rationale, call sites) before coding around it.

## Core Game Logic (authoritative: `projectInfo/colorlition_rules_logic.md`)

**Deck = 88 cards**: 63 Interest Blocs (9 each × 7 colors: Red, Purple, Green, Blue, Orange, Yellow, Grey) + 10 Public Grants (+2 flat) + 3 Pivots (wilds) + 1 Exit Poll (shuffled into bottom 15 cards; triggers final round).

**Segments = player count**: rows are chosen from the 5 named segments (Industrial Belt, Urban Professionals, Agricultural Frontier, Financial District, Periphery). Max 3 cards per segment. **Max 5 players** per game (capped by the 5 named segments).

**Turn**: either draw 1 card and place it in a segment (<3 cards), **or** claim a segment (take all its cards into your Base, exit the round).

**Scoring** — triangular per color in Base: `n(n+1)/2` → 1/3/6/10/15/21 for 1–6+ cards.
1. Top 3 colors by count are **positive**.
2. All other colors are **negative** (subtracted).
3. Pivots (wilds) are auto-assigned to **maximize net score** — don't ask the player to choose. Implement as a brute-force search over all assignments (3 Pivots × 7 colors = 343 combos). "Assign to top 3" is usually correct but not always — the optimal assignment can push a 4th color into the top 3 to demote a weaker current member. Compute net, don't shortcut.
4. Each Public Grant = +2 flat.
5. Projected Mandate (live leaderboard) = `(Positive − Negative) + Grants`.

## Narrative Engine — what each spec file drives

- **`colorlition_interest_bloc_demands.md`** — 49 "We want..." strings (7 per color). When a player draws an Interest Bloc card, the matching demand shows **privately on their mobile** first. Once they commit the card to a segment, the demand moves to the **big screen** alongside that card — so the drawer sees it before anyone else, but it becomes public on placement.
- **`colorlition_segments_and_headlines.md`** — headline generation rules. Triggers:
  - 1st card in empty segment → "Rising Demand" template.
  - 2nd different color → "Tense Alliance" template.
  - 3rd card (segment full) → pull a specific ironic headline from the dictionary based on `segment × color combo`.
  - Headlines render on the Big Screen.
- **`colorlition_victory_titles_headlines.md`** — end-of-game title lookup table keyed by the set of colors in the winner's top-3 (1-bloc / 2-bloc / 3-bloc entries). Assign the title based on the final color DNA.

When implementing these systems, treat the markdown files as the source data — parse or port them into structured data (JSON/TS), don't retype the content inline.

## Naming Conventions (preserve in UI copy)

The game uses deliberate political/journalistic vocabulary. Don't rename these in UI strings:
- "Interest Bloc" (not "card"), "Voter Segment" (not "row"), "Base" / "Coalition" (not "hand"), "Add Representation" (drawing/placing a card), "Claim Demands" (not "take row"), "Policy Contradictions" / "Flip-Flops" (for negative-scoring colors), "Poll Results" (the live leaderboard), "Undecided" (wilds), "Ally" (+2 cards), "Exit Poll" (final-round trigger).

The original spec uses "Projected Mandate" / "The Pivot" / "Public Grant" — the implementation has since renamed these for player-facing copy. Internal `kind` strings (`'pivot'`, `'grant'`) are unchanged; only the displayed labels (via `labelFor()` in `src/game/data/demands.ts`) and headings have moved. Use the new names in any new UI; treat the spec's older terms as historical.

## Open Decisions (not yet in specs)

Before implementing, the following are unspecified and worth confirming with the user: framework choice (Next.js is implied by the `/room/[code]` route style but not stated), how rooms are created/joined (likely delegated to `react-gameroom`), reconnection behavior, scoring tiebreakers (e.g., equal counts across the 3rd/4th color slot), and whether the Exit Poll position is deterministic per seed or re-randomized each game.

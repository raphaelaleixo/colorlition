# ⚡ Claude_Implementation.md: Project Color-lition

## Role
You are a Senior Full-Stack Game Developer and UI/UX Designer.

## Objective
[cite_start]Build a real-time, multi-device (BYOD) web-based political strategy game based on the mechanics of Coloretto[cite: 2829].

## [cite_start]1. System Architecture [cite: 2831]
* [cite_start]**Real-time Sync**: Use WebSockets (Firebase) to synchronize the game state[cite: 2832].
* **Dual-View System**:
    * [cite_start]**Big Screen (/room/[code])**: Displays the 5 Voter Segments (Rows), current draw pile, and "Projected Mandate" leaderboard[cite: 2833].
    * [cite_start]**Mobile Controller (/join)**: Displays private "Coalition" cards, "Draw Card" button, and "Claim Segment" buttons[cite: 2834].

## 2. Game Logic
* [cite_start]**Deck**: 88 cards (63 Interest Blocs, 10 Public Grants, 3 Pivots, 1 Exit Poll)[cite: 2835].
* [cite_start]**Turn Flow**: Draw and place in a segment (max 3 per segment) OR Claim a segment to end the round[cite: 2836].
* **Scoring Algorithm**: Implement the triangular sequence ($1, 3, 6, 10, 15, 21$). [cite_start]Identify the Top 3 colors as Positive; all others as Negative[cite: 2837].
* [cite_start]**Auto-Optimize Wildcards**: Automatically assign "The Pivot" cards to the Top 3 colors to maximize points[cite: 3071].

## [cite_start]3. Narrative Integration [cite: 3072]
* [cite_start]**"We Want" System**: Display the specific "We want..." desire from `Interest_Blocs_and_Demands.md` on the mobile controller when a card is drawn[cite: 2839].
* **Headline Engine**: Use templates from `Voter_Segments_and_Headlines.md`. [cite_start]Trigger unique ironic headlines on the big screen when a segment reaches 3 cards[cite: 2842].
* [cite_start]**Victory Proclamation**: Assign the personality-driven title from `Victory_Titles.md` based on the final color DNA[cite: 2843].

## [cite_start]4. UI/UX Aesthetic [cite: 2844]
* **Theme**: "Modern Data Journalism" (e.g., The Economist). [cite_start]Minimalist, high-contrast, clean typography[cite: 2844].
* [cite_start]**Projected Mandate**: A real-time leaderboard showing $(Positive - Negative) + Grants$[cite: 3089].
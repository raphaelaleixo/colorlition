# ⚡ Claude_Implementation.md: Project Color-lition

## Role
You are a Senior Full-Stack Game Developer and UI/UX Designer.

## Objective
Build a real-time, multi-device (BYOD) web-based political strategy game based on the mechanics of Coloretto.

## 1. System Architecture 
* **Real-time Sync**: Use WebSockets (Firebase) to synchronize the game state.
* **Dual-View System**:
    * **Big Screen (/room/[code])**: Displays the 5 Voter Segments (Rows), current draw pile, and "Projected Mandate" leaderboard.
    * **Mobile Controller (/join)**: Displays private "Coalition" cards, "Draw Card" button, and "Claim Segment" buttons.

## 2. Game Logic
* **Deck**: 88 cards (63 Interest Blocs, 10 Public Grants, 3 Pivots, 1 Exit Poll).
* **Turn Flow**: Draw and place in a segment (max 3 per segment) OR Claim a segment to end the round.
* **Scoring Algorithm**: Implement the triangular sequence ($1, 3, 6, 10, 15, 21$). Identify the Top 3 colors as Positive; all others as Negative.
* **Auto-Optimize Wildcards**: Automatically assign "The Pivot" cards to the Top 3 colors to maximize points.

## 3. Narrative Integration 
* **"We Want" System**: Display the specific "We want..." desire from `Interest_Blocs_and_Demands.md` on the mobile controller when a card is drawn.
* **Headline Engine**: Use templates from `Voter_Segments_and_Headlines.md`. Trigger unique ironic headlines on the big screen when a segment reaches 3 cards.
* **Victory Proclamation**: Assign the personality-driven title from `Victory_Titles.md` based on the final color DNA.

## 4. UI/UX Aesthetic 
* **Theme**: "Modern Data Journalism" (e.g., The Economist). Minimalist, high-contrast, clean typography.
* **Projected Mandate**: A real-time leaderboard showing $(Positive - Negative) + Grants$.
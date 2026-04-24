# 🗳️ Color-lition: Rules and Logic Manual (Full)

## 1. Overview
Color-lition is a high-stakes, 2026-era political strategy game based on the mechanics of Coloretto. Players act as candidates in a multi-party election with the goal of building a stable governing coalition by satisfying the demands of exactly three interest groups.

## 2. Components & Setup
### The Deck (88 Cards Total)
* **63 Interest Bloc Cards**: 9 cards for each of the 7 colors (Red, Purple, Green, Blue, Orange, Yellow, Grey).
* **10 Public Grants (+2)**: Non-partisan infrastructure or economic wins providing flat bonus points.
* **3 The Pivots (Wilds)**: Vague PR statements that can fill any bloc at the end of the game.
* **1 The Exit Poll**: Triggers the final round. Placed randomly within the bottom 15 cards.

### Voter Segments (The Rows)
The number of active segments (rows) must equal the number of players.
1. **The Industrial Belt** (Factory Workers).
2. **Urban Professionals** (The Creative Class).
3. **The Agricultural Frontier** (Farmers and Settlers).
4. **The Financial District** (Analysts and Investors).
5. **The Periphery** (Local Residents).

## 3. Gameplay Mechanics
### Turn Actions
On your turn, perform one of two actions:
* **Action A (Offer Representation)**: Draw one card and place it in any Voter Segment with < 3 cards.
* **Action B (Claim a Constituency)**: Take all cards in one segment for your "Base" and exit the round.

## 4. Scoring: The Coalition vs. The Noise
The final score uses a triangular sequence:
$$S = \frac{n(n+1)}{2}$$

* **1 card** = 1 pt | **2 cards** = 3 pts | **3 cards** = 6 pts | **4 cards** = 10 pts | **5 cards** = 15 pts | **6+ cards** = 21 pts.

### Final Tally Steps:
1. **Positive Points**: Choose the 3 colors in your Base with the highest card counts.
2. **Negative Points**: All other colors are "Policy Contradictions" (Flip-Flops); subtract their triangular values.
3. **Optimize Wilds**: The algorithm assigns "The Pivot" cards to maximize the top 3 colors.
4. **Add Grants**: +2 points for every Public Grant collected.
# 🗳️ Color-lition: Rules and Logic Manual (Full)

## 1. Overview
Color-lition is a high-stakes, 2026-era political strategy game based on the mechanics of Coloretto. [cite_start]Players act as candidates in a multi-party election with the goal of building a stable governing coalition by satisfying the demands of exactly three interest groups[cite: 1777, 1778].

## 2. Components & Setup
### The Deck (88 Cards Total)
* [cite_start]**63 Interest Bloc Cards**: 9 cards for each of the 7 colors (Red, Purple, Green, Blue, Orange, Yellow, Grey)[cite: 1780, 1824].
* [cite_start]**10 Public Grants (+2)**: Non-partisan infrastructure or economic wins providing flat bonus points[cite: 1781, 1824].
* [cite_start]**3 The Pivots (Wilds)**: Vague PR statements that can fill any bloc at the end of the game[cite: 1782, 1824].
* **1 The Exit Poll**: Triggers the final round. [cite_start]Placed randomly within the bottom 15 cards[cite: 1783, 1784].

### Voter Segments (The Rows)
[cite_start]The number of active segments (rows) must equal the number of players[cite: 1785].
1. [cite_start]**The Industrial Belt** (Factory Workers)[cite: 1786].
2. [cite_start]**Urban Professionals** (The Creative Class)[cite: 1786].
3. [cite_start]**The Agricultural Frontier** (Farmers and Settlers)[cite: 1787].
4. [cite_start]**The Financial District** (Analysts and Investors)[cite: 1787].
5. [cite_start]**The Periphery** (Local Residents)[cite: 1788].

## 3. Gameplay Mechanics
### Turn Actions
[cite_start]On your turn, perform one of two actions[cite: 1789]:
* [cite_start]**Action A (Offer Representation)**: Draw one card and place it in any Voter Segment with < 3 cards[cite: 1789].
* [cite_start]**Action B (Claim a Constituency)**: Take all cards in one segment for your "Base" and exit the round[cite: 1790].

## 4. Scoring: The Coalition vs. The Noise
The final score uses a triangular sequence:
$$S = \frac{n(n+1)}{2}$$

* **1 card** = 1 pt | **2 cards** = 3 pts | **3 cards** = 6 pts | **4 cards** = 10 pts | **5 cards** = 15 pts | [cite_start]**6+ cards** = 21 pts[cite: 1795, 1796].

### Final Tally Steps:
1. [cite_start]**Positive Points**: Choose the 3 colors in your Base with the highest card counts[cite: 1796, 1826].
2. [cite_start]**Negative Points**: All other colors are "Policy Contradictions" (Flip-Flops); subtract their triangular values[cite: 1797, 1826].
3. [cite_start]**Optimize Wilds**: The algorithm assigns "The Pivot" cards to maximize the top 3 colors[cite: 1798].
4. [cite_start]**Add Grants**: +2 points for every Public Grant collected[cite: 1799].
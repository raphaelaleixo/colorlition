import { useContext } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { PiAsterisk, PiChartBar, PiNumberCircleTwo } from "react-icons/pi";
import { PALETTE, COLOR_ICONS, pivotStripes } from "../../theme/colors";
import {
  DEMANDS,
  EXIT_POLL_DEMAND,
  GRANT_DEMANDS,
  PIVOT_DEMANDS,
  labelFor,
} from "../../game/data/demands";
import { GameContext } from "../../contexts/GameContext";
import { colorsInPlay } from "../../game/summarize";
import type { Card as GameCard } from "../../game/types";
import type { ChipKey } from "../../theme/colors";

type Size = "small" | "medium";
type Props = {
  card: GameCard;
  showDemand?: boolean;
  size?: Size;
  fluid?: boolean;
  sx?: SxProps<Theme>;
};

function keyFor(card: GameCard): ChipKey {
  if (card.kind === "bloc") return card.color;
  if (card.kind === "grant") return "grant";
  if (card.kind === "pivot") return "pivot";
  return "exitPoll";
}

export function Card({
  card,
  showDemand = false,
  size = "small",
  fluid = false,
  sx,
}: Props) {
  const key = keyFor(card);
  const Icon =
    card.kind === "bloc"
      ? COLOR_ICONS[card.color]
      : card.kind === "pivot"
        ? PiAsterisk
        : card.kind === "grant"
          ? PiNumberCircleTwo
          : card.kind === "exitPoll"
            ? PiChartBar
            : undefined;
  const ctx = useContext(GameContext);
  const pivotBg =
    card.kind === "pivot" && ctx?.gameState
      ? pivotStripes(colorsInPlay(ctx.gameState))
      : null;
  // Exit Poll inverts the colored-card scheme: white card, ink text/icons.
  const isExitPoll = card.kind === "exitPoll";
  const cardBg = isExitPoll ? "#ffffff" : (pivotBg ?? PALETTE[key]);
  const cardFg = isExitPoll ? "#1A1613" : "#ffffff";

  if (size === "small") {
    return (
      <Box
        sx={[
          {
            ...(fluid
              ? { flex: 1, minWidth: 0, aspectRatio: "7 / 10" }
              : { width: 56, height: 80, flexShrink: 0 }),
            borderRadius: 1.25,
            background: cardBg,
            color: cardFg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isExitPoll
              ? "0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(26, 22, 19, 0.18)"
              : "0 1px 2px rgba(0,0,0,0.12)",
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        {Icon && <Icon size={32} />}
      </Box>
    );
  }

  const demand = (() => {
    if (!showDemand) return null;
    if (card.kind === "bloc") {
      return DEMANDS[card.color]?.[card.value] ?? null;
    }
    if (card.kind === "pivot") {
      const i = parseInt(card.id.replace(/^pivot-/, ""), 10) || 0;
      return PIVOT_DEMANDS[i % PIVOT_DEMANDS.length];
    }
    if (card.kind === "grant") {
      const i = parseInt(card.id.replace(/^grant-/, ""), 10) || 0;
      return GRANT_DEMANDS[i % GRANT_DEMANDS.length];
    }
    if (card.kind === "exitPoll") {
      return EXIT_POLL_DEMAND;
    }
    return null;
  })();

  return (
    <Box
      sx={{
        width: 320,
        // Mirror the small card's 7:10, but laid out horizontally.
        // overflow: hidden so long demand text can't push the box past the
        // ratio (aspect-ratio is preferred, not enforced, against content).
        aspectRatio: "10 / 7",
        overflow: "hidden",
        background: cardBg,
        borderRadius: 3,
        boxShadow: isExitPoll
          ? "0 16px 40px rgba(26, 22, 19, 0.14), inset 0 0 0 1px rgba(26, 22, 19, 0.22)"
          : "0 16px 40px rgba(26, 22, 19, 0.14), inset 0 0 0 4px #ffffff",
        p: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          color: cardFg,
          display: "inline-flex",
        }}
      >
        {Icon && <Icon size={32} />}
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          color: cardFg,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Source Sans 3", system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            lineHeight: 1.1,
          }}
        >
          {labelFor(key)}
        </Typography>
        {demand && (
          <Typography
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 20,
            }}
          >
            {`"${demand}"`}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

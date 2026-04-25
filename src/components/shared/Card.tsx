import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PALETTE, COLOR_ICONS } from "../../theme/colors";
import { DEMANDS, labelFor } from "../../game/data/demands";
import type { Card as GameCard } from "../../game/types";
import type { ChipKey } from "../../theme/colors";

type Size = "small" | "medium";
type Props = { card: GameCard; showDemand?: boolean; size?: Size; fluid?: boolean };

function keyFor(card: GameCard): ChipKey {
  if (card.kind === "bloc") return card.color;
  if (card.kind === "grant") return "grant";
  if (card.kind === "pivot") return "pivot";
  return "exitPoll";
}

export function Card({ card, showDemand = false, size = "small", fluid = false }: Props) {
  const key = keyFor(card);
  const Icon = card.kind === "bloc" ? COLOR_ICONS[card.color] : undefined;

  if (size === "small") {
    return (
      <Box
        sx={{
          ...(fluid
            ? { flex: 1, minWidth: 0, aspectRatio: "7 / 10" }
            : { width: 56, height: 80, flexShrink: 0 }),
          borderRadius: 1.25,
          backgroundColor: PALETTE[key],
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
        }}
      >
        {Icon && <Icon size={32} />}
        {!Icon && card.kind === "grant" && (
          <Typography variant="h5" sx={{ color: "inherit", fontWeight: 700 }}>
            +2
          </Typography>
        )}
        {!Icon && card.kind === "pivot" && (
          <Typography variant="h5" sx={{ color: "inherit", fontWeight: 700 }}>
            P
          </Typography>
        )}
      </Box>
    );
  }

  const chip = (
    <Chip
      icon={Icon ? <Icon size={18} /> : undefined}
      label={labelFor(key)}
      sx={{
        backgroundColor: PALETTE[key],
        color: "#ffffff",
        fontWeight: 500,
        fontSize: 14,
        height: 40,
        "& .MuiChip-label": { px: 2 },
        "& .MuiChip-icon": { color: "#ffffff", ml: "8px", mr: "-4px" },
      }}
    />
  );

  if (!showDemand || card.kind !== "bloc") return <>{chip}</>;

  const demand = DEMANDS[card.color]?.[card.value];
  if (!demand) return <>{chip}</>;

  return (
    <Stack
      spacing={1}
      sx={{ maxWidth: 320, backgroundColor: PALETTE[key] }}
    >
      {chip}
      <Typography
        variant="body1"
        sx={{
          fontStyle: "italic",
          lineHeight: 1.2,
          fontFamily: '"Playfair Display", Georgia, serif',
        }}
      >
        {` "${demand}"`}
      </Typography>
    </Stack>
  );
}

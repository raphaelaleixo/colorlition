import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PALETTE, COLOR_ICONS } from "../../theme/colors";
import { DEMANDS, labelFor } from "../../game/data/demands";
import type { Card as GameCard } from "../../game/types";
import type { ChipKey } from "../../theme/colors";

type Size = "small" | "medium";
type Props = { card: GameCard; showDemand?: boolean; size?: Size };

const sizeSx: Record<Size, Record<string, unknown>> = {
  small: {},
  medium: {
    fontSize: 14,
    height: 40,
    "& .MuiChip-label": { px: 2 },
  },
};

function keyFor(card: GameCard): ChipKey {
  if (card.kind === "bloc") return card.color;
  if (card.kind === "grant") return "grant";
  if (card.kind === "pivot") return "pivot";
  return "exitPoll";
}

export function Card({ card, showDemand = false, size = "small" }: Props) {
  const key = keyFor(card);
  const isMedium = size === "medium";
  const Icon = card.kind === "bloc" ? COLOR_ICONS[card.color] : undefined;
  const chip = (
    <Chip
      icon={Icon ? <Icon size={isMedium ? 18 : 14} /> : undefined}
      label={labelFor(key)}
      sx={{
        backgroundColor: PALETTE[key],
        color: "#ffffff",
        fontWeight: 500,
        "& .MuiChip-icon": { color: "#ffffff", ml: "8px", mr: "-4px" },
        ...sizeSx[size],
      }}
    />
  );

  if (!showDemand || card.kind !== "bloc") return <>{chip}</>;

  const demand = DEMANDS[card.color]?.[card.value];
  if (!demand) return <>{chip}</>;

  return (
    <Stack
      spacing={isMedium ? 1 : 0.25}
      sx={{ maxWidth: isMedium ? 320 : 200, backgroundColor: PALETTE[key] }}
    >
      {chip}
      <Typography
        variant={isMedium ? "body1" : "caption"}
        sx={{
          fontStyle: "italic",
          lineHeight: 1.2,
          ...(isMedium && { fontFamily: '"Playfair Display", Georgia, serif' }),
        }}
      >
        {isMedium ? ` "${demand}"` : `"${demand}"`}
      </Typography>
    </Stack>
  );
}

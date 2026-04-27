import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PiAsterisk, PiNumberCircleTwo } from 'react-icons/pi';
import { summarizeCoalition, colorsInPlay } from '../../game/summarize';
import { labelFor, type LabelKey } from '../../game/data/demands';
import { COLOR_ICONS, PALETTE, pivotStripes, type ChipKey } from '../../theme/colors';
import type {
  Card as GameCard,
  Color,
  ColorlitionGameState,
} from '../../game/types';

// Per-group breakdown of the player's base — one row per bloc color plus
// rows for Allies (grants) and Undecided (pivots) when present. Mirrors the
// chip key system used elsewhere so colors and icons stay consistent.
export function CoalitionBreakdown({
  base,
  gameState,
}: {
  base: GameCard[];
  gameState: ColorlitionGameState;
}) {
  const rows = summarizeCoalition(base);
  const pivotBg = pivotStripes(colorsInPlay(gameState));

  if (rows.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        No cards yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.75}>
      {rows.map((r) => {
        const key = r.label as ChipKey;
        const Icon =
          key === 'pivot'
            ? PiAsterisk
            : key === 'grant'
              ? PiNumberCircleTwo
              : COLOR_ICONS[key as Color];
        const background = key === 'pivot' ? pivotBg : PALETTE[key];
        return (
          <Stack
            key={r.label}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', py: 0.5 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flex: 1, alignItems: 'baseline', minWidth: 0 }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {labelFor(r.label as LabelKey)}
              </Typography>
              {key === 'grant' && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  (+2 points)
                </Typography>
              )}
              {key === 'pivot' && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  (wildcard)
                </Typography>
              )}
            </Stack>
            <Typography
              sx={{
                fontWeight: 700,
                fontFeatureSettings: "'tnum' 1",
                minWidth: 36,
                textAlign: 'right',
              }}
            >
              × {r.count}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

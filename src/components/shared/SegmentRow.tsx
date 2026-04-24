import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from './Card';
import type { Segment } from '../../game/types';

type Props = { segment: Segment; showDemand?: boolean };

export function SegmentRow({ segment, showDemand = false }: Props) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'flex-start',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'rule.hair',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Typography variant="h5" sx={{ minWidth: 200, pt: 0.25 }}>
        {segment.label}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', flex: 1 }}>
        {segment.cards.map((c) => (
          <Card key={c.id} card={c} showDemand={showDemand} />
        ))}
      </Stack>
      {segment.claimedBy !== null && (
        <Typography variant="body2" sx={{ color: 'text.secondary', pt: 0.5 }}>
          claimed by #{segment.claimedBy}
        </Typography>
      )}
    </Stack>
  );
}

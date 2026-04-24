import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SegmentRow } from '../shared/SegmentRow';
import type { Segment } from '../../game/types';

export function SegmentsReadonly({ segments }: { segments: Segment[] }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6">Voter Segments</Typography>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Stack>
  );
}

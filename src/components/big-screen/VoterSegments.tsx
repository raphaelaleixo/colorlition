import Stack from '@mui/material/Stack';
import { SegmentRow } from '../shared/SegmentRow';
import type { Segment } from '../../game/types';

export function VoterSegments({ segments }: { segments: Segment[] }) {
  return (
    <Stack spacing={1}>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} />
      ))}
    </Stack>
  );
}

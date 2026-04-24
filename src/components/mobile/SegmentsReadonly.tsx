import { SegmentRow } from '../shared/SegmentRow';
import { Section } from '../shared/Section';
import type { Segment } from '../../game/types';

export function SegmentsReadonly({ segments }: { segments: Segment[] }) {
  return (
    <Section heading="Voter Segments" dense>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Section>
  );
}

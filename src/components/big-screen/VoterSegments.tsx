import { SegmentRow } from '../shared/SegmentRow';
import { Section } from '../shared/Section';
import type { Segment } from '../../game/types';

export function VoterSegments({ segments }: { segments: Segment[] }) {
  return (
    <Section heading="Voter Segments">
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Section>
  );
}

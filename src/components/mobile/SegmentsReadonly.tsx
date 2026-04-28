import { SegmentRow } from '../shared/SegmentRow';
import { Section } from '../shared/Section';
import { useT } from '../../i18n';
import type { Segment } from '../../game/types';

export function SegmentsReadonly({ segments }: { segments: Segment[] }) {
  const t = useT();
  return (
    <Section heading={t('segments.heading')} dense>
      {segments.map((s) => (
        <SegmentRow key={s.key} segment={s} showDemand />
      ))}
    </Section>
  );
}

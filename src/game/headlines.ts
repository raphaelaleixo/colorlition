import {
  HEADLINE_TEMPLATES,
  type HeadlineVariation,
  type TemplateKey,
} from './data/headlines';
import type { Card, Headline, Segment } from './types';

function templateKey(card: Card): TemplateKey | null {
  switch (card.kind) {
    case 'bloc':
      return card.color;
    case 'pivot':
      return 'pivot';
    case 'grant':
      return 'grant';
    case 'exitPoll':
      return null;
  }
}

const VARIATION_BY_POSITION: Record<1 | 2 | 3, HeadlineVariation> = {
  1: 'spark',
  2: 'movement',
  3: 'friction',
};

export function deriveHeadline(
  _segmentBefore: Segment,
  segmentAfter: Segment,
  placedCard: Card,
  roundNumber: number,
  seq: number,
): Headline | null {
  const n = segmentAfter.cards.length;
  if (n < 1 || n > 3) return null;

  const key = templateKey(placedCard);
  if (!key) return null;

  const variation = VARIATION_BY_POSITION[n as 1 | 2 | 3];
  const template = HEADLINE_TEMPLATES[key][variation];
  const text = template.replace('[Segment]', segmentAfter.label);

  return {
    id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
    kind: variation,
    segmentKey: segmentAfter.key,
    roundNumber,
    text,
  };
}

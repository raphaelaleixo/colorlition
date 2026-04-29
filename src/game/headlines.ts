import { format } from '../i18n';
import type { GameDict } from '../i18n';
import type {
  Card,
  Headline,
  HeadlineKind,
  HeadlineTemplateKey,
  Segment,
} from './types';

function templateKey(card: Card): HeadlineTemplateKey | null {
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

export function deriveHeadline(
  _segmentBefore: Segment,
  segmentAfter: Segment,
  placedCard: Card,
  roundNumber: number,
  seq: number,
): Headline | null {
  const n = segmentAfter.cards.length;
  if (n < 1) return null;

  const key = templateKey(placedCard);
  if (!key) return null;

  // Full-segment placements always fire the ironic-dictionary "friction"
  // variant. Capacity-1 rows collapse spark+friction into friction-only;
  // capacity-2 rows skip "movement".
  let variation: HeadlineKind;
  if (n >= segmentAfter.capacity) {
    variation = 'friction';
  } else if (n === 1) {
    variation = 'spark';
  } else if (n === 2) {
    variation = 'movement';
  } else {
    return null;
  }

  return {
    id: `h-${roundNumber}-${segmentAfter.key}-${seq}`,
    kind: variation,
    templateKey: key,
    segmentKey: segmentAfter.key,
    roundNumber,
  };
}

// Render a structured headline against the active locale dict. Substitutes
// the segment label into the template's {segment} token.
export function renderHeadline(headline: Headline, dict: GameDict): string {
  const template = dict.headlineTemplates[headline.templateKey][headline.kind];
  const segment = dict.segmentLabels[headline.segmentKey];
  return format(template, { segment });
}

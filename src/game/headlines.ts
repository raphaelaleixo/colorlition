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

const VARIATION_BY_POSITION: Record<1 | 2 | 3, HeadlineKind> = {
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

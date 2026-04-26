import type { Color } from '../types';

export type HeadlineVariation = 'spark' | 'movement' | 'friction';

export type TemplateKey = Color | 'pivot' | 'grant';

// Verbatim from the simplified headline matrix: 9 card types × 3 variations.
// Variations map to placement position: 1st card = spark, 2nd = movement, 3rd = friction.
// Use the [Segment] token; renderer substitutes the segment label.
export const HEADLINE_TEMPLATES: Record<
  TemplateKey,
  Record<HeadlineVariation, string>
> = {
  red: {
    spark: 'Union flyers begin appearing across [Segment].',
    movement: 'A call for solidarity echoes through [Segment].',
    friction: 'Local workers in [Segment] demand a seat at the table.',
  },
  purple: {
    spark: 'Equality activists mobilize for a march in [Segment].',
    movement: 'A manifesto for systemic change gains traction in [Segment].',
    friction: 'Demands for radical reform spark debate in [Segment].',
  },
  green: {
    spark: 'Ecological urgency reshapes the conversation in [Segment].',
    movement: 'Residents of [Segment] call for immediate climate action.',
    friction: 'Green transition goals are pushed to the forefront of [Segment].',
  },
  blue: {
    spark: 'Investors eye [Segment] for new deregulation trials.',
    movement: 'The language of fiscal discipline dominates [Segment].',
    friction: "Market forces move to restructure [Segment]'s priorities.",
  },
  orange: {
    spark: 'The land-owning lobby asserts its power over [Segment].',
    movement: 'Export-led growth becomes the new focus for [Segment].',
    friction: 'Demands for property rights expansion intensify in [Segment].',
  },
  yellow: {
    spark: 'Calls for order lead to increased patrols in [Segment].',
    movement: 'A new push for public safety reshapes [Segment].',
    friction: 'Surveillance measures are proposed to secure [Segment].',
  },
  grey: {
    spark: 'Voters call for a return to the heritage of [Segment].',
    movement: 'Traditionalist values gain ground among [Segment] elders.',
    friction: 'A push for cultural continuity takes hold in [Segment].',
  },
  pivot: {
    spark: 'A heavy silence hangs over [Segment] as voters wait.',
    movement: "The 'Silent Center' in [Segment] remains neutral.",
    friction: 'Undecided residents in [Segment] look for a reason to care.',
  },
  grant: {
    spark: 'A local power-broker lends their weight to [Segment].',
    movement: 'Institutional stability increases as an Ally joins [Segment].',
    friction: 'A respected figure in [Segment] legitimizes the current mood.',
  },
};

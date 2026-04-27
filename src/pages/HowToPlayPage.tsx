import { Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { RoomHeader } from '../components/shared/RoomHeader';

const SCORING_ROWS: ReadonlyArray<readonly [string, string]> = [
  ['1 card', '1'],
  ['2 cards', '3'],
  ['3 cards', '6'],
  ['4 cards', '10'],
  ['5 cards', '15'],
  ['6+ cards', '21'],
];

const GLOSSARY: ReadonlyArray<readonly [string, string]> = [
  ['Interest Bloc', 'A colored card representing a voter group with a "We want…" demand.'],
  ['Voter Segment', 'A row on the table where blocs accumulate. One segment per player; max three cards each.'],
  ['Base / Coalition', 'The cards a player has claimed. Scored at the end.'],
  ['Claim Demands', 'The action of taking all cards in one segment into your Base; you exit the round.'],
  ['Policy Contradictions', 'Colors outside your top three. Their points are subtracted (a.k.a. "Flip-Flops").'],
  ['Poll Results', 'The live leaderboard — Positive minus Negative, plus Allies.'],
  ['Undecided', 'A wild card. Auto-assigned at scoring to maximize your net total.'],
  ['Ally', 'A non-partisan power-broker worth a flat +2 points.'],
  ['Exit Poll', 'Hidden in the bottom 15 cards. Drawing it triggers the final round.'],
];

export default function HowToPlayPage() {
  return (
    <Box sx={{ p: { xs: 3, sm: 6 }, maxWidth: 760, mx: 'auto' }}>
      <RoomHeader
        slot={
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            The Manual
          </Typography>
        }
      />
      <Stack spacing={4} sx={{ pt: 4 }}>
        <Stack spacing={1.5}>
          <Typography variant="h1">How to Play</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Color-lition is a real-time card-drafting game for 2 to 5 players, dressed up
            as 2026 coalition politics. You play a candidate adding Interest Blocs to Voter
            Segments and claiming the ones that fit, racing to assemble a stable governing
            coalition of at most three colors while keeping policy contradictions off your
            record.
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title="Setup" overline="The Deck">
          <Typography variant="body1">
            The deck contains <strong>88 cards</strong>:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" component="span">
                <strong>63 Interest Bloc cards</strong> — 9 cards in each of the seven colors
                (Red, Purple, Green, Blue, Orange, Yellow, Grey).
              </Typography>
            </li>
            <li>
              <Typography variant="body1" component="span">
                <strong>10 Allies</strong> — non-partisan power-brokers worth a flat +2 points.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" component="span">
                <strong>3 Undecideds</strong> — wild cards that fill any bloc at scoring.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" component="span">
                <strong>1 Exit Poll</strong> — shuffled into the bottom 15 cards; triggers the final round.
              </Typography>
            </li>
          </ul>
          <Typography variant="body1">
            The number of active Voter Segments equals the number of players. Each segment can hold up
            to three cards. Segments are drawn from a fixed cast: the Industrial Belt, Urban
            Professionals, the Agricultural Frontier, the Financial District, and the Periphery.
          </Typography>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title="Your Turn" overline="Two Actions, One Choice">
          <Typography variant="body1">
            On your turn you take exactly one of two actions:
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 0.5 }}>
                Add Representation
              </Typography>
              <Typography variant="body1">
                Draw one card from the pile and place it in any Voter Segment that has fewer
                than three cards. If the card is an Interest Bloc, its "We want…" demand
                appears privately on your phone first. Once you commit it to a segment, the
                demand becomes public on the big screen.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 0.5 }}>
                Claim Demands
              </Typography>
              <Typography variant="body1">
                Take every card from a single segment into your Base. You sit out the rest of
                the round. The round ends once each player has claimed.
              </Typography>
            </Box>
          </Stack>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title="Scoring" overline="The Coalition vs. The Noise">
          <Typography variant="body1">
            At the end of the game, your Base is tallied color by color using a triangular
            scale — bigger blocs are worth disproportionately more.
          </Typography>

          <Table size="small" sx={{ maxWidth: 360 }}>
            <TableHead>
              <TableRow>
                <TableCell>Cards of one color</TableCell>
                <TableCell align="right">Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SCORING_ROWS.map(([label, points]) => (
                <TableRow key={label}>
                  <TableCell>{label}</TableCell>
                  <TableCell align="right">{points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Stack spacing={1.5}>
            <Typography variant="body1">
              <strong>1. Pick your top three colors.</strong> The three colors with the most
              cards in your Base score positively.
            </Typography>
            <Typography variant="body1">
              <strong>2. Subtract the rest.</strong> Every other color is a Policy
              Contradiction — its triangular value is subtracted.
            </Typography>
            <Typography variant="body1">
              <strong>3. Undecideds optimize themselves.</strong> The game assigns each
              Undecided to whichever color produces the best net score for you. You don't
              have to pick.
            </Typography>
            <Typography variant="body1">
              <strong>4. Add Allies.</strong> Each Ally in your Base adds a flat +2 points.
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            The live <em>Poll Results</em> on the big screen show this calculation in real time
            as cards land.
          </Typography>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title="The Final Round" overline="Exit Poll Triggered">
          <Typography variant="body1">
            The Exit Poll is shuffled into the bottom 15 cards of the deck. The moment it is
            drawn, every player who has not yet claimed gets one final action — then the game
            ends and scoring begins. Watch your Base before then: a fourth color sneaking into
            it can flip from positive to negative on a single late draw.
          </Typography>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title="Glossary" overline="The Vocabulary">
          <Box component="dl" sx={{ m: 0, display: 'grid', rowGap: 1.5 }}>
            {GLOSSARY.map(([term, definition]) => (
              <Box key={term}>
                <Typography component="dt" variant="overline" sx={{ color: 'text.primary' }}>
                  {term}
                </Typography>
                <Typography component="dd" variant="body1" sx={{ m: 0, color: 'text.secondary' }}>
                  {definition}
                </Typography>
              </Box>
            ))}
          </Box>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Link component={RouterLink} to="/" underline="hover">
            Back to home
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}

function Section({
  title,
  overline,
  children,
}: {
  title: string;
  overline?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={2} component="section">
      {overline && (
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          {overline}
        </Typography>
      )}
      <Typography variant="h2">{title}</Typography>
      {children}
    </Stack>
  );
}

import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import type { Color, ScoreBreakdown } from '../../game/types';
import { deriveVictoryTitle } from '../../game/titles';
import { labelFor } from '../../game/data/demands';
import { PALETTE } from '../../theme/colors';
import { Section } from '../shared/Section';

function ColoredBlocList({ colors }: { colors: Color[] }) {
  if (colors.length === 0) return <>—</>;
  return (
    <>
      {colors.map((c, i) => (
        <Fragment key={c}>
          <Box
            component="span"
            sx={{ color: PALETTE[c], fontWeight: 700 }}
          >
            {labelFor(c)}
          </Box>
          {i < colors.length - 1 ? ', ' : null}
        </Fragment>
      ))}
    </>
  );
}

export function WinnerScreen({
  breakdowns,
  winnerIds,
  nameFor,
}: {
  breakdowns: ScoreBreakdown[];
  winnerIds: string[];
  nameFor: (playerId: string) => string;
}) {
  const navigate = useNavigate();
  return (
    <Section>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              lineHeight: 1,
            }}
          >
            Game Over
          </Typography>
          <Typography variant="h1">
            {(() => {
              const lines = winnerIds.map((id) => {
                const breakdown = breakdowns.find((b) => b.playerId === id);
                const title = breakdown
                  ? deriveVictoryTitle(breakdown.positiveColors, breakdown.colorCounts)
                  : 'the Unclassified Leader';
                return `${nameFor(id)}, ${title} Wins!`;
              });
              return winnerIds.length === 1 ? lines[0] : `Co-winners: ${lines.join(' • ')}`;
            })()}
          </Typography>
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Positive blocs</TableCell>
              <TableCell align="right">Positive</TableCell>
              <TableCell>Negative blocs</TableCell>
              <TableCell align="right">Negative</TableCell>
              <TableCell align="right">Grants</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {breakdowns
              .slice()
              .sort((a, b) => b.total - a.total)
              .map((b) => (
                <TableRow key={b.playerId}>
                  <TableCell>{nameFor(b.playerId)}</TableCell>
                  <TableCell>
                    <ColoredBlocList colors={b.positiveColors} />
                  </TableCell>
                  <TableCell align="right">{b.positive}</TableCell>
                  <TableCell>
                    <ColoredBlocList colors={b.negativeColors} />
                  </TableCell>
                  <TableCell align="right">{b.negative}</TableCell>
                  <TableCell align="right">{b.grants}</TableCell>
                  <TableCell align="right">{b.total}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Back to Home
          </Button>
        </Box>
      </Stack>
    </Section>
  );
}

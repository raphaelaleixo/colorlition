import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import type { ScoreBreakdown } from '../../game/types';
import { deriveVictoryTitle } from '../../game/titles';

export function WinnerScreen({
  breakdowns,
  winnerIds,
  nameFor,
}: {
  breakdowns: ScoreBreakdown[];
  winnerIds: string[];
  nameFor: (playerId: string) => string;
}) {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">
        {(() => {
          const lines = winnerIds.map((id) => {
            const breakdown = breakdowns.find((b) => b.playerId === id);
            const title = breakdown
              ? deriveVictoryTitle(breakdown.positiveColors)
              : '…the Unclassified Leader';
            return `${nameFor(id)}, ${title}`;
          });
          return winnerIds.length === 1 ? lines[0] : `Co-winners: ${lines.join(' • ')}`;
        })()}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Positive colors</TableCell>
            <TableCell align="right">Positive</TableCell>
            <TableCell>Negative colors</TableCell>
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
                <TableCell>{b.positiveColors.join(', ') || '—'}</TableCell>
                <TableCell align="right">{b.positive}</TableCell>
                <TableCell>{b.negativeColors.join(', ') || '—'}</TableCell>
                <TableCell align="right">{b.negative}</TableCell>
                <TableCell align="right">{b.grants}</TableCell>
                <TableCell align="right">{b.total}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Stack>
  );
}

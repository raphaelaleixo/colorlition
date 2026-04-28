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
import { useGameDict, useLabelFor, useT } from '../../i18n';
import { PALETTE } from '../../theme/colors';
import { Section } from '../shared/Section';

function ColoredBlocList({ colors }: { colors: Color[] }) {
  const labelFor = useLabelFor();
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
  const dict = useGameDict();
  const t = useT();
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
            {t('winner.gameOver')}
          </Typography>
          <Typography variant="h1">
            {(() => {
              const lines = winnerIds.map((id) => {
                const breakdown = breakdowns.find((b) => b.playerId === id);
                const title = breakdown
                  ? deriveVictoryTitle(breakdown.rawColorCounts, dict)
                  : dict.unclassifiedLeaderTitle;
                return t('winner.wins', { name: nameFor(id), title });
              });
              return winnerIds.length === 1
                ? lines[0]
                : t('winner.coWinners', { lines: lines.join(' • ') });
            })()}
          </Typography>
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('winner.tableHeader.player')}</TableCell>
              <TableCell>{t('winner.tableHeader.positiveBlocs')}</TableCell>
              <TableCell align="right">{t('winner.tableHeader.positive')}</TableCell>
              <TableCell>{t('winner.tableHeader.negativeBlocs')}</TableCell>
              <TableCell align="right">{t('winner.tableHeader.negative')}</TableCell>
              <TableCell align="right">{t('winner.tableHeader.grants')}</TableCell>
              <TableCell align="right">{t('winner.tableHeader.total')}</TableCell>
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
            {t('common.backToHome')}
          </Button>
        </Box>
      </Stack>
    </Section>
  );
}

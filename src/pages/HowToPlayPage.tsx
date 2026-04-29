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
import { useT } from '../i18n';
import type { UIKey } from '../i18n';

const SCORING_ROWS: ReadonlyArray<readonly [UIKey, string]> = [
  ['howTo.scoring.row.1card', '1'],
  ['howTo.scoring.row.2cards', '3'],
  ['howTo.scoring.row.3cards', '6'],
  ['howTo.scoring.row.4cards', '10'],
  ['howTo.scoring.row.5cards', '15'],
  ['howTo.scoring.row.6cards', '21'],
];

const GLOSSARY: ReadonlyArray<readonly [UIKey, UIKey]> = [
  ['howTo.glossary.interestBloc.term', 'howTo.glossary.interestBloc.def'],
  ['howTo.glossary.voterSegment.term', 'howTo.glossary.voterSegment.def'],
  ['howTo.glossary.base.term', 'howTo.glossary.base.def'],
  ['howTo.glossary.claim.term', 'howTo.glossary.claim.def'],
  ['howTo.glossary.contradictions.term', 'howTo.glossary.contradictions.def'],
  ['howTo.glossary.poll.term', 'howTo.glossary.poll.def'],
  ['howTo.glossary.undecided.term', 'howTo.glossary.undecided.def'],
  ['howTo.glossary.ally.term', 'howTo.glossary.ally.def'],
  ['howTo.glossary.exitPoll.term', 'howTo.glossary.exitPoll.def'],
];

export default function HowToPlayPage() {
  const t = useT();
  return (
    <Box sx={{ p: { xs: 3, sm: 6 }, maxWidth: 760, mx: 'auto' }}>
      <RoomHeader
        slot={
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {t('howTo.overline')}
          </Typography>
        }
      />
      <Stack spacing={4} sx={{ pt: 4 }}>
        <Stack spacing={1.5}>
          <Typography variant="h1">{t('howTo.title')}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('howTo.intro')}
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title={t('howTo.section.setup')} overline={t('howTo.section.deck')}>
          <Typography variant="body1">
            {t('howTo.deck.intro')}{' '}
            <strong>{t('howTo.deck.cardsBold')}</strong>
            {t('howTo.deck.cardsAfter')}
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" component="span">
                <strong>{t('howTo.deck.row1.bold')}</strong>
                {t('howTo.deck.row1.detail')}
              </Typography>
            </li>
            <li>
              <Typography variant="body1" component="span">
                <strong>{t('howTo.deck.row2.bold')}</strong>
                {t('howTo.deck.row2.detail')}
              </Typography>
            </li>
            <li>
              <Typography variant="body1" component="span">
                <strong>{t('howTo.deck.row3.bold')}</strong>
                {t('howTo.deck.row3.detail')}
              </Typography>
            </li>
            <li>
              <Typography variant="body1" component="span">
                <strong>{t('howTo.deck.row4.bold')}</strong>
                {t('howTo.deck.row4.detail')}
              </Typography>
            </li>
          </ul>
          <Typography variant="body1">
            {t('howTo.segments.intro')}
          </Typography>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title={t('howTo.section.turn')} overline={t('howTo.section.turnOver')}>
          <Typography variant="body1">
            {t('howTo.turn.intro')}
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 0.5 }}>
                {t('howTo.turn.add.title')}
              </Typography>
              <Typography variant="body1">
                {t('howTo.turn.add.body')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" component="h3" sx={{ mb: 0.5 }}>
                {t('howTo.turn.claim.title')}
              </Typography>
              <Typography variant="body1">
                {t('howTo.turn.claim.body')}
              </Typography>
            </Box>
          </Stack>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title={t('howTo.section.scoring')} overline={t('howTo.section.scoringOver')}>
          <Typography variant="body1">
            {t('howTo.scoring.intro')}
          </Typography>

          <Table size="small" sx={{ maxWidth: 360 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('howTo.scoring.colHeader1')}</TableCell>
                <TableCell align="right">{t('howTo.scoring.colHeader2')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SCORING_ROWS.map(([labelKey, points]) => (
                <TableRow key={labelKey}>
                  <TableCell>{t(labelKey)}</TableCell>
                  <TableCell align="right">{points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Stack spacing={1.5}>
            <Typography variant="body1">
              <strong>{t('howTo.scoring.point1.bold')}</strong>
              {t('howTo.scoring.point1.body')}
            </Typography>
            <Typography variant="body1">
              <strong>{t('howTo.scoring.point2.bold')}</strong>
              {t('howTo.scoring.point2.body')}
            </Typography>
            <Typography variant="body1">
              <strong>{t('howTo.scoring.point3.bold')}</strong>
              {t('howTo.scoring.point3.body')}
            </Typography>
            <Typography variant="body1">
              <strong>{t('howTo.scoring.point4.bold')}</strong>
              {t('howTo.scoring.point4.body')}
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('howTo.scoring.notePrefix')}
            <em>{t('howTo.scoring.noteItalic')}</em>
            {t('howTo.scoring.noteSuffix')}
          </Typography>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title={t('howTo.section.finalRound')} overline={t('howTo.section.finalRoundOver')}>
          <Typography variant="body1">
            {t('howTo.finalRound.body')}
          </Typography>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title={t('howTo.section.twoPlayer')} overline={t('howTo.section.twoPlayerOver')}>
          <Typography variant="body1">
            {t('howTo.twoPlayer.body')}
          </Typography>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Section title={t('howTo.section.glossary')} overline={t('howTo.section.glossaryOver')}>
          <Box component="dl" sx={{ m: 0, display: 'grid', rowGap: 1.5 }}>
            {GLOSSARY.map(([termKey, defKey]) => (
              <Box key={termKey}>
                <Typography component="dt" variant="overline" sx={{ color: 'text.primary' }}>
                  {t(termKey)}
                </Typography>
                <Typography component="dd" variant="body1" sx={{ m: 0, color: 'text.secondary' }}>
                  {t(defKey)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Section>

        <Divider sx={{ borderColor: 'rule.hair' }} />

        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Link component={RouterLink} to="/" underline="hover">
            {t('common.backToHome')}
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

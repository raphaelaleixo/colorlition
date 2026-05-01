import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Ludoratory } from './Ludoratory';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useT } from '../../i18n';

export function PageFooter() {
  const t = useT();
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'center', color: 'text.secondary', pt: 3, pb: 4 }}
    >
      <Ludoratory size={28} sx={{ flex: 'none', color: 'text.secondary' }} />
      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          {t('footer.madeByPrefix')}
          <Link
            href="https://ludoratory.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            {t('footer.madeByLink')}
          </Link>
          {t('footer.madeBySuffix')}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          {t('footer.licensePrefix')}
          <Link
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit' }}
          >
            {t('footer.licenseLink')}
          </Link>
          {t('footer.licenseSuffix')}
        </Typography>
      </Stack>
      <LocaleSwitcher />
    </Stack>
  );
}

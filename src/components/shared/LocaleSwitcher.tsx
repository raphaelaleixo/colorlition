import Stack from '@mui/material/Stack';
import {
  LOCALES,
  LOCALE_LABELS,
  useLocaleControls,
  useT,
  type Locale,
} from '../../i18n';

// Compact EN / PT toggle. Lives in PageFooter — visible on every screen but
// out of the way during play.
export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleControls();
  const t = useT();

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={t('locale.switcher.aria')}
      sx={{ alignItems: 'center', flex: 'none' }}
    >
      {LOCALES.map((code, idx) => {
        const active = code === locale;
        return (
          <Stack
            key={code}
            direction="row"
            sx={{ alignItems: 'center' }}
          >
            {idx > 0 && (
              <span aria-hidden style={{ opacity: 0.4, padding: '0 6px' }}>
                ·
              </span>
            )}
            <button
              type="button"
              onClick={() => setLocale(code as Locale)}
              aria-pressed={active}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: active ? 'default' : 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'inherit',
                opacity: active ? 1 : 0.55,
                textDecoration: active ? 'underline' : 'none',
                textUnderlineOffset: 3,
              }}
            >
              {LOCALE_LABELS[code]}
            </button>
          </Stack>
        );
      })}
    </Stack>
  );
}

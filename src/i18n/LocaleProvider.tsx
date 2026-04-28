import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { LocaleContext } from './LocaleContext';
import { LOCALES, type Locale } from './types';

const STORAGE_KEY = 'colorlition.locale';
const URL_PARAM = 'lang';
const DEFAULT_LOCALE: Locale = 'en';

// Map lowercase URL values to a canonical Locale. Accepts the canonical
// codes ('en', 'pt-BR') plus the convenience short form 'pt'.
function localeFromParam(raw: string): Locale | null {
  const v = raw.toLowerCase();
  if (v === 'en') return 'en';
  if (v === 'pt' || v === 'pt-br') return 'pt-BR';
  return null;
}

// Resolve the initial locale: URL param wins, then localStorage, then default.
// The chosen locale is persisted via the effect below so a `?lang=pt` link
// sticks even after the param is dropped from the URL.
function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const fromUrl = new URLSearchParams(window.location.search).get(URL_PARAM);
  if (fromUrl) {
    const parsed = localeFromParam(fromUrl);
    if (parsed) return parsed;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && (LOCALES as readonly string[]).includes(raw)) {
    return raw as Locale;
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  // Single source of persistence: every locale change (including the initial
  // mount when ?lang= was present) syncs to localStorage and <html lang>.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

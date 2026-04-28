import { useContext, useMemo } from 'react';
import { LocaleContext } from './LocaleContext';
import enUI from './ui/en';
import ptBRUI from './ui/pt-BR';
import enGame from './game/en';
import ptBRGame from './game/pt-BR';
import {
  LOCALE_URL_PARAM,
  type GameDict,
  type LabelKey,
  type Locale,
  type UIDict,
  type UIKey,
} from './types';

const UI_DICTS: Record<Locale, UIDict> = {
  en: enUI,
  'pt-BR': ptBRUI,
};

const GAME_DICTS: Record<Locale, GameDict> = {
  en: enGame,
  'pt-BR': ptBRGame,
};

function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx.locale;
}

export function useLocaleControls() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocaleControls must be used within a LocaleProvider');
  }
  return ctx;
}

// Append the locale URL param to a URL so a recipient (QR scan, shared link)
// inherits the host's language. Returns the input unchanged if it isn't a
// parseable absolute URL.
export function localizedUrl(url: string, locale: Locale): string {
  try {
    const u = new URL(url);
    u.searchParams.set(LOCALE_URL_PARAM, locale);
    return u.toString();
  } catch {
    return url;
  }
}

// Replace {token} placeholders. Missing params leave the placeholder intact
// so the bug is visible rather than a silent empty string.
export function format(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (raw, key: string) =>
    key in params ? String(params[key]) : raw,
  );
}

export type T = (key: UIKey, params?: Record<string, string | number>) => string;

export function useT(): T {
  const locale = useLocale();
  return useMemo(() => {
    const dict = UI_DICTS[locale];
    const fallback = UI_DICTS.en;
    return (key, params) => {
      const template = dict[key] ?? fallback[key];
      if (template === undefined) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] missing UI key: ${key}`);
        }
        return key;
      }
      return format(template, params);
    };
  }, [locale]);
}

export function useGameDict(): GameDict {
  const locale = useLocale();
  return GAME_DICTS[locale];
}

// Resolves coalition-row label keys (color | 'pivot' | 'grant' | 'exitPoll')
// against the active locale's GameDict.
export function labelFor(key: LabelKey, dict: GameDict): string {
  if (key === 'pivot') return dict.pivotLabel;
  if (key === 'grant') return dict.grantLabel;
  if (key === 'exitPoll') return dict.exitPollLabel;
  return dict.blocNames[key];
}

export function useLabelFor(): (key: LabelKey) => string {
  const dict = useGameDict();
  return useMemo(() => (key: LabelKey) => labelFor(key, dict), [dict]);
}

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ko';
/** A string in both languages. */
export interface Txt {
  ko: string;
  en: string;
}

export const tx = (ko: string, en: string): Txt => ({ ko, en });

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** pick the string for the current language */
  L: (ko: string, en: string) => string;
  /** pick from a Txt */
  P: (t: Txt) => string;
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, L: (_k, e) => e, P: (t) => t.en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const value = useMemo<LangCtx>(
    () => ({ lang, setLang, L: (ko, en) => (lang === 'ko' ? ko : en), P: (t) => t[lang] }),
    [lang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

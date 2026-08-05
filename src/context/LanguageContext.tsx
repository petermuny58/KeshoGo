import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Language, LanguageCode } from '../types';

// English is the only implemented language for this pass. The shape below is
// deliberately ready for Bemba, Nyanja, Tonga and Lozi once translations exist —
// adding a language later is a data change here, not a new context or UI.
export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', enabled: true },
  { code: 'bem', label: 'Bemba', nativeLabel: 'Ichibemba', enabled: false },
  { code: 'nya', label: 'Nyanja', nativeLabel: 'Chinyanja', enabled: false },
  { code: 'toi', label: 'Tonga', nativeLabel: 'Chitonga', enabled: false },
  { code: 'loz', label: 'Lozi', nativeLabel: 'Silozi', enabled: false },
];

interface LanguageContextValue {
  language: LanguageCode;
  availableLanguages: Language[];
  setLanguage: (code: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      availableLanguages: AVAILABLE_LANGUAGES,
      setLanguage,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

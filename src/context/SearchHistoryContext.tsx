import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface SearchHistoryContextValue {
  recentSearches: string[];
  addSearch: (query: string) => void;
  clearHistory: () => void;
}

const SearchHistoryContext = createContext<SearchHistoryContextValue | null>(null);

export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const value = useMemo<SearchHistoryContextValue>(
    () => ({
      recentSearches,
      addSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        setRecentSearches((prev) => [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6));
      },
      clearHistory: () => setRecentSearches([]),
    }),
    [recentSearches],
  );

  return <SearchHistoryContext.Provider value={value}>{children}</SearchHistoryContext.Provider>;
}

export function useSearchHistory(): SearchHistoryContextValue {
  const ctx = useContext(SearchHistoryContext);
  if (!ctx) throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  return ctx;
}

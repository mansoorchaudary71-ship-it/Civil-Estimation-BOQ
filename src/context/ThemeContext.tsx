import React, { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Deprecated pass-through.
 *
 * The real theme lives in SettingsContext (`app-settings`). This provider used to ALSO write
 * `light`/`dark` onto <html> from a second storage key (`app-theme`). Because it sits above
 * SettingsProvider, its effect ran last and overwrote the user's saved choice with "system" on
 * every load. It is kept only so existing imports keep compiling.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'system', setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

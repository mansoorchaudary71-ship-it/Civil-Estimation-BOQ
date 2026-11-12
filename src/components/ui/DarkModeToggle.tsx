import { Button } from './/Button';
import React from 'react';
import { Sun, Moon, Eye, Settings } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';


export function DarkModeToggle({ isMobile }: { isMobile?: boolean }) {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system' | 'high-contrast' | 'modern' | 'engineering-blueprint')[] = ['light', 'dark', 'system', 'high-contrast', 'modern', 'engineering-blueprint'];
    const nextTheme = themes[(themes.indexOf(settings.theme) + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };

  const isDarkMode = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isHighContrast = settings.theme === 'high-contrast';

  const getThemeIcon = () => {
    if (settings.theme === 'high-contrast') return <Eye className="w-5 h-5 text-accent-700" />;
    if (settings.theme === 'dark') return <Moon className="w-5 h-5 text-accent-800" />;
    if (settings.theme === 'modern') return <Sun className="w-5 h-5 text-txt-tertiary" />;
    if (settings.theme === 'engineering-blueprint') return <Settings className="w-5 h-5 text-accent-800" />;
    return <Sun className="w-5 h-5 text-accent-700" />;
  };

  const getThemeLabel = () => {
    if (settings.theme === 'high-contrast') return 'High Contrast';
    if (settings.theme === 'dark') return 'Dark Mode';
    if (settings.theme === 'modern') return 'Modern';
    if (settings.theme === 'engineering-blueprint') return 'Blueprint';
    return 'Light Mode';
  };

  if (isMobile) {
    return (
      <Button
        onClick={toggleTheme}
        className="flex items-center justify-between text-left text-[18px] font-bold text-[#111111] dark:text-white group"
      >
        <div className="flex items-center gap-3">
          {getThemeIcon()}
          {getThemeLabel()}
        </div>
        <div className="w-10 h-6 rounded-full bg-surface-active relative transition-colors duration-300">
           <div className={`absolute top-1 w-4 h-4 rounded-full bg-surface-default transition-all duration-300 ${isDarkMode || isHighContrast ? 'left-5' : 'left-1'}`}></div>
        </div>
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      className={`w-10 h-10 rounded-full shadow-brand-sm flex items-center justify-center transition-all duration-300 ${
        isHighContrast
          ? 'bg-black border border-accent-500 text-accent-700 hover:bg-ink hover:shadow-brand-md hover:-translate-y-0.5'
          : isDarkMode 
          ? 'bg-ink border border-ink-600 text-accent-400 hover:bg-ink-600 hover:shadow-brand-md hover:-translate-y-0.5' 
          : 'bg-surface-default border border-ui-borderSubtle text-accent-700 hover:bg-surface-hover hover:shadow-brand-md hover:-translate-y-0.5'
      }`}
      title="Toggle Theme"
    >
      {getThemeIcon()}
    </Button>
  );
}

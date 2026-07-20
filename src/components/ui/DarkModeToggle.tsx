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
    if (settings.theme === 'high-contrast') return <Eye className="w-5 h-5 text-yellow-500" />;
    if (settings.theme === 'dark') return <Moon className="w-5 h-5 text-indigo-500" />;
    if (settings.theme === 'modern') return <Sun className="w-5 h-5 text-zinc-500" />;
    if (settings.theme === 'engineering-blueprint') return <Settings className="w-5 h-5 text-blue-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
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
      <button
        onClick={toggleTheme}
        className="flex items-center justify-between text-left text-[18px] font-bold text-[#111111] dark:text-white group"
      >
        <div className="flex items-center gap-3">
          {getThemeIcon()}
          {getThemeLabel()}
        </div>
        <div className="w-10 h-6 rounded-full bg-slate-200 dark:bg-slate-700 relative transition-colors duration-300">
           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isDarkMode || isHighContrast ? 'left-5' : 'left-1'}`}></div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ${
        isHighContrast
          ? 'bg-black border border-yellow-500 text-yellow-500 hover:bg-gray-900 hover:shadow-md hover:-translate-y-0.5'
          : isDarkMode 
          ? 'bg-slate-800 border border-slate-700 text-amber-400 hover:bg-slate-700 hover:shadow-md hover:-translate-y-0.5' 
          : 'bg-white border border-slate-200 text-amber-500 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5'
      }`}
      title="Toggle Theme"
    >
      {getThemeIcon()}
    </button>
  );
}

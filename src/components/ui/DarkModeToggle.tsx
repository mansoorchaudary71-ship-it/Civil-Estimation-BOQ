import React from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export function DarkModeToggle({ isMobile }: { isMobile?: boolean }) {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    if (settings.theme === 'light') updateSettings({ theme: 'dark' });
    else if (settings.theme === 'dark') updateSettings({ theme: 'high-contrast' });
    else updateSettings({ theme: 'light' });
  };

  const isDarkMode = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isHighContrast = settings.theme === 'high-contrast';

  const getThemeIcon = () => {
    if (isHighContrast) return <Eye className="w-5 h-5 text-yellow-500" />;
    if (isDarkMode) return <Moon className="w-5 h-5 text-amber-500" />;
    return <Sun className="w-5 h-5 text-blue-500" />;
  };

  const getThemeLabel = () => {
    if (isHighContrast) return 'High Contrast';
    if (isDarkMode) return 'Dark Mode';
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
      {isHighContrast ? <Eye className="w-5 h-5" /> : isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}

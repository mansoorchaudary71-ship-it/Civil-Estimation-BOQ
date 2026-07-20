const fs = require('fs');
const file = 'src/components/ui/DarkModeToggle.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldToggle = `  const toggleTheme = () => {
    if (settings.theme === 'light') updateSettings({ theme: 'dark' });
    else if (settings.theme === 'dark') updateSettings({ theme: 'high-contrast' });
    else updateSettings({ theme: 'light' });
  };`;

const newToggle = `  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system' | 'high-contrast' | 'modern' | 'engineering-blueprint')[] = ['light', 'dark', 'system', 'high-contrast', 'modern', 'engineering-blueprint'];
    const nextTheme = themes[(themes.indexOf(settings.theme) + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };`;

content = content.replace(oldToggle, newToggle);

const oldImports = `import { Sun, Moon, Eye } from 'lucide-react';`;
const newImports = `import { Sun, Moon, Eye, Settings } from 'lucide-react';`;
content = content.replace(oldImports, newImports);

const oldIcon = `  const getThemeIcon = () => {
    if (isHighContrast) return <Eye className="w-5 h-5 text-yellow-500" />;
    if (isDarkMode) return <Moon className="w-5 h-5 text-amber-500" />;
    return <Sun className="w-5 h-5 text-blue-500" />;
  };`;

const newIcon = `  const getThemeIcon = () => {
    if (settings.theme === 'high-contrast') return <Eye className="w-5 h-5 text-yellow-500" />;
    if (settings.theme === 'dark') return <Moon className="w-5 h-5 text-indigo-500" />;
    if (settings.theme === 'modern') return <Sun className="w-5 h-5 text-zinc-500" />;
    if (settings.theme === 'engineering-blueprint') return <Settings className="w-5 h-5 text-blue-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };`;

content = content.replace(oldIcon, newIcon);

const oldLabel = `  const getThemeLabel = () => {
    if (isHighContrast) return 'High Contrast';
    if (isDarkMode) return 'Dark Mode';
    return 'Light Mode';
  };`;

const newLabel = `  const getThemeLabel = () => {
    if (settings.theme === 'high-contrast') return 'High Contrast';
    if (settings.theme === 'dark') return 'Dark Mode';
    if (settings.theme === 'modern') return 'Modern';
    if (settings.theme === 'engineering-blueprint') return 'Blueprint';
    return 'Light Mode';
  };`;

content = content.replace(oldLabel, newLabel);

const oldButtonIcon = `{isHighContrast ? <Eye className="w-5 h-5" /> : isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}`;
const newButtonIcon = `{getThemeIcon()}`;
content = content.replace(oldButtonIcon, newButtonIcon);

fs.writeFileSync(file, content);
console.log('Patched DarkModeToggle');

const fs = require('fs');
const file = 'src/components/auth/ProfileSettings.tsx';
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

const oldIcon = `  const getThemeIcon = () => {
    if (settings.theme === 'high-contrast') return <Eye className="w-5 h-5 text-yellow-500" />;
    if (settings.theme === 'dark') return <Moon className="w-5 h-5 text-indigo-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };`;

const newIcon = `  const getThemeIcon = () => {
    if (settings.theme === 'high-contrast') return <Eye className="w-5 h-5 text-yellow-500" />;
    if (settings.theme === 'dark') return <Moon className="w-5 h-5 text-indigo-500" />;
    if (settings.theme === 'modern') return <Sun className="w-5 h-5 text-zinc-500" />;
    if (settings.theme === 'engineering-blueprint') return <Settings className="w-5 h-5 text-blue-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };`;

content = content.replace(oldIcon, newIcon);
fs.writeFileSync(file, content);
console.log('Patched ProfileSettings');

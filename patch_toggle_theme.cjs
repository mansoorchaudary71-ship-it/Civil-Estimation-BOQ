const fs = require('fs');
const file = 'src/context/SettingsContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldToggle = `  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };`;

const newToggle = `  const toggleTheme = () => {
    setSettings(prev => {
      const themes: Theme[] = ['light', 'dark', 'system', 'high-contrast', 'modern', 'engineering-blueprint'];
      const nextTheme = themes[(themes.indexOf(prev.theme) + 1) % themes.length];
      return { ...prev, theme: nextTheme };
    });
  };`;

content = content.replace(oldToggle, newToggle);
fs.writeFileSync(file, content);
console.log('Patched toggleTheme');

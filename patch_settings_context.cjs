const fs = require('fs');
const file = 'src/context/SettingsContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "export type Theme = 'light' | 'dark' | 'system' | 'high-contrast';",
  "export type Theme = 'light' | 'dark' | 'system' | 'high-contrast' | 'modern' | 'engineering-blueprint';"
);

const applyThemeOld = `      root.classList.remove('light', 'dark', 'high-contrast');
      if (settings.theme === 'high-contrast') {
          root.classList.add('high-contrast');
      } else if (isDark) {
          root.classList.add('dark');
      } else {
          root.classList.add('light');
      }`;

const applyThemeNew = `      root.classList.remove('light', 'dark', 'high-contrast', 'theme-modern', 'theme-blueprint');
      if (settings.theme === 'high-contrast') {
          root.classList.add('high-contrast');
      } else if (settings.theme === 'modern') {
          root.classList.add('theme-modern');
      } else if (settings.theme === 'engineering-blueprint') {
          root.classList.add('theme-blueprint');
      } else if (isDark) {
          root.classList.add('dark');
      } else {
          root.classList.add('light');
      }`;

content = content.replace(applyThemeOld, applyThemeNew);

fs.writeFileSync(file, content);
console.log('Patched SettingsContext');

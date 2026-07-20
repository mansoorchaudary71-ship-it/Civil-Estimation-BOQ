const fs = require('fs');
const file = 'src/components/modules/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldThemes = `                      {[
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "system", label: "System", icon: Laptop },
                        { id: "high-contrast", label: "High Contrast", icon: Eye },
                      ]`;

const newThemes = `                      {[
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "system", label: "System", icon: Laptop },
                        { id: "high-contrast", label: "High Contrast", icon: Eye },
                        { id: "modern", label: "Modern", icon: Sun },
                        { id: "engineering-blueprint", label: "Blueprint", icon: Laptop },
                      ]`;

content = content.replace(oldThemes, newThemes);
fs.writeFileSync(file, content);
console.log('Patched SettingsModal');

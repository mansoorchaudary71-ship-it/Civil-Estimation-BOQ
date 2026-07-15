const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const oldLogout = `  const logOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };`;

const newLogout = `  const logOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('auth_token');
    setUser(null);
  };`;

content = content.replace(oldLogout, newLogout);
fs.writeFileSync('src/contexts/AuthContext.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const logoutRoute = `
  app.post("/api/auth/logout", (req, res) => {
    // For JWT, logout is primarily handled client-side by deleting the token.
    // We can add a token blacklist here in a production database if needed.
    res.json({ success: true, message: "Logged out successfully" });
  });
`;

if (!content.includes('/api/auth/logout')) {
  content = content.replace('  app.get("/api/auth/me", authenticateToken, (req, res) => {', logoutRoute + '\n  app.get("/api/auth/me", authenticateToken, (req, res) => {');
  fs.writeFileSync('server.ts', content);
}

const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const mockEndpoints = `
  app.get("/api/rates", (req, res) => {
    res.json({
      status: "ok",
      data: {
        cement: 1250,
        steel: 260,
        bricks: 14000,
        sand: 60,
        crush: 120,
        laborGrey: 450,
        laborFinish: 550,
        last_updated: new Date().toISOString()
      }
    });
  });

  app.get("/api/updates/count", (req, res) => {
    res.json({ success: true, count: 1250 });
  });

  app.post("/api/updates/subscribe", (req, res) => {
    res.json({ success: true, message: "Subscribed successfully" });
  });

  app.post("/api/project/invite", (req, res) => {
    res.json({ success: true, message: "Invited successfully" });
  });

  app.post("/api/workspace/gmail/send", (req, res) => {
    res.json({ success: true, message: "Sent successfully" });
  });

  app.get("/api/blog/posts", (req, res) => {
    res.json({ status: "ok", posts: [] });
  });

  app.get("/api/blog/posts/:slug", (req, res) => {
    res.json({ status: "ok", post: null });
  });

  app.post("/api/contact", (req, res) => {
    res.json({ success: true, message: "Contact request received" });
  });
`;

content = content.replace('  // API routes FIRST\n  app.get("/api/health", (req, res) => {\n    res.json({ status: "ok" });\n  });', '  // API routes FIRST\n  app.get("/api/health", (req, res) => {\n    res.json({ status: "ok" });\n  });\n' + mockEndpoints);

fs.writeFileSync('server.ts', content);

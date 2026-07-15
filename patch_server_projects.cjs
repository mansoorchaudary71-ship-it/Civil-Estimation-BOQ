const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const projectRoutes = `
  // Project Storage Array
  const projectsData = [];

  // Project Routes
  app.get("/api/projects", authenticateToken, (req, res) => {
    const userProjects = projectsData.filter(p => p.memberIds.includes(req.user.id));
    res.json(userProjects);
  });

  app.post("/api/projects", authenticateToken, (req, res) => {
    const now = Date.now();
    const newProject = {
      ...req.body,
      id: now.toString(),
      ownerId: req.user.id,
      memberIds: [req.user.id],
      roles: { [req.user.id]: 'owner' },
      memberEmails: { [req.user.id]: req.user.email || '' },
      estimates: [],
      createdAt: now,
      updatedAt: now
    };
    projectsData.push(newProject);
    res.status(201).json(newProject);
  });

  app.put("/api/projects/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const idx = projectsData.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Project not found" });
    
    // Check role
    const role = projectsData[idx].roles[req.user.id];
    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).json({ error: "Forbidden" });
    }

    projectsData[idx] = { ...projectsData[idx], ...req.body, updatedAt: Date.now() };
    res.json(projectsData[idx]);
  });

  app.delete("/api/projects/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const idx = projectsData.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Project not found" });

    // Check role
    const role = projectsData[idx].roles[req.user.id];
    if (role !== 'owner') {
      return res.status(403).json({ error: "Forbidden" });
    }

    projectsData.splice(idx, 1);
    res.json({ success: true });
  });

  app.post("/api/projects/:id/estimates", authenticateToken, (req, res) => {
    const { id } = req.params;
    const idx = projectsData.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Project not found" });
    
    const role = projectsData[idx].roles[req.user.id];
    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).json({ error: "Forbidden" });
    }

    const now = Date.now();
    const newEst = {
      ...req.body,
      id: now.toString(),
      projectId: id,
      date: new Date().toISOString(),
      createdAt: now,
      updatedAt: now
    };

    projectsData[idx].estimates.push(newEst);
    projectsData[idx].updatedAt = now;
    res.status(201).json(newEst);
  });

  app.delete("/api/projects/:id/estimates/:estimateId", authenticateToken, (req, res) => {
    const { id, estimateId } = req.params;
    const idx = projectsData.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Project not found" });

    const role = projectsData[idx].roles[req.user.id];
    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).json({ error: "Forbidden" });
    }

    projectsData[idx].estimates = projectsData[idx].estimates.filter(e => e.id !== estimateId);
    projectsData[idx].updatedAt = Date.now();
    res.json({ success: true });
  });
`;

if (!content.includes('/api/projects')) {
  content = content.replace('  app.get("/api/health", (req, res) => {', projectRoutes + '\n  app.get("/api/health", (req, res) => {');
  fs.writeFileSync('server.ts', content);
}

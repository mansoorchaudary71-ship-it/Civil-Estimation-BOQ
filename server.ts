import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST

  const users = [];
  const JWT_SECRET = process.env.JWT_SECRET || "civil_estimation_pro_secret_key";

  // Auth Middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Please provide all fields" });
      }
      
      const userExists = users.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };
      users.push(newUser);
      
      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
      }

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });


  app.post("/api/auth/logout", (req, res) => {
    // For JWT, logout is primarily handled client-side by deleting the token.
    // We can add a token blacklist here in a production database if needed.
    res.json({ success: true, message: "Logged out successfully" });
  });

  app.get("/api/auth/me", authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });


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

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

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


  // Example API route for Gemini API
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const { prompt } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

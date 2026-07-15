const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const additionalImports = `
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";`;

content = content.replace('import { GoogleGenAI } from "@google/genai";', 'import { GoogleGenAI } from "@google/genai";' + additionalImports);

const authCode = `
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

  app.get("/api/auth/me", authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });
`;

content = content.replace('  // API routes FIRST', '  // API routes FIRST\n' + authCode);

fs.writeFileSync('server.ts', content);

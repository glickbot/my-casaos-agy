const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const WORKSPACES_DIR = '/app/workspaces';
const SETTINGS_FILE = '/root/.gemini/antigravity-cli/settings.json';
const MCP_CONFIG_FILE = '/root/.gemini/antigravity-cli/mcp_config.json';

// Ensure directories exist
if (!fs.existsSync(WORKSPACES_DIR)) fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
const geminiDir = path.dirname(SETTINGS_FILE);
if (!fs.existsSync(geminiDir)) fs.mkdirSync(geminiDir, { recursive: true });

// Auto-register MCP
function registerMcp() {
  const mcpPath = path.join(__dirname, 'mcp-server.js');
  let config = { mcpServers: {} };
  
  if (fs.existsSync(MCP_CONFIG_FILE)) {
    try {
      config = JSON.parse(fs.readFileSync(MCP_CONFIG_FILE, 'utf8'));
    } catch (e) {
      console.error("Failed to parse mcp config", e);
    }
  }
  
  if (!config.mcpServers) config.mcpServers = {};
  
  config.mcpServers["casaos-mcp"] = {
    command: "node",
    args: [mcpPath]
  };
  
  fs.writeFileSync(MCP_CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log("Registered CasaOS MCP server.");
}
registerMcp();

// API Routes
app.get('/api/workspaces', (req, res) => {
  try {
    const items = fs.readdirSync(WORKSPACES_DIR, { withFileTypes: true });
    const repos = items
      .filter(item => item.isDirectory())
      .map(item => ({ name: item.name, path: path.join(WORKSPACES_DIR, item.name) }));
    res.json({ workspaces: repos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workspaces/clone', async (req, res) => {
  const { githubUrl } = req.body;
  if (!githubUrl) return res.status(400).json({ error: "githubUrl is required" });
  
  try {
    // Extract repo name from URL
    const repoName = githubUrl.split('/').pop().replace('.git', '');
    const targetPath = path.join(WORKSPACES_DIR, repoName);
    
    if (fs.existsSync(targetPath)) {
      return res.status(400).json({ error: "Workspace already exists" });
    }
    
    await simpleGit().clone(githubUrl, targetPath);
    res.json({ success: true, workspace: { name: repoName, path: targetPath } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PTY Sessions Tracker
const sessions = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('start_session', ({ workspaceName }) => {
    let cwd = '/app';
    if (workspaceName && workspaceName !== 'Global') {
      cwd = path.join(WORKSPACES_DIR, workspaceName);
      if (!fs.existsSync(cwd)) {
        socket.emit('output', `\r\nError: Workspace ${workspaceName} does not exist.\r\n`);
        return;
      }
    }

    const ptyProcess = pty.spawn('/root/.local/bin/agy', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: cwd,
      env: process.env
    });

    sessions[socket.id] = ptyProcess;

    ptyProcess.onData((data) => {
      socket.emit('output', data);
    });
    
    ptyProcess.onExit(({ exitCode }) => {
      socket.emit('output', `\r\n[Process exited with code ${exitCode}]\r\n`);
    });

    // Auto-Execution Check
    if (workspaceName && workspaceName !== 'Global') {
      const instructionsFile = path.join(cwd, 'instructions.md');
      if (fs.existsSync(instructionsFile)) {
        setTimeout(() => {
          ptyProcess.write("Please review and execute the steps in instructions.md\r");
        }, 2000); // Wait a bit for agy to fully boot
      }
    }
  });

  socket.on('input', (data) => {
    if (sessions[socket.id]) {
      sessions[socket.id].write(data);
    }
  });

  socket.on('resize', (size) => {
    if (sessions[socket.id]) {
      try {
        sessions[socket.id].resize(size.cols, size.rows);
      } catch (e) {
        // Ignored
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (sessions[socket.id]) {
      sessions[socket.id].kill();
      delete sessions[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

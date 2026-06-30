# Architecture

This document serves as the structural blueprint for CasaOS AGY, ensuring AI agents understand the stack and integration points.

## System Overview

CasaOS AGY wraps the Google Antigravity CLI (`agy`) into an accessible, persistent, and sandboxed web environment specifically for CasaOS users. 

### 1. Frontend (Vite + React)
Located in `/frontend`.
- **Purpose**: Provides a graphical user interface to interact with the underlying `agy` terminal.
- **Components**:
  - `App.jsx`: The main dashboard featuring a sidebar for workspace management and global settings.
  - `TerminalComponent.jsx`: Encapsulates `xterm.js` to render the pseudo-terminal. It establishes a `Socket.io` connection to the backend to send keystrokes and receive shell output.
- **Styling**: Tailwind CSS + Custom CSS (`index.css`) utilizing CasaOS-inspired dark mode aesthetics.

### 2. Backend (Node.js + Express)
Located in `/backend`.
- **Purpose**: Serves the frontend assets, acts as a bridge for WebSockets, and manages the `node-pty` pseudo-terminals.
- **Key Modules**:
  - `server.js`: Sets up the Express server, Socket.io listeners, handles GitHub cloning via `simple-git`, and spawns the `/root/.local/bin/agy` process for connected clients.
  - `mcp-server.js`: A custom Model Context Protocol (MCP) server that AGY can connect to. Registered dynamically upon boot.

### 3. Docker & Infrastructure
Located at project root.
- **Dockerfile**: Based on `node:20-bookworm`. It installs the `agy` CLI binary, builds the React frontend via Vite, and configures the container to run the backend server.
- **docker-compose.yml**: Configured with CasaOS specific `x-casaos` fields. It maps persistent volumes:
  - `/var/run/docker.sock`: To allow MCP or AGY to manipulate Docker containers if requested.
  - `/app/workspaces`: Maps to `/DATA/AppData/casaos-agy/workspaces` for code persistence.
  - `/root/.gemini`: Maps to `/DATA/AppData/casaos-agy/gemini` for AGY's local database and context memory.

### Security Boundaries
- The application executes `agy` commands as `root` inside a Docker container.
- Workspace directories isolate projects, preventing `agy` from losing context or destroying global files accidentally.

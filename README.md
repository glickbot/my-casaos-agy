# CasaOS AGY Web

**CasaOS AGY** is a web-based integration of the [Google Antigravity CLI (AGY)](https://github.com/google/antigravity) specifically tailored for CasaOS environments. It provides a sleek, browser-based terminal interface with built-in workspace isolation, auto-execution of AI tasks, and a custom Model Context Protocol (MCP) server.

Turn your CasaOS server into a highly capable, autonomous AI coding assistant!

![App Icon](https://raw.githubusercontent.com/IceWhaleTech/CasaOS/main/public/favicon.ico)

## Features
- **Web-based Terminal**: Powered by `xterm.js` and `node-pty`, providing a flawless pseudo-terminal in the browser.
- **Workspace Isolation**: Manage multiple repositories and workspaces (e.g., cloned from GitHub) and execute autonomous AI agents strictly confined to those directories.
- **Global Settings Management**: Easily configure your Google Gemini API key and model preferences via the web UI.
- **Custom MCP Server**: Automatically registers and serves a custom Model Context Protocol (MCP) server for deep integration.
- **CasaOS Native**: Seamlessly installs into CasaOS as a 3rd party app with pre-configured volumes for persistent storage.

## Installation

### Method 1: Custom Install (Recommended)
1. Open your CasaOS dashboard.
2. Click on the **App Store**.
3. In the top right corner, click **Custom Install**.
4. In the top right corner of the Custom Install modal, click the **Import** icon.
5. Paste the following URL:
   `https://raw.githubusercontent.com/glickbot/my-casaos-agy/main/docker-compose.yml`
6. Click **Submit** and then **Install**.

### Method 2: Command Line
If you prefer standard Docker Compose:
```bash
git clone https://github.com/glickbot/my-casaos-agy.git
cd my-casaos-agy
docker compose up -d
```
Then navigate to `http://<your-casaos-ip>:3000`.

## Architecture
This project is built using:
- **Frontend**: Vite + React + Tailwind CSS + Lucide React + Xterm.js
- **Backend**: Express + Socket.IO + Node-PTY + Simple-Git
- **Docker**: Containerized specifically for Debian Bookworm with native binaries for both AMD64 and ARM64.

## Documentation
- [Installation Guide](docs/INSTALL.md)
- [Development Guide](docs/DEVELOPMENT.md)

## Intent and AI Context
This repository contains an `intent/` directory. This is used by AI agents (like AGY itself) to rapidly understand the context, architecture, and goals of the codebase. See [intent/ARCHITECTURE.md](intent/ARCHITECTURE.md) for more details.

## License
MIT License. See [LICENSE](LICENSE) for more details.

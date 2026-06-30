# Development Guide

This project is split into a **Frontend** (Vite + React) and a **Backend** (Express + Node-PTY). The backend serves the compiled frontend.

## Prerequisites
- Node.js (v20+ recommended)
- Just (`cargo install just` or `apt install just`)
- Docker & Docker Compose

## Available Commands

The project uses a `justfile` for automating common tasks. Run `just` in the root directory to see all commands:

```bash
just              # List all available recipes
just install      # Install all dependencies (frontend and backend)
just dev-frontend # Run frontend dev server (HMR enabled, on port 5173)
just dev-backend  # Start backend server locally (on port 3000)
just build-docker # Manually build the GHCR docker image locally and run it
just up           # Start the application using docker-compose
just down         # Stop the application
just logs         # View application logs
just lint         # Run linting on the frontend
just ci           # Run a full CI pipeline locally (install, lint, build, test)
```

## Local Development Workflow

1. **Install dependencies:**
   ```bash
   just install
   ```

2. **Start the backend server:**
   In one terminal, start the Express/Socket.io backend:
   ```bash
   just dev-backend
   ```
   *Note: This relies on `node-pty` which requires native build tools (make, g++, python3) to compile when you run `npm install`. Ensure your local machine has them.*

3. **Start the frontend dev server:**
   In another terminal, start the Vite server for Hot Module Replacement:
   ```bash
   just dev-frontend
   ```

4. **Testing in Docker:**
   To test the production build locally:
   ```bash
   just build-docker
   ```

## Publishing

The repository is configured with a GitHub Action (`.github/workflows/docker-publish.yml`). Any push or merge to the `main` branch will automatically trigger a build of the Docker image and publish it to the GitHub Container Registry (`ghcr.io/glickbot/my-casaos-agy:latest`).

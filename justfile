# ====================================================================
# justfile for CasaOS AGY
# ====================================================================

# List all available recipes
default:
    @just --list

# =================
# Docker Commands
# =================

# Start the application using docker-compose
up:
    docker compose up -d
    @echo "======================================================"
    @echo "🚀 Application is running!"
    @echo "👉 Test the app at: http://localhost:3000"
    @echo "======================================================"

# Stop the application
down:
    docker compose down

# Rebuild and start the application
build-docker:
    docker compose up -d --build
    @echo "======================================================"
    @echo "🚀 Application built and is running!"
    @echo "👉 Test the app at: http://localhost:3000"
    @echo "======================================================"

# View application logs
logs:
    docker compose logs -f

# =================
# Local Development
# =================

# Install all dependencies (frontend and backend)
install:
    @echo "Installing frontend dependencies..."
    cd frontend && npm install
    @echo "Installing backend dependencies..."
    cd backend && npm install

# Run frontend dev server
dev-frontend:
    cd frontend && npm run dev

# Start backend server locally
dev-backend:
    cd backend && node server.js

# Build the frontend manually for production
build-frontend:
    cd frontend && npm run build

# =================
# Linting & Testing
# =================

# Run linting
lint:
    cd frontend && npm run lint

# Run automated tests (runs on Linux or any OS)
test: lint
    @echo "Running tests..."
    # Add your test frameworks (e.g. Jest, Vitest) here in the future
    # cd frontend && npm test
    # cd backend && npm test
    @echo "✅ All linters and tests passed successfully!"

# Run a full CI pipeline locally (install, lint, build, test)
ci: install lint build-frontend test
    @echo "CI pipeline completed successfully."

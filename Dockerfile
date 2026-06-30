FROM node:20-bookworm

# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    docker.io \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Antigravity CLI
RUN curl -fsSL https://antigravity.google/cli/install.sh | bash

# Create working directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend and copy to backend public directory
RUN cd frontend && npm run build
RUN mkdir -p /app/backend/public && cp -r /app/frontend/dist/* /app/backend/public/

# Start the Node.js server
WORKDIR /app/backend
EXPOSE 3000

CMD ["node", "server.js"]

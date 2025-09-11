# Railway-optimized Dockerfile for Eco-Recommendation App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 py3-pip postgresql-client

# Install serve globally
RUN npm install -g serve

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Copy and install frontend dependencies
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Install Python dependencies for NLP
WORKDIR /app/backend/nlp_api
RUN pip3 install -r requirements.txt

# Go back to app root
WORKDIR /app

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application
CMD ["./start.sh"]
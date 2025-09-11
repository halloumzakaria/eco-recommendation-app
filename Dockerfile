# Railway-optimized Dockerfile for Eco-Recommendation App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 py3-pip postgresql-client

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
RUN npm run build

# Install Python dependencies for NLP
WORKDIR /app/backend/nlp_api
RUN pip3 install -r requirements.txt

# Go back to app root
WORKDIR /app

# Install serve for frontend
RUN npm install -g serve

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application
CMD ["./start.sh"]
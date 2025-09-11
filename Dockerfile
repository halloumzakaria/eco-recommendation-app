# Multi-stage build for Ecosphere
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

FROM python:3.9-slim AS nlp-builder
WORKDIR /app/nlp
COPY backend/nlp_api/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/nlp_api/ ./

FROM postgres:14-alpine AS postgres
ENV POSTGRES_DB=eco_recommendation
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Final production image
FROM node:18-alpine
WORKDIR /app

# Install Python for NLP API
RUN apk add --no-cache python3 py3-pip

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Copy backend
COPY --from=backend-builder /app/backend ./backend

# Copy NLP API
COPY --from=nlp-builder /app/nlp ./nlp

# Install serve for frontend
RUN npm install -g serve

# Install Python dependencies for NLP
RUN pip3 install -r ./nlp/requirements.txt

# Copy docker-compose and other configs
COPY docker-compose.yml ./
COPY railway.json ./

# Expose ports
EXPOSE 3000 5000 5001 5003 5432

# Start script
COPY start.sh ./
RUN chmod +x start.sh
CMD ["./start.sh"]

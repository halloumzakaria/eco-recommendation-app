# Dockerfile.frontend

# Étape 1 : builder avec Node.js
FROM node:18-alpine AS builder

# Accept build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_NLP_API_URL

# Set environment variables for the build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_NLP_API_URL=$REACT_APP_NLP_API_URL

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : servir avec un serveur léger (serve)
FROM node:18-alpine

WORKDIR /app

# Install serve to serve the built files
RUN npm install -g serve

# Copy the built files from the builder stage
COPY --from=builder /usr/src/app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]

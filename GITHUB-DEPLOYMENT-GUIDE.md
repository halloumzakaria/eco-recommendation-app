# GitHub Deployment Guide for Eco-Recommendation

This guide will help you deploy your Eco-Recommendation application using GitHub and various cloud platforms.

## 🚀 Quick Start

### 1. Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub deployment configuration"
   git push origin main
   ```

2. **Set up environment variables** (see Environment Variables section below)

### 2. Choose Your Deployment Platform

## 📋 Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is perfect for full-stack applications with databases.

**Steps:**
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project from your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy automatically!

**Environment Variables for Railway:**
```
POSTGRES_DB=eco_recommendation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
REACT_APP_API_URL=https://your-app.railway.app/api
REACT_APP_NLP_API_URL=https://your-app.railway.app:5001
```

### Option 2: Render

Great for static sites and APIs.

**Steps:**
1. Go to [Render.com](https://render.com)
2. Connect your GitHub account
3. Create a new Web Service
4. Select your repository
5. Configure build and start commands

**Build Command:** `npm install && cd frontend && npm run build`
**Start Command:** `cd backend && npm start`

### Option 3: Docker Hub + VPS

For more control over your deployment.

**Steps:**
1. Push Docker image to Docker Hub
2. Deploy on any VPS (DigitalOcean, AWS, etc.)
3. Use docker-compose to run your application

### Option 4: GitHub Pages (Frontend Only)

For static frontend deployment.

**Steps:**
1. Enable GitHub Pages in repository settings
2. Use the provided GitHub Actions workflow
3. Your app will be available at `https://username.github.io/repository-name`

## 🔧 Environment Variables

Create a `.env` file in your project root (copy from `env.example`):

```bash
# Database Configuration
POSTGRES_DB=eco_recommendation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# API URLs (update for production)
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_NLP_API_URL=https://your-domain.com:5001
```

## 🐳 Docker Deployment

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Use production configuration
docker-compose -f docker-compose.production.yml up -d
```

## 🔄 GitHub Actions

The repository includes automated deployment workflows:

- **Test**: Runs on every push/PR
- **Deploy to Railway**: Deploys on main branch push
- **Deploy to Render**: Alternative deployment option
- **Deploy to Docker Hub**: Builds and pushes Docker images

### Required Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `RAILWAY_TOKEN`: Your Railway API token
- `RAILWAY_SERVICE_NAME`: Your Railway service name
- `RENDER_SERVICE_ID`: Your Render service ID
- `RENDER_API_KEY`: Your Render API key
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token

## 📱 Platform-Specific Instructions

### Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set environment variables:**
   ```bash
   railway variables set POSTGRES_PASSWORD=your_password
   railway variables set JWT_SECRET=your_jwt_secret
   ```

### Render Deployment

1. **Create a new Web Service**
2. **Connect your GitHub repository**
3. **Configure:**
   - Build Command: `npm install && cd frontend && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment: `Node`

### Docker Hub Deployment

1. **Build and push image:**
   ```bash
   docker build -t your-username/eco-recommendation .
   docker push your-username/eco-recommendation
   ```

2. **Deploy on VPS:**
   ```bash
   docker run -d -p 3000:3000 -p 5000:5000 -p 5001:5001 your-username/eco-recommendation
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Ensure database service is running
   - Verify network connectivity

2. **Frontend Can't Connect to Backend**
   - Check `REACT_APP_API_URL` environment variable
   - Ensure backend is running on correct port
   - Check CORS configuration

3. **NLP API Not Working**
   - Verify Python dependencies are installed
   - Check Flask app is running
   - Ensure correct port configuration

### Debug Commands

```bash
# Check container status
docker ps

# View container logs
docker logs container_name

# Access container shell
docker exec -it container_name sh

# Check network connectivity
docker network ls
docker network inspect eco-network
```

## 📊 Monitoring

### Health Checks

The application includes health check endpoints:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000/api/health`
- NLP API: `http://localhost:5001/health`

### Logs

Monitor your application logs:
```bash
# Docker Compose logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nlp_api
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, random secrets
3. **Database Passwords**: Use strong passwords
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly for production

## 📈 Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for caching
3. **CDN**: Use a CDN for static assets
4. **Load Balancing**: Use multiple instances for high traffic

## 🆘 Support

If you encounter issues:

1. Check the logs first
2. Verify environment variables
3. Test locally with Docker
4. Check platform-specific documentation
5. Create an issue in the repository

## 📝 Next Steps

After successful deployment:

1. Set up a custom domain
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Implement CI/CD pipelines
5. Add automated backups

---

**Happy Deploying! 🚀**


# 🚀 Ecosphere Railway Deployment Guide

This guide provides multiple options for deploying your Ecosphere application to Railway.

## 📋 Prerequisites

- Railway account (free at https://railway.app)
- Git repository (GitHub recommended)
- Docker installed locally (for testing)

## 🎯 Deployment Options

### Option 1: GitHub + Railway Web Interface (Recommended)

This is the easiest and most reliable method:

#### Step 1: Prepare GitHub Repository

1. **Create a new GitHub repository**:
   - Go to https://github.com
   - Click "New repository"
   - Name it: `ecosphere-app`
   - Make it **public**
   - Don't initialize with README (you already have code)

2. **Push your code to GitHub**:
   ```bash
   # Add GitHub remote
   git remote add github https://github.com/YOUR_USERNAME/ecosphere-app.git
   
   # Push to GitHub
   git push -u github master
   ```

#### Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with your email
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Connect GitHub** and select `ecosphere-app`
6. **Configure environment variables** (see below)
7. **Deploy!**

### Option 2: Railway CLI (Advanced)

For developers who prefer command line:

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set SECRET_KEY=$(openssl rand -base64 32)
railway variables set POSTGRES_PASSWORD=$(openssl rand -base64 16)

# Deploy
railway up
```

### Option 3: Manual Upload

1. **Create deployment package**:
   ```bash
   tar -czf ecosphere-deployment.tar.gz \
       --exclude=node_modules \
       --exclude=.git \
       --exclude=mon_env \
       --exclude=*.log \
       .
   ```

2. **Upload to Railway**:
   - Go to https://railway.app
   - Click "New Project" > "Empty Project"
   - Upload `ecosphere-deployment.tar.gz`
   - Configure environment variables

## 🔧 Environment Variables

Set these variables in your Railway project:

### Required Variables

```bash
NODE_ENV=production
SECRET_KEY=your_super_secret_jwt_key_here_change_this
POSTGRES_PASSWORD=your_secure_password_here
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
```

### Database Variables

```bash
POSTGRES_DB=eco_recommendation
POSTGRES_USER=postgres
DB_HOST=postgres
DB_PORT=5432
DB_NAME=eco_recommendation
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
```

## 🐳 Docker Configuration

The project includes optimized Docker configurations for Railway:

- `Dockerfile.railway` - Multi-stage build for Railway
- `docker-compose.railway.yml` - Railway-optimized compose file
- `railway.toml` - Railway configuration

## 📱 Services Architecture

Your Ecosphere app consists of:

1. **Frontend** (React) - Port 3000
2. **Backend API** (Node.js/Express) - Port 5000
3. **NLP API** (Python/Flask) - Port 5001
4. **PostgreSQL Database** - Port 5432

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure `POSTGRES_PASSWORD` is set
   - Check database service is running
   - Verify connection strings

2. **Frontend API Calls Failing**:
   - Update `REACT_APP_API_URL` with correct Railway URL
   - Check CORS settings in backend

3. **NLP API Not Working**:
   - Ensure Python dependencies are installed
   - Check `REACT_APP_NLP_API_URL` is correct

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check service status
railway status

# Connect to database
railway connect postgres
```

## 🚀 Quick Start Script

Use the provided deployment script:

```bash
chmod +x railway-deploy.sh
./railway-deploy.sh
```

This script will guide you through the deployment process.

## 📊 Monitoring

After deployment, monitor your app:

1. **Railway Dashboard**: Check service health
2. **Logs**: Monitor application logs
3. **Metrics**: Track performance and usage

## 🔄 Updates

To update your deployment:

1. **Push changes to GitHub**
2. **Railway will auto-deploy** (if enabled)
3. **Or manually trigger deployment** in Railway dashboard

## 💡 Tips

- Use Railway's free tier for development
- Set up custom domains for production
- Enable auto-deploy for continuous deployment
- Monitor resource usage to avoid limits

## 🆘 Support

If you encounter issues:

1. Check Railway documentation: https://docs.railway.app
2. Review application logs
3. Verify environment variables
4. Test locally with Docker first

---

**Happy Deploying! 🌱**

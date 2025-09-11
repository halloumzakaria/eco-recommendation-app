# 🐳 Docker Hub + Railway Deployment Guide

Deploy your Eco Recommendation app using Docker Hub - the easiest and most reliable method!

## 📋 Prerequisites

- Docker Hub account (free at [hub.docker.com](https://hub.docker.com))
- Railway account (free at [railway.app](https://railway.app))
- WSL terminal access

## 🎯 Step 1: Prepare Your Docker Image

### 1.1 Login to Docker Hub
```bash
# In WSL terminal
docker login
# Enter your Docker Hub username and password
```

### 1.2 Build Your Docker Image
```bash
# Navigate to your project directory
cd eco-recommendation

# Build the image with your Docker Hub username
docker build -f Dockerfile.dockerhub -t YOUR_DOCKERHUB_USERNAME/eco-recommendation:latest .

# Example:
# docker build -f Dockerfile.dockerhub -t maryam123/eco-recommendation:latest .
```

### 1.3 Push to Docker Hub
```bash
# Push the image to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/eco-recommendation:latest

# Example:
# docker push maryam123/eco-recommendation:latest
```

## 🎯 Step 2: Deploy to Railway from Docker Hub

### 2.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from Docker Hub"
4. Enter your image name: `YOUR_DOCKERHUB_USERNAME/eco-recommendation:latest`

### 2.2 Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway creates the database automatically

### 2.3 Configure Environment Variables
In your main service, go to "Variables" tab:

**Required Variables:**
```bash
NODE_ENV=production
SECRET_KEY=your_super_secret_jwt_key_here_change_this
```

**Database Variables (Railway sets these automatically):**
```bash
DB_HOST=(Railway sets this)
DB_PORT=(Railway sets this)
DB_NAME=(Railway sets this)
DB_USER=(Railway sets this)
DB_PASSWORD=(Railway sets this)
```

**Frontend API URLs (update after deployment):**
```bash
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
```

### 2.4 Connect Database
1. Go to your service → "Settings"
2. Find "Connect Database"
3. Select your PostgreSQL database
4. Railway automatically sets database environment variables

## 🎯 Step 3: Deploy and Test

1. **Railway automatically deploys** your Docker image
2. **Wait for deployment** to complete (green checkmark)
3. **Get your app URL** from Railway dashboard
4. **Update frontend URLs** with actual Railway URLs
5. **Test your app!**

## 🔄 Updating Your App

To update your app:
```bash
# 1. Make changes to your code
# 2. Rebuild the image
docker build -f Dockerfile.dockerhub -t YOUR_DOCKERHUB_USERNAME/eco-recommendation:latest .

# 3. Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/eco-recommendation:latest

# 4. Railway automatically redeploys!
```

## 🚀 Benefits of Docker Hub Deployment

✅ **Reliable builds** - No build issues on Railway
✅ **Faster deployments** - Pre-built images deploy instantly
✅ **Version control** - Tag different versions
✅ **Easy rollbacks** - Deploy any previous version
✅ **No build limits** - Railway doesn't need to build your complex app
✅ **Works with WSL** - All commands work in your environment

## 🔧 Troubleshooting

### Issue: "Docker build failed"
**Solution**: 
```bash
# Check build logs
docker build -f Dockerfile.dockerhub -t YOUR_DOCKERHUB_USERNAME/eco-recommendation:latest . --no-cache

# Test locally first
docker run -p 3000:3000 YOUR_DOCKERHUB_USERNAME/eco-recommendation:latest
```

### Issue: "Docker push failed"
**Solution**: 
```bash
# Make sure you're logged in
docker login

# Check image exists
docker images | grep eco-recommendation
```

### Issue: "Railway can't pull image"
**Solution**: 
- Make sure image is public on Docker Hub
- Check image name is correct
- Verify image was pushed successfully

## 📱 Testing Your Deployment

After deployment, test:
1. **Frontend loads** at your Railway URL
2. **User registration/login** works
3. **Product search** functions
4. **AI recommendations** work
5. **Database operations** are successful

## 🎉 Success!

You now have:
- A live website accessible from anywhere
- A professional URL for your portfolio
- Easy updates via Docker Hub
- Reliable deployment process

---

**Your Eco Recommendation app is ready for Docker Hub deployment! 🐳🌱**

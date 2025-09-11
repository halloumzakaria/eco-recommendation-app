# 🚀 Railway Docker Deployment Guide

Complete guide to deploy your Eco Recommendation app to Railway using Docker.

## 📋 Prerequisites

- Railway account (free at [railway.app](https://railway.app))
- Your project code ready in GitLab
- Docker configuration files (already set up!)

## 🎯 Step 1: Prepare Your Repository

Your project is already configured with:
- ✅ `Dockerfile.railway` - Railway-optimized Docker configuration
- ✅ `railway.json` - Railway deployment settings
- ✅ `railway.toml` - Alternative Railway configuration
- ✅ Environment variable templates

## 🎯 Step 2: Deploy to Railway

### Method 1: Deploy from GitLab (Recommended)

1. **Go to Railway**: https://railway.app
2. **Sign in** with your account
3. **Click "New Project"**
4. **Select "Deploy from Git repo"**
5. **Connect GitLab**:
   - Click "Connect GitLab"
   - Authorize Railway to access your GitLab
   - Select your repository: `group-1050472`
6. **Railway will detect Docker automatically**
7. **Click "Deploy Now"**

### Method 2: Manual Upload

1. **Go to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Empty Project"**
4. **Upload your `eco-recommendation` folder**
5. **Railway will detect Docker and build automatically**

## 🎯 Step 3: Add PostgreSQL Database

Your app needs a database:

1. **In your Railway project**, click **"+ New"**
2. **Select "Database"**
3. **Choose "PostgreSQL"**
4. **Railway creates the database automatically**
5. **Note the database connection details**

## 🎯 Step 4: Configure Environment Variables

In your main service, go to **"Variables"** tab and add:

### Required Variables:
```bash
NODE_ENV=production
SECRET_KEY=your_super_secret_jwt_key_here_change_this_to_something_secure
```

### Database Variables (Railway sets these automatically when you connect the database):
```bash
DB_HOST=(Railway sets this automatically)
DB_PORT=(Railway sets this automatically)
DB_NAME=(Railway sets this automatically)
DB_USER=(Railway sets this automatically)
DB_PASSWORD=(Railway sets this automatically)
```

### Frontend API URLs (update after deployment):
```bash
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
```

## 🎯 Step 5: Connect Database to Your Service

1. **Go to your main service** → **"Settings"**
2. **Find "Connect Database"** section
3. **Select your PostgreSQL database**
4. **Railway automatically sets database environment variables**

## 🎯 Step 6: Configure Build Settings

Railway should automatically detect your Docker setup, but verify:

1. **Go to your service** → **"Settings"**
2. **Find "Build" section**
3. **Dockerfile path**: `Dockerfile.railway`
4. **Build context**: `.` (root directory)

## 🎯 Step 7: Deploy and Get URLs

1. **Railway will automatically build and deploy** your Docker container
2. **Wait for deployment to complete** (green checkmark)
3. **Go to your service** → **"Settings"** → **"Domains"**
4. **Copy the generated URL** (looks like: `https://your-app-name.railway.app`)

## 🎯 Step 8: Update Frontend URLs

After getting your Railway URLs, update the environment variables:

1. **Go to your service** → **"Variables"**
2. **Update these variables**:
   ```bash
   REACT_APP_API_URL=https://your-actual-backend-url.railway.app/api
   REACT_APP_NLP_API_URL=https://your-actual-nlp-url.railway.app
   ```
3. **Redeploy** (Railway will auto-redeploy when you save variables)

## 🎯 Step 9: Test Your Deployment

After deployment, test these features:

1. **Frontend loads** at your Railway URL
2. **User registration/login** works
3. **Product search** functions
4. **AI recommendations** work
5. **Database operations** are successful

## 🔧 Your App Architecture

### Services Running in Docker Container:
- **Frontend** (React) - Port 3000 (served by `serve`)
- **Backend API** (Node.js) - Port 5000
- **NLP API** (Python Flask) - Port 5001
- **PostgreSQL Database** - External Railway database

### Docker Configuration:
- **Multi-stage build** for optimized image size
- **All services in one container** for simplified deployment
- **Automatic service startup** with proper sequencing
- **Health checks** for reliability

## 🚀 Benefits of This Setup

✅ **Single Docker container** - Easy to manage and deploy
✅ **Optimized for Railway** - Uses Railway-specific configurations
✅ **Automatic scaling** - Railway handles traffic spikes
✅ **Free hosting** - Railway's free tier is generous
✅ **Easy updates** - Just push to GitLab and Railway auto-deploys
✅ **Professional URL** - Perfect for your portfolio

## 🔧 Troubleshooting

### Issue: "Docker build failed"
**Solution**: 
- Check build logs in Railway dashboard
- Ensure all files are in the correct locations
- Verify Dockerfile.railway syntax

### Issue: "Services not starting"
**Solution**: 
- Check that all environment variables are set
- Verify database connection
- Check service logs in Railway dashboard

### Issue: "Database connection failed"
**Solution**: 
- Make sure you connected the PostgreSQL database
- Verify database environment variables are set
- Check database is running and accessible

### Issue: "Port conflicts"
**Solution**: 
- Railway handles port mapping automatically
- Your app should use the PORT environment variable
- Check that services are binding to 0.0.0.0, not localhost

## 📱 Monitoring Your App

Railway provides:
- **Real-time logs** - See what's happening
- **Metrics** - CPU, memory usage
- **Health checks** - Automatic monitoring
- **Automatic restarts** - If something crashes

## 🎉 Success!

Once deployed, you'll have:
- A live website accessible from anywhere
- A professional URL for your portfolio
- Automatic deployments when you push to GitLab
- Free hosting with Railway's generous free tier

## 🔄 Updating Your App

To update your app:
1. **Make changes** to your code
2. **Commit and push** to GitLab
3. **Railway automatically detects changes** and redeploys
4. **Your app updates** without any manual intervention

---

**Your Eco Recommendation app is ready for Railway deployment! 🐳🌱**

## Quick Commands

If you need to test locally with Docker:
```bash
# Build the Railway Docker image
docker build -f Dockerfile.railway -t eco-app .

# Run locally (requires PostgreSQL)
docker run -p 3000:3000 -p 5000:5000 -p 5001:5001 eco-app
```

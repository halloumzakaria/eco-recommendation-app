# 🐳 Docker Deployment to Railway - Complete Guide

Deploying your Ecosphere app as a Docker container to Railway is the best approach for your multi-service application!

## 📋 What You Have

Your app already has these Docker files:
- `Dockerfile` - Main application container
- `Dockerfile.railway` - Railway-optimized container
- `docker-compose.yml` - Multi-service setup
- `docker-compose.railway.yml` - Railway-optimized compose

## 🎯 Step 1: Prepare Your Docker Image

### **Option A: Use Railway's Dockerfile (Recommended)**

Railway will automatically detect and use your `Dockerfile.railway`:

1. **Make sure your `Dockerfile.railway` is ready**
2. **Railway will build the image automatically**

### **Option B: Use Standard Dockerfile**

If you prefer the standard approach:

1. **Railway will use your main `Dockerfile`**
2. **It will run `docker-compose up`**

## 🎯 Step 2: Deploy to Railway

### **Method 1: Deploy from GitLab (Recommended)**

1. **Go to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from Git repo"**
4. **Enter your GitLab URL**: `https://rendu-git.etna-alternance.net/your-username/your-repo.git`
5. **Railway will automatically detect Docker**
6. **Click "Deploy Now"**

### **Method 2: Upload Files Directly**

1. **Go to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Empty Project"**
4. **Upload your entire `eco-recommendation` folder**
5. **Railway will detect Docker and build automatically**

## 🎯 Step 3: Add PostgreSQL Database

Your app needs a database:

1. **In your Railway project**, click **"+ New"**
2. **Select "Database"**
3. **Choose "PostgreSQL"**
4. **Railway creates the database automatically**

## 🎯 Step 4: Configure Environment Variables

In your main service, go to **"Variables"** tab:

### **Required Variables:**
```
NODE_ENV=production
SECRET_KEY=your_super_secret_jwt_key_here_change_this
POSTGRES_PASSWORD=your_secure_password_here
```

### **Database Variables (Railway sets these automatically):**
```
DB_HOST=(Railway sets this)
DB_PORT=(Railway sets this)
DB_NAME=(Railway sets this)
DB_USER=(Railway sets this)
DB_PASSWORD=(Railway sets this)
```

### **Frontend API URLs (update after deployment):**
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
```

## 🎯 Step 5: Connect Database

1. **Go to your main service** → **"Settings"**
2. **Find "Connect Database"**
3. **Select your PostgreSQL database**
4. **Railway automatically sets database environment variables**

## 🎯 Step 6: Configure Docker Build

Railway will automatically detect your Docker setup, but you can customize:

1. **Go to your service** → **"Settings"**
2. **Find "Build" section**
3. **Dockerfile path**: `Dockerfile.railway` (or `Dockerfile`)
4. **Build context**: `.` (root directory)

## 🎯 Step 7: Get Your App URLs

1. **Go to your main service** → **"Settings"**
2. **Find "Domains" section**
3. **Copy the generated URL** (looks like: `https://your-app-name.railway.app`)

## 🎯 Step 8: Update Frontend URLs

Update your environment variables with the actual Railway URLs:

```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
```

## 🎯 Step 9: Deploy and Test

1. **Railway will automatically build and deploy** your Docker container
2. **Wait for deployment to complete** (green checkmark)
3. **Click on your app URL** to test it
4. **Check if all services are running**

## 🔧 Docker Configuration Details

### **Your App Structure:**
- **Frontend** (React) - Port 3000
- **Backend API** (Node.js) - Port 5000
- **NLP API** (Python) - Port 5001
- **PostgreSQL Database** - Port 5432

### **Docker Compose Services:**
```yaml
services:
  postgres:     # Database
  backend:      # Node.js API
  frontend:     # React app
  nlp_api:      # Python NLP service
```

## 🚀 Benefits of Docker Deployment

✅ **Consistent environment** across development and production
✅ **Easy scaling** and management
✅ **All services in one container** (simplified deployment)
✅ **Automatic dependency management**
✅ **Easy to update** and maintain

## 🔧 Troubleshooting

### **Issue: "Docker build failed"**
**Solution**: Check the build logs in Railway dashboard for specific errors

### **Issue: "Services not starting"**
**Solution**: Check that all environment variables are set correctly

### **Issue: "Database connection failed"**
**Solution**: Make sure you connected the PostgreSQL database

### **Issue: "Port conflicts"**
**Solution**: Railway handles port mapping automatically

## 📱 Testing Your Deployment

After deployment, test these features:
1. **Frontend loads** at your Railway URL
2. **User registration/login** works
3. **Product search** functions
4. **AI recommendations** work
5. **Database operations** are successful

## 🎉 Success!

Once deployed, you'll have:
- A live website accessible from anywhere
- A professional URL for your portfolio
- Automatic deployments when you push to GitLab
- Free hosting (with Railway's free tier)

---

**Let's deploy your Dockerized Ecosphere app! 🐳🌱**

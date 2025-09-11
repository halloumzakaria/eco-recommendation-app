# 🚀 Railway Deployment: Step-by-Step Guide for Beginners

Don't worry! I'll guide you through every step to deploy your Ecosphere app to Railway.

## 📋 What You Need

- Your Ecosphere code (✅ You have this)
- GitHub account (✅ You have this)
- Railway account (We'll create this)

## 🎯 Step 1: Create Railway Account

1. **Go to Railway**: https://railway.app
2. **Click "Sign Up"**
3. **Choose "Sign up with GitHub"** (This is the easiest way)
4. **Authorize Railway** to access your GitHub account
5. **Complete your profile** (name, etc.)

## 🎯 Step 2: Create GitHub Repository (if not done)

Your GitHub repository should already exist at: `https://github.com/maryamnajari/ecosphere-app`

If it doesn't exist, let's create it:

1. **Go to GitHub**: https://github.com
2. **Click the "+" icon** → "New repository"
3. **Repository name**: `ecosphere-app`
4. **Make it Public** ✅
5. **Don't initialize** with README (you already have code)
6. **Click "Create repository"**

## 🎯 Step 3: Push Your Code to GitHub

Let's make sure your code is on GitHub:

```bash
# Check if you're in the right directory
pwd
# Should show: /home/maryam/group-1050472/eco-recommendation

# Check git status
git status

# If you have uncommitted changes, commit them
git add .
git commit -m "Prepare for Railway deployment"

# Push to GitHub
git push github master
```

## 🎯 Step 4: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Find and select** `ecosphere-app` from your repositories
5. **Click "Deploy Now"**

## 🎯 Step 5: Configure Environment Variables

After deployment starts, you need to set environment variables:

1. **Click on your project** in Railway dashboard
2. **Go to "Variables" tab**
3. **Add these variables one by one**:

```
NODE_ENV = production
SECRET_KEY = your_super_secret_jwt_key_here_change_this
POSTGRES_PASSWORD = your_secure_password_here
REACT_APP_API_URL = https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL = https://your-nlp-url.railway.app
```

**Important**: Replace the URLs with your actual Railway URLs after deployment!

## 🎯 Step 6: Add Database Service

Your app needs a PostgreSQL database:

1. **In Railway dashboard**, click **"+ New"**
2. **Select "Database"**
3. **Choose "PostgreSQL"**
4. **Railway will create the database automatically**

## 🎯 Step 7: Connect Services

1. **Go to your main service** (the one with your code)
2. **Go to "Settings" tab**
3. **Find "Connect Database"**
4. **Select your PostgreSQL database**
5. **Railway will automatically set the database environment variables**

## 🎯 Step 8: Update Environment Variables

After connecting the database, update these variables:

```
DB_HOST = (Railway will set this automatically)
DB_PORT = (Railway will set this automatically)
DB_NAME = (Railway will set this automatically)
DB_USER = (Railway will set this automatically)
DB_PASSWORD = (Railway will set this automatically)
```

## 🎯 Step 9: Get Your App URLs

1. **Go to your main service**
2. **Click "Settings"**
3. **Find "Domains" section**
4. **Copy the generated URL** (looks like: `https://your-app-name.railway.app`)

## 🎯 Step 10: Update Frontend URLs

Update your environment variables with the actual URLs:

```
REACT_APP_API_URL = https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL = https://your-nlp-url.railway.app
```

## 🎯 Step 11: Deploy and Test

1. **Railway will automatically redeploy** when you change variables
2. **Wait for deployment to complete** (green checkmark)
3. **Click on your app URL** to test it
4. **Check if all services are running**

## 🔧 Troubleshooting

### If deployment fails:

1. **Check the logs** in Railway dashboard
2. **Look for error messages**
3. **Common issues**:
   - Missing environment variables
   - Database connection problems
   - Port configuration issues

### If your app doesn't work:

1. **Check all environment variables are set**
2. **Verify database is connected**
3. **Check service logs for errors**
4. **Make sure all services are running**

## 📱 Your App Structure

Your Ecosphere app has these services:
- **Frontend** (React) - Main user interface
- **Backend API** (Node.js) - Handles data and authentication
- **NLP API** (Python) - Handles AI recommendations
- **PostgreSQL Database** - Stores all data

## 🎉 Success!

Once deployed, you'll have:
- A live website accessible from anywhere
- A professional URL for your portfolio
- Automatic deployments when you push to GitHub
- Free hosting (with Railway's free tier)

## 📞 Need Help?

If you get stuck at any step:
1. **Take a screenshot** of the error
2. **Check the Railway logs**
3. **Ask me for help** with the specific error

---

**Let's get your Ecosphere app live! 🌱**

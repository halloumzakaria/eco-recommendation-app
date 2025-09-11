# 🚀 Deploy from GitLab to Railway - Complete Guide

Deploying from your school's GitLab to Railway is actually easier and more reliable!

## 📋 Prerequisites

- Your GitLab repository URL (from your school)
- Railway account (free at https://railway.app)
- Your code is already in GitLab

## 🎯 Step 1: Get Your GitLab Repository URL

Your GitLab repository should be at: `https://rendu-git.etna-alternance.net`

To get the exact URL, run this command in your terminal:
```bash
cd eco-recommendation
git remote get-url origin
```

## 🎯 Step 2: Create Railway Account

1. **Go to Railway**: https://railway.app
2. **Click "Sign Up"**
3. **Sign up with your email** (you don't need GitHub for this method)
4. **Complete your profile**

## 🎯 Step 3: Deploy from GitLab

### **Option A: Deploy from GitLab URL (Recommended)**

1. **In Railway dashboard**, click **"New Project"**
2. **Select "Deploy from Git repo"**
3. **Enter your GitLab repository URL**:
   ```
   https://rendu-git.etna-alternance.net/your-username/your-repo-name.git
   ```
4. **Click "Deploy Now"**

### **Option B: Deploy from Local Files**

If Railway can't access your GitLab directly:

1. **In Railway dashboard**, click **"New Project"**
2. **Select "Empty Project"**
3. **Upload your files** (drag and drop the `eco-recommendation` folder)

## 🎯 Step 4: Add PostgreSQL Database

Your app needs a database:

1. **In your Railway project**, click **"+ New"**
2. **Select "Database"**
3. **Choose "PostgreSQL"**
4. **Railway creates the database automatically**

## 🎯 Step 5: Configure Environment Variables

In your main service, go to **"Variables"** tab and add:

### **Required Variables:**
```
NODE_ENV=production
SECRET_KEY=your_super_secret_jwt_key_here_change_this
POSTGRES_PASSWORD=your_secure_password_here
```

### **Database Variables (Railway will set these automatically):**
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

## 🎯 Step 6: Connect Database to Your Service

1. **Go to your main service** → **"Settings"**
2. **Find "Connect Database"**
3. **Select your PostgreSQL database**
4. **Railway automatically sets database environment variables**

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

1. **Railway will automatically redeploy** when you change variables
2. **Wait for deployment to complete** (green checkmark)
3. **Click on your app URL** to test it
4. **Check if all services are running**

## 🔧 Troubleshooting

### **Issue: "Repository not accessible"**
**Solution**: Use Option B (upload files directly) instead

### **Issue: "Build failed"**
**Solution**: Check the logs in Railway dashboard for specific errors

### **Issue: "Database connection failed"**
**Solution**: Make sure you connected the PostgreSQL database to your service

### **Issue: "App not loading"**
**Solution**: Check that all environment variables are set correctly

## 📱 Your App Architecture

Your Ecosphere app has these services:
- **Frontend** (React) - Main user interface
- **Backend API** (Node.js) - Handles data and authentication
- **NLP API** (Python) - Handles AI recommendations
- **PostgreSQL Database** - Stores all data

## 🎉 Benefits of GitLab Deployment

✅ **No GitHub authentication issues**
✅ **Uses your existing school repository**
✅ **Keeps everything in one place**
✅ **Easy to update from school**
✅ **No need to manage multiple repositories**

## 🚀 Quick Start Commands

If you want to update your deployment:

```bash
# Make changes to your code
git add .
git commit -m "Update for deployment"
git push origin master

# Railway will automatically redeploy if connected to GitLab
```

## 📞 Need Help?

If you get stuck:
1. **Check Railway logs** for error messages
2. **Verify environment variables** are set correctly
3. **Make sure database is connected**
4. **Ask me for help** with specific errors

---

**Let's get your Ecosphere app live from GitLab! 🌱**

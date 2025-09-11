# ✅ Railway Deployment Checklist

Follow these steps in order to deploy your Ecosphere app:

## 📋 Pre-Deployment Checklist

- [ ] **GitHub Repository**: `https://github.com/maryamnajari/ecosphere-app` exists
- [ ] **Code is pushed to GitHub**: Your latest code is on GitHub
- [ ] **Railway Account**: You have a Railway account at https://railway.app

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub
```bash
# In your terminal (WSL):
cd eco-recommendation
git push github master
```

### Step 2: Create Railway Account
1. Go to https://railway.app
2. Click "Sign Up"
3. Choose "Sign up with GitHub"
4. Authorize Railway to access your GitHub

### Step 3: Deploy from GitHub
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Find and select `ecosphere-app`
4. Click "Deploy Now"

### Step 4: Add Database
1. Click "+ New" in your project
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway creates the database automatically

### Step 5: Set Environment Variables
In your main service, go to "Variables" tab and add:

```
NODE_ENV=production
SECRET_KEY=your_super_secret_jwt_key_here_change_this
POSTGRES_PASSWORD=your_secure_password_here
```

### Step 6: Connect Database
1. Go to your main service → "Settings"
2. Find "Connect Database"
3. Select your PostgreSQL database
4. Railway sets database variables automatically

### Step 7: Get Your URLs
1. Go to your main service → "Settings"
2. Find "Domains" section
3. Copy the generated URL

### Step 8: Update Frontend URLs
Add these variables with your actual Railway URLs:

```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
```

### Step 9: Test Your App
1. Wait for deployment to complete (green checkmark)
2. Click on your app URL
3. Test all features

## 🔧 Common Issues & Solutions

### Issue: "Repository not found"
**Solution**: Make sure your GitHub repository is public and exists

### Issue: "Build failed"
**Solution**: Check the logs in Railway dashboard for specific errors

### Issue: "Database connection failed"
**Solution**: Make sure you connected the PostgreSQL database to your service

### Issue: "App not loading"
**Solution**: Check that all environment variables are set correctly

## 📞 Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Check Railway logs
3. Ask me for help with the specific error

---

**Ready to deploy? Let's start! 🌱**

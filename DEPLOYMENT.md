# 🚀 Ecosphere Deployment Guide

## Free Deployment Options

### Option 1: Railway (Recommended - Easiest)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Connect your GitHub repository
   - Railway will automatically detect Docker Compose
   - Add environment variables:
     ```
     DATABASE_URL=postgresql://postgres:password@postgres:5432/eco_recommendation
     SECRET_KEY=your_super_secret_jwt_key_here
     NODE_ENV=production
     ```

3. **Deploy**
   - Click "Deploy Now"
   - Railway will build and deploy your app
   - Get your live URL!

### Option 2: Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Connect your GitHub repository
   - Choose "Docker" as environment
   - Set build command: `docker-compose up --build`
   - Add environment variables (same as above)

3. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app

### Option 3: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Deploy**
   ```bash
   fly launch
   fly deploy
   ```

## Environment Variables Needed

```
DATABASE_URL=postgresql://postgres:password@postgres:5432/eco_recommendation
SECRET_KEY=your_super_secret_jwt_key_here
NODE_ENV=production
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_NLP_API_URL=https://your-nlp-url.com
```

## Quick Start (Railway)

1. Push your code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Click "Deploy"
7. Get your live URL!

Your Ecosphere app will be live at: `https://your-app-name.railway.app`

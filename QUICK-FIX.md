# 🚨 Quick Fix for 500 Internal Server Error

## The Problem
You're getting a 500 Internal Server Error when searching for "hair care" because the NLP API container is not running or not accessible.

## 🔧 Immediate Solutions

### Option 1: Restart All Containers (Recommended)
```bash
# Stop all containers
docker-compose down

# Start all containers fresh
docker-compose up -d --build

# Wait for services to start
sleep 10

# Test the search
curl "http://localhost:5000/api/products/search?q=hair"
```

### Option 2: Check Container Status
```bash
# Check if containers are running
docker-compose ps

# Check specific container logs
docker-compose logs nlp_api --tail=20
docker-compose logs backend --tail=20
```

### Option 3: Test Individual Services
```bash
# Test backend health
curl http://localhost:5000/

# Test NLP API directly
curl "http://localhost:5003/ai-search?q=hair"

# Test backend search (this should work now with fallback)
curl "http://localhost:5000/api/products/search?q=hair"
```

## 🎯 What I Fixed

### 1. **Added Fallback Search**
- If NLP API is not available, the backend now falls back to a simple database search
- This prevents the 500 error and still returns relevant results

### 2. **Better Error Handling**
- Added detailed logging to help diagnose issues
- Added timeout to prevent hanging requests

### 3. **Database Seeding**
- Created sample products for testing
- Run: `node backend/seed-database.js`

## 🧪 Test Scripts Created

### Test API Connectivity
```bash
node test-connection.js
```

### Test Search Functionality
```bash
python test-search.py
```

## 🔍 Expected Behavior Now

1. **If NLP API is running**: You get AI-powered search results
2. **If NLP API is down**: You get basic database search results (no 500 error)
3. **If database is empty**: You get an empty results array (no 500 error)

## 🚀 Quick Start Commands

```bash
# 1. Navigate to project
cd eco-recommendation

# 2. Restart everything
docker-compose down && docker-compose up -d --build

# 3. Wait for startup
sleep 15

# 4. Seed database with sample products
node backend/seed-database.js

# 5. Test search
curl "http://localhost:5000/api/products/search?q=hair"

# 6. Open frontend
# Go to http://localhost:3000 and try searching
```

## 🐛 If Still Not Working

1. **Check Docker is running**: `docker --version`
2. **Check ports are free**: `netstat -tulpn | grep :5000`
3. **Check container logs**: `docker-compose logs`
4. **Try manual container restart**: `docker-compose restart nlp_api`

The search should now work even if the NLP API is not available!

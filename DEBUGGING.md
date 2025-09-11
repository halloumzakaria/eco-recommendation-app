# 🔍 AI Product Search Debugging Guide

## 🚨 **Issues Fixed**

### ✅ **1. Port Mismatch Issue**
- **Problem**: Backend was calling `eco-nlp:5003` but NLP API was running on port 5001
- **Solution**: Updated `app.py` to run on port 5003 to match backend expectations

### ✅ **2. Missing AI Search Route**
- **Problem**: NLP API (`app.py`) was missing the `/ai-search` endpoint
- **Solution**: Added complete AI search functionality with keyword matching and scoring

### ✅ **3. Docker Compose Configuration**
- **Problem**: NLP API dependency was on backend instead of postgres
- **Solution**: Updated to depend on postgres with health check

## 🛠️ **Quick Fix Commands**

### **1. Rebuild and Start All Services**
```bash
cd eco-recommendation
docker-compose down
docker-compose up -d --build
```

### **2. Check Container Status**
```bash
docker-compose ps
```

### **3. View Logs for Specific Service**
```bash
# Backend logs
docker-compose logs backend --tail=20

# NLP API logs  
docker-compose logs nlp_api --tail=20

# Frontend logs
docker-compose logs frontend --tail=20

# Database logs
docker-compose logs postgres --tail=20
```

### **4. Test API Endpoints**

#### **Test NLP API Directly**
```bash
curl "http://localhost:5003/ai-search?q=hair"
curl "http://localhost:5003/ai-search?q=kitchen"
curl "http://localhost:5003/ai-search?q=bamboo"
```

#### **Test Backend API**
```bash
curl "http://localhost:5000/api/products/search?q=hair"
curl "http://localhost:5000/api/products/search?q=kitchen"
```

#### **Test Frontend**
Open browser: http://localhost:3000

## 🔧 **Debugging Script**

Run the automated debugging script:
```bash
chmod +x debug-api.sh
./debug-api.sh
```

## 📋 **Expected Working Flow**

```
User types "hair care" 
    ↓
Frontend calls /api/products/search?q=hair+care
    ↓
Backend calls eco-nlp:5003/ai-search?q=hair+care
    ↓
NLP API processes query with keyword matching
    ↓
Returns scored results (top 10)
    ↓
Frontend displays products with scores
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: 500 Internal Server Error**
**Cause**: Container communication problems
**Solution**:
```bash
docker-compose down
docker-compose up -d --build
```

### **Issue 2: Connection Refused**
**Cause**: Services not ready or port conflicts
**Solution**:
```bash
# Check if ports are in use
netstat -tulpn | grep :5000
netstat -tulpn | grep :5003
netstat -tulpn | grep :3000

# Kill processes using ports if needed
sudo kill -9 $(lsof -t -i:5000)
sudo kill -9 $(lsof -t -i:5003)
sudo kill -9 $(lsof -t -i:3000)
```

### **Issue 3: Database Connection Issues**
**Cause**: PostgreSQL not ready
**Solution**:
```bash
# Wait for database to be ready
docker-compose exec postgres pg_isready -U postgres

# Check database logs
docker-compose logs postgres
```

### **Issue 4: Frontend Compilation Errors**
**Cause**: Missing dependencies
**Solution**:
```bash
# Rebuild frontend container
docker-compose build frontend
docker-compose up -d frontend
```

## 🧪 **Test Search Queries**

Try these search queries to test the AI functionality:

- `hair care` - Should find hair-related products
- `kitchen items` - Should find kitchen products  
- `bamboo products` - Should find bamboo items
- `eco-friendly soap` - Should find soap products
- `reusable bottles` - Should find bottle products
- `yoga mat` - Should find yoga/sport products
- `cotton bags` - Should find bag products

## 📊 **API Response Format**

### **Successful Search Response**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Bamboo Hair Brush",
      "description": "Eco-friendly bamboo hair brush",
      "category": "hygiène",
      "price": 15.99,
      "score": 8
    }
  ]
}
```

### **Empty Search Response**
```json
{
  "results": []
}
```

## 🔍 **Monitoring Commands**

### **Real-time Logs**
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend
docker-compose logs -f nlp_api
```

### **Container Resource Usage**
```bash
docker stats
```

### **Network Connectivity Test**
```bash
# Test from backend to NLP API
docker-compose exec backend curl eco-nlp:5003/ai-search?q=test

# Test from NLP API to database
docker-compose exec nlp_api python -c "import psycopg2; print('DB OK')"
```

## 🚀 **Performance Optimization**

### **If Search is Slow**
1. Check database indexes on Products table
2. Monitor container resource usage
3. Consider caching search results

### **If Memory Issues**
1. Increase Docker memory limits
2. Monitor container memory usage
3. Restart containers if needed

## 📞 **Support**

If issues persist:
1. Run the debugging script: `./debug-api.sh`
2. Check all container logs
3. Verify all services are running
4. Test each API endpoint individually

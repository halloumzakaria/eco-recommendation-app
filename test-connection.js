// test-connection.js
const axios = require('axios');

async function testConnection() {
  console.log("🔍 Testing API Connections...\n");
  
  // Test 1: Backend health check
  console.log("1. Testing Backend Health Check...");
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log("✅ Backend is running:", response.data);
  } catch (error) {
    console.log("❌ Backend is not running:", error.message);
  }
  
  // Test 2: Backend products endpoint
  console.log("\n2. Testing Backend Products Endpoint...");
  try {
    const response = await axios.get('http://localhost:5000/api/products/');
    console.log("✅ Backend products endpoint working:", response.data.length, "products found");
  } catch (error) {
    console.log("❌ Backend products endpoint error:", error.message);
  }
  
  // Test 3: NLP API direct connection
  console.log("\n3. Testing NLP API Direct Connection...");
  try {
    const response = await axios.get('http://localhost:5003/ai-search?q=hair');
    console.log("✅ NLP API is running:", response.data);
  } catch (error) {
    console.log("❌ NLP API is not running:", error.message);
    console.log("   This is likely the cause of the 500 error!");
  }
  
  // Test 4: Backend search endpoint
  console.log("\n4. Testing Backend Search Endpoint...");
  try {
    const response = await axios.get('http://localhost:5000/api/products/search?q=hair');
    console.log("✅ Backend search endpoint working:", response.data);
  } catch (error) {
    console.log("❌ Backend search endpoint error:", error.message);
    console.log("   Error details:", error.response?.data || error.message);
  }
  
  console.log("\n🔧 Troubleshooting Tips:");
  console.log("1. Make sure all containers are running: docker-compose ps");
  console.log("2. Check container logs: docker-compose logs nlp_api");
  console.log("3. Restart containers: docker-compose down && docker-compose up -d");
  console.log("4. Seed database: node backend/seed-database.js");
}

testConnection();

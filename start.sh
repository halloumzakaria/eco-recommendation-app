#!/bin/sh

# Wait for database to be ready (Railway provides DATABASE_URL)
echo "🚀 Starting Eco-Recommendation App..."

# Start NLP API (only if DATABASE_URL is available)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🐍 Starting NLP API..."
    cd /app/backend/nlp_api && python3 app.py &
    sleep 3
else
    echo "⚠️  No DATABASE_URL found, skipping NLP API"
fi

# Start Backend
echo "🔧 Starting Backend..."
cd /app/backend && npm start &
sleep 3

# Start Frontend
echo "🌐 Starting Frontend..."
cd /app && serve -s frontend/build -l ${PORT:-3000} &
sleep 3

echo "✅ All services started!"

# Keep container running
wait

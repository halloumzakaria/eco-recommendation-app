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

# Start Backend (which will serve both API and frontend)
echo "🔧 Starting Backend with Frontend..."
cd /app/backend && PORT=${PORT:-8080} npm start

echo "✅ App started!"

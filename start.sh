#!/bin/sh

# Railway will provide PostgreSQL as a service
# Start NLP API
cd /app/backend/nlp_api && python3 app.py &
sleep 5

# Start Backend
cd /app/backend && npm start &
sleep 5

# Start Frontend
cd /app && serve -s frontend/build -l ${PORT:-3000} &
sleep 5

# Keep container running
wait

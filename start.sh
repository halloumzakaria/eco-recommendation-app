#!/bin/sh

# Start PostgreSQL
postgres &
sleep 10

# Start NLP API
cd /app/nlp && python3 app.py &
sleep 5

# Start Backend
cd /app/backend && npm start &
sleep 5

# Start Frontend
cd /app && serve -s frontend/build -l 3000 &
sleep 5

# Keep container running
wait

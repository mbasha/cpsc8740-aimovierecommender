#!/bin/bash
set -e

echo "Starting Python inference service..."
python inference.py &
PYTHON_PID=$!
echo "Python inference service started (PID $PYTHON_PID)"

# Give Python service time to start
sleep 2

echo "Starting Go API server..."
exec ./api/server

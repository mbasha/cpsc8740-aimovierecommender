#!/bin/bash

echo "Starting AI Movie Recommender..."

# Start Python inference service
source venv/bin/activate
python inference.py &
INFERENCE_PID=$!
echo "Inference service started (PID $INFERENCE_PID)"

# Wait for inference service to be ready
sleep 3

# Start Go API
cd api
go run . &
GO_PID=$!
cd ..
echo "Go API started (PID $GO_PID)"

# Start React frontend
cd frontend
npm run dev &
REACT_PID=$!
cd ..
echo "React frontend started (PID $REACT_PID)"

echo ""
echo "All services running:"
echo "  Inference: http://localhost:5001"
echo "  Go API:    http://localhost:8080"
echo "  Frontend:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and clean up on exit
trap "echo 'Stopping...'; kill $INFERENCE_PID $GO_PID $REACT_PID 2>/dev/null; exit" INT
wait
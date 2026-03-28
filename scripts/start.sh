#!/bin/bash
# Start all services for local development

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting Top Shelf Rentals..."

# Start Python inference service
cd "$ROOT"
source venv/bin/activate
python inference.py &
INFERENCE_PID=$!
echo "Inference service started (PID $INFERENCE_PID)"

sleep 3

# Start Go API
cd "$ROOT/api"
go run . &
GO_PID=$!
cd "$ROOT"
echo "Go API started (PID $GO_PID)"

# Start React frontend
cd "$ROOT/frontend"
npm run dev &
REACT_PID=$!
cd "$ROOT"
echo "React frontend started (PID $REACT_PID)"

echo ""
echo "All services running:"
echo "  Inference: http://localhost:5001"
echo "  Go API:    http://localhost:8080"
echo "  Frontend:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

trap "echo 'Stopping...'; kill $INFERENCE_PID $GO_PID $REACT_PID 2>/dev/null; exit" INT
wait
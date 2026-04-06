#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying dist to api..."
cp -r frontend/dist api/dist

echo "Building Go API..."
cd api
go build -o server .
cd ..

echo "Build complete."
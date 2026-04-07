#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying dist to api..."
rm -rf api/dist
cp -r frontend/dist api/dist

echo "Building Go binary..."
cd api
go build -o server .
cd ..

echo "Done."
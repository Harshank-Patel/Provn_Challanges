#!/bin/bash

echo "================================="
echo "Starting Provn Challenge"
echo "================================="

source "$(conda info --base)/etc/profile.d/conda.sh"

conda activate provn_ai

echo ""
echo "Starting Backend..."

uvicorn backend.app:app --reload &

echo ""
echo "Starting Frontend..."

cd frontend
npm run dev &

echo ""
echo "================================="
echo "Backend:  http://localhost:8000"
echo "Docs:     http://localhost:8000/docs"
echo "Frontend: http://localhost:5173"
echo "================================="

wait
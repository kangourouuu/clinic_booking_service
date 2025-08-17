#!/bin/bash

echo "🔁 Starting docker compose..."
docker compose -f docker-compose.yml --env-file .env up --build

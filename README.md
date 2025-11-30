# Canva Selling Templates - Production Repo

This repository contains a full-stack Canva-style selling-template app:
- Frontend: Vite + React + Tailwind
- Backend: Express + SQLite (auth, asset proxy, Stripe checkout, webhook)
- Features: Canvas editor, html2canvas export, SVG export with embedded fonts,
  font upload & picker, asset manager, layers, snapping, autosave (IndexedDB)
- Deployment: Dockerfiles & docker-compose, Nginx proxy, GitHub Actions CI/CD

See `.env.example` for environment variables.

To run (development):
1. Start server:
   cd server
   npm install
   cp .env.example .env
   node index.js

2. Start frontend:
   cd frontend
   npm install
   npm run dev

To run with Docker Compose:
1. Copy `.env.prod` to `.env`
2. docker-compose up -d --build


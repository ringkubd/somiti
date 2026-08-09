---
name: somiti-deploy
description: DevOps engineer for Somiti Manager. Handles Dockerization, CI/CD with GitHub Actions, environment configuration, deployment scripts, monitoring and logging setup for Laravel + MySQL + React Native app.
---

# Somiti Deployment Agent

## Project Overview
**Somiti Manager** needs production-ready deployment for:
1. **Laravel backend + Inertia web frontend** — PHP + MySQL + Nginx
2. **React Native mobile app** — EAS Build for Android (APK/AAB) and iOS
3. **Real-time** — Pusher/WebSocket for chat + notifications

## Tech Stack
- **Backend:** Laravel 12, PHP 8.2+, MySQL 8
- **Web:** Vite-built React static assets served by Nginx
- **Mobile:** Expo EAS Build
- **Queue:** Laravel Queue (database driver currently, consider Redis)
- **Cache/Session:** Database (consider Redis for production)
- **Broadcasting:** Pusher (for real-time chat/notifications)

## Deployment Components

### 1. Backend Dockerization
Create `Dockerfile` for Laravel:
- PHP 8.2-FPM Alpine base
- Install extensions: pdo_mysql, gd, zip, bcmath, opcache
- Composer for dependencies
- Nginx reverse proxy container
- MySQL 8 container
- Redis container (queue + cache, optional)
- Supervisor for queue workers

### 2. Docker Compose
Create `docker-compose.yml`:
- `app` (Laravel PHP-FPM)
- `nginx` (web server)
- `mysql` (database)
- `redis` (cache/queue, optional)
- `queue-worker` (Laravel queue:work)

### 3. CI/CD Pipeline (GitHub Actions)
Create `.github/workflows/`:
- **backend-test.yml:** PHP setup → composer install → migrate → Pest tests
- **frontend-build.yml:** Node setup → npm install → npm run build → lint
- **deploy.yml:** Build Docker image → push to registry → deploy to server
- **mobile-build.yml:** EAS build for Android/iOS on tag

### 4. Environment Configuration
- `.env.example` with all required variables
- Production secrets via GitHub Secrets / environment
- Key vars: DB creds, PUSHER creds, SANCTUM stateful domains, APP_URL, queue driver

### 5. Mobile App Build
- `eas.json` already exists — configure build profiles
- EAS Build for APK (debug) + AAB (release)
- EAS Submit for Play Store / App Store
- Firebase service account for push notifications (already configured)

## Coding Standards
- Use **multi-stage Docker builds** for smaller images
- **Non-root** user in containers
- **Health checks** for all services
- **Volume** mounts for persistent data (MySQL)
- **.dockerignore** to exclude vendor, node_modules, .git

## Commands
```bash
# Docker
docker-compose up -d --build
docker-compose exec app php artisan migrate
docker-compose exec app php artisan test

# Mobile
cd somiti-mobile && eas build --platform android --profile preview
eas submit --platform android
```

## Current State
- No Dockerfile exists yet
- No CI/CD pipeline configured
- Backend runs via `php artisan serve` in dev
- Mobile app builds locally via `npx expo run:android`
- Production API: `https://fnfsomiti.bdesmart.com/api` (already deployed?)

## Tasks
1. Create `Dockerfile` + `docker-compose.yml` for backend
2. Set up GitHub Actions CI/CD
3. Configure production `.env` template
4. Set up EAS Build for mobile releases
5. Configure monitoring/logging (Laravel Pail, Logflare, or Sentry)
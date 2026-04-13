# Finance Management Microservices

A learning-focused microservices project for personal finance management. The system is split into isolated services with JWT-based authentication, Redis-backed caching, and synchronous inter-service communication.

## Overview

The project contains three services:

- `identity` - register/login users and issue JWT tokens
- `finance` - manage expenses and salaries, expose monthly summaries, cache summary results in Redis
- `reports` - generate and persist monthly reports based on data fetched from `finance`

## Architecture Flow

```text
Client
  |
  | 1. Register / login
  v
identity (3001)
  |
  | 2. Returns JWT
  v
Client
  |
  | 3. Call protected endpoints with Bearer token
  v
finance (4001) ----> Redis
  |
  | 4. reports requests monthly summary over HTTP
  v
reports (5001)
```

## Key Rules

- Each service owns its own PostgreSQL schema, enforcing data ownership boundaries within a shared instance.
- No service reads another service's schema directly.
- identity, finance, and reports use the same AUTH_SECRET in this MVP.
- reports depends on finance through FINANCE_BASE_URL.
- Redis is used only by finance for summary caching.

## Services

### practice/identity

- User registration and login
- JWT issuance
- Zod input validation
- Default port: 3001

### practice/finance

- Expenses CRUD
- Salaries CRUD
- Monthly summary endpoint
- Redis cache with invalidation on writes
- JWT-protected endpoints
- Default port: 4001

### practice/reports

- Monthly report generation
- Calls finance summary endpoint over HTTP
- Stores a report snapshot in its own DB
- Idempotent per userId + month + year
- Default port: 5001

## Tech Stack

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Redis
- JWT
- Zod
- Microservices Architecture
- Docker / Docker Compose
- git/github

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL running locally
- Redis running locally if finance cache is enabled

### Environment Variables

Each service has its own .env file.

**Identity env:** `practice/identity/.env`

```env
DATABASE_URL
PORT=3001
AUTH_SECRET
JWT_EXPIRES_IN
```

**Finance env:** `practice/finance/.env`

```env
DATABASE_URL
PORT=4001
AUTH_SECRET
REDIS_ENABLED=true|false
REDIS_URL
REDIS_PREFIX
```

**Reports env:** `practice/reports/.env`

```env
DATABASE_URL
PORT=5001
AUTH_SECRET
FINANCE_BASE_URL=http://localhost:4001
```

### Local Run

Use this mode if you want to run each service separately on your machine.

Install dependencies in each service:

```bash
cd practice/identity
npm install

cd ../finance
npm install

cd ../reports
npm install
```

Run Prisma setup manually for local development only.

Recommended order:

1. practice/identity
2. practice/finance
3. practice/reports

For each service:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the services in three terminals:

```bash
cd practice/identity
node server.js
```

```bash
cd practice/finance
node server.js
```

```bash
cd practice/reports
node server.js
```

Health checks:

```text
http://localhost:3001/health
http://localhost:4001/health
http://localhost:5001/health
```

### Docker Compose Run

Use this mode if you want Docker to orchestrate the full system.

From `practice/`:

```bash
cd practice
docker compose up -d --build
docker compose ps
```

In Docker Compose, each service runs its own migration automatically before startup using `npx prisma migrate deploy`.

Useful commands:

```bash
docker compose logs -f
docker compose down
docker compose down -v
```

## End-to-End Usage

1. Register or login via identity.
2. Copy the returned JWT.
3. Call finance endpoints with `Authorization: Bearer <token>`.
4. Call reports with the same token.
5. reports fetches the monthly summary from finance and stores a report snapshot.

Example login:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your@email.com\",\"password\":\"your-password\"}"
```

Example summary request:

```bash
curl http://localhost:4001/summary/2026/2 \
  -H "Authorization: Bearer <token>"
```

## Key Design Decisions

- **Schema per service** — each service owns a separate PostgreSQL schema within a shared instance, keeping data ownership boundaries explicit.
- **Shared JWT secret** — simplifies local auth verification for the MVP.
- **Redis only in finance** — keeps caching close to the aggregation hotspot.
- **Persisted reports** — provide a stable monthly snapshot instead of recomputing every read.
- **Idempotent monthly report generation** — prevents duplicate reports for the same period.

## Project Structure

```text
practice/
  identity/
  finance/
  reports/
  shared/
```

## Docker Image Optimization

Docker images were optimized using multi-stage builds and a `.dockerignore` file to reduce the size of production images.

### Image Size Before Optimization

| Service  | Size   |
|----------|--------|
| identity | 1.46GB |
| finance  | 1.43GB |
| reports  | 1.43GB |

### Image Size After Optimization

| Service  | Size  |
|----------|-------|
| identity | 581MB |
| finance  | 583MB |
| reports  | 580MB |

**Result:** ~60% reduction in Docker image size per service.

### Build Time Measurement (no cache)

**Before optimization:**

| Build | Time     |
|-------|----------|
| 1     | 403.32s  |
| 2     | 325.53s  |
| 3     | 391.66s  |

**After optimization:**

| Build | Time     |
|-------|----------|
| 1     | 393.78s  |
| 2     | 528.43s  |
| 3     | 463.76s  |

**Observation:**

The optimization significantly reduced the final production image size, while full `--no-cache` build time increased due to dependency installation in multi-stage builds.

## Redis Cache Performance Benchmark

To measure the real impact of Redis caching, the finance service was benchmarked against a large dataset under two conditions: Redis disabled (every request hits PostgreSQL directly) and Redis enabled (first request populates the cache, subsequent requests are served from Redis).

### Dataset

- **100 users**, each with **200 expenses × 12 months = 2,400 expenses**
- **240,000 expense records** total in PostgreSQL
- Endpoint tested: `GET /summary/2025/1`
- All requests authenticated with a valid JWT Bearer token
- Docker Compose environment (finance-service + Redis + PostgreSQL containers)

### Results — Redis OFF (direct PostgreSQL queries)

| Request | Status | Response Time |
| ------- | ------ | ------------- |
| #1 | 200 OK | 698ms |
| #2 | 200 OK | 131ms |
| #3 | 200 OK | 106ms |
| #4 | 200 OK | 108ms |
| #5 | 200 OK | 103ms |

Request #1 is slower due to cold PostgreSQL query planning and connection warm-up.
Requests #2–5 average ~112ms — each one performs a full DB aggregation scan.

### Results — Redis ON (in-memory cache)

| Request | Status | Response Time |
| ------- | ------ | ------------- |
| #1 | 200 OK | 96ms |
| #2 | 200 OK | 73ms |
| #3 | 200 OK | 71ms |
| #4 | 200 OK | 70ms |
| #5 | 200 OK | 92ms |

Request #1 is served from a warm cache populated in a previous run.
Requests #2–5 average ~77ms — served entirely from Redis, no DB scan.

### Summary

| Condition | Cold Request | Avg Requests #2–5 |
| --------- | ------------ | ----------------- |
| Redis OFF | 698ms | ~112ms |
| Redis ON | 96ms | ~77ms |

- Cold request is **~7× faster** with Redis (698ms → 96ms)
- Repeated requests are **~31% faster** on average (112ms → 77ms)
- At 240,000 records, skipping the DB aggregation entirely via Redis has a measurable and consistent effect on response time

## Future Improvements

- Replace shared JWT secret with asymmetric verification.
- Add automated tests and CI.
- Add centralized logging and tracing.

## Security

- Do not commit real `.env` files.
- Keep `.env` in `.gitignore`.
- Rotate secrets if they were exposed.

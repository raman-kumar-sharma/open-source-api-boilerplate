# Open Source API Boilerplate

Enterprise-grade Node.js REST API with Express, MongoDB, JWT auth, permission-based RBAC, audit logging, observability, and production hardening.

[![CI](https://github.com/raman-kumar-sharma/open-source-api-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/raman-kumar-sharma/open-source-api-boilerplate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Repo:** [github.com/raman-kumar-sharma/open-source-api-boilerplate](https://github.com/raman-kumar-sharma/open-source-api-boilerplate)

## Enterprise capabilities

| Area | Implementation |
|------|----------------|
| **Architecture** | Layered design with constructor DI, service/repository boundaries |
| **Security** | JWT access + refresh (HTTP-only cookie), account lockout, auth rate limiting, Helmet, CORS, XSS/mongo sanitization |
| **Authorization** | Role-based access with fine-grained permission matrix (`users:read`, `audit:read`, …) |
| **Observability** | Correlation IDs (`X-Request-ID`), structured Winston logs, Prometheus metrics at `/metrics` |
| **Reliability** | Liveness/readiness probes, graceful shutdown with DB disconnect, `dumb-init` in Docker |
| **Compliance** | Immutable audit trail for auth and sensitive user operations |
| **API standards** | RFC 7807–style problem details, consistent success envelope with `correlationId` |
| **Quality** | Jest + Supertest, ESLint, GitHub Actions CI with coverage artifact |

## Features

- Routes → controllers → services → repositories
- Constructor-based dependency injection (`src/container`)
- Permission-based RBAC beyond coarse roles
- Audit log API for administrators
- Account lockout after configurable failed login attempts
- AsyncLocalStorage request context for distributed tracing
- Prometheus histograms/counters (HTTP + auth)
- Swagger UI at `/api-docs`

## Stack

| | |
|---|---|
| Runtime | Node.js 18+ (ES modules) |
| API | Express |
| DB | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Metrics | prom-client |
| Docs | OpenAPI / Swagger |
| CI | GitHub Actions |

## Setup

```bash
git clone https://github.com/raman-kumar-sharma/open-source-api-boilerplate.git
cd open-source-api-boilerplate
npm install
cp .env.example .env
npm run dev
```

API: `http://localhost:3000`  
Docs: `http://localhost:3000/api-docs`  
Metrics: `http://localhost:3000/metrics`

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | HTTP port |
| `MONGODB_URI` | required | MongoDB connection string |
| `JWT_ACCESS_SECRET` | required | Min 32 characters |
| `JWT_REFRESH_SECRET` | required | Min 32 characters |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `CLIENT_URL` | `http://localhost:3000` | CORS origin |
| `APP_URL` | `http://localhost:3000` | Public base URL (problem types) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Global rate limit window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `METRICS_ENABLED` | `true` | Expose Prometheus metrics |
| `METRICS_PATH` | `/metrics` | Metrics endpoint path |
| `METRICS_TOKEN` | _(empty)_ | Optional Bearer token for `/metrics` |
| `AUDIT_LOG_ENABLED` | `true` | Persist security audit events |
| `ACCOUNT_LOCKOUT_ENABLED` | `true` | Lock accounts after failed logins |
| `MAX_LOGIN_ATTEMPTS` | `5` | Attempts before lockout |
| `ACCOUNT_LOCK_DURATION_MS` | `900000` | Lock duration (15 min) |
| `LOG_LEVEL` | `info` | Winston log level |

Do not commit `.env`.

## Docker

```bash
cp .env.example .env
docker-compose up -d
```

Readiness probe: `GET /api/v1/health/ready`

## API

### Health & ops

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Summary health |
| GET | `/api/v1/health/live` | Kubernetes liveness |
| GET | `/api/v1/health/ready` | Kubernetes readiness (DB ping) |
| GET | `/metrics` | Prometheus metrics (optional Bearer) |

Pass `X-Request-ID` on any request to propagate correlation through logs and responses.

### Auth

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/refresh-token` |
| POST | `/api/v1/auth/logout` |
| POST | `/api/v1/auth/forgot-password` |
| POST | `/api/v1/auth/reset-password` |
| POST | `/api/v1/auth/verify-email` |

### Users

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/v1/users` | `users:list` |
| GET | `/api/v1/users/:id` | `users:read` |
| PUT | `/api/v1/users/:id` | `users:write` |
| DELETE | `/api/v1/users/:id` | `users:delete` |
| PATCH | `/api/v1/users/profile` | `profile:write` |

### Audit (admin)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/v1/audit-logs` | `audit:read` |

Query: `?page=1&limit=10&action=auth.login&from=2025-01-01`

## Permission matrix

| Permission | Admin | Manager | User |
|------------|-------|---------|------|
| `users:list` | ✓ | ✓ | |
| `users:read` | ✓ | ✓ | ✓ (own via service rule) |
| `users:write` | ✓ | | |
| `users:delete` | ✓ | | |
| `profile:write` | ✓ | ✓ | ✓ |
| `audit:read` | ✓ | | |

## Dependency injection

Wiring lives in `src/container/index.js`. Tests use `createContainer()` and can override registrations.

## Scripts

```bash
npm run dev
npm test
npm run test:coverage
npm run lint
```

## Structure

```
src/
├── config/
├── container/
├── controllers/
├── services/
├── repositories/
├── models/
├── routes/
├── middlewares/
├── observability/
├── lib/              # request context (AsyncLocalStorage)
├── validators/
├── utils/
├── app.js
└── server.js
tests/
.github/workflows/
```

## Contributing

1. Fork [the repo](https://github.com/raman-kumar-sharma/open-source-api-boilerplate)
2. Branch, commit, push
3. Open a PR (`npm test` and `npm run lint` must pass)

## License

[MIT](LICENSE)

# City News Search — Backend API

Node.js + Express + PostgreSQL + Prisma + Convex + SERP API

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CONVEX_URL` | Your Convex deployment URL (used when the backend calls a
  Convex token‑issuance endpoint) |
| `CONVEX_JWT_ISSUER` | Convex JWT issuer URL (used for JWKS verification) |
| `CONVEX_JWT_SECRET` | *(optional)* secret used to sign/verify tokens locally when the
  Convex service has no issuance endpoint. If set, the backend will fall
  back to HS256 tokens instead of making network requests. |
| `SERP_API_KEY` | Google SERP API key from serpapi.com |
| `PORT` | Server port (default 3000) |

### 3. Run database migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start development server

```bash
npm run dev
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login + create session |
| POST | `/api/auth/logout` | Yes | Logout + close session |

### User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | `/api/users/city` | Yes | Update user's city |

### News

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/news?city=mumbai&sessionId=...` | Yes | Fetch news + log search |

### Admin

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/api/admin/users` | Yes | ADMIN |
| GET | `/api/admin/sessions` | Yes | ADMIN |
| GET | `/api/admin/searches` | Yes | ADMIN |

All admin and protected routes require a Convex JWT in the `Authorization: Bearer <token>` header.

---

## Authentication Flow

1. Backend requests a Convex JWT pair from the Convex deployment when a
   user registers or logs in. (Previously the frontend obtained the token,
   but the API now handles issuance so clients simply receive and store it.)
2. Client stores the returned access token and refresh token locally.
3. Subsequent API calls include the access token in an
   `Authorization: Bearer <token>` header.
4. Backend validates JWTs via Convex's JWKS endpoint using
   `verifyConvexToken`.
5. Backend maps Convex user (`email` claim) → internal PostgreSQL user and
   enforces authorization.

---

## Architecture

```
src/
├── domain/
│   ├── entities/          # User, Session, Search, NewsArticle interfaces
│   └── repositories/      # Repository interface definitions (contracts)
├── application/
│   └── use-cases/         # Business logic (register, login, logout, searchNews, updateCity)
├── infrastructure/
│   ├── database/          # Prisma client + repository implementations
│   ├── convex/            # Convex JWT verification (JWKS-based)
│   └── serp/              # Google SERP API service
├── interfaces/
│   ├── controllers/       # auth, user, news, admin
│   ├── routes/            # Express routers
│   ├── middlewares/       # auth, validation, error handling
│   └── validators/        # Zod schemas
├── shared/
│   ├── errors/            # AppError, BadRequestError, UnauthorizedError, etc.
│   ├── logger/            # Winston logger
│   └── utils/             # Response helpers, pagination
├── app.ts                 # Express app factory (helmet, cors, rate-limit)
└── server.ts              # Bootstrap + graceful shutdown
```

---

## Session Lifecycle

- **Login** → creates a `sessions` row with `login_time`; returns `sessionId` to client
- **News search** → client sends `sessionId` as query param; search is logged
- **Logout** → `logout_time` and `duration_seconds` are calculated and stored
- **App crash** → session stays open (acceptable per spec)

---

## Request/Response Format

### Success

```json
{
  "success": true,
  "message": "Login successful",
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email address" }]
}
```

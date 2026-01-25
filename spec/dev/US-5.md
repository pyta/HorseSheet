# US-5: Add Authentication with JWT + Refresh Token (NestJS + Vue)

## Functional Requirements

### US-5.1: Backend – Auth Module (NestJS)

**Priority**: High  
**Description**: Implement authentication using **email/password** with **JWT access token** and **refresh token** rotation. Every API endpoint (except auth & health) must require authorization.

**Acceptance Criteria**:

- [ ] Create `AuthModule` with:
  - [ ] `LocalStrategy` for login (`/auth/login`).
  - [ ] `JwtStrategy` to protect routes with Bearer token.
  - [ ] `JwtAuthGuard` registered **globally**; exclude: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/health`.
- [ ] Implement `POST /auth/login`:
  - [ ] Validates user with email/password (hashed with **bcrypt**, min 12 rounds).
  - [ ] Issues **access token** (expires 15 minutes) and **refresh token** (7–30 days).
  - [ ] Sends **refresh token** as **HttpOnly, Secure, SameSite=Lax** cookie named `rt`.
  - [ ] Returns `{ accessToken }` in JSON (no refresh token in body).
- [ ] Implement `POST /auth/refresh`:
  - [ ] Reads refresh token from cookie `rt`.
  - [ ] Verifies & **rotates** refresh token (invalidate old; issue new).
  - [ ] Returns new `{ accessToken }` and sets a new `rt` cookie.
- [ ] Implement `POST /auth/logout`:
  - [ ] Clears `rt` cookie.
  - [ ] Invalidates server-side stored refresh token (if tracked).
- [ ] Store only **hashed refresh tokens** in DB with `userId`, `expiresAt`, `createdAt`, `ip`, `userAgent`.
- [ ] Add **RBAC** with roles: `admin`, `stable_owner`, `stable_manager` (no access to prices), `user` (schedule preview only). Use `@Roles()` decorator + guard.
- [ ] Configure **CORS** to allow FE origin and `credentials: true`.
- [ ] Add **rate limiting** on `/auth/*` and basic audit logs (login success/failure, refresh, logout).

**How tokens work?**

1. **Access token**: short-lived (e.g., `15m`), sent as `Authorization: Bearer <token>`.
2. **Refresh token**: long-lived (e.g., `7d`), stored **only** in **HttpOnly cookie** (`rt`) and **rotated** on each refresh.
3. **Rotation**: on each `/auth/refresh`, issue a new refresh token, persist its hash, and invalidate the previous one.

---

### US-5.2: Frontend – Auth Flow (Vue)

**Priority**: High  
**Description**: Implement login, automatic token refresh, route protection, and logout within the Vue app. The app should treat all data routes as protected.

**Acceptance Criteria**:

- [ ] Create a **Login view** with email/password form and validation.
- [ ] On successful login:
  - [ ] Save `accessToken` **in memory** (not in `localStorage`).
  - [ ] Backend sets refresh token cookie automatically (HttpOnly).
- [ ] Configure a centralized **API client** (Axios) with:
  - [ ] `baseURL` from env (`VITE_API_URL`).
  - [ ] `withCredentials: true` to send refresh cookie.
  - [ ] Request interceptor: attaches `Authorization: Bearer <accessToken>`.
  - [ ] Response interceptor:
    - [ ] On `401` once → call `/auth/refresh`, update access token, retry original request.
    - [ ] On failed refresh → clear token and redirect to `/login`.
    - [ ] Prevent concurrent refresh calls (queue requests until refreshed).
- [ ] Protect routes using **router guards** (e.g., meta: `{ requiresAuth: true }`).
- [ ] Implement **Logout** button:
  - [ ] Calls `/auth/logout`.
  - [ ] Clears in-memory access token and redirects to `/login`.
- [ ] Optional: display user role in UI; block admin-only routes by role.

---

### US-5.3: Security & Hardening

**Priority**: High  
**Description**: Apply baseline security best practices for cookie, headers, CSRF, and password protection.

**Acceptance Criteria**:

- [ ] Use `helmet` on BE and enable **HSTS** (prod), enforce HTTPS.
- [ ] Cookies: `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict` if UX allows).
- [ ] **CSRF** protection on `/auth/refresh` (one of):
  - [ ] Keep `SameSite` strict/lax **and** require custom header (e.g., `X-Requested-With`).
  - [ ] Or implement **double-submit cookie** pattern.
- [ ] Lockout/bruteforce protection on `/auth/login` (rate limit + IP/UA).
- [ ] Password hashing with **bcrypt** (12–14 salt rounds).
- [ ] Do not expose sensitive error details (generic 401/403 messages).
- [ ] Log security events (login success/failure, refresh, logout) with timestamp/IP/UA.

---

## Data Model (New Entities)

### Entity: `users`

**Purpose**: Store application users and their authentication/security attributes.

**Suggested fields**:

```
users (
  id                uuid PK,
  email             varchar(320) UNIQUE NOT NULL,
  password_hash     varchar(255) NOT NULL,
  first_name        varchar(100) NULL,
  last_name         varchar(100) NULL,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
)
```

**Notes**:
- Passwords are stored only as **bcrypt** hashes.
- Consider unique index on lower(email) for case-insensitivity.

### Entity: `roles`

**Purpose**: Define role-based access control levels.

**Seeded roles** (fixed, enumerated by `code`):
- `admin`
- `stable_owner`
- `stable_manager` *(no access to prices)*
- `user` *(schedule preview only)*

**Suggested fields**:

```
roles (
  id          uuid PK,
  code        varchar(64) UNIQUE NOT NULL,  -- e.g., 'admin', 'stable_owner'
  name        varchar(128) NOT NULL,        -- human-readable label
  description text NULL
)
```

### Entity: `user_roles` (many-to-many)

**Purpose**: Assign multiple roles to a single user (if needed now or in future).

```
user_roles (
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id     uuid REFERENCES roles(id)  ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
)
```

### Entity: `refresh_tokens`

**Purpose**: Persist hashed refresh tokens for rotation, revocation and audit.

```
refresh_tokens (
  id            uuid PK,
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  token_hash    varchar(255) NOT NULL,
  issued_at     timestamptz DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  revoked_at    timestamptz NULL,
  ip            inet NULL,
  user_agent    text NULL
)
```

**Rules**:
- Store **only hashes** of refresh tokens.
- On refresh, **revoke** previous token (`revoked_at` set) and insert a new row.
- Reject refresh when token is expired or revoked.

---

## Authorization Rules (RBAC)

Use a roles guard that reads `roles` claim from the **access token** (or loads from DB) and enforces the following:

- **admin**: full access to all endpoints.
- **stable_owner**: full stable management (except pricing visibility rules do not apply; owners can view prices).
- **stable_manager**: can manage schedules, staff, resources **without access to prices**. The BE should:
  - Hide or omit price-related fields in responses for this role.
  - Reject price mutation endpoints with `403`.
- **user**: read-only access for **schedule preview** endpoints only; all mutation endpoints return `403`.

**Implementation hints**:
- Define `@Roles('admin')`, `@Roles('stable_owner')`, etc., at controller/route level.
- For price hiding, implement a response mapper or DTO transformer that conditionally strips price fields when `stable_manager` role is present.

---

## Non-Functional Requirements

- [ ] **Performance**: Token verification in O(1); DB access only on refresh and role lookups as needed.
- [ ] **Scalability**: Stateless access tokens; shared store (DB/Redis) for refresh tokens across instances.
- [ ] **Observability**: Audit logs for auth events; `/health` endpoint remains public.
- [ ] **DX**: Clear `.env` variables, README with setup steps.

---

## Deliverables

- [ ] **BE (NestJS)**: `AuthModule` with controllers, strategies, guards, services, and entities (`users`, `roles`, `user_roles`, `refresh_tokens`).
- [ ] **FE (Vue)**: Login view, API client with interceptors, route guards, logout handling.
- [ ] **Config**: CORS, cookies, helmet, rate limiting.
- [ ] **Docs**: README section explaining token lifecycle, env setup, and role matrix.

---

## Definition of Done (DoD)

- [ ] All protected endpoints return **401** if no/invalid access token.
- [ ] Login: `200`, sets `rt` cookie, returns `{ accessToken }`.
- [ ] Refresh rotates tokens; old RT cannot be reused.
- [ ] Logout clears cookie and invalidates server-side refresh.
- [ ] FE retries failed (401) requests after refresh.
- [ ] Roles enforced per matrix; price data hidden from `stable_manager`.
- [ ] Unit tests for auth service and token rotation logic.
- [ ] Lint/build pass; no secrets committed.

---

## Technical Notes

**Environment variables**  
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,  
`ACCESS_EXPIRES_IN=15m`, `REFRESH_EXPIRES_IN=7d`,  
`FRONTEND_ORIGIN`, `CORS_CREDENTIALS=true`.

**Backend (NestJS)**  
- Use `@nestjs/jwt`, `@nestjs/passport`, `passport-local`, `passport-jwt`, `bcrypt`.
- Apply `JwtAuthGuard` globally; mark public routes or use `@Public()`.
- Implement CSRF mitigation for `/auth/refresh` via SameSite and/or custom header.

**Frontend (Vue)**  
- Keep `accessToken` in memory (store/composable).  
- Axios with `withCredentials: true`, single-flight refresh in interceptor.  
- Router guards to protect private routes and enforce role-based access in UI.

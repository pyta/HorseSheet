# Architecture Document - HorseSheet

## 1. Overview

HorseSheet is a web-based stable management system built with a microservices architecture designed for deployment on small VPS platforms like mikr.us. The system provides flexible schedule management, participant tracking, and stable operations organization.

### 1.1 Technology Stack

- **Backend**: Node.js with NestJS (TypeScript)
- **Frontend**: Vue.js 3 (Composition API)
- **Database**: PostgreSQL (primary), Redis (optional caching)
- **Deployment**: Docker containers on VPS
- **Reverse Proxy**: Nginx
- **Build Tools**: Vite (frontend), TypeScript (backend)

### 1.2 Architecture Principles

- **Microservices-ready**: Modular design that can be split into separate services
- **Resource-efficient**: Optimized for small server deployments (1-2GB RAM)
- **Authentication-ready**: Architecture supports Bearer token authentication without refactoring
- **Soft deletion**: All entities support soft deletion for historical data preservation
- **Optimistic locking**: Concurrent edit protection using version/timestamp
- **Public + Private APIs**: Clear separation between public read-only and authenticated endpoints

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│  - SSL/TLS Termination (Let's Encrypt)                      │
│  - Static file serving (Vue dist)                           │
│  - API routing (/api/* → Backend)                           │
└───────────────┬───────────────────────────────┬─────────────┘
                │                               │
                │ /api/*                        │ /* (static)
                ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│    API Gateway Service        │   │   Static Frontend        │
│    (NestJS)                   │   │   (Vue.js SPA)           │
│                               │   │                          │
│  - Request routing            │   │  - Vue Router            │
│  - Authentication middleware  │   │  - API client            │
│  - Rate limiting              │   │  - State management      │
│  - CORS handling              │   │  - UI components         │
└───────────────┬───────────────┘   └──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│              Business Logic Service (NestJS)                 │
│                                                              │
│  Modules:                                                    │
│  - Stable Module                                             │
│  - Instructor Module                                         │
│  - Activity Module                                           │
│  - Service Module                                            │
│  - Participant Module                                        │
│  - ContactPerson Module                                      │
│  - PriceList Module                                          │
│  - ScheduleEntry Module                                      │
│  - Auth Module (architecture ready, not implemented in MVP)  │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Persistence Layer                          │
│                                                              │
│  - PostgreSQL (primary database)                             │
│  - TypeORM (ORM)                                             │
│  - Repository pattern                                        │
│  - Soft deletion support                                     │
│  - Optimistic locking (version/timestamp)                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Deployment Architecture (mikr.us)

For PoC deployment on mikr.us or similar small VPS:

```
┌─────────────────────────────────────────────────────────────┐
│                    mikr.us VPS (2.1 or 3.0)                  │
│  - 1-2GB RAM                                                 │
│  - 10-25GB Storage                                           │
│  - 1 CPU core                                                │
│  - Ubuntu 22.04 LTS                                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Nginx      │   │   Backend    │   │  PostgreSQL  │
│   Container  │   │   Container  │   │  Container   │
│   (Port 80/443)│   │   (Port 3000)│   │   (Port 5432)│
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    Docker Network
```

**Resource Allocation (mikr.us 2.1 - 1GB RAM):**
- Nginx: ~50MB
- NestJS Backend: ~200-300MB
- PostgreSQL: ~150-200MB
- System overhead: ~100MB
- **Total: ~500-650MB** (fits comfortably in 1GB)

**Alternative: mikr.us 3.0 (2GB RAM)**
- More headroom for caching, background jobs, and growth
- Recommended for production use

### 2.3 Microservices Structure

The system is designed as a **modular monolith** that can be split into microservices:

#### Phase 1: MVP (Single Service)
- All modules in one NestJS application
- Single database connection
- Shared authentication middleware (ready but not enforced)

#### Phase 2: Split Architecture (Future)
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ API Gateway  │─────▶│  Business    │─────▶│   Database   │
│  Service     │      │  Logic       │      │   Service    │
│              │      │  Service     │      │              │
│ - Routing    │      │ - Modules    │      │ - PostgreSQL │
│ - Auth       │      │ - Business   │      │ - Migrations │
│ - Rate Limit │      │   Logic      │      │ - Backups    │
└──────────────┘      └──────────────┘      └──────────────┘
```

## 3. Backend Architecture

### 3.1 NestJS Module Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── config/                    # Configuration
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── interfaces/
│   ├── stable/                    # Stable module
│   │   ├── stable.controller.ts
│   │   ├── stable.service.ts
│   │   ├── stable.entity.ts
│   │   ├── stable.repository.ts
│   │   └── dto/
│   ├── instructor/                # Instructor module
│   ├── activity/                  # Activity module
│   ├── service/                   # Service module
│   ├── participant/              # Participant module
│   ├── contact-person/           # Contact person module
│   ├── price-list/               # Price list module
│   ├── schedule-entry/           # Schedule entry module
│   └── auth/                     # Auth module (architecture ready)
│       ├── auth.guard.ts
│       ├── auth.middleware.ts
│       └── auth.module.ts
├── test/                          # Tests
├── docker/
│   └── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```

### 3.2 Core Modules

#### 3.2.1 Stable Module
- **Entity**: `Stable` (id, name, address, contactInfo, timezone, isActive, createdAt, updatedAt, version)
- **Operations**: CRUD with soft deletion
- **Public Endpoint**: GET /api/stables/:id (read-only)

#### 3.2.2 Instructor Module
- **Entity**: `Instructor` (id, name, stableId, isActive, createdAt, updatedAt, version)
- **Operations**: CRUD with soft deletion
- **Validation**: Must be active to be used in schedule entries

#### 3.2.3 Activity Module
- **Entity**: `Activity` (id, name, description, stableId, isActive, createdAt, updatedAt, version)
- **Operations**: CRUD with soft deletion
- **Public Endpoint**: GET /api/activities (read-only)

#### 3.2.4 Service Module
- **Entity**: `Service` (id, name, description, stableId, isActive, createdAt, updatedAt, version)
- **Operations**: CRUD with soft deletion
- **Public Endpoint**: GET /api/services (read-only)

#### 3.2.5 Participant Module
- **Entity**: `Participant` (id, name, email, phone, stableId, defaultContactPersonId, isActive, createdAt, updatedAt, version)
- **Operations**: CRUD with soft deletion
- **Relations**: Many-to-One with ContactPerson

#### 3.2.6 Contact Person Module
- **Entity**: `ContactPerson` (id, name, email, phone, stableId, isActive, createdAt, updatedAt, version)
- **Operations**: CRUD with soft deletion
- **Relations**: One-to-Many with Participant

#### 3.2.7 Price List Module
- **Entity**: `PriceList` (id, stableId, activityId, serviceId, price, currency, isActive, createdAt, updatedAt, version)
- **Operations**: CRUD with soft deletion
- **Relations**: Optional Many-to-One with Activity or Service

#### 3.2.8 Schedule Entry Module
- **Entity**: `ScheduleEntry` (id, stableId, date, time, instructorId, activityId, isActive, createdAt, updatedAt, version)
- **Relations**: 
  - Many-to-One with Instructor
  - Many-to-One with Activity
  - Many-to-Many with Participant (via join table)
  - One-to-Many with ScheduleEntryParticipant (for service associations)
- **Operations**: CRUD with soft deletion, optimistic locking
- **Public Endpoint**: GET /api/schedule-entries (read-only with filters)

#### 3.2.9 Schedule Entry Participant (Join Entity)
- **Entity**: `ScheduleEntryParticipant` (id, scheduleEntryId, participantId, serviceId, createdAt, updatedAt)
- **Purpose**: Links participants to schedule entries with optional service association

### 3.3 Data Access Layer

#### Repository Pattern
- Each module has a dedicated repository
- Extends TypeORM's `Repository<T>`
- Implements soft deletion queries
- Handles optimistic locking checks

#### Soft Deletion Implementation
```typescript
// Base entity with soft deletion
@DeleteDateColumn()
deletedAt: Date | null;

// Repository queries automatically filter deleted records
// Historical data preserved, new entries cannot reference deleted entities
```

#### Optimistic Locking
```typescript
@VersionColumn()
version: number;

// Update operations check version before saving
// Throws ConflictException if version mismatch
```

### 3.4 API Design

#### RESTful Endpoints Structure

**Public Endpoints (No Authentication Required):**
```
GET  /api/stables/:id
GET  /api/activities
GET  /api/services
GET  /api/schedule-entries?filters...
```

**Authenticated Endpoints (Bearer Token Required - Architecture Ready):**
```
# Stable
POST   /api/stables
PUT    /api/stables/:id
DELETE /api/stables/:id

# Instructors
GET    /api/instructors
POST   /api/instructors
PUT    /api/instructors/:id
DELETE /api/instructors/:id

# Activities
POST   /api/activities
PUT    /api/activities/:id
DELETE /api/activities/:id

# Services
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id

# Participants
GET    /api/participants
POST   /api/participants
PUT    /api/participants/:id
DELETE /api/participants/:id

# Contact Persons
GET    /api/contact-persons
POST   /api/contact-persons
PUT    /api/contact-persons/:id
DELETE /api/contact-persons/:id

# Price Lists
GET    /api/price-lists
POST   /api/price-lists
PUT    /api/price-lists/:id
DELETE /api/price-lists/:id

# Schedule Entries
POST   /api/schedule-entries
PUT    /api/schedule-entries/:id
DELETE /api/schedule-entries/:id
POST   /api/schedule-entries/:id/duplicate
GET    /api/schedule-entries/export?filters...
```

#### Request/Response Format

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (optional, architecture ready)
```

**Response Format:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

**Error Response:**
```json
{
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Date/Time Format
- All dates and times use ISO 8601 format
- Timezone stored per stable
- API responses include timezone information

### 3.5 Authentication Architecture (Ready, Not Implemented)

#### Middleware Pattern
```typescript
// auth.middleware.ts - Processes Bearer token if present
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      // Future: Validate token and attach user context
      // For MVP: Token is accepted but not validated
    }
    next();
  }
}
```

#### Guards (Future Implementation)
- `AuthGuard`: Validates Bearer token
- `RolesGuard`: Enforces role-based access (Stable Owner, Schedule Manager, Viewer)
- `PublicGuard`: Marks endpoints as public (no auth required)

### 3.6 Validation and Error Handling

#### Validation
- DTOs with class-validator decorators
- Minimal validation: only required fields and existence checks
- Custom validators for entity active status

#### Error Handling
- Global exception filter
- User-friendly error messages
- Technical details logged server-side
- HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 500 (Internal Server Error)

## 4. Frontend Architecture

### 4.1 Vue.js Structure

```
frontend/
├── src/
│   ├── main.ts                    # Application entry
│   ├── App.vue                    # Root component
│   ├── router/
│   │   └── index.ts               # Vue Router configuration
│   ├── stores/                    # Pinia stores (state management)
│   │   ├── stable.ts
│   │   ├── schedule.ts
│   │   └── ui.ts
│   ├── services/                  # API client services
│   │   ├── api.ts                 # Axios instance
│   │   ├── stable.service.ts
│   │   ├── schedule.service.ts
│   │   └── ...
│   ├── views/                     # Page components
│   │   ├── Dashboard.vue
│   │   ├── ScheduleView.vue
│   │   ├── StableSetup.vue
│   │   └── ...
│   ├── components/                # Reusable components
│   │   ├── common/
│   │   ├── forms/
│   │   └── schedule/
│   ├── composables/               # Composition API utilities
│   │   ├── useApi.ts
│   │   ├── useValidation.ts
│   │   └── useSchedule.ts
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   └── assets/                    # Static assets
├── public/
├── docker/
│   └── Dockerfile
├── .env.example
├── package.json
└── vite.config.ts
```

### 4.2 State Management (Pinia)

#### Stores
- **Stable Store**: Current stable, setup progress
- **Schedule Store**: Schedule entries, filters, selected date range
- **Entity Stores**: Instructors, activities, services, participants, contact persons, price lists
- **UI Store**: Loading states, error messages, notifications

### 4.3 API Client

#### Axios Configuration
```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Bearer token (future)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4.4 Routing

#### Public Routes
- `/` - Dashboard/Home
- `/stable/:id` - Public stable view
- `/schedule` - Public schedule view
- `/activities` - Public activities list
- `/services` - Public services list

#### Authenticated Routes (Future)
- `/dashboard` - Stable owner dashboard
- `/schedule/manage` - Schedule management
- `/instructors` - Instructor management
- `/participants` - Participant management
- `/settings` - Stable settings

### 4.5 UI Components

#### Schedule View
- Calendar view (default: current week)
- List view option
- Filter controls (date range, instructor, participant)
- Search bar
- Export button
- Entry detail modal/expand

#### Forms
- Minimal validation
- Auto-populate defaults
- Fast submission workflow
- Clear error messages

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
Stable (1) ──┐
             │
             ├── (1:N) ── Instructor
             ├── (1:N) ── Activity
             ├── (1:N) ── Service
             ├── (1:N) ── Participant
             ├── (1:N) ── ContactPerson
             ├── (1:N) ── PriceList
             └── (1:N) ── ScheduleEntry

ScheduleEntry (1) ──┬── (N:1) ── Instructor
                    ├── (N:1) ── Activity
                    └── (N:M) ── Participant (via ScheduleEntryParticipant)

ScheduleEntryParticipant (1) ──┬── (N:1) ── ScheduleEntry
                               ├── (N:1) ── Participant
                               └── (N:1) ── Service (optional)

Participant (1) ── (N:1) ── ContactPerson (defaultContactPersonId)
```

### 5.2 Database Schema

#### Core Tables
- `stables` - Stable information
- `instructors` - Instructor records
- `activities` - Activity types
- `services` - Service offerings
- `participants` - Participant records
- `contact_persons` - Contact person records
- `price_lists` - Pricing information
- `schedule_entries` - Schedule entries
- `schedule_entry_participants` - Join table for participants and services

#### Common Columns (All Tables)
- `id` - UUID primary key
- `created_at` - Timestamp
- `updated_at` - Timestamp
- `deleted_at` - Timestamp (soft deletion)
- `version` - Integer (optimistic locking)

### 5.3 Indexes

#### Performance Indexes
- `stables.id` (primary key)
- `schedule_entries.date` (for date range queries)
- `schedule_entries.instructor_id` (for instructor filtering)
- `schedule_entry_participants.participant_id` (for participant filtering)
- `schedule_entry_participants.schedule_entry_id` (for join queries)

### 5.4 Migrations

- TypeORM migrations for schema versioning
- Migration files in `backend/src/migrations/`
- Automated migration on application startup (optional, or manual)

## 6. Deployment Strategy

### 6.1 Platform Options

#### Option 1: mikr.us (Recommended for PoC)

**Pros:**
- Very low cost (35-130 PLN/year)
- Full control over server
- Docker support
- Shared databases available (can save resources)
- Located in Finland (good for EU users)

**Cons:**
- Manual server management
- Limited resources (1-2GB RAM)
- No managed services

**Recommended Plan:**
- **mikr.us 2.1** (1GB RAM, 10GB disk, 75 PLN/year) - Minimum viable
- **mikr.us 3.0** (2GB RAM, 25GB disk, 130 PLN/year) - Recommended for better performance

#### Option 2: DigitalOcean / Linode / Vultr

**Pros:**
- More resources available
- Better documentation
- Managed databases available
- More regions

**Cons:**
- Higher cost (~$5-10/month = ~200-400 PLN/year)
- Still requires manual management

**Recommended Plan:**
- Basic Droplet: 1 CPU, 1GB RAM, 25GB SSD (~$5/month)

#### Option 3: Hetzner Cloud

**Pros:**
- Very affordable in Europe
- Good performance
- Clean control panel

**Cons:**
- Less known outside Europe
- Manual management

**Recommended Plan:**
- CX11: 1 CPU, 2GB RAM, 20GB SSD (~€4/month)

#### Option 4: Render / Railway / Fly.io (PaaS)

**Pros:**
- Zero server management
- Auto-deploy from Git
- Managed databases
- Free tiers available

**Cons:**
- Less control
- Costs can scale with usage
- Cold starts possible

**Recommendation:** Start with **mikr.us 3.0** for PoC, consider upgrading or migrating to managed PaaS if needed.

### 6.2 Docker Setup

#### docker-compose.yml
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: docker/Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/horsesheet
      - PORT=3000
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=horsesheet
      - POSTGRES_USER=horsesheet
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### Frontend Dockerfile (Build Only)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Static files copied to nginx volume
```

### 6.3 Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Frontend static files
    root /usr/share/nginx/html;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Vue Router - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 6.4 Deployment Process

#### Initial Setup
1. Provision VPS (mikr.us 3.0 recommended)
2. Install Docker and Docker Compose
3. Clone repository
4. Configure environment variables
5. Build and start containers
6. Set up SSL certificate (Let's Encrypt)
7. Configure domain DNS

#### Continuous Deployment
```bash
# Simple deployment script
#!/bin/bash
git pull origin main
docker-compose build
docker-compose up -d
docker-compose exec backend npm run migration:run
```

#### CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/horsesheet
            git pull
            docker-compose build
            docker-compose up -d
```

### 6.5 Environment Configuration

#### Backend .env
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@postgres:5432/horsesheet
JWT_SECRET=your-secret-key (future)
CORS_ORIGIN=https://your-domain.com
```

#### Frontend .env
```env
VITE_API_BASE_URL=https://your-domain.com/api
```

## 7. Security Considerations

### 7.1 MVP Security
- HTTPS via Let's Encrypt
- Environment variables for secrets
- Input validation (DTOs)
- SQL injection prevention (TypeORM parameterized queries)
- CORS configuration
- Rate limiting (future: via middleware)

### 7.2 Future Security (Post-MVP)
- Bearer token authentication
- JWT token validation
- Role-based access control
- API rate limiting
- Request size limits
- Security headers (Helmet.js)

## 8. Monitoring and Logging

### 8.1 Logging
- NestJS built-in logger
- Structured logging (JSON format)
- Log levels: error, warn, log, debug
- Log rotation
- Container logs aggregation

### 8.2 Health Checks
```typescript
// GET /health
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 8.3 Monitoring (Future)
- Uptime monitoring (UptimeRobot)
- Application performance monitoring (optional)
- Error tracking (Sentry - optional)

## 9. Performance Optimization

### 9.1 Backend Optimizations
- Database query optimization (indexes, eager loading)
- Response compression (gzip)
- Connection pooling
- Caching frequently accessed data (Redis - optional)

### 9.2 Frontend Optimizations
- Code splitting
- Lazy loading routes
- Asset optimization (minification, compression)
- CDN for static assets (future)

### 9.3 Database Optimizations
- Proper indexing
- Query optimization
- Connection pooling
- Regular VACUUM (PostgreSQL)

## 10. Development Workflow

### 10.1 Local Development
```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev

# Database (Docker)
docker-compose up postgres
```

### 10.2 Testing Strategy
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows (future)

### 10.3 Code Quality
- ESLint for TypeScript/JavaScript
- Prettier for code formatting
- Pre-commit hooks (Husky)
- TypeScript strict mode

## 11. Future Scalability

### 11.1 Horizontal Scaling
- Stateless backend design
- Database connection pooling
- Load balancer (future)
- Multiple backend instances (future)

### 11.2 Microservices Split
When ready to split:
1. Extract API Gateway service
2. Extract Business Logic service
3. Extract Data Persistence service
4. Inter-service communication (REST or message queue)

### 11.3 Database Scaling
- Read replicas (future)
- Database sharding (future, if multi-stable support)
- Caching layer (Redis)

## 12. Cost Estimation

### 12.1 mikr.us Deployment
- **mikr.us 3.0**: 130 PLN/year (~11 PLN/month)
- **Domain**: ~50 PLN/year (optional)
- **Total**: ~180 PLN/year (~15 PLN/month)

### 12.2 Alternative Platforms
- **DigitalOcean**: ~$5/month (~200 PLN/year)
- **Hetzner**: ~€4/month (~200 PLN/year)
- **Render**: Free tier available, then ~$7/month

## 13. Risk Mitigation

### 13.1 Resource Constraints
- **Risk**: Limited RAM on small VPS
- **Mitigation**: Optimize memory usage, use shared databases if available, monitor resource usage

### 13.2 Data Loss
- **Risk**: Server failure, data corruption
- **Mitigation**: Regular database backups, automated backup scripts

### 13.3 Security
- **Risk**: Unauthorized access, data breaches
- **Mitigation**: HTTPS, secure environment variables, input validation, future authentication

## 14. Success Criteria Alignment

This architecture supports all PRD success criteria:
- ✅ Fast and flexible UX (minimal validation, efficient queries)
- ✅ Complete CRUD APIs (all modules implemented)
- ✅ Public read-only access (public endpoints)
- ✅ Authentication-ready (middleware pattern)
- ✅ Soft deletion (all entities)
- ✅ Optimistic locking (version column)
- ✅ Resource-efficient deployment (small VPS compatible)

## 15. Next Steps

1. **Setup Development Environment**
   - Initialize NestJS project
   - Initialize Vue.js project
   - Set up PostgreSQL locally
   - Configure Docker Compose for local development

2. **Implement Core Modules**
   - Start with Stable module
   - Implement remaining entities
   - Set up database migrations

3. **Build Frontend**
   - Set up Vue Router
   - Create API client
   - Build schedule view
   - Implement CRUD forms

4. **Deploy PoC**
   - Provision mikr.us VPS
   - Set up Docker environment
   - Deploy application
   - Configure domain and SSL

5. **Testing and Iteration**
   - User testing
   - Performance optimization
   - Bug fixes
   - Feature refinement

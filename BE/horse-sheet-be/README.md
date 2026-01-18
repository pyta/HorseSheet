<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

HorseSheet Backend API - A NestJS-based stable management system API.

This API provides full CRUD operations for managing stables, instructors, activities, services, participants, contact persons, price lists, and schedule entries.

## Features

- ✅ Full CRUD operations for all entities
- ✅ Soft deletion support for all entities
- ✅ Optimistic locking for concurrent edit protection
- ✅ Public read-only endpoints (stables, activities, services, schedule entries)
- ✅ Authentication-ready architecture (Bearer token support)
- ✅ Swagger/OpenAPI documentation
- ✅ Global exception handling and validation
- ✅ Health check endpoint

## Quick Start

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Start the database:**
   ```bash
   yarn db:up
   # or: docker-compose up -d
   ```

3. **Create `.env` file** (copy from `.env.example` and adjust if needed):
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   yarn start:dev
   ```

5. **Access the API:**
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/api/health

## Project setup

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (for database) OR PostgreSQL 15+ installed locally
- Yarn package manager

### Installation

```bash
$ yarn install
```

### Database Setup

#### Option 1: Using Docker Compose (Recommended)

The easiest way to set up the database for local development is using Docker Compose:

1. **Start the PostgreSQL container:**
   ```bash
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```bash
   docker-compose ps
   ```

3. **View database logs (optional):**
   ```bash
   docker-compose logs -f postgres
   ```

4. **Stop the database (when done):**
   ```bash
   docker-compose down
   ```

5. **Stop and remove all data (clean slate):**
   ```bash
   docker-compose down -v
   ```

The database will be available at `localhost:5433` with:
- **User:** `horsesheet`
- **Password:** `horsesheet_dev`
- **Database:** `horsesheet`

> **Note:** Port 5433 is used instead of 5432 to avoid conflicts with local PostgreSQL installations.

#### Option 2: Local PostgreSQL Installation

If you prefer to use a local PostgreSQL installation:

1. Install PostgreSQL 15+ on your system
2. Create a database:
   ```sql
   CREATE DATABASE horsesheet;
   CREATE USER horsesheet WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE horsesheet TO horsesheet;
   ```

### Environment Configuration

Create a `.env` file in the root directory:

**For Docker Compose setup:**
```env
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Database (Docker Compose)
DATABASE_URL=postgresql://horsesheet:horsesheet_dev@localhost:5433/horsesheet
DATABASE_SSL=false

# JWT (future use)
JWT_SECRET=your-secret-key-here-change-in-production
```

**For local PostgreSQL setup:**
```env
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Database (Local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/horsesheet
DATABASE_SSL=false

# JWT (future use)
JWT_SECRET=your-secret-key-here-change-in-production
```

> **Note:** The application will automatically synchronize the schema in development mode (`NODE_ENV=development`).

### Database Management Scripts

The following npm/yarn scripts are available for database management:

```bash
# Start the database
yarn db:up

# Stop the database
yarn db:down

# View database logs
yarn db:logs

# Reset database (removes all data and recreates)
yarn db:reset

# Connect to database via psql
yarn db:psql
```

### Database Migrations

The project uses TypeORM migrations for database schema versioning. Migrations allow you to version control your database schema and apply changes in a controlled manner.

#### Important Notes

- **In development**: By default, `synchronize` is disabled. You should use migrations instead of `synchronize` for better control.
- **In production**: Always use migrations. Never use `synchronize: true` in production.

#### Migration Scripts

```bash
# Generate a new migration based on entity changes
yarn migration:generate src/migrations/MigrationName

# Create an empty migration file
yarn migration:create src/migrations/MigrationName

# Run pending migrations
yarn migration:run

# Revert the last migration
yarn migration:revert

# Show migration status
yarn migration:show
```

#### Creating Your First Migration

1. **Generate a migration from your entities** (recommended):
   ```bash
   yarn migration:generate src/migrations/InitialSchema
   ```
   This will analyze your entities and create a migration file with all the necessary changes.

2. **Or create an empty migration** (for manual SQL):
   ```bash
   yarn migration:create src/migrations/AddNewColumn
   ```
   Then edit the generated file in `src/migrations/` to add your SQL changes.

3. **Review the generated migration file** in `src/migrations/` to ensure it's correct.

4. **Run the migration**:
   ```bash
   yarn migration:run
   ```

#### Migration File Structure

Migration files are automatically generated in `src/migrations/` with timestamps. Example:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration code here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback code here
  }
}
```

#### Environment Configuration for Migrations

To disable `synchronize` and use migrations only, set in your `.env`:

```env
DB_SYNCHRONIZE=false
```

Or remove `DB_SYNCHRONIZE` from your `.env` (it defaults to `false`).

#### Best Practices

- Always review generated migrations before running them
- Test migrations on a development database first
- Commit migration files to version control
- Never edit existing migrations that have been run in production
- Create new migrations for schema changes instead of modifying old ones

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode (recommended for development)
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## API Documentation

Once the application is running, access Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api/docs

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/stables/:id` - Get stable details
- `GET /api/activities` - List all activities
- `GET /api/services` - List all services
- `GET /api/schedule-entries` - List schedule entries (with filters)

### Authenticated Endpoints (Architecture Ready)
All other endpoints accept optional Bearer token (not enforced in MVP):
- Stable management: `POST`, `PATCH`, `DELETE /api/stables`
- Instructor management: `GET`, `POST`, `PATCH`, `DELETE /api/instructors`
- Activity management: `POST`, `PATCH`, `DELETE /api/activities`
- Service management: `POST`, `PATCH`, `DELETE /api/services`
- Participant management: `GET`, `POST`, `PATCH`, `DELETE /api/participants`
- Contact person management: `GET`, `POST`, `PATCH`, `DELETE /api/contact-persons`
- Price list management: `GET`, `POST`, `PATCH`, `DELETE /api/price-lists`
- Schedule entry management: `GET`, `POST`, `PATCH`, `DELETE /api/schedule-entries`
- Schedule export: `GET /api/schedule-entries/export`
- Schedule duplicate: `POST /api/schedule-entries/:id/duplicate`

### Health Check
- `GET /api/health` - Health check endpoint

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## test
# AssetBox

A digital asset marketplace monorepo — buy and sell digital assets (audio, video, graphics, templates, and more) at scale.

## Architecture

This is a [Turborepo](https://turbo.build/repo) monorepo with the following structure:

```
AssetBox/
├── apps/
│   ├── api/        # NestJS REST API (port 3001)
│   ├── web/        # Next.js storefront & dashboard (port 3000)
│   ├── docs/       # Next.js documentation site (port 3002)
│   └── workers/    # Kafka consumer microservice (NestJS)
├── packages/
│   ├── config/         # Shared runtime configuration
│   ├── database/       # Prisma schema, migrations, and client
│   ├── email/          # Email service (Resend)
│   ├── templates/      # React Email templates
│   ├── types/          # Shared TypeScript types (incl. Kafka event interfaces)
│   ├── ui/             # Shared React component library (@repo/ui)
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── docker-compose.yml  # Local development infrastructure
```

**Tech Stack:**
- **Backend**: NestJS + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 15 + React 18 + NextAuth (magic links) + TanStack Query
- **Email**: Resend + React Email
- **Storage**: MinIO (S3-compatible)
- **Search**: Meilisearch
- **Queue/Cache**: Redis + BullMQ
- **Payments**: Stripe
- **Event Streaming**: Apache Kafka + Zookeeper (event-driven architecture)

### Event-Driven Architecture

AssetBox uses **Apache Kafka** for inter-service event streaming alongside the existing BullMQ queue system (which continues to handle background jobs such as media processing).

```
┌─────────────┐  asset.uploaded  ┌────────────────────────┐
│  apps/api   │ ───────────────► │  asset-events topic    │
│  (Producer) │  asset.purchased ├────────────────────────┤
│             │ ───────────────► │  purchase-events topic │
│             │  user.registered ├────────────────────────┤
│             │ ───────────────► │  user-events topic     │
└─────────────┘                  └──────────┬─────────────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        ▼                    ▼                    ▼
               ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐
               │ search-indexer │  │ email-notif.    │  │ analytics       │
               │ (Meilisearch)  │  │ (Resend emails) │  │ (structured log)│
               └────────────────┘  └─────────────────┘  └─────────────────┘
                        │                    │                    │
                        └────────────────────┴────────────────────┘
                                             │ on failure
                                  ┌──────────▼──────────┐
                                  │  *.dlq topics (DLQ) │
                                  └─────────────────────┘
```

**Topics:**
| Topic | Event | Publisher | Consumers |
|---|---|---|---|
| `asset-events` | `asset.uploaded` | `AssetsService` | `SearchIndexerController` |
| `purchase-events` | `asset.purchased` | `PaymentsService` | `EmailNotificationController`, `AnalyticsController` |
| `user-events` | `user.registered` | `UsersService` | `EmailNotificationController` |
| `*.dlq` | Failed messages | `DlqService` | (manual inspection) |

## Prerequisites

- Node.js >= 18
- npm 10
- Docker & Docker Compose

## Setup

### 1. Clone and install

```bash
git clone https://github.com/mhtpsd/AssetBox-prod.git
cd AssetBox-prod
npm install
```

### 2. Configure environment variables

```bash
# Root (docker-compose secrets)
cp .env.example .env

# API
cp apps/api/.env.example apps/api/.env.local

# Workers
cp apps/workers/.env.example apps/workers/.env.local

# Web
cp apps/web/.env.example apps/web/.env.local
```

Edit each `.env` file with your actual values.

### 3. Start infrastructure

```bash
npm run docker:up
```

This starts PostgreSQL, Redis, Meilisearch, MinIO, **Zookeeper, Kafka, and Kafka UI** via Docker Compose.

| Service | URL |
|---|---|
| API | http://localhost:3001/api |
| Web | http://localhost:3000 |
| Docs | http://localhost:3002 |
| MinIO console | http://localhost:9001 |
| Meilisearch | http://localhost:7700 |
| **Kafka UI** | **http://localhost:8080** |

### 4. Initialize the database

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations
```

### 5. Start development servers

```bash
npm run dev
```

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |
| `MEILI_MASTER_KEY` | Meilisearch master key |
| `MINIO_ROOT_USER` | MinIO root username |
| `MINIO_ROOT_PASSWORD` | MinIO root password |

### `apps/api/.env.local`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string |
| `NEXTAUTH_SECRET` | Yes | Shared secret with web app |
| `REDIS_HOST` | Yes | Redis hostname |
| `REDIS_PORT` | Yes | Redis port (default: 6379) |
| `REDIS_PASSWORD` | No | Redis password (optional) |
| `STORAGE_ENDPOINT` | Yes | MinIO/S3 endpoint URL |
| `STORAGE_ACCESS_KEY` | Yes | Storage access key |
| `STORAGE_SECRET_KEY` | Yes | Storage secret key |
| `STORAGE_BUCKET_PRIVATE` | Yes | Private bucket name |
| `STORAGE_BUCKET_PUBLIC` | Yes | Public bucket name |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `RESEND_API_KEY` | Yes | Resend API key |
| `EMAIL_FROM` | Yes | Sender email address |
| `MEILISEARCH_HOST` | Yes | Meilisearch host URL |
| `MEILISEARCH_API_KEY` | Yes | Meilisearch API key |
| `KAFKA_BROKERS` | No | Comma-separated Kafka brokers (default: `localhost:9092`) |
| `KAFKA_CLIENT_ID` | No | Kafka client ID (default: `assetbox-api`) |
| `KAFKA_GROUP_ID` | No | Kafka consumer group ID (default: `assetbox-consumers`) |

### `apps/workers/.env.local`

| Variable | Required | Description |
|---|---|---|
| `KAFKA_BROKERS` | No | Comma-separated Kafka brokers (default: `localhost:9092`) |
| `KAFKA_CLIENT_ID` | No | Kafka client ID (default: `assetbox-workers`) |
| `KAFKA_GROUP_ID` | No | Kafka consumer group ID (default: `assetbox-consumers`) |
| `MEILISEARCH_HOST` | Yes | Meilisearch host URL |
| `MEILISEARCH_API_KEY` | Yes | Meilisearch API key |
| `RESEND_API_KEY` | Yes | Resend API key |
| `EMAIL_FROM` | Yes | Sender email address |
| `FRONTEND_URL` | No | Frontend URL for email links |

### `apps/web/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | Yes | NextAuth secret (same as API) |
| `NEXTAUTH_URL` | Yes | Public URL of the web app |
| `NEXT_PUBLIC_API_URL` | Yes | Public URL of the API |
| `DATABASE_URL` | Yes | Prisma connection string |
| `RESEND_API_KEY` | Yes | Resend API key |
| `EMAIL_FROM` | Yes | Sender email address |

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all apps and packages |
| `npm run test` | Run all tests |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema to database (dev only) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` | Start infrastructure containers (incl. Kafka) |
| `npm run docker:down` | Stop infrastructure containers |
| `npm run docker:reset` | Reset and restart infrastructure |

## Health Check

The API exposes a health check endpoint:

```
GET /api/health
```

Returns the status of the database, Redis, Meilisearch, and **Kafka** connections.

## Deployment

### Docker Compose (Production)

```bash
cp .env.example .env          # fill in production values
cp apps/api/.env.example apps/api/.env   # fill in API vars
cp apps/web/.env.example apps/web/.env   # fill in web vars

docker compose -f docker-compose.prod.yml up -d
```

See `docker-compose.prod.yml` for the full production setup including application containers.

## Package Namespaces

This monorepo uses two namespaces:
- `@assetbox/*` — production app packages (api, web, workers, database, email, templates, config, types)
- `@repo/*` — shared tooling packages (ui, eslint-config, typescript-config)

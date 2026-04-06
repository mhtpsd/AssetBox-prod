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

---

## Docker Images

Three production Docker images are built and published to [GitHub Container Registry (GHCR)](https://ghcr.io/mhtpsd):

| Image | Registry | Description |
|---|---|---|
| `assetbox-api` | `ghcr.io/mhtpsd/assetbox-api` | NestJS REST API |
| `assetbox-web` | `ghcr.io/mhtpsd/assetbox-web` | Next.js storefront + dashboard |
| `assetbox-workers` | `ghcr.io/mhtpsd/assetbox-workers` | Kafka consumer workers |

### Build images locally

```bash
# Build API image
docker build -f apps/api/Dockerfile -t assetbox-api:local .

# Build Web image
docker build -f apps/web/Dockerfile -t assetbox-web:local .

# Build Workers image
docker build -f apps/workers/Dockerfile -t assetbox-workers:local .
```

### Run with Docker Compose (production)

```bash
# Configure environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/workers/.env.example apps/workers/.env

# Start all services (includes Kafka, Zookeeper, Workers)
docker compose -f docker-compose.prod.yml up -d
```

---

## CI/CD Pipeline

GitHub Actions workflows automate quality checks, image builds, and deployment.

### Workflows

| File | Trigger | Description |
|---|---|---|
| `.github/workflows/ci.yml` | Push/PR to `main`/`develop` | Lint → Type check → Build → Test → Docker Build+Push → Deploy |
| `.github/workflows/docker-build.yml` | Push tag `v*` | Builds and pushes semver-tagged release images |

### Pipeline stages

```
Push to main
     │
     ├─── lint          (ESLint across all packages)
     ├─── type-check    (tsc --noEmit on API)
     ├─── build         (Turborepo build all)
     └─── test          (Jest across all packages)
              │
              └─── docker-build  (builds 3 images → pushes to GHCR)
                         │
                         └─── deploy  (kubectl set image — configure KUBECONFIG_DATA secret)
```

### Enabling Kubernetes deployment

1. Add a repository secret named `KUBECONFIG_DATA` (Settings → Secrets → Actions):
   ```bash
   cat ~/.kube/config | base64
   ```
2. Uncomment the deploy steps in `.github/workflows/ci.yml` under the `deploy` job.

---

## Kubernetes Deployment

Kubernetes manifests are in the `k8s/` directory, organized with [Kustomize](https://kustomize.io/) overlays.

### Directory structure

```
k8s/
├── namespace.yaml              # assetbox namespace
├── base/
│   ├── api/                    # NestJS API: Deployment + Service + HPA
│   ├── web/                    # Next.js: Deployment + Service
│   ├── workers/                # Kafka workers: Deployment + HPA
│   ├── ingress/                # Nginx Ingress controller routing
│   ├── postgres/               # PostgreSQL StatefulSet + PVC
│   ├── redis/                  # Redis Deployment
│   ├── kafka/                  # Zookeeper + Kafka StatefulSets
│   ├── meilisearch/            # Meilisearch Deployment + PVC
│   ├── minio/                  # MinIO Deployment + PVC
│   └── configmaps-secrets/     # ConfigMap + Secrets template
└── overlays/
    ├── dev/                    # 1 replica, lower resources
    ├── staging/                # 2 replicas, medium resources
    └── prod/                   # 3+ replicas API, higher resources
```

### Quick start (local — minikube or kind)

```bash
# 1. Start a local cluster
minikube start
# or: kind create cluster

# 2. Install nginx ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml

# 3. Apply secrets (edit the file first — replace base64 placeholders)
cp k8s/base/configmaps-secrets/secrets.yaml /tmp/assetbox-secrets.yaml
# Edit /tmp/assetbox-secrets.yaml with real base64-encoded values
kubectl apply -f /tmp/assetbox-secrets.yaml

# 4. Deploy dev overlay (1 replica, lower resources)
kubectl apply -k k8s/overlays/dev

# 5. Check pods
kubectl get pods -n assetbox

# 6. Access via port-forward (or configure /etc/hosts for ingress)
kubectl port-forward svc/web 3000:3000 -n assetbox &
kubectl port-forward svc/api 3001:3001 -n assetbox &
```

### Deploy to different environments

```bash
# Development (1 replica)
kubectl apply -k k8s/overlays/dev

# Staging (2 replicas)
kubectl apply -k k8s/overlays/staging

# Production (3+ replicas API, higher limits)
kubectl apply -k k8s/overlays/prod
```

### Production architecture

```
                    ┌─── Kubernetes Cluster (assetbox namespace) ──────────────┐
                    │                                                          │
Internet ──► Nginx  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
            Ingress─┼─►│ web pod │ │ web pod │ │ web pod │  HPA: 2-10        │
               │    │  └─────────┘ └─────────┘ └─────────┘                  │
               │    │                                                          │
               └────┼─►┌─────────┐ ┌─────────┐ ┌─────────┐  HPA: 2-10      │
                    │  │ api pod │ │ api pod │ │ api pod │                   │
                    │  └────┬────┘ └────┬────┘ └────┬────┘                  │
                    │       └───────────┴───────┬────┘                       │
                    │                           ▼                             │
                    │              ┌────────────────────────┐                │
                    │              │   Kafka (StatefulSet)  │                │
                    │              └───────────┬────────────┘                │
                    │                          │                              │
                    │         ┌────────────────▼────────────────┐            │
                    │         │  workers pods  (HPA: 1-5)       │            │
                    │         │  search-indexer │ email │ analytics           │
                    │         └─────────────────────────────────┘            │
                    │                                                          │
                    │  PostgreSQL │ Redis │ Meilisearch │ MinIO               │
                    │  (StatefulSets + PVCs for persistent storage)           │
                    └──────────────────────────────────────────────────────────┘

GitHub Actions: Push to main → Lint/Test → Build Docker → Push GHCR → kubectl deploy
```

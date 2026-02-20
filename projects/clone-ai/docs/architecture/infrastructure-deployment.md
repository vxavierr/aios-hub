# Infrastructure & Deployment

> **Clone Lab** - AI-Powered Code Cloning Assistant
> Version: 1.0.0
> Last Updated: 2026-02-20

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Deployment Scenarios](#deployment-scenarios)
   - [Local Development (CLI-only)](#1-local-development-cli-only)
   - [Local with API Server](#2-local-with-api-server)
   - [Cloud Deployment](#3-cloud-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Docker Configuration](#docker-configuration)
6. [Secrets Management](#secrets-management)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Package Distribution](#package-distribution)
9. [Monitoring & Observability](#monitoring--observability)
10. [Disaster Recovery](#disaster-recovery)

---

## Overview

Clone Lab follows a **CLI-First** architecture, ensuring all core functionality works via command line before any UI or cloud deployment. This document outlines the infrastructure and deployment strategies for running Clone Lab in various environments.

### Core Principles

- **CLI First**: All features must work via CLI before API/UI
- **Local-First**: Default deployment runs entirely locally
- **Cloud-Ready**: Optional cloud deployment for scaling
- **Multi-Provider AI**: Support for Claude, GPT, Gemini, and Ollama
- **Portable Data**: Easy migration between local and cloud vector databases

---

## Technology Stack

### Runtime & Language

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| TypeScript | 5.x | Type-safe development |
| pnpm | 9.x | Package manager with workspaces |

### Package Structure (pnpm Workspaces)

```
clone-ai/
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # Workspace definition
├── packages/
│   ├── cli/                  # CLI application
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   ├── core/                 # Core library
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   ├── api/                  # Optional API server
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   └── providers/            # AI provider implementations
│       ├── package.json
│       ├── src/
│       └── tsconfig.json
├── docs/
└── tests/
```

### Vector Database Options

| Environment | Database | Configuration |
|-------------|----------|---------------|
| Local | ChromaDB | Embedded, file-based |
| Cloud | Pinecone | Managed, scalable |

### AI Providers

| Provider | SDK | Use Case |
|----------|-----|----------|
| Anthropic Claude | `@anthropic-ai/sdk` | Primary AI (recommended) |
| OpenAI GPT | `openai` | Alternative provider |
| Google Gemini | `@google/generative-ai` | Alternative provider |
| Ollama | HTTP API | Local/self-hosted |

---

## Deployment Scenarios

### 1. Local Development (CLI-only)

The primary deployment mode. Runs entirely on the developer's machine without external services.

#### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Machine                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │   CLI App    │───▶│   Core Lib   │───▶│  ChromaDB  │ │
│  │  (clone-ai)  │    │  (packages/) │    │  (local)   │ │
│  └──────────────┘    └──────────────┘    └────────────┘ │
│         │                   │                            │
│         │                   ▼                            │
│         │           ┌──────────────┐                     │
│         │           │ AI Providers │                     │
│         │           │ (Claude/GPT) │                     │
│         │           └──────────────┘                     │
│         │                   │                            │
│         ▼                   ▼                            │
│  ┌──────────────────────────────────────┐               │
│  │         ~/.clone-ai/                 │               │
│  │  ├── config.yaml                     │               │
│  │  ├── data/                           │               │
│  │  │   └── chroma/                     │               │
│  │  └── cache/                          │               │
│  └──────────────────────────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Requirements

```yaml
# System Requirements
node: ">=20.0.0"
pnpm: ">=9.0.0"
memory: "4GB minimum, 8GB recommended"
storage: "10GB for dependencies and cache"

# Optional (for local AI)
ollama: "latest"  # For local LLM inference
```

#### Installation

```bash
# Install via npm
npm install -g @clone-ai/cli

# Or install from source
git clone https://github.com/clone-ai/clone-lab.git
cd clone-lab
pnpm install
pnpm build
pnpm link --global
```

#### Configuration

```yaml
# ~/.clone-ai/config.yaml
version: "1.0"

# AI Provider Configuration
ai:
  provider: "claude"  # claude | openai | gemini | ollama
  model: "claude-3-sonnet-20240229"
  apiKey: "${ANTHROPIC_API_KEY}"  # From environment

# Vector Database
database:
  type: "chromadb"
  path: "~/.clone-ai/data/chroma"

# CLI Settings
cli:
  outputFormat: "markdown"
  colorOutput: true
  defaultTemplate: "comprehensive"
```

#### Usage

```bash
# Basic usage
clone-ai analyze ./my-project

# With options
clone-ai clone ./source ./target --template=api-first

# Interactive mode
clone-ai interactive

# Configuration
clone-ai config set ai.provider openai
clone-ai config list
```

---

### 2. Local with API Server

For teams wanting a local HTTP API without cloud deployment.

#### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Local Network                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐   │
│  │   CLI App   │     │  API Server │     │   Web Client    │   │
│  │ (optional)  │     │  :3000      │     │   (optional)    │   │
│  └─────────────┘     └──────┬──────┘     └─────────────────┘   │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Core Lib  │────▶│   ChromaDB  │     │  AI APIs    │       │
│  │             │     │   :8000     │     │ (external)  │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Docker Compose                        │   │
│  │  ├── clone-ai-api                                        │   │
│  │  ├── chromadb                                            │   │
│  │  └── redis (caching)                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Docker Compose Configuration

```yaml
# docker-compose.local.yaml
version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_TYPE=chromadb
      - CHROMA_HOST=chromadb
      - CHROMA_PORT=8000
      - REDIS_URL=redis://redis:6379
    depends_on:
      - chromadb
      - redis
    volumes:
      - ./packages:/app/packages
      - ~/.clone-ai:/root/.clone-ai
    networks:
      - clone-ai-network

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
      - CHROMA_SERVER_HTTP_PORT=8000
    networks:
      - clone-ai-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - clone-ai-network

volumes:
  chroma-data:
  redis-data:

networks:
  clone-ai-network:
    driver: bridge
```

#### Running

```bash
# Start all services
docker-compose -f docker-compose.local.yaml up -d

# View logs
docker-compose -f docker-compose.local.yaml logs -f api

# Stop services
docker-compose -f docker-compose.local.yaml down
```

---

### 3. Cloud Deployment

Production deployment with managed services for scalability.

#### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Cloud Platform                             │
│                    (AWS / GCP / Azure / Railway)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐         ┌────────────────────────────────────┐ │
│  │   Cloudflare   │────────▶│          Load Balancer             │ │
│  │      CDN       │         │                                    │ │
│  └────────────────┘         └──────────────┬─────────────────────┘ │
│                                            │                        │
│         ┌──────────────────────────────────┼───────────────────┐   │
│         ▼                                  ▼                   ▼   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │  API Pod 1  │    │  API Pod 2  │    │  API Pod N  │           │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘           │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                        │
│         ┌──────────────────┴──────────────────┐                   │
│         ▼                                     ▼                   │
│  ┌─────────────────┐                 ┌─────────────────┐         │
│  │    Pinecone     │                 │      Redis      │         │
│  │  (Vector DB)    │                 │    (Cache)      │         │
│  │   Managed       │                 │   Managed       │         │
│  └─────────────────┘                 └─────────────────┘         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Secret Management                         │   │
│  │  ├── ANTHROPIC_API_KEY                                       │   │
│  │  ├── OPENAI_API_KEY                                          │   │
│  │  ├── PINECONE_API_KEY                                        │   │
│  │  └── Database credentials                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clone-ai-api
  labels:
    app: clone-ai
    component: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: clone-ai
      component: api
  template:
    metadata:
      labels:
        app: clone-ai
        component: api
    spec:
      containers:
        - name: api
          image: cloneai/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_TYPE
              value: "pinecone"
            - name: PINECONE_ENVIRONMENT
              valueFrom:
                secretKeyRef:
                  name: clone-ai-secrets
                  key: pinecone-environment
            - name: PINECONE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: clone-ai-secrets
                  key: pinecone-api-key
            - name: ANTHROPIC_API_KEY
              valueFrom:
                secretKeyRef:
                  name: clone-ai-secrets
                  key: anthropic-api-key
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: clone-ai-api
spec:
  selector:
    app: clone-ai
    component: api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: clone-ai-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: clone-ai-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## Environment Configuration

### Environment Variables

#### Required Variables

```bash
# .env.example

# AI Provider Configuration (at least one required)
ANTHROPIC_API_KEY=sk-ant-xxxxx          # Claude API key
OPENAI_API_KEY=sk-xxxxx                  # OpenAI API key
GOOGLE_AI_KEY=xxxxx                      # Gemini API key

# Vector Database
DATABASE_TYPE=chromadb                   # chromadb | pinecone

# ChromaDB (local)
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_PATH=~/.clone-ai/data/chroma

# Pinecone (cloud)
PINECONE_API_KEY=xxxxx
PINECONE_ENVIRONMENT=production
PINECONE_INDEX=clone-ai

# API Server (optional)
API_PORT=3000
API_HOST=0.0.0.0
NODE_ENV=development

# Redis (caching)
REDIS_URL=redis://localhost:6379
```

#### Optional Variables

```bash
# Logging
LOG_LEVEL=info                           # debug | info | warn | error
LOG_FORMAT=json                          # json | pretty

# Performance
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT_MS=30000
CACHE_TTL_SECONDS=3600

# Feature Flags
ENABLE_TELEMETRY=false
ENABLE_EXPERIMENTAL=false
```

### Configuration Files

#### Application Config

```yaml
# config/app.yaml
app:
  name: "Clone Lab"
  version: "1.0.0"
  environment: "${NODE_ENV:development}"

server:
  port: "${API_PORT:3000}"
  host: "${API_HOST:0.0.0.0}"
  cors:
    enabled: true
    origins:
      - "http://localhost:*"
      - "https://clone-ai.dev"

ai:
  defaultProvider: "${AI_PROVIDER:claude}"
  providers:
    claude:
      model: "claude-3-sonnet-20240229"
      maxTokens: 4096
      temperature: 0.7
    openai:
      model: "gpt-4-turbo-preview"
      maxTokens: 4096
    gemini:
      model: "gemini-pro"
    ollama:
      host: "http://localhost:11434"
      model: "llama2"

database:
  type: "${DATABASE_TYPE:chromadb}"
  chromadb:
    host: "${CHROMA_HOST:localhost}"
    port: "${CHROMA_PORT:8000}"
  pinecone:
    environment: "${PINECONE_ENVIRONMENT}"
    index: "${PINECONE_INDEX:clone-ai}"

cache:
  enabled: true
  ttl: 3600
  redis:
    url: "${REDIS_URL:redis://localhost:6379}"

logging:
  level: "${LOG_LEVEL:info}"
  format: "${LOG_FORMAT:json}"
```

---

## Docker Configuration

### Multi-Stage Dockerfile

```dockerfile
# Dockerfile
# Stage 1: Base dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .

RUN pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 cloneai

# Copy built application
COPY --from=builder /app/packages/cli/dist ./packages/cli/dist
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set ownership
RUN chown -R cloneai:nodejs /app

USER cloneai

ENTRYPOINT ["node", "packages/cli/dist/index.js"]
CMD ["--help"]
```

### API Server Dockerfile

```dockerfile
# Dockerfile.api
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app ./
COPY . .

RUN pnpm build

# Stage 3: Production API
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 cloneai

# Copy only necessary packages
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN chown -R cloneai:nodejs /app

USER cloneai

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "packages/api/dist/server.js"]
```

### Production Docker Compose

```yaml
# docker-compose.prod.yaml
version: "3.9"

services:
  api:
    image: cloneai/api:${VERSION:-latest}
    restart: unless-stopped
    ports:
      - "${API_PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_TYPE=${DATABASE_TYPE:-pinecone}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - PINECONE_ENVIRONMENT=${PINECONE_ENVIRONMENT}
      - PINECONE_INDEX=${PINECONE_INDEX}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - clone-ai-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - clone-ai-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - clone-ai-network

volumes:
  redis-data:

networks:
  clone-ai-network:
    driver: bridge
```

---

## Secrets Management

### Development (Local)

```bash
# Use .env file (never commit)
cp .env.example .env

# Edit with your keys
vim .env

# Load via dotenv
node -r dotenv/config packages/cli/dist/index.js
```

### CI/CD (GitHub Actions)

```yaml
# Store secrets in GitHub repository settings
# Settings > Secrets and variables > Actions > New repository secret

# Required secrets:
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY
# - PINECONE_API_KEY
# - NPM_TOKEN (for publishing)
```

### Production (Cloud)

#### AWS Secrets Manager

```typescript
// packages/core/src/config/secrets.ts
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secretsManager = new SecretsManager({
  region: process.env.AWS_REGION,
});

export async function getSecret(secretName: string): Promise<string> {
  const response = await secretsManager.getSecretValue({
    SecretId: secretName,
  });

  return response.SecretString || '';
}

export async function loadSecrets(): Promise<void> {
  const secrets = await getSecret('clone-ai/production');

  Object.assign(process.env, JSON.parse(secrets));
}
```

#### HashiCorp Vault

```typescript
// packages/core/src/config/vault.ts
import vault from 'node-vault';

const vaultClient = vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

export async function getSecrets(path: string): Promise<Record<string, string>> {
  const result = await vaultClient.read(path);
  return result.data;
}
```

### Secrets Rotation Policy

| Secret Type | Rotation Period | Method |
|-------------|-----------------|--------|
| API Keys | 90 days | Manual + Alert |
| Database Credentials | 30 days | Automated |
| JWT Secrets | 7 days | Automated |
| Encryption Keys | 1 year | Manual + Audit |

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9.0.0'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: packages/*/dist

  docker:
    name: Docker Build
    runs-on: ubuntu-latest
    needs: [test, build]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push CLI
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            cloneai/cli:latest
            cloneai/cli:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.api
          push: true
          tags: |
            cloneai/api:latest
            cloneai/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  release:
    types: [published]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9.0.0'

jobs:
  npm-publish:
    name: Publish to npm
    runs-on: ubuntu-latest
    if: github.event.release.prerelease == false
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Publish packages
        run: pnpm -r publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  docker-publish:
    name: Publish Docker Images
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Get version
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push CLI
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            cloneai/cli:${{ steps.version.outputs.VERSION }}
            cloneai/cli:latest

      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.api
          push: true
          tags: |
            cloneai/api:${{ steps.version.outputs.VERSION }}
            cloneai/api:latest

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [npm-publish, docker-publish]
    if: github.event.release.prerelease == false
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/clone-ai-api \
            api=cloneai/api:${{ steps.version.outputs.VERSION }} \
            --namespace=production
```

---

## Package Distribution

### NPM Publishing Strategy

#### Package Names

| Package | NPM Name | Scope |
|---------|----------|-------|
| CLI | `@clone-ai/cli` | Public |
| Core | `@clone-ai/core` | Public |
| API Server | `@clone-ai/api` | Public |
| Providers | `@clone-ai/providers` | Public |

#### Version Strategy

```
MAJOR.MINOR.PATCH[-PRERELEASE]

Examples:
- 1.0.0     - Stable release
- 1.1.0     - New features (backward compatible)
- 1.1.1     - Bug fixes
- 2.0.0     - Breaking changes
- 2.0.0-beta.1 - Pre-release
```

#### Package.json Configuration

```json
// packages/cli/package.json
{
  "name": "@clone-ai/cli",
  "version": "1.0.0",
  "description": "AI-powered code cloning assistant CLI",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "clone-ai": "./dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "ai",
    "code-cloning",
    "code-analysis",
    "llm",
    "developer-tools"
  ],
  "author": "Clone Lab Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/clone-ai/clone-lab.git",
    "directory": "packages/cli"
  },
  "bugs": {
    "url": "https://github.com/clone-ai/clone-lab/issues"
  },
  "homepage": "https://clone-ai.dev",
  "engines": {
    "node": ">=20.0.0"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  }
}
```

### Installation Methods

```bash
# Global installation (recommended for CLI)
npm install -g @clone-ai/cli

# Or with pnpm
pnpm add -g @clone-ai/cli

# Or with yarn
yarn global add @clone-ai/cli

# Project dependency (for programmatic use)
npm install @clone-ai/core

# Docker
docker pull cloneai/cli:latest
docker run --rm -v $(pwd):/workspace cloneai/cli analyze /workspace
```

---

## Monitoring & Observability

### Logging

```typescript
// packages/core/src/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
});
```

### Health Checks

```typescript
// packages/api/src/routes/health.ts
import { Router } from 'express';
import { logger } from '@clone-ai/core';

const router = Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      ai: await checkAIProvider(),
    },
  };

  const allHealthy = Object.values(health.checks).every((c) => c.status === 'ok');

  res.status(allHealthy ? 200 : 503).json(health);
});

router.get('/ready', (req, res) => {
  // Simple readiness check
  res.status(200).json({ ready: true });
});
```

### Metrics (Prometheus)

```typescript
// packages/api/src/metrics.ts
import client from 'prom-client';

const register = new client.Registry();

// Default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const cloneRequestsTotal = new client.Counter({
  name: 'clone_ai_requests_total',
  help: 'Total number of clone requests',
  labelNames: ['provider', 'status'],
  registers: [register],
});

export const cloneRequestDuration = new client.Histogram({
  name: 'clone_ai_request_duration_seconds',
  help: 'Duration of clone requests in seconds',
  labelNames: ['provider', 'operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export { register };
```

---

## Disaster Recovery

### Backup Strategy

| Component | Backup Method | Frequency | Retention |
|-----------|---------------|-----------|-----------|
| Pinecone Index | Export to S3 | Daily | 30 days |
| Redis Cache | RDB snapshot | Hourly | 7 days |
| Configuration | Git | On change | Indefinite |
| Logs | S3/GCS | Real-time | 90 days |

### Recovery Procedures

#### Database Recovery

```bash
# Restore ChromaDB from backup
chroma backup restore --from s3://backup-bucket/chroma/$(date +%Y-%m-%d)

# Verify restoration
chroma verify --collection clone-ai
```

#### Application Rollback

```bash
# Kubernetes rollback
kubectl rollout undo deployment/clone-ai-api -n production

# Docker rollback
docker service update --image cloneai/api:previous-version clone-ai_api
```

### Incident Response

1. **Detection**: Automated alerts via PagerDuty/Opsgenie
2. **Triage**: On-call engineer assesses severity
3. **Mitigation**: Scale up, rollback, or hotfix
4. **Resolution**: Root cause analysis and permanent fix
5. **Post-mortem**: Document and share learnings

---

## Appendix

### Useful Commands

```bash
# Development
pnpm dev                  # Start development server
pnpm build               # Build all packages
pnpm test                # Run tests
pnpm lint                # Lint code
pnpm typecheck           # Type check

# Docker
docker-compose up -d     # Start local stack
docker-compose logs -f   # View logs
docker-compose down      # Stop stack

# Kubernetes
kubectl get pods -n clone-ai
kubectl logs -f deployment/clone-ai-api
kubectl scale deployment clone-ai-api --replicas=5

# Debugging
NODE_DEBUG=* pnpm dev    # Enable debug logs
DEBUG=clone-ai:* pnpm dev  # Enable debug mode
```

### Related Documents

- [Architecture Overview](./architecture-overview.md)
- [API Reference](./api-reference.md)
- [Security Policy](./security.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

*Document Version: 1.0.0*
*Last Updated: 2026-02-20*
*Maintained by: Clone Lab DevOps Team*

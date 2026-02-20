# Clone Lab - Full Stack Architecture

**Version:** 1.0
**Date:** 2026-02-20
**Author:** Aria (Architect Agent)

---

## Overview

This document outlines the complete fullstack architecture for Clone Lab, including backend systems, CLI interface, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

Clone Lab é um sistema de clonagem de personalidade de IA que opera através de um pipeline de 5 módulos: **Extract → Analyze → Synthesize → Manifest → Deploy**. A arquitetura é projetada para ser modular, extensível e multi-provider (Claude, GPT, Gemini, Ollama).

---

## Architecture Documents

| Document | Description |
|----------|-------------|
| [High Level Architecture](./high-level-architecture.md) | C4 diagrams, system overview, ADRs |
| [Data Model & Storage](./data-model.md) | ERD, schemas, vector storage design |
| [API Specifications](./api-specifications.md) | REST API design, OpenAPI specs |
| [Component Architecture](./component-architecture.md) | Module design, interfaces, patterns |
| [Infrastructure & Deployment](./infrastructure-deployment.md) | Docker, CI/CD, environments |
| [Security & Compliance](./security-compliance.md) | Auth, encryption, RBAC |
| [Observability & Testing](./observability-testing.md) | Logging, metrics, testing strategy |

---

## Quick Reference

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20.x LTS |
| **Language** | TypeScript 5.x |
| **Package Manager** | pnpm 8.x (workspaces) |
| **CLI Framework** | Commander.js |
| **API Server** | Fastify |
| **Validation** | Zod |
| **Logging** | Pino |
| **Testing** | Vitest + Testcontainers |

### AI/LLM Stack

| Component | Provider |
|-----------|----------|
| **Primary LLM** | Claude (Anthropic) |
| **Fallback LLM** | GPT-4 (OpenAI) |
| **Alternative** | Gemini (Google) |
| **Local Option** | Ollama |
| **Embeddings** | OpenAI text-embedding-3-small |

### Storage Stack

| Component | Technology |
|-----------|------------|
| **Vector DB (Local)** | ChromaDB |
| **Vector DB (Cloud)** | Pinecone |
| **File Storage** | Local filesystem / S3 |
| **Config Format** | JSON / YAML |

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLONE LAB PIPELINE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   │  EXTRACT │───▶│  ANALYZE │───▶│SYNTHESIZE│───▶│ MANIFEST │───▶│  DEPLOY  │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
│        │               │               │               │               │
│        ▼               ▼               ▼               ▼               ▼
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   │ YouTube  │    │ Linguistic│   │ DNA      │    │ System   │    │ Runtime  │
│   │ PDFs     │    │ Emotional │   │ Profile  │    │ Prompts  │    │ Session  │
│   │ Web      │    │ Cognitive │   │ (v1.0)   │    │ (Claude/ │    │ Manager  │
│   │ Social   │    │ Knowledge │   │          │    │ GPT/etc) │    │          │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
clone-lab/
├── packages/
│   ├── core/                    # Core engine (clone generation)
│   │   ├── src/
│   │   │   ├── dna/            # DNA synthesis
│   │   │   ├── manifest/       # Prompt generation
│   │   │   └── runtime/        # Clone execution
│   │   └── package.json
│   │
│   ├── extractors/              # Content extraction modules
│   │   ├── src/
│   │   │   ├── base/           # ISourceExtractor interface
│   │   │   ├── json/           # JSON/JSONL extractor
│   │   │   ├── markdown/       # Markdown/text extractor
│   │   │   ├── youtube/        # YouTube transcript extractor
│   │   │   └── web/            # Web crawler extractor
│   │   └── package.json
│   │
│   ├── embeddings/              # Embedding generation
│   │   ├── src/
│   │   │   ├── chunking/       # Text chunking strategies
│   │   │   ├── providers/      # OpenAI, local embeddings
│   │   │   └── cache/          # Embedding cache
│   │   └── package.json
│   │
│   ├── storage/                 # Vector store abstraction
│   │   ├── src/
│   │   │   ├── interface/      # IVectorStore interface
│   │   │   ├── chromadb/       # ChromaDB implementation
│   │   │   ├── pinecone/       # Pinecone implementation
│   │   │   └── memory/         # In-memory for testing
│   │   └── package.json
│   │
│   └── cli/                     # Command-line interface
│       ├── src/
│       │   ├── commands/       # CLI commands
│       │   ├── output/         # Formatters, progress bars
│       │   └── index.ts        # Entry point
│       └── package.json
│
├── apps/
│   └── api/                     # REST API server
│       ├── src/
│       │   ├── routes/         # API endpoints
│       │   ├── middleware/     # Auth, logging, etc.
│       │   └── index.ts        # Server entry
│       └── package.json
│
├── docs/
│   ├── architecture/           # Architecture docs (this folder)
│   ├── prd/                    # Product requirements
│   └── stories/                # Development stories
│
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Key Design Principles

### 1. Modular Architecture
Each package is independently versionable and testable. Dependencies flow inward (core has no dependencies on CLI/API).

### 2. Plugin-Based Extensibility
New extractors, analyzers, and AI providers can be added without modifying core code through a registry pattern.

### 3. CLI-First Development
Every feature must work via CLI before any API/UI is considered. The API is a thin wrapper over CLI commands.

### 4. Provider Abstraction
AI providers are abstracted behind a common interface, allowing seamless switching between Claude, GPT, Gemini, and Ollama.

### 5. Type Safety
TypeScript strict mode everywhere. Zod schemas for runtime validation of external inputs.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Initial architecture creation | Aria (Architect) |

---

*Generated by Aria (Architect Agent) - AIOS Framework*

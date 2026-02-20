# Clone Lab - High Level Architecture

**Version:** 1.0 | **Date:** 2026-02-20 | **Author:** Aria (Architect)

---

## System Context (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL WORLD                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Developer  │     │    Source    │     │   AI Provider│                │
│  │    (CLI)     │     │    Systems   │     │   (LLM APIs) │                │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘                │
│         │                    │                     │                        │
└─────────┼────────────────────┼─────────────────────┼────────────────────────┘
          │                    │                     │
          ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLONE LAB                                       │
│                     "Capture Intelligence, Replicate Personality"           │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        PIPELINE ENGINE                               │   │
│   │   Extract ──▶ Analyze ──▶ Synthesize ──▶ Manifest ──▶ Deploy        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Container Diagram (C4 Level 2)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              CLONE LAB SYSTEM                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐                │
│  │   CLI (cli)     │   │   API (api)     │   │   Core (core)   │                │
│  │                 │   │                 │   │                 │                │
│  │  • Commander.js │   │  • Fastify      │   │  • DNA Engine   │                │
│  │  • Interactive  │   │  • REST/WS      │   │  • Analyzers    │                │
│  │  • Batch Mode   │   │  • Auth         │   │  • Generators   │                │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘                │
│           │                     │                     │                          │
│           └─────────────────────┼─────────────────────┘                          │
│                                 │                                                │
│                                 ▼                                                │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐                │
│  │ Extractors      │   │ Embeddings      │   │ Storage         │                │
│  │                 │   │                 │   │                 │                │
│  │ • JSON/JSONL    │   │ • OpenAI        │   │ • ChromaDB      │                │
│  │ • Markdown      │   │ • Chunking      │   │ • Pinecone      │                │
│  │ • YouTube       │   │ • Cache         │   │ • FileSystem    │                │
│  │ • Web/PDF       │   │                 │   │                 │                │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘                │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              PIPELINE DATA FLOW                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  PHASE 1: EXTRACT                                                                │
│  ┌─────────┐     ┌──────────────┐     ┌──────────────┐                          │
│  │ Sources │────▶│  Extractors  │────▶│ ExtractedData│                          │
│  │ (files) │     │ (per type)   │     │ (normalized) │                          │
│  └─────────┘     └──────────────┘     └──────┬───────┘                          │
│                                               │                                  │
│  PHASE 2: ANALYZE                               ▼                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                     │
│  │ Analysis     │────▶│   Trait      │────▶│ AnalysisResult│                     │
│  │ Pipeline     │     │ Detectors    │     │ (per trait)   │                     │
│  └──────────────┘     └──────────────┘     └──────┬───────┘                     │
│                                                     │                             │
│  PHASE 3: SYNTHESIZE                                ▼                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                     │
│  │ DNA          │────▶│  Conflict    │────▶│ PersonalityDNA│                     │
│  │ Synthesizer  │     │  Resolution  │     │ (.dna.json)   │                     │
│  └──────────────┘     └──────────────┘     └──────┬───────┘                     │
│                                                     │                             │
│  PHASE 4: MANIFEST                                  ▼                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                     │
│  │ Prompt       │────▶│  Provider    │────▶│ Manifest     │                     │
│  │ Generator    │     │  Adapters    │     │ (.manifest)   │                     │
│  └──────────────┘     └──────────────┘     └──────┬───────┘                     │
│                                                     │                             │
│  PHASE 5: DEPLOY                                    ▼                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                     │
│  │ Clone        │────▶│  Provider    │────▶│ Conversation │                     │
│  │ Runtime      │     │  Gateway     │     │ Session      │                     │
│  └──────────────┘     └──────────────┘     └──────────────┘                     │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Monorepo with pnpm Workspaces

**Status:** Accepted

**Context:** Need to manage multiple packages with shared dependencies while enabling independent versioning.

**Decision:** Use pnpm workspaces in a monorepo structure.

**Consequences:**
- (+) Shared types and utilities across packages
- (+) Atomic commits across packages
- (+) Simplified dependency management
- (-) Larger repository size
- (-) More complex CI/CD

### ADR-002: CLI-First Architecture

**Status:** Accepted

**Context:** Target users are developers who prefer command-line interfaces.

**Decision:** CLI is the primary interface; API is secondary.

**Consequences:**
- (+) Better developer experience
- (+) Scriptable and automatable
- (+) Lower barrier to entry
- (-) Limited visual feedback
- (-) API features must wait for CLI maturity

### ADR-003: Provider Abstraction Layer

**Status:** Accepted

**Context:** Need to support multiple LLM providers with different APIs.

**Decision:** Abstract providers behind a common `IProvider` interface.

**Consequences:**
- (+) Easy provider switching
- (+) Testability with mock providers
- (+) Future provider support
- (-) Abstraction overhead
- (-) Feature lag behind provider updates

### ADR-004: Vector Database Abstraction

**Status:** Accepted

**Context:** Need flexible storage options (local development vs cloud production).

**Decision:** Abstract storage behind `IVectorStore` interface with ChromaDB (local) and Pinecone (cloud) implementations.

**Consequences:**
- (+) Local-first development
- (+) Cloud scalability when needed
- (+) Testability
- (-) Limited to common feature subset

### ADR-005: Plugin-Based Extractors

**Status:** Accepted

**Context:** Need to support many data source types with extensibility.

**Decision:** Registry pattern with `ISourceExtractor` interface and auto-discovery.

**Consequences:**
- (+) Easy to add new extractors
- (+) Community contributions
- (+) Selective loading
- (-) Discovery overhead
- (-) Version compatibility complexity

---

## Technology Stack Decisions

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20.x LTS | Long-term support, native async/await, vast ecosystem |
| Language | TypeScript 5.x | Type safety, better DX, catch errors at compile time |
| Package Manager | pnpm 8.x | Efficient disk usage, fast installs, workspace support |
| CLI Framework | Commander.js | Mature, well-documented, POSIX-compliant |
| API Server | Fastify | High performance, schema-based validation, plugin ecosystem |
| Validation | Zod | TypeScript-first, runtime validation, type inference |
| Logging | Pino | High performance, structured JSON, child loggers |
| Testing | Vitest | Fast, TypeScript native, compatible with Jest API |
| Vector DB (Local) | ChromaDB | Embedded, no external dependencies, developer-friendly |
| Vector DB (Cloud) | Pinecone | Managed service, high performance, good free tier |
| LLM Provider | Multi | Claude (primary), GPT (fallback), Gemini (alt), Ollama (local) |
| Embeddings | OpenAI text-embedding-3-small | Good quality/cost ratio, 1536 dimensions |

---

## Communication Patterns

### CLI → Core
```
CLI parses args → Loads config → Calls core functions → Formats output
```

### API → Core
```
API validates request → Authenticates → Calls core functions → Returns JSON
```

### Core → Providers
```
Core prepares messages → Provider adapter formats → API call → Response parsing
```

### Core → Storage
```
Core generates embeddings → Storage adapter → Vector DB → Similarity search
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Initial architecture | Aria (Architect) |

---

*Generated by Aria (Architect Agent) - AIOS Framework*

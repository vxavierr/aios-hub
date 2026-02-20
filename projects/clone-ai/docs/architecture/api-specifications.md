# Clone Lab - API Specifications

**Version:** 1.0 | **Date:** 2026-02-20 | **Author:** Aria (Architect)

---

## API Design Principles

1. **RESTful Design** - Resource-oriented URLs with proper HTTP methods
2. **Versioning** - URL-based versioning (`/api/v1/`)
3. **Error Handling** - Consistent error response format with codes
4. **Pagination** - Cursor-based pagination for list endpoints
5. **Rate Limiting** - Per-user rate limits with headers
6. **Streaming** - SSE for real-time responses

---

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.clone-lab.io/api/v1
```

---

## Authentication

### API Key (CLI)

```http
Authorization: Bearer cl_xxxxxxxxxxxxxxxxxxxx
```

### JWT (Web)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Core Endpoints

### Extraction

#### POST /extract

Extract content from a data source.

**Request:**
```json
{
  "source": {
    "type": "youtube" | "pdf" | "web" | "social" | "json" | "markdown",
    "path": "string (optional)",
    "url": "string (optional)",
    "options": {
      "recursive": false,
      "chunkSize": 1000,
      "overlap": 200
    }
  },
  "output": {
    "format": "json" | "jsonl",
    "destination": "file" | "memory"
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "status": "completed",
  "extractedData": {
    "id": "uuid",
    "wordCount": 1234,
    "chunkCount": 12
  },
  "metadata": {
    "processedAt": "2026-02-20T12:00:00Z",
    "duration": 1234
  }
}
```

### Analysis

#### POST /analyze

Analyze extracted content for personality traits.

**Request:**
```json
{
  "extractedId": "uuid",
  "analyzers": ["big_five", "emotional", "cognitive", "communication"],
  "options": {
    "parallel": true,
    "cacheResults": true
  }
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "extractedId": "uuid",
  "results": {
    "bigFive": {
      "openness": { "value": 0.85, "confidence": 0.92 },
      "conscientiousness": { "value": 0.72, "confidence": 0.88 },
      "extraversion": { "value": 0.45, "confidence": 0.90 },
      "agreeableness": { "value": 0.68, "confidence": 0.85 },
      "neuroticism": { "value": 0.32, "confidence": 0.87 }
    },
    "communication": {
      "formality": "semi-formal",
      "avgSentenceLength": 18,
      "vocabularyLevel": "advanced"
    }
  },
  "fidelity": 87
}
```

### DNA Management

#### POST /dna

Create a new personality DNA profile.

**Request:**
```json
{
  "name": "Professor Example",
  "analysisIds": ["uuid1", "uuid2"],
  "options": {
    "encrypt": false,
    "weights": {
      "traits": { "openness": 1.2 }
    }
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Professor Example",
  "version": "1.0.0",
  "fidelity": 85,
  "sourceCount": 12,
  "confidence": 0.89,
  "created": "2026-02-20T12:00:00Z"
}
```

#### GET /dna/{id}

Retrieve a DNA profile.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Professor Example",
  "version": "1.0.0",
  "traits": { ... },
  "communication": { ... },
  "knowledgeDomains": [ ... ],
  "fidelity": 85,
  "created": "2026-02-20T12:00:00Z",
  "modified": "2026-02-20T12:00:00Z"
}
```

#### GET /dna

List all DNA profiles.

**Query Parameters:**
- `limit`: number (default: 20)
- `cursor`: string (pagination cursor)
- `sort`: "name" | "created" | "fidelity"
- `order`: "asc" | "desc"

**Response (200):**
```json
{
  "profiles": [
    { "id": "uuid", "name": "...", "fidelity": 85 }
  ],
  "pagination": {
    "nextCursor": "string",
    "hasMore": true
  }
}
```

#### DELETE /dna/{id}

Delete a DNA profile.

**Response (204):** No content

### Manifest Generation

#### POST /manifest

Generate a deployment manifest from DNA.

**Request:**
```json
{
  "dnaId": "uuid",
  "provider": "claude" | "openai" | "gemini" | "ollama",
  "modelConfig": {
    "model": "claude-3-sonnet",
    "temperature": 0.7,
    "maxTokens": 4096
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "dnaId": "uuid",
  "provider": "claude",
  "systemPrompt": "You are Professor Example...",
  "modelConfig": { ... },
  "generatedAt": "2026-02-20T12:00:00Z"
}
```

### Chat Runtime

#### POST /chat

Send a message to a clone.

**Request:**
```json
{
  "manifestId": "uuid",
  "message": "Hello, can you help me?",
  "sessionId": "uuid (optional)",
  "options": {
    "stream": true
  }
}
```

**Response (200) - Non-streaming:**
```json
{
  "response": "Hello! I'd be happy to help you...",
  "sessionId": "uuid",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 50,
    "totalTokens": 200
  }
}
```

**Response (200) - Streaming (SSE):**
```
event: token
data: {"content": "Hello"}

event: token
data: {"content": "!"}

event: done
data: {"sessionId": "uuid", "usage": {...}}
```

#### GET /sessions

List active sessions.

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "manifestId": "uuid",
      "messageCount": 5,
      "lastActivity": "2026-02-20T12:00:00Z"
    }
  ]
}
```

### Providers

#### GET /providers

List available AI providers.

**Response (200):**
```json
{
  "providers": [
    {
      "name": "claude",
      "displayName": "Anthropic Claude",
      "models": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
      "status": "available",
      "latency": 1200
    },
    {
      "name": "openai",
      "displayName": "OpenAI GPT",
      "models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
      "status": "available",
      "latency": 800
    }
  ]
}
```

#### POST /providers/{name}/test

Test provider connectivity.

**Response (200):**
```json
{
  "provider": "claude",
  "status": "connected",
  "latency": 150,
  "model": "claude-3-sonnet"
}
```

---

## Error Response Format

```json
{
  "error": {
    "code": "E001",
    "message": "Source unavailable or rate-limited",
    "details": {
      "source": "youtube",
      "reason": "quota_exceeded"
    },
    "requestId": "req_xxx",
    "timestamp": "2026-02-20T12:00:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| E001 | 503 | Source unavailable or rate-limited |
| E002 | 400 | Invalid source format |
| E003 | 422 | Insufficient content for analysis |
| E004 | 422 | Schema validation failed |
| E005 | 400 | Provider not supported |
| E006 | 502 | Provider API error |
| E007 | 429 | Rate limit exceeded |
| E008 | 401 | Invalid API key |
| E009 | 403 | Permission denied |
| E010 | 400 | Configuration file invalid |

---

## Rate Limiting

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708435200
```

### Limits

| Tier | Requests/min | Requests/day |
|------|--------------|--------------|
| Free | 10 | 100 |
| Pro | 60 | 1,000 |
| Enterprise | Unlimited | Unlimited |

---

## WebSocket /chat/stream

Real-time streaming chat endpoint.

**Connection:**
```
wss://api.clone-lab.io/ws/chat?manifestId=xxx&sessionId=yyy
```

**Message Format:**
```json
{
  "type": "message" | "ping" | "error",
  "payload": {
    "content": "string"
  }
}
```

---

## OpenAPI 3.0 Summary

```yaml
openapi: 3.0.0
info:
  title: Clone Lab API
  version: 1.0.0
  description: AI Personality Cloning Platform

servers:
  - url: https://api.clone-lab.io/api/v1
    description: Production

paths:
  /extract:
    post:
      summary: Extract content from source
      tags: [Extraction]

  /analyze:
    post:
      summary: Analyze extracted content
      tags: [Analysis]

  /dna:
    get:
      summary: List DNA profiles
    post:
      summary: Create DNA profile
    get:
      summary: List profiles

  /dna/{id}:
    get:
      summary: Get DNA profile
    delete:
      summary: Delete DNA profile

  /manifest:
    post:
      summary: Generate manifest

  /chat:
    post:
      summary: Send chat message

  /providers:
    get:
      summary: List providers

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Initial API spec | Aria (Architect) |

---

*Generated by Aria (Architect Agent) - AIOS Framework*

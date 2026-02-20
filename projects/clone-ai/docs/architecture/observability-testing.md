# Clone Lab - Observability & Testing

**Version:** 1.0 | **Date:** 2026-02-20 | **Author:** Aria (Architect)

---

## Observability Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          OBSERVABILITY ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐         │
│  │    CLI      │   │    API      │   │    Core     │   │  Providers  │         │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘         │
│         │                 │                 │                 │                 │
│         └─────────────────┴─────────────────┴─────────────────┘                 │
│                                    │                                             │
│                                    ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         TELEMETRY LAYER                                  │   │
│  │                                                                          │   │
│  │  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐         │   │
│  │  │   Pino    │   │  Open     │   │  Health   │   │  Metrics  │         │   │
│  │  │  Logger   │   │ Telemetry │   │  Checks   │   │ (Prom)    │         │   │
│  │  └───────────┘   └───────────┘   └───────────┘   └───────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Logging Strategy

### Pino Configuration

```typescript
// packages/core/src/logging/logger.ts
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.timestamp({
    format: 'iso',
  }),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  redact: {
    paths: ['apiKey', 'authorization', 'password', '*.apiKey'],
    censor: '[REDACTED]',
  },
});

// Child logger with context
export function createContextLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
```

### Structured Log Format

```json
{
  "level": "info",
  "time": "2026-02-20T12:00:00.000Z",
  "correlationId": "req-abc123",
  "service": "clone-lab-api",
  "version": "1.0.0",
  "msg": "DNA synthesis completed",
  "dnaId": "uuid-here",
  "fidelity": 87,
  "duration": 1234,
  "sourceCount": 12
}
```

### Log Levels

| Level | Usage |
|-------|-------|
| `trace` | Detailed debugging (not in production) |
| `debug` | Development debugging |
| `info` | Normal operations |
| `warn` | Unexpected but handled |
| `error` | Errors requiring attention |
| `fatal` | System-critical failures |

---

## Correlation IDs

```typescript
// Middleware to add correlation ID
import { randomUUID } from 'crypto';
import { asyncLocalStorage } from './async-context';

export function correlationMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  asyncLocalStorage.run({ correlationId }, next);
}

// Usage in code
function logWithContext(message: string, data?: object) {
  const store = asyncLocalStorage.getStore();
  logger.info({ correlationId: store?.correlationId, ...data }, message);
}
```

---

## Health Check Endpoints

### /health/live

```typescript
// Liveness probe
app.get('/health/live', async (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### /health/ready

```typescript
// Readiness probe
app.get('/health/ready', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    vectorStore: await checkVectorStore(),
    providers: await checkProviders(),
  };

  const allHealthy = Object.values(checks).every((c) => c.status === 'ok');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

### Provider Health Checks

```typescript
async function checkProviders(): Promise<HealthCheck> {
  const results = await Promise.allSettled(
    providers.map(async (p) => ({
      name: p.name,
      latency: await measureLatency(() => p.testConnection()),
    }))
  );

  return {
    status: results.every((r) => r.status === 'fulfilled') ? 'ok' : 'degraded',
    details: results.map((r) =>
      r.status === 'fulfilled'
        ? r.value
        : { name: 'unknown', error: r.reason.message }
    ),
  };
}
```

---

## Prometheus Metrics

### Custom Metrics

```typescript
// packages/core/src/metrics/metrics.ts
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

export const register = new Registry();

// DNA generation metrics
export const dnaGenerationCounter = new Counter({
  name: 'clone_lab_dna_generation_total',
  help: 'Total number of DNA generations',
  labelNames: ['status', 'fidelity_range'],
  registers: [register],
});

export const dnaGenerationDuration = new Histogram({
  name: 'clone_lab_dna_generation_duration_seconds',
  help: 'Duration of DNA generation',
  labelNames: ['status'],
  buckets: [1, 5, 10, 30, 60, 120],
  registers: [register],
});

// Provider metrics
export const providerRequestCounter = new Counter({
  name: 'clone_lab_provider_requests_total',
  help: 'Total provider API requests',
  labelNames: ['provider', 'model', 'status'],
  registers: [register],
});

export const providerLatency = new Histogram({
  name: 'clone_lab_provider_latency_seconds',
  help: 'Provider API latency',
  labelNames: ['provider', 'model'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Active sessions gauge
export const activeSessionsGauge = new Gauge({
  name: 'clone_lab_active_sessions',
  help: 'Number of active clone sessions',
  registers: [register],
});
```

### Metrics Endpoint

```typescript
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

---

## Testing Strategy

### Test Pyramid

```
                    ┌─────────┐
                   │   E2E   │ (5%)
                  ├───────────┤
                 │ Integration│ (15%)
                ├──────────────┤
               │    Unit Tests │ (80%)
              └────────────────┘
```

### Unit Tests (Vitest)

```typescript
// packages/core/src/dna/__tests__/synthesizer.test.ts
import { describe, it, expect, vi } from 'vitest';
import { DNASynthesizer } from '../synthesizer';

describe('DNASynthesizer', () => {
  it('should synthesize DNA from analysis results', async () => {
    const synthesizer = new DNASynthesizer(mockAnalyzers, mockResolver);

    const result = await synthesizer.synthesize([mockAnalysisResult]);

    expect(result).toBeDefined();
    expect(result.fidelity).toBeGreaterThan(0);
    expect(result.fidelity).toBeLessThanOrEqual(100);
  });

  it('should calculate fidelity based on confidence', async () => {
    // Test fidelity calculation
  });

  it('should resolve conflicts between analyzers', async () => {
    // Test conflict resolution
  });
});
```

### Integration Tests (Testcontainers)

```typescript
// tests/integration/vector-store.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GenericContainer } from 'testcontainers';

describe('VectorStore Integration', () => {
  let container;
  let vectorStore;

  beforeAll(async () => {
    container = await new GenericContainer('chromadb/chroma:latest')
      .withExposedPorts(8000)
      .start();

    vectorStore = new ChromaDBStore({
      host: container.getHost(),
      port: container.getMappedPort(8000),
    });
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should insert and search vectors', async () => {
    await vectorStore.insert([mockVectorRecord]);

    const results = await vectorStore.search(mockEmbedding, 5);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(mockVectorRecord.id);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/cli.test.ts
import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('CLI E2E', () => {
  test('should extract from JSON file', async () => {
    const { stdout } = await execAsync(
      'clone-lab extract ./fixtures/test.json -o ./output/extracted.json'
    );

    expect(stdout).toContain('Extracted');
    expect(stdout).toContain('words');
  });

  test('should create DNA profile', async () => {
    const { stdout } = await execAsync(
      'clone-lab synthesize ./output/analysis.json -n "Test Profile"'
    );

    expect(stdout).toContain('DNA profile created');
    expect(stdout).toContain('fidelity');
  });

  test('should run interactive session', async () => {
    // Test interactive clone session
  });
});
```

### Test Fixtures

```typescript
// tests/fixtures/dna-fixtures.ts
export const mockDNA: PersonalityDNA = {
  id: 'test-uuid',
  version: '1.0.0',
  name: 'Test Profile',
  created: new Date('2026-02-20'),
  modified: new Date('2026-02-20'),
  traits: {
    bigFive: {
      openness: { name: 'openness', value: 0.8, confidence: 0.9, evidence: [] },
      conscientiousness: { name: 'conscientiousness', value: 0.7, confidence: 0.85, evidence: [] },
      extraversion: { name: 'extraversion', value: 0.5, confidence: 0.88, evidence: [] },
      agreeableness: { name: 'agreeableness', value: 0.6, confidence: 0.82, evidence: [] },
      neuroticism: { name: 'neuroticism', value: 0.3, confidence: 0.9, evidence: [] },
    },
    // ...
  },
  communication: {
    formality: 'semi-formal',
    avgSentenceLength: 18,
    vocabularyLevel: 'advanced',
    humorUsage: 'occasional',
    commonPhrases: ['in my experience', 'let me think'],
    verbalTics: ['um', 'you know'],
  },
  knowledgeDomains: [],
  fidelity: 85,
  sourceCount: 5,
  confidence: 0.87,
};
```

---

## Coverage Requirements

```json
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
};
```

---

## Performance Testing

```typescript
// tests/performance/dna-generation.bench.ts
import { bench, describe } from 'vitest';
import { DNASynthesizer } from '../../packages/core/src/dna/synthesizer';

describe('DNA generation performance', () => {
  bench('synthesize 10 sources', async () => {
    const synthesizer = new DNASynthesizer(analyzers, resolver);
    await synthesizer.synthesize(mockAnalysisResults10);
  });

  bench('synthesize 100 sources', async () => {
    const synthesizer = new DNASynthesizer(analyzers, resolver);
    await synthesizer.synthesize(mockAnalysisResults100);
  });

  bench('synthesize 500 sources', async () => {
    const synthesizer = new DNASynthesizer(analyzers, resolver);
    await synthesizer.synthesize(mockAnalysisResults500);
  });
});
```

---

## CI/CD Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      chromadb:
        image: chromadb/chroma:latest
        ports:
          - 8000:8000

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Initial observability & testing | Aria (Architect) |

---

*Generated by Aria (Architect Agent) - AIOS Framework*

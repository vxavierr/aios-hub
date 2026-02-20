# Clone Lab - Data Model & Storage

**Version:** 1.0 | **Date:** 2026-02-20 | **Author:** Aria (Architect)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ENTITY RELATIONSHIPS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐                │
│  │  SourceData  │──────▶│ ExtractedData│──────▶│AnalysisResult│                │
│  │              │  1:N  │              │  1:N  │              │                │
│  │ • id         │       │ • id         │       │ • id         │                │
│  │ • type       │       │ • sourceId   │       │ • extractedId│                │
│  │ • path/url   │       │ • content    │       │ • analyzer   │                │
│  │ • metadata   │       │ • metadata   │       │ • traits     │                │
│  └──────────────┘       └──────────────┘       │ • confidence │                │
│                                                 └──────┬───────┘                │
│                                                        │                         │
│                                                        │ 1:N                     │
│                                                        ▼                         │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐                │
│  │    Session   │◀──────│   Manifest   │◀──────│PersonalityDNA│                │
│  │              │  1:N  │              │  1:1  │              │                │
│  │ • id         │       │ • id         │       │ • id         │                │
│  │ • manifestId │       │ • dnaId      │       │ • version    │                │
│  │ • messages   │       │ • provider   │       │ • traits     │                │
│  │ • state      │       │ • prompt     │       │ • communication│               │
│  │ • created    │       │ • config     │       │ • knowledge  │                │
│  └──────────────┘       └──────────────┘       │ • fidelity   │                │
│                                                 └──────────────┘                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Type Definitions (TypeScript)

### SourceData

```typescript
// Source types for extraction
type SourceType = 'youtube' | 'pdf' | 'web' | 'social' | 'json' | 'markdown';

interface SourceMetadata {
  title?: string;
  author?: string;
  date?: string;
  url?: string;
  [key: string]: unknown;
}

interface SourceData {
  id: string;                    // UUID
  type: SourceType;
  path?: string;                 // Local file path
  url?: string;                  // Remote URL
  metadata: SourceMetadata;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
```

### ExtractedData

```typescript
interface ExtractedContent {
  text: string;                  // Raw text content
  chunks?: TextChunk[];          // Pre-chunked content
  embeddings?: number[][];       // Vector embeddings
}

interface ExtractedData {
  id: string;                    // UUID
  sourceId: string;              // Reference to SourceData
  content: ExtractedContent;
  metadata: {
    wordCount: number;
    charCount: number;
    language?: string;
    extractedAt: Date;
  };
}
```

### PersonalityDNA

```typescript
interface PersonalityTrait {
  name: string;
  value: number;                 // 0.0 - 1.0 scale
  confidence: number;            // 0.0 - 1.0 confidence
  evidence: string[];            // Supporting evidence
}

interface CommunicationStyle {
  formality: 'formal' | 'semi-formal' | 'informal';
  avgSentenceLength: number;
  vocabularyLevel: 'simple' | 'moderate' | 'advanced';
  humorUsage: 'none' | 'rare' | 'occasional' | 'frequent';
  commonPhrases: string[];
  verbalTics: string[];
}

interface KnowledgeDomain {
  name: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'expert';
  keywords: string[];
}

interface PersonalityDNA {
  id: string;                    // UUID
  version: string;               // Schema version (e.g., "1.0.0")
  name: string;                  // Display name
  created: Date;
  modified: Date;

  // Core personality dimensions
  traits: {
    bigFive: {
      openness: PersonalityTrait;
      conscientiousness: PersonalityTrait;
      extraversion: PersonalityTrait;
      agreeableness: PersonalityTrait;
      neuroticism: PersonalityTrait;
    };
    emotional: {
      sentimentBaseline: PersonalityTrait;
      emotionalRange: PersonalityTrait;
      primaryEmotions: Record<string, PersonalityTrait>;
    };
    cognitive: {
      style: 'analytical' | 'intuitive' | 'hybrid';
      reasoning: PersonalityTrait;
      creativity: PersonalityTrait;
    };
  };

  communication: CommunicationStyle;
  knowledgeDomains: KnowledgeDomain[];

  // Quality metrics
  fidelity: number;              // 0-100 score
  sourceCount: number;           // Number of sources used
  confidence: number;            // Overall confidence
}
```

### ManifestConfig

```typescript
type ProviderType = 'claude' | 'openai' | 'gemini' | 'ollama';

interface ModelConfig {
  model: string;                 // Model identifier
  temperature: number;           // 0.0 - 2.0
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

interface ManifestConfig {
  id: string;
  dnaId: string;
  provider: ProviderType;
  modelConfig: ModelConfig;
  systemPrompt: string;
  generatedAt: Date;

  // Optional fine-tuning
  weights?: {
    traits: Record<string, number>;
    communication: Record<string, number>;
  };
}
```

### Session

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  manifestId: string;
  messages: Message[];
  state: 'active' | 'paused' | 'ended';
  created: Date;
  lastActivity: Date;
  metadata?: Record<string, unknown>;
}
```

---

## Zod Schemas

```typescript
import { z } from 'zod';

// Source Data Schema
export const SourceDataSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['youtube', 'pdf', 'web', 'social', 'json', 'markdown']),
  path: z.string().optional(),
  url: z.string().url().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
});

// Personality DNA Schema
export const PersonalityTraitSchema = z.object({
  name: z.string(),
  value: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const PersonalityDNASchema = z.object({
  id: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  name: z.string().min(1).max(100),
  created: z.date(),
  modified: z.date(),
  traits: z.object({
    bigFive: z.object({
      openness: PersonalityTraitSchema,
      conscientiousness: PersonalityTraitSchema,
      extraversion: PersonalityTraitSchema,
      agreeableness: PersonalityTraitSchema,
      neuroticism: PersonalityTraitSchema,
    }),
    emotional: z.object({
      sentimentBaseline: PersonalityTraitSchema,
      emotionalRange: PersonalityTraitSchema,
      primaryEmotions: z.record(PersonalityTraitSchema),
    }),
    cognitive: z.object({
      style: z.enum(['analytical', 'intuitive', 'hybrid']),
      reasoning: PersonalityTraitSchema,
      creativity: PersonalityTraitSchema,
    }),
  }),
  communication: z.object({
    formality: z.enum(['formal', 'semi-formal', 'informal']),
    avgSentenceLength: z.number().int().positive(),
    vocabularyLevel: z.enum(['simple', 'moderate', 'advanced']),
    humorUsage: z.enum(['none', 'rare', 'occasional', 'frequent']),
    commonPhrases: z.array(z.string()),
    verbalTics: z.array(z.string()),
  }),
  knowledgeDomains: z.array(z.object({
    name: z.string(),
    proficiency: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
    keywords: z.array(z.string()),
  })),
  fidelity: z.number().int().min(0).max(100),
  sourceCount: z.number().int().nonnegative(),
  confidence: z.number().min(0).max(1),
});

// Manifest Schema
export const ManifestConfigSchema = z.object({
  id: z.string().uuid(),
  dnaId: z.string().uuid(),
  provider: z.enum(['claude', 'openai', 'gemini', 'ollama']),
  modelConfig: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().positive(),
    topP: z.number().min(0).max(1).optional(),
    frequencyPenalty: z.number().min(-2).max(2).optional(),
    presencePenalty: z.number().min(-2).max(2).optional(),
  }),
  systemPrompt: z.string(),
  generatedAt: z.date(),
  weights: z.object({
    traits: z.record(z.number()),
    communication: z.record(z.number()),
  }).optional(),
});
```

---

## Vector Storage Design

### Collections

| Collection | Purpose | Dimensions |
|------------|---------|------------|
| `content_chunks` | Text embeddings for RAG | 1536 |
| `personality_vectors` | DNA profile vectors | 384 (compressed) |
| `conversation_history` | Session embeddings | 1536 |

### Indexes

```yaml
content_chunks:
  - name: source_id_idx
    type: filter
    field: sourceId
  - name: content_embedding_idx
    type: vector
    field: embedding
    metric: cosine

personality_vectors:
  - name: dna_id_idx
    type: filter
    field: dnaId
  - name: trait_embedding_idx
    type: vector
    field: embedding
    metric: cosine
```

### Query Patterns

```typescript
// Similarity search for RAG
interface SimilarityQuery {
  collection: 'content_chunks';
  embedding: number[];
  topK: number;
  filter?: {
    sourceId?: string;
    dateRange?: { from: Date; to: Date };
  };
}

// Personality matching
interface PersonalityMatchQuery {
  collection: 'personality_vectors';
  embedding: number[];
  topK: number;
  threshold: number;  // Minimum similarity
}
```

---

## File Storage Strategy

### Directory Structure

```
~/.clone-lab/
├── profiles/
│   ├── {profile-id}.dna.json
│   └── {profile-id}.dna.yaml
├── manifests/
│   └── {manifest-id}.manifest.json
├── cache/
│   ├── embeddings/
│   │   └── {source-id}.embeddings.bin
│   └── extractions/
│       └── {source-id}.extracted.json
├── sessions/
│   └── {session-id}.session.json
└── config.yaml
```

### File Formats

| Type | Format | Max Size | Encryption |
|------|--------|----------|------------|
| DNA Profile | JSON/YAML | 500KB | Optional (AES-256) |
| Manifest | JSON | 100KB | No |
| Cache | Binary/JSON | 10MB | No |
| Session | JSON | 5MB | Optional |

---

## Data Migration Strategy

### Version Compatibility

```typescript
interface Migration {
  fromVersion: string;
  toVersion: string;
  migrate: (data: unknown) => unknown;
}

const migrations: Migration[] = [
  {
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    migrate: (data) => {
      // Add new fields with defaults
      return { ...data, newField: 'default' };
    },
  },
];

function migrateDNA(dna: PersonalityDNA, targetVersion: string): PersonalityDNA {
  let current = dna;
  while (current.version !== targetVersion) {
    const migration = migrations.find(m => m.fromVersion === current.version);
    if (!migration) break;
    current = migration.migrate(current) as PersonalityDNA;
  }
  return current;
}
```

### Backup Strategy

| Data Type | Backup Frequency | Retention |
|-----------|------------------|-----------|
| DNA Profiles | On change | 30 days |
| Sessions | Hourly | 7 days |
| Cache | None (regenerable) | N/A |
| Config | On change | 10 versions |

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Initial data model | Aria (Architect) |

---

*Generated by Aria (Architect Agent) - AIOS Framework*

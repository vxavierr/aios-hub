# Clone Lab - Component Architecture

**Version:** 1.0 | **Date:** 2026-02-20 | **Author:** Aria (Architect)

---

## Package Dependency Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            PACKAGE DEPENDENCIES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                        ┌──────────────┐                                         │
│                        │     CLI      │                                         │
│                        │  (packages/  │                                         │
│                        │     cli)     │                                         │
│                        └──────┬───────┘                                         │
│                               │                                                  │
│                               ▼                                                  │
│                        ┌──────────────┐                                         │
│                        │     API      │                                         │
│                        │  (apps/api)  │                                         │
│                        └──────┬───────┘                                         │
│                               │                                                  │
│                               ▼                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │   Core       │◀──│  Extractors  │   │  Embeddings  │   │   Storage    │     │
│  │ (packages/   │   │ (packages/   │   │ (packages/   │   │ (packages/   │     │
│  │   core)      │   │ extractors)  │   │ embeddings)  │   │  storage)    │     │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘     │
│         │                  │                  │                  │               │
│         └──────────────────┴──────────────────┴──────────────────┘               │
│                                     │                                            │
│                                     ▼                                            │
│                            ┌──────────────┐                                     │
│                            │   Providers  │                                     │
│                            │ (packages/   │                                     │
│                            │  providers)  │                                     │
│                            └──────────────┘                                     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Interfaces

### ISourceExtractor

```typescript
// packages/extractors/src/base/extractor.interface.ts

interface ExtractionResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  chunks?: TextChunk[];
}

interface ISourceExtractor {
  readonly type: SourceType;
  readonly supportedExtensions: string[];

  canHandle(source: string): boolean;
  extract(source: string, options?: ExtractionOptions): Promise<ExtractionResult>;
}
```

### IAnalyzer

```typescript
// packages/core/src/analysis/analyzer.interface.ts

interface AnalysisContext {
  extractedData: ExtractedData[];
  options: Record<string, unknown>;
}

interface AnalysisResult {
  analyzer: string;
  traits: PersonalityTrait[];
  confidence: number;
  metadata: Record<string, unknown>;
}

interface IAnalyzer {
  readonly name: string;
  readonly version: string;

  analyze(context: AnalysisContext): Promise<AnalysisResult>;
}
```

### IEmbeddingProvider

```typescript
// packages/embeddings/src/provider.interface.ts

interface EmbeddingOptions {
  model?: string;
  batchSize?: number;
}

interface IEmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;

  embed(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;
  embedSingle(text: string): Promise<number[]>;
}
```

### IVectorStore

```typescript
// packages/storage/src/vector-store.interface.ts

interface VectorRecord {
  id: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

interface IVectorStore {
  readonly name: string;

  insert(records: VectorRecord[]): Promise<void>;
  search(embedding: number[], topK: number): Promise<SearchResult[]>;
  delete(ids: string[]): Promise<void>;
}
```

### IProvider (AI)

```typescript
// packages/providers/src/provider.interface.ts

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

interface IProvider {
  readonly name: string;
  readonly models: string[];

  chat(messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse>;
  streamChat(messages: ChatMessage[], options: ChatOptions): AsyncIterable<string>;
  testConnection(): Promise<boolean>;
}
```

---

## Core Classes

### DNASynthesizer

```typescript
// packages/core/src/dna/synthesizer.ts

class DNASynthesizer {
  constructor(
    private readonly analyzers: IAnalyzer[],
    private readonly conflictResolver: ConflictResolver
  ) {}

  async synthesize(analysisResults: AnalysisResult[]): Promise<PersonalityDNA> {
    // 1. Group results by trait type
    const grouped = this.groupByTrait(analysisResults);

    // 2. Resolve conflicts between analyzers
    const resolved = await this.conflictResolver.resolve(grouped);

    // 3. Build DNA structure
    const dna = this.buildDNA(resolved);

    // 4. Calculate fidelity score
    dna.fidelity = this.calculateFidelity(dna);

    return dna;
  }

  private calculateFidelity(dna: PersonalityDNA): number {
    // Score based on:
    // - Number of sources
    // - Confidence levels
    // - Trait coverage
    // - Evidence quality
  }
}
```

### PromptGenerator

```typescript
// packages/core/src/manifest/generator.ts

class PromptGenerator {
  constructor(
    private readonly templateEngine: TemplateEngine,
    private readonly providerAdapters: Map<ProviderType, ProviderAdapter>
  ) {}

  async generate(dna: PersonalityDNA, provider: ProviderType): Promise<string> {
    // 1. Get provider-specific adapter
    const adapter = this.providerAdapters.get(provider);

    // 2. Map DNA traits to instructions
    const instructions = this.mapTraitsToInstructions(dna);

    // 3. Apply provider-specific formatting
    const formatted = adapter.formatInstructions(instructions);

    // 4. Render template
    const prompt = await this.templateEngine.render('system-prompt', {
      dna,
      instructions: formatted,
    });

    // 5. Optimize for token limits
    return adapter.optimize(prompt);
  }
}
```

### CloneRuntime

```typescript
// packages/core/src/runtime/runtime.ts

class CloneRuntime {
  constructor(
    private readonly provider: IProvider,
    private readonly manifest: ManifestConfig,
    private readonly sessionManager: SessionManager
  ) {}

  async sendMessage(content: string, sessionId?: string): Promise<string> {
    // 1. Get or create session
    const session = sessionId
      ? await this.sessionManager.get(sessionId)
      : await this.sessionManager.create(this.manifest.id);

    // 2. Build message history
    const messages = this.buildMessages(session, content);

    // 3. Call provider
    const response = await this.provider.chat(messages, this.manifest.modelConfig);

    // 4. Update session
    await this.sessionManager.addMessage(session.id, {
      role: 'user',
      content,
    });
    await this.sessionManager.addMessage(session.id, {
      role: 'assistant',
      content: response.content,
    });

    return response.content;
  }

  async *streamMessage(content: string): AsyncIterable<string> {
    // Streaming variant
  }
}
```

---

## Design Patterns

### Strategy Pattern (Extractors)

```typescript
// Extraction strategy selection
class ExtractorRegistry {
  private extractors: Map<SourceType, ISourceExtractor> = new Map();

  register(extractor: ISourceExtractor): void {
    this.extractors.set(extractor.type, extractor);
  }

  getExtractor(source: string): ISourceExtractor {
    for (const extractor of this.extractors.values()) {
      if (extractor.canHandle(source)) {
        return extractor;
      }
    }
    throw new Error(`No extractor found for: ${source}`);
  }
}
```

### Factory Pattern (Providers)

```typescript
// Provider factory
class ProviderFactory {
  static create(type: ProviderType, config: ProviderConfig): IProvider {
    switch (type) {
      case 'claude':
        return new ClaudeProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      default:
        throw new Error(`Unknown provider: ${type}`);
    }
  }
}
```

### Observer Pattern (Progress)

```typescript
// Progress reporting
interface ProgressListener {
  onProgress(event: ProgressEvent): void;
}

class ProgressNotifier {
  private listeners: ProgressListener[] = [];

  subscribe(listener: ProgressListener): void {
    this.listeners.push(listener);
  }

  notify(event: ProgressEvent): void {
    for (const listener of this.listeners) {
      listener.onProgress(event);
    }
  }
}
```

---

## Dependency Injection

```typescript
// Simple DI container
class Container {
  private services: Map<string, unknown> = new Map();
  private factories: Map<string, () => unknown> = new Map();

  register<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  get<T>(name: string): T {
    if (!this.services.has(name)) {
      const factory = this.factories.get(name);
      if (!factory) throw new Error(`Service not found: ${name}`);
      this.services.set(name, factory());
    }
    return this.services.get(name) as T;
  }
}

// Bootstrap
const container = new Container();

container.register('vectorStore', () => new ChromaDBStore(config));
container.register('embeddingProvider', () => new OpenAIEmbeddings(apiKey));
container.register('providerRegistry', () => {
  const registry = new ProviderRegistry();
  registry.register('claude', new ClaudeProvider(config));
  registry.register('openai', new OpenAIProvider(config));
  return registry;
});
```

---

## Plugin System

### Extractor Plugin

```typescript
// Custom extractor plugin
interface ExtractorPlugin {
  name: string;
  version: string;
  register(registry: ExtractorRegistry): void;
}

// Example: Custom YouTube extractor
const youtubePlugin: ExtractorPlugin = {
  name: '@clone-lab/extractor-youtube',
  version: '1.0.0',
  register(registry) {
    registry.register(new YouTubeExtractor());
  },
};
```

### Provider Plugin

```typescript
// Custom provider plugin
interface ProviderPlugin {
  name: string;
  version: string;
  register(factory: ProviderFactory): void;
}

// Example: Custom provider
const mistralPlugin: ProviderPlugin = {
  name: '@clone-lab/provider-mistral',
  version: '1.0.0',
  register(factory) {
    factory.register('mistral', (config) => new MistralProvider(config));
  },
};
```

---

## CLI Structure

```typescript
// packages/cli/src/index.ts

import { Command } from 'commander';

const program = new Command();

program
  .name('clone-lab')
  .description('AI Personality Cloning Platform')
  .version('1.0.0');

// Extract command
program.command('extract')
  .description('Extract content from source')
  .argument('<source>', 'Source path or URL')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format', 'json')
  .action(async (source, options) => {
    const extractor = container.get('extractorRegistry').getExtractor(source);
    const result = await extractor.extract(source);
    // ... handle result
  });

// Analyze command
program.command('analyze')
  .description('Analyze extracted content')
  .argument('<input>', 'Extracted data path')
  .option('--analyzers <list>', 'Comma-separated analyzer list')
  .action(async (input, options) => {
    // ...
  });

// Synthesize command
program.command('synthesize')
  .description('Create DNA profile from analysis')
  .argument('<analysis>', 'Analysis result path')
  .option('-n, --name <name>', 'Profile name')
  .option('--encrypt', 'Encrypt the profile')
  .action(async (analysis, options) => {
    // ...
  });

// Manifest command
program.command('manifest')
  .description('Generate deployment manifest')
  .argument('<dna>', 'DNA profile path')
  .option('-p, --provider <provider>', 'Target provider', 'claude')
  .action(async (dna, options) => {
    // ...
  });

// Run command
program.command('run')
  .description('Run interactive clone session')
  .argument('<manifest>', 'Manifest path')
  .option('-p, --provider <provider>', 'Provider to use')
  .action(async (manifest, options) => {
    // Start REPL
  });

program.parse();
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Initial component architecture | Aria (Architect) |

---

*Generated by Aria (Architect Agent) - AIOS Framework*

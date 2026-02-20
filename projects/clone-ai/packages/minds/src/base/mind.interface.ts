/**
 * @fileoverview Core IMind interface and fundamental types for the Minds system
 * @description This is the foundation that all 8 Minds must implement
 * @module @clone-lab/minds/base
 */

import type {
  ExtractedData,
  ValidationResult,
  MindOptions,
  MindStatistics,
} from './types.js';

/**
 * Valid Mind identifiers - one for each analytical dimension
 */
export type MindId =
  | 'tim'
  | 'daniel'
  | 'brene'
  | 'barbara'
  | 'charlie'
  | 'constantin'
  | 'quinn'
  | 'victoria';

/**
 * Persona definition for a Mind
 * Each Mind has a unique personality and expertise area
 */
export interface MindPersona {
  /** Unique identifier for this Mind */
  id: MindId;
  /** Display name */
  name: string;
  /** Optional real-world inspiration for this Mind */
  inspiration?: string;
  /** Areas of expertise this Mind specializes in */
  expertise: string[];
  /** Communication tone of this Mind */
  tone: 'analytical' | 'empathetic' | 'pragmatic' | 'visionary';
  /** Brief description of this Mind's role */
  description?: string;
  /** Version of the Mind implementation */
  version?: string;
}

/**
 * Context passed to a Mind for analysis
 * Contains all data and state needed for processing
 */
export interface MindContext {
  /** Data extracted from sources to analyze */
  extractedData: ExtractedData[];
  /** Results from previously executed Minds (for sequential analysis) */
  previousResults?: Map<MindId, MindResult>;
  /** Configuration options for this analysis */
  options: Record<string, unknown>;
  /** Unique session identifier for tracking */
  sessionId: string;
  /** Execution context metadata */
  metadata?: MindContextMetadata;
}

/**
 * Additional metadata for MindContext
 */
export interface MindContextMetadata {
  /** Timestamp when context was created */
  createdAt: Date;
  /** Source identifier for the analysis */
  sourceId?: string;
  /** User who initiated the analysis */
  userId?: string;
  /** Priority level for this analysis */
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Result of a Mind's analysis
 */
export interface MindResult {
  /** ID of the Mind that produced this result */
  mindId: MindId;
  /** Personality traits extracted */
  traits: PersonalityTrait[];
  /** Overall confidence in the results (0-1) */
  confidence: number;
  /** Supporting evidence from source data */
  evidence: Evidence[];
  /** Recommendations based on analysis */
  recommendations: string[];
  /** Additional metadata about the result */
  metadata: MindResultMetadata;
}

/**
 * A personality trait extracted by a Mind
 */
export interface PersonalityTrait {
  /** Category of the trait (e.g., 'communication', 'values', 'behavior') */
  category: string;
  /** Name of the trait */
  name: string;
  /** Value of the trait (can be string, number, or boolean) */
  value: string | number | boolean;
  /** Confidence in this specific trait (0-1) */
  confidence: number;
  /** IDs of source content that support this trait */
  sources: string[];
  /** Optional notes about this trait */
  notes?: string;
}

/**
 * Supporting evidence from source data
 */
export interface Evidence {
  /** ID of the source data */
  source: string;
  /** Excerpt from the source */
  excerpt: string;
  /** Relevance score (0-1) */
  relevance: number;
  /** Type of evidence */
  type?: 'quote' | 'behavior' | 'preference' | 'opinion' | 'other';
}

/**
 * Metadata included in MindResult
 */
export interface MindResultMetadata {
  /** When this result was generated */
  timestamp: Date;
  /** Version of the Mind that generated this */
  mindVersion: string;
  /** Statistics about the analysis */
  statistics?: MindStatistics;
  /** Any warnings generated during analysis */
  warnings?: string[];
  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * Core interface that all Minds must implement
 *
 * @example
 * ```typescript
 * class TimMind implements IMind {
 *   readonly persona: MindPersona = {
 *     id: 'tim',
 *     name: 'Tim',
 *     expertise: ['data-extraction', 'source-validation'],
 *     tone: 'analytical'
 *   };
 *
 *   async analyze(context: MindContext): Promise<MindResult> {
 *     // Implementation
 *   }
 *
 *   async validate(result: MindResult): Promise<ValidationResult> {
 *     // Implementation
 *   }
 *
 *   canHandle(context: MindContext): boolean {
 *     return context.extractedData.length > 0;
 *   }
 *
 *   getDependencies(): MindId[] {
 *     return []; // Tim has no dependencies
 *   }
 * }
 * ```
 */
export interface IMind {
  /** The persona definition for this Mind */
  readonly persona: MindPersona;

  /**
   * Perform analysis on the provided context
   * @param context - The context containing data to analyze
   * @returns Promise resolving to the analysis result
   */
  analyze(context: MindContext): Promise<MindResult>;

  /**
   * Validate a MindResult for correctness and completeness
   * @param result - The result to validate
   * @returns Promise resolving to validation result
   */
  validate(result: MindResult): Promise<ValidationResult>;

  /**
   * Check if this Mind can handle the given context
   * @param context - The context to check
   * @returns Whether this Mind can process the context
   */
  canHandle(context: MindContext): boolean;

  /**
   * Get the list of Mind IDs that must run before this Mind
   * @returns Array of dependent Mind IDs
   */
  getDependencies(): MindId[];

  /**
   * Optional: Initialize the Mind with configuration
   * @param options - Configuration options
   */
  initialize?(options: MindOptions): Promise<void>;

  /**
   * Optional: Clean up resources when Mind is no longer needed
   */
  dispose?(): Promise<void>;

  /**
   * Optional: Check the health of this Mind
   * @returns Health status
   */
  healthCheck?(): Promise<import('./types.js').MindHealthStatus>;
}

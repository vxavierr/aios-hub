/**
 * @fileoverview Core IMind interface and fundamental types
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
 * Valid Mind identifiers
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
 */
export interface MindPersona {
  id: MindId;
  name: string;
  inspiration?: string;
  expertise: string[];
  tone: 'analytical' | 'empathetic' | 'pragmatic' | 'visionary';
  description?: string;
  version?: string;
}

/**
 * Context passed to a Mind for analysis
 */
export interface MindContext {
  extractedData: ExtractedData[];
  previousResults?: Map<MindId, MindResult>;
  options: Record<string, unknown>;
  sessionId: string;
  metadata?: MindContextMetadata;
}

/**
 * Additional metadata for MindContext
 */
export interface MindContextMetadata {
  createdAt: Date;
  sourceId?: string;
  userId?: string;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Result of a Mind's analysis
 */
export interface MindResult {
  mindId: MindId;
  traits: PersonalityTrait[];
  confidence: number;
  evidence: Evidence[];
  recommendations: string[];
  metadata: MindResultMetadata;
}

/**
 * A personality trait extracted by a Mind
 */
export interface PersonalityTrait {
  category: string;
  name: string;
  value: string | number | boolean;
  confidence: number;
  sources: string[];
  notes?: string;
}

/**
 * Supporting evidence from source data
 */
export interface Evidence {
  source: string;
  excerpt: string;
  relevance: number;
  type?: 'quote' | 'behavior' | 'preference' | 'opinion' | 'other';
}

/**
 * Metadata included in MindResult
 */
export interface MindResultMetadata {
  timestamp: Date;
  mindVersion: string;
  statistics?: MindStatistics;
  warnings?: string[];
  [key: string]: unknown;
}

/**
 * Core interface that all Minds must implement
 */
export interface IMind {
  readonly persona: MindPersona;

  analyze(context: MindContext): Promise<MindResult>;
  validate(result: MindResult): Promise<ValidationResult>;
  canHandle(context: MindContext): boolean;
  getDependencies(): MindId[];

  initialize?(options: MindOptions): Promise<void>;
  dispose?(): Promise<void>;
  healthCheck?(): Promise<import('./types.js').MindHealthStatus>;
}

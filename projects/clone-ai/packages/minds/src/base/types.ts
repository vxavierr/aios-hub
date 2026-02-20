/**
 * @fileoverview Core types for the Clone Lab Minds system
 * @description Fundamental type definitions used across all Minds
 * @module @clone-lab/minds/base
 */

import type { MindId } from './mind.interface.js';

/**
 * Represents data extracted from a source (conversations, documents, etc.)
 * This type is imported from @clone-lab/core but defined here for package independence
 */
export interface ExtractedData {
  /** Unique identifier for this extracted data */
  id: string;
  /** Source type (chat, document, video, audio, etc.) */
  sourceType: 'chat' | 'document' | 'video' | 'audio' | 'social' | 'other';
  /** Raw content extracted */
  content: string;
  /** Timestamp of original content */
  timestamp?: Date;
  /** Metadata about the source */
  metadata?: Record<string, unknown>;
}

/**
 * Result of validating a Mind's analysis output
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** Validation score (0-100) */
  score: number;
  /** List of validation errors or warnings */
  issues: ValidationIssue[];
  /** Additional validation metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  /** Issue severity level */
  severity: 'error' | 'warning' | 'info';
  /** Issue code for programmatic handling */
  code: string;
  /** Human-readable issue description */
  message: string;
  /** Path to the affected field (dot notation) */
  path?: string;
}

/**
 * Configuration options for Mind execution
 */
export interface MindOptions {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Maximum processing time in milliseconds */
  timeout?: number;
  /** Confidence threshold for results (0-1) */
  confidenceThreshold?: number;
  /** Include raw evidence in results */
  includeEvidence?: boolean;
  /** Custom analyzers to run */
  customAnalyzers?: string[];
  /** Additional configuration */
  [key: string]: unknown;
}

/**
 * Statistics about a Mind's analysis
 */
export interface MindStatistics {
  /** Time taken for analysis in milliseconds */
  executionTimeMs: number;
  /** Number of data items processed */
  itemsProcessed: number;
  /** Number of traits extracted */
  traitsExtracted: number;
  /** Average confidence score */
  averageConfidence: number;
  /** Memory usage in bytes */
  memoryUsedBytes?: number;
}

/**
 * Context for Mind initialization
 */
export interface MindInitContext {
  /** Mind instance ID */
  instanceId: string;
  /** Configuration options */
  options?: MindOptions;
  /** Logger instance */
  logger?: MindLogger;
}

/**
 * Simple logger interface for Minds
 */
export interface MindLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Serializable version of MindContext (for distributed execution)
 * Map is converted to Record for JSON serialization
 */
export interface SerializableMindContext {
  extractedData: ExtractedData[];
  previousResults?: Record<MindId, import('./mind.interface.js').MindResult>;
  options: Record<string, unknown>;
  sessionId: string;
}

/**
 * Health check result for a Mind
 */
export interface MindHealthStatus {
  /** Mind identifier */
  mindId: MindId;
  /** Whether the mind is healthy */
  healthy: boolean;
  /** Last successful execution timestamp */
  lastSuccess?: Date;
  /** Error message if unhealthy */
  error?: string;
  /** Additional health metrics */
  metrics?: MindStatistics;
}

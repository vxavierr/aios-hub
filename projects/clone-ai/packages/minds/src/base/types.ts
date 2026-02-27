/**
 * @fileoverview Core types for the Minds system
 * @description Fundamental type definitions used across all Minds
 * @module @clone-lab/minds/base
 */

import type { MindId } from './mind.interface.js';

/**
 * Represents data extracted from a source
 */
export interface ExtractedData {
  id: string;
  sourceType: 'chat' | 'document' | 'video' | 'audio' | 'social' | 'other';
  content: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Result of validating a Mind's analysis output
 */
export interface ValidationResult {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
  metadata?: Record<string, unknown>;
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  path?: string;
}

/**
 * Configuration options for Mind execution
 */
export interface MindOptions {
  verbose?: boolean;
  timeout?: number;
  confidenceThreshold?: number;
  includeEvidence?: boolean;
  customAnalyzers?: string[];
  [key: string]: unknown;
}

/**
 * Statistics about a Mind's analysis
 */
export interface MindStatistics {
  executionTimeMs: number;
  itemsProcessed: number;
  traitsExtracted: number;
  averageConfidence: number;
  memoryUsedBytes?: number;
}

/**
 * Context for Mind initialization
 */
export interface MindInitContext {
  instanceId: string;
  options?: MindOptions;
  logger?: MindLogger;
}

/**
 * Simple logger interface
 */
export interface MindLogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Serializable MindContext
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
  mindId: MindId;
  healthy: boolean;
  lastSuccess?: Date;
  error?: string;
  metrics?: MindStatistics;
}

/**
 * @fileoverview Core types for Clone Lab
 * @description Fundamental type definitions used across the system
 * @module @clone-lab/core
 */

/**
 * Represents data extracted from a source (conversations, documents, etc.)
 */
export interface ExtractedData {
  /** Unique identifier for this extracted data */
  id: string;
  /** Source type (chat, document, video, audio, social, other) */
  sourceType: 'chat' | 'document' | 'video' | 'audio' | 'social' | 'other';
  /** Raw content extracted */
  content: string;
  /** Timestamp of original content */
  timestamp?: Date;
  /** Metadata about the source */
  metadata?: Record<string, unknown>;
}

/**
 * Result of validating analysis output
 */
export interface CoreValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** Validation score (0-100) */
  score: number;
  /** List of validation issues */
  issues: CoreValidationIssue[];
}

/**
 * Individual validation issue
 */
export interface CoreValidationIssue {
  /** Issue severity level */
  severity: 'error' | 'warning' | 'info';
  /** Issue code */
  code: string;
  /** Human-readable description */
  message: string;
  /** Path to affected field */
  path?: string;
}

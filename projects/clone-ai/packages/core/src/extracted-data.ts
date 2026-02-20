/**
 * @fileoverview Types for extracted data
 * @module @clone-lab/core
 */

/**
 * Represents data extracted from a source
 */
export interface ExtractedData {
  /** Unique identifier */
  id: string;
  /** Source type */
  sourceType: 'chat' | 'document' | 'video' | 'audio' | 'social' | 'other';
  /** Raw content */
  content: string;
  /** Timestamp */
  timestamp?: Date;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Schema definition for extracted data validation
 */
export interface ExtractedDataSchema {
  version: string;
  fields: Record<string, SchemaField>;
}

/**
 * Field definition for schema
 */
export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  description?: string;
}

/**
 * @fileoverview Configuration types for Clone Lab
 * @module @clone-lab/core
 */

/**
 * Main configuration for a clone
 */
export interface CloneConfig {
  /** Unique clone identifier */
  id: string;
  /** Display name for the clone */
  name: string;
  /** Version of the clone configuration */
  version: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  updatedAt: Date;
}

/**
 * Options for clone operations
 */
export interface CloneOptions {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Custom configuration */
  [key: string]: unknown;
}

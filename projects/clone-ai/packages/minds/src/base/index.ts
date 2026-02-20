/**
 * @fileoverview Base module exports for @clone-lab/minds
 * @description Exports all base types and interfaces
 * @module @clone-lab/minds/base
 */

// Core interface
export type { IMind } from './mind.interface.js';

// Mind-related types
export type {
  MindId,
  MindPersona,
  MindContext,
  MindContextMetadata,
  MindResult,
  MindResultMetadata,
  PersonalityTrait,
  Evidence,
} from './mind.interface.js';

// Supporting types
export type {
  ExtractedData,
  ValidationResult,
  ValidationIssue,
  MindOptions,
  MindStatistics,
  MindInitContext,
  MindLogger,
  SerializableMindContext,
  MindHealthStatus,
} from './types.js';

/**
 * @fileoverview Brene Mind module exports
 * @description Values & Beliefs Analysis Mind for Clone Lab v2.0
 * @module @clone-lab/minds/brene
 */

// Main Mind implementation
export { BreneMind } from './brene-mind.js';

// Type definitions
export type {
  BreneResult,
  BreneOptions,
  CoreValue,
  Belief,
  VulnerabilityPattern,
  EmotionalTrigger,
  AuthenticityMarkers,
  NonNegotiable,
  ShameResilience,
  ValueImportance,
  ValueCategory,
  BeliefType,
  BeliefStrength,
  VulnerabilityResponse,
  TriggerCategory,
  ShameResponse,
} from './types.js';

// Prompt templates
export {
  BRENE_SYSTEM_PROMPT,
  BRENE_PROMPTS,
  createAnalysisPrompt,
  formatExtractedDataForPrompt,
  formatPreviousResultsForPrompt,
  type PromptContext,
} from './prompts.js';

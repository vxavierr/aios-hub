/**
 * @fileoverview Daniel Mind module exports
 * @description Behavioral Patterns Analysis - Big Five, Cognitive Biases, Decision-Making
 * @module @clone-lab/minds/daniel
 */

// Main Mind implementation
export { DanielMind } from './daniel-mind.js';

// Type definitions
export type {
  BigFiveTraits,
  BigFiveFacets,
  CognitiveBiasType,
  CognitiveBias,
  DecisionStyle,
  RiskTolerance,
  TimePreference,
  DecisionPatterns,
  BehavioralTrigger,
  ResponsePattern,
  BehavioralProfile,
  DanielMindOptions,
} from './types.js';

// Prompt templates
export {
  DANIEL_SYSTEM_PROMPT,
  DANIEL_PROMPTS,
  generateBigFivePrompt,
  generateCognitiveBiasPrompt,
  generateDecisionPatternPrompt,
  generateTriggerPrompt,
  generateFullProfilePrompt,
} from './prompts.js';

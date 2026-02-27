/**
 * @fileoverview Charlie Mind module exports
 * @description Synthesis & Paradoxes - Mental model identification, paradox detection, and wisdom distillation
 * @module @clone-lab/minds/charlie
 */

// Main class
export { CharlieMind } from './charlie-mind.js';
export { default } from './charlie-mind.js';

// Types
export type {
  MentalModel,
  MentalModelCategory,
  Paradox,
  ParadoxType,
  ParadoxSeverity,
  ParadoxResolutionStatus,
  ParadoxElement,
  Wisdom,
  WisdomType,
  WisdomDomain,
  CrossDomainConnection,
  ConnectionType,
  SynthesisQuality,
  SynthesisResult,
  CharlieResult,
  CharlieOptions,
} from './types.js';

// Prompts
export {
  CHARLIE_SYSTEM_PROMPT,
  CHARLIE_ANALYSIS_PROMPT,
  MENTAL_MODELS_PROMPT,
  PARADOX_DETECTION_PROMPT,
  WISDOM_EXTRACTION_PROMPT,
  CROSS_DOMAIN_PROMPT,
  SYNTHESIS_PROMPT,
  buildContextString,
  getDependencyList,
} from './prompts.js';

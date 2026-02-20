/**
 * @fileoverview Constantin Mind module exports
 * @description Implementation pattern analysis for Clone Lab
 * @module @clone-lab/minds/constantin
 */

// Main class
export { ConstantinMind, createConstantinMind } from './constantin-mind.js';

// Types
export type {
  ImplementationCategory,
  ImplementationPattern,
  TechnicalPreferenceType,
  TechnicalPreference,
  ToolChoiceCategory,
  ToolChoice,
  ProblemSolvingMethod,
  ProblemSolvingApproach,
  ExecutionStyleTrait,
  ExecutionStyle,
  ResourceAllocationPattern,
  ResourceAllocation,
  ConstantinAnalysisResult,
  ConstantinMindOptions,
} from './types.js';

// Prompts (for advanced usage)
export {
  CONSTANTIN_SYSTEM_PROMPT,
  IMPLEMENTATION_PATTERNS_PROMPT,
  TECHNICAL_PREFERENCES_PROMPT,
  TOOL_CHOICES_PROMPT,
  PROBLEM_SOLVING_PROMPT,
  EXECUTION_STYLE_PROMPT,
  RESOURCE_ALLOCATION_PROMPT,
  PROFILE_SUMMARY_PROMPT,
  buildPrompt,
  getAnalysisPrompts,
} from './prompts.js';

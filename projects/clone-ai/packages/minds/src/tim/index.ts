/**
 * @fileoverview Tim Mind module exports
 * @description Extraction Specialist - First Mind in the pipeline
 * @module @clone-lab/minds/tim
 */

// Main class export
export { TimMind } from './tim-mind.js';

// Types
export type {
  SourceQuality,
  DuplicateGroup,
  CoverageResult,
  TopicCoverage,
  CoverageGap,
  TemporalDistribution,
  TimePeriod,
  FormatDiversity,
  TimMindOptions,
  TimAnalysisResult,
} from './types.js';

// Constants
export {
  DEFAULT_TIM_OPTIONS,
  calculateWeightedScore,
  meetsQualityThreshold,
  getWordCount,
  calculateAgeInDays,
} from './types.js';

// Prompts
export {
  TIM_SYSTEM_PROMPT,
  SOURCE_QUALITY_PROMPT,
  DUPLICATE_DETECTION_PROMPT,
  COVERAGE_ANALYSIS_PROMPT,
  RECOMMENDATIONS_PROMPT,
  getFullAnalysisPrompt,
  formatDataForPrompt,
  buildAnalysisPrompt,
} from './prompts.js';

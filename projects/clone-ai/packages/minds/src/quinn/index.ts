/**
 * @fileoverview Quinn Mind - Quality Assurance Module
 * @description Exports for the Quinn quality validation Mind
 * @module @clone-lab/minds/quinn
 */

// Main class export
export { QuinnMind } from './quinn-mind.js';

// Type exports
export type {
  QualityHeuristic,
  QualityCategory,
  ValidationRule,
  ValidationRuleResult,
  ConsistencyCheck,
  ConsistencyType,
  ConsistencyCheckResult,
  InconsistencyDetail,
  CoverageGap,
  GapCategory,
  QualityIssue,
  QualityIssueType,
  RedFlag,
  RedFlagType,
  QualityReport,
  QualityBreakdown,
  QualityReportMetadata,
  QuinnOptions,
} from './types.js';

// Constant exports
export {
  DEFAULT_QUALITY_THRESHOLDS,
  STANDARD_QUALITY_HEURISTICS,
} from './types.js';

// Prompt exports
export {
  QUINN_SYSTEM_PROMPT,
  QUALITY_VALIDATION_PROMPT,
  CONSISTENCY_CHECK_PROMPT,
  GAP_IDENTIFICATION_PROMPT,
  RED_FLAG_DETECTION_PROMPT,
  QUALITY_REPORT_PROMPT,
  TRAIT_VALIDATION_TEMPLATE,
  EVIDENCE_QUALITY_TEMPLATE,
  CONFIDENCE_CALIBRATION_TEMPLATE,
  buildQualityValidationPrompt,
  buildConsistencyCheckPrompt,
  buildGapIdentificationPrompt,
  buildRedFlagDetectionPrompt,
  buildQualityReportPrompt,
} from './prompts.js';

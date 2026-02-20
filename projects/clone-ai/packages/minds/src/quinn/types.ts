/**
 * @fileoverview Types for Quinn Mind - Quality Assurance
 * @description Quality validation, consistency checking, and gap identification types
 * @module @clone-lab/minds/quinn
 */

import type { MindId, Evidence } from '../base/index.js';

/**
 * Quality heuristic rule for validation
 */
export interface QualityHeuristic {
  /** Unique identifier for this heuristic */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this heuristic checks */
  description: string;
  /** Category of the heuristic */
  category: QualityCategory;
  /** Weight of this heuristic in overall score (0-1) */
  weight: number;
  /** Minimum threshold for passing (0-100) */
  threshold: number;
  /** Whether this heuristic is required for overall pass */
  required: boolean;
}

/**
 * Categories for quality heuristics
 */
export type QualityCategory =
  | 'completeness'
  | 'consistency'
  | 'evidence-quality'
  | 'confidence-calibration'
  | 'coverage';

/**
 * Validation rule with conditions
 */
export interface ValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Condition expression or function name */
  condition: string;
  /** Expected outcome */
  expectedOutcome: 'pass' | 'fail' | 'warning';
  /** Severity if rule fails */
  severity: 'error' | 'warning' | 'info';
  /** Related mind IDs this rule applies to */
  appliesTo: MindId[];
}

/**
 * Result of applying a validation rule
 */
export interface ValidationRuleResult {
  /** Rule that was evaluated */
  rule: ValidationRule;
  /** Whether the rule passed */
  passed: boolean;
  /** Actual outcome */
  actualOutcome: 'pass' | 'fail' | 'warning';
  /** Message explaining the result */
  message: string;
  /** Related evidence if any */
  evidence?: Evidence[];
}

/**
 * Consistency check between minds
 */
export interface ConsistencyCheck {
  /** Check identifier */
  id: string;
  /** Name of the consistency check */
  name: string;
  /** Mind IDs being compared */
  mindIds: MindId[];
  /** Type of consistency being checked */
  type: ConsistencyType;
  /** Tolerance for differences (0-1) */
  tolerance: number;
}

/**
 * Types of consistency checks
 */
export type ConsistencyType =
  | 'trait-alignment'
  | 'confidence-correlation'
  | 'evidence-overlap'
  | 'value-agreement';

/**
 * Result of a consistency check
 */
export interface ConsistencyCheckResult {
  /** The check that was performed */
  check: ConsistencyCheck;
  /** Whether the check passed */
  passed: boolean;
  /** Consistency score (0-1) */
  score: number;
  /** Details about any inconsistencies found */
  inconsistencies: InconsistencyDetail[];
}

/**
 * Detail about a specific inconsistency
 */
export interface InconsistencyDetail {
  /** Description of the inconsistency */
  description: string;
  /** Mind IDs involved */
  involvedMinds: MindId[];
  /** Trait or value that is inconsistent */
  item: string;
  /** Values from each mind */
  values: Record<MindId, unknown>;
  /** Severity of the inconsistency */
  severity: 'high' | 'medium' | 'low';
}

/**
 * Coverage gap identified by Quinn
 */
export interface CoverageGap {
  /** Gap identifier */
  id: string;
  /** Name of the gap area */
  name: string;
  /** Category of the gap */
  category: GapCategory;
  /** Description of what's missing */
  description: string;
  /** Impact of this gap (0-1) */
  impact: number;
  /** Suggested actions to fill the gap */
  suggestions: string[];
  /** Related mind IDs that should have covered this */
  relatedMinds: MindId[];
}

/**
 * Categories of coverage gaps
 */
export type GapCategory =
  | 'missing-traits'
  | 'insufficient-evidence'
  | 'unanalyzed-data'
  | 'low-confidence'
  | 'incomplete-analysis';

/**
 * Quality issue found during validation
 */
export interface QualityIssue {
  /** Issue identifier */
  id: string;
  /** Type of issue */
  type: QualityIssueType;
  /** Severity of the issue */
  severity: 'critical' | 'high' | 'medium' | 'low';
  /** Description of the issue */
  description: string;
  /** Source mind where issue was found */
  sourceMind: MindId;
  /** Affected traits or values */
  affectedItems: string[];
  /** Recommended fix */
  recommendation: string;
}

/**
 * Types of quality issues
 */
export type QualityIssueType =
  | 'missing-evidence'
  | 'low-confidence'
  | 'contradiction'
  | 'insufficient-coverage'
  | 'data-quality'
  | 'validation-failure';

/**
 * Red flag detected during quality analysis
 */
export interface RedFlag {
  /** Flag identifier */
  id: string;
  /** Type of red flag */
  type: RedFlagType;
  /** Description of the concern */
  description: string;
  /** Confidence that this is a genuine issue (0-1) */
  confidence: number;
  /** Related evidence */
  evidence: Evidence[];
  /** Recommended action */
  action: 'investigate' | 'warn' | 'block' | 'ignore';
}

/**
 * Types of red flags
 */
export type RedFlagType =
  | 'contradictory-traits'
  | 'unusual-patterns'
  | 'data-inconsistency'
  | 'confidence-mismatch'
  | 'missing-critical-data'
  | 'suspicious-source';

/**
 * Complete quality report from Quinn
 */
export interface QualityReport {
  /** Overall quality score (0-100) */
  overallScore: number;
  /** Whether the analysis passes quality threshold */
  passed: boolean;
  /** Breakdown by category */
  breakdown: QualityBreakdown;
  /** All quality issues found */
  issues: QualityIssue[];
  /** All coverage gaps identified */
  gaps: CoverageGap[];
  /** Consistency check results */
  consistencyResults: ConsistencyCheckResult[];
  /** Red flags detected */
  redFlags: RedFlag[];
  /** Recommendations for improvement */
  recommendations: string[];
  /** Metadata about the report */
  metadata: QualityReportMetadata;
}

/**
 * Breakdown of quality scores by category
 */
export interface QualityBreakdown {
  /** Completeness score (0-100) */
  completeness: number;
  /** Consistency score (0-100) */
  consistency: number;
  /** Evidence quality score (0-100) */
  evidenceQuality: number;
  /** Confidence calibration score (0-100) */
  confidenceCalibration: number;
  /** Coverage score (0-100) */
  coverage: number;
}

/**
 * Metadata for quality report
 */
export interface QualityReportMetadata {
  /** When the report was generated */
  timestamp: Date;
  /** Version of Quinn that generated the report */
  quinnVersion: string;
  /** Number of minds analyzed */
  mindsAnalyzed: number;
  /** Time taken to generate report in ms */
  processingTimeMs: number;
}

/**
 * Configuration options for Quinn Mind
 */
export interface QuinnOptions {
  /** Minimum overall quality score to pass (0-100) */
  minimumOverallScore: number;
  /** Minimum evidence per trait */
  minimumEvidencePerTrait: number;
  /** Maximum allowed inconsistencies */
  maximumInconsistencies: number;
  /** Minimum coverage percentage (0-100) */
  minimumCoveragePercentage: number;
  /** Whether to fail on critical issues */
  failOnCritical: boolean;
  /** Custom quality heuristics to apply */
  customHeuristics?: QualityHeuristic[];
  /** Custom validation rules to apply */
  customRules?: ValidationRule[];
}

/**
 * Default quality thresholds
 */
export const DEFAULT_QUALITY_THRESHOLDS: QuinnOptions = {
  minimumOverallScore: 70,
  minimumEvidencePerTrait: 2,
  maximumInconsistencies: 3,
  minimumCoveragePercentage: 80,
  failOnCritical: true,
};

/**
 * Standard quality heuristics used by Quinn
 */
export const STANDARD_QUALITY_HEURISTICS: QualityHeuristic[] = [
  {
    id: 'qh-001',
    name: 'Trait Evidence Coverage',
    description: 'Each trait should have at least 2 supporting evidence items',
    category: 'evidence-quality',
    weight: 0.25,
    threshold: 80,
    required: true,
  },
  {
    id: 'qh-002',
    name: 'Cross-Mind Consistency',
    description: 'Analysis from different minds should be consistent',
    category: 'consistency',
    weight: 0.25,
    threshold: 75,
    required: true,
  },
  {
    id: 'qh-003',
    name: 'Trait Coverage Completeness',
    description: 'All major trait categories should be covered',
    category: 'completeness',
    weight: 0.20,
    threshold: 80,
    required: true,
  },
  {
    id: 'qh-004',
    name: 'Confidence Calibration',
    description: 'Confidence scores should correlate with evidence strength',
    category: 'confidence-calibration',
    weight: 0.15,
    threshold: 70,
    required: false,
  },
  {
    id: 'qh-005',
    name: 'Data Utilization',
    description: 'Majority of extracted data should be utilized in analysis',
    category: 'coverage',
    weight: 0.15,
    threshold: 70,
    required: false,
  },
];

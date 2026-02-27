/**
 * @fileoverview Type definitions for Constantin Mind
 * @description Implementation-focused types for analyzing how things get done
 * @module @clone-lab/minds/constantin
 */

/**
 * Categorization of implementation approaches
 */
export type ImplementationCategory =
  | 'iterative'
  | 'incremental'
  | 'test-driven'
  | 'prototype-first'
  | 'documentation-driven'
  | 'specification-driven'
  | 'exploratory'
  | 'structured';

/**
 * Represents a detected implementation pattern
 */
export interface ImplementationPattern {
  /** Pattern identifier */
  id: string;
  /** Category of this pattern */
  category: ImplementationCategory;
  /** Human-readable name of the pattern */
  name: string;
  /** Description of how this pattern manifests */
  description: string;
  /** Confidence score for this detection (0-1) */
  confidence: number;
  /** Source IDs that support this pattern */
  sources: string[];
  /** Examples of this pattern in action */
  examples: string[];
  /** Frequency of this pattern (how often it appears) */
  frequency: number;
}

/**
 * Technical preference type categories
 */
export type TechnicalPreferenceType =
  | 'language'
  | 'framework'
  | 'tool'
  | 'methodology'
  | 'paradigm'
  | 'architecture'
  | 'testing'
  | 'deployment';

/**
 * Represents a technical preference or choice
 */
export interface TechnicalPreference {
  /** Preference identifier */
  id: string;
  /** Type of technical preference */
  type: TechnicalPreferenceType;
  /** Name of the technology or approach */
  name: string;
  /** How strongly this preference is held (0-1) */
  strength: number;
  /** Context where this preference applies */
  context: string;
  /** Evidence supporting this preference */
  evidence: string[];
  /** Related preferences that influence this one */
  relatedTo: string[];
  /** Whether this is an explicit or inferred preference */
  explicit: boolean;
}

/**
 * Categories for tool choices
 */
export type ToolChoiceCategory =
  | 'editor'
  | 'version-control'
  | 'build'
  | 'testing'
  | 'deployment'
  | 'monitoring'
  | 'communication'
  | 'documentation'
  | 'automation'
  | 'other';

/**
 * Represents a tool choice or preference
 */
export interface ToolChoice {
  /** Tool choice identifier */
  id: string;
  /** Category of this tool */
  category: ToolChoiceCategory;
  /** Name of the tool */
  name: string;
  /** How the tool is used */
  usage: string;
  /** Confidence in this preference (0-1) */
  confidence: number;
  /** When this tool is preferred */
  whenUsed: string;
  /** Alternative tools considered */
  alternatives: string[];
}

/**
 * Problem-solving methodology types
 */
export type ProblemSolvingMethod =
  | 'analytical'
  | 'intuitive'
  | 'systematic'
  | 'creative'
  | 'collaborative'
  | 'research-oriented'
  | 'experimentation-driven';

/**
 * Represents problem-solving approach analysis
 */
export interface ProblemSolvingApproach {
  /** Primary method used */
  primaryMethod: ProblemSolvingMethod;
  /** Secondary methods observed */
  secondaryMethods: ProblemSolvingMethod[];
  /** Description of the approach */
  description: string;
  /** Confidence in this analysis (0-1) */
  confidence: number;
  /** Supporting evidence */
  evidence: string[];
}

/**
 * Execution style characteristics
 */
export type ExecutionStyleTrait =
  | 'thorough'
  | 'fast-paced'
  | 'methodical'
  | 'iterative'
  | 'perfectionist'
  | 'pragmatic'
  | 'experimental';

/**
 * Represents execution style analysis
 */
export interface ExecutionStyle {
  /** Dominant execution traits */
  dominantTraits: ExecutionStyleTrait[];
  /** Description of execution style */
  description: string;
  /** Speed preference (1-5 scale: 1=slow/careful, 5=fast/rapid) */
  speedPreference: number;
  /** Quality vs speed balance (0-1: 0=speed, 1=quality) */
  qualityVsSpeed: number;
  /** Risk tolerance (0-1: 0=risk-averse, 1=risk-embracing) */
  riskTolerance: number;
  /** Confidence in this analysis (0-1) */
  confidence: number;
}

/**
 * Resource allocation pattern types
 */
export type ResourceAllocationPattern =
  | 'time-boxed'
  | 'effort-driven'
  | 'outcome-focused'
  | 'balanced'
  | 'prioritized';

/**
 * Represents resource allocation analysis
 */
export interface ResourceAllocation {
  /** Primary allocation pattern */
  pattern: ResourceAllocationPattern;
  /** Time management style description */
  timeManagement: string;
  /** Effort distribution preferences */
  effortDistribution: string;
  /** Priority handling approach */
  priorityHandling: string;
  /** Confidence in this analysis (0-1) */
  confidence: number;
}

/**
 * Complete result from Constantin Mind analysis
 */
export interface ConstantinAnalysisResult {
  /** Detected implementation patterns */
  implementationPatterns: ImplementationPattern[];
  /** Technical preferences identified */
  technicalPreferences: TechnicalPreference[];
  /** Tool choices detected */
  toolChoices: ToolChoice[];
  /** Problem-solving approach */
  problemSolving: ProblemSolvingApproach;
  /** Execution style analysis */
  executionStyle: ExecutionStyle;
  /** Resource allocation patterns */
  resourceAllocation: ResourceAllocation;
  /** Overall implementation profile summary */
  profileSummary: string;
  /** Overall confidence in the analysis (0-1) */
  overallConfidence: number;
}

/**
 * Configuration options specific to Constantin Mind
 */
export interface ConstantinMindOptions {
  /** Minimum confidence threshold for patterns */
  patternConfidenceThreshold?: number;
  /** Whether to include inferred preferences */
  includeInferred?: boolean;
  /** Maximum patterns to extract per category */
  maxPatternsPerCategory?: number;
  /** Whether to analyze tool alternatives */
  analyzeAlternatives?: boolean;
}

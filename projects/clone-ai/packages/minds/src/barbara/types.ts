/**
 * @fileoverview Type definitions for Barbara Mind - Cognitive Architecture Analysis
 * @description Types for cognitive patterns, thinking styles, and mental models
 * @module @clone-lab/minds/barbara
 */

/**
 * MBTI (Myers-Briggs Type Indicator) profile dimensions
 */
export interface MBTIProfile {
  /** Extraversion vs Introversion (0-100, higher = more extraverted) */
  ei: number;
  /** Sensing vs Intuition (0-100, higher = more intuitive) */
  sn: number;
  /** Thinking vs Feeling (0-100, higher = more thinking) */
  tf: number;
  /** Judging vs Perceiving (0-100, higher = more judging) */
  jp: number;
  /** Inferred MBTI type code (e.g., 'INTJ', 'ENFP') */
  inferredType: string;
  /** Confidence in the inference (0-1) */
  confidence: number;
}

/**
 * Big Five personality traits (OCEAN model)
 */
export interface BigFiveTraits {
  /** Openness to experience (0-100) */
  openness: BigFiveTraitDetail;
  /** Conscientiousness (0-100) */
  conscientiousness: BigFiveTraitDetail;
  /** Extraversion (0-100) */
  extraversion: BigFiveTraitDetail;
  /** Agreeableness (0-100) */
  agreeableness: BigFiveTraitDetail;
  /** Neuroticism (0-100) */
  neuroticism: BigFiveTraitDetail;
}

/**
 * Detailed Big Five trait with facets
 */
export interface BigFiveTraitDetail {
  /** Overall trait score (0-100) */
  score: number;
  /** Level classification */
  level: 'low' | 'moderate' | 'high';
  /** Sub-facets of the trait */
  facets?: Record<string, number>;
  /** Evidence supporting this assessment */
  evidence?: string[];
}

/**
 * Thinking style classification
 */
export type ThinkingStyleType =
  | 'analytical'
  | 'intuitive'
  | 'creative'
  | 'practical'
  | 'balanced';

/**
 * Thinking style analysis result
 */
export interface ThinkingStyle {
  /** Primary thinking style */
  primary: ThinkingStyleType;
  /** Secondary thinking style (if applicable) */
  secondary?: ThinkingStyleType;
  /** Score for each style dimension (0-100) */
  scores: Record<ThinkingStyleType, number>;
  /** Confidence in the assessment (0-1) */
  confidence: number;
  /** Evidence from source data */
  evidence: string[];
}

/**
 * Learning preference modalities
 */
export type LearningModality =
  | 'visual'
  | 'auditory'
  | 'kinesthetic'
  | 'reading-writing'
  | 'social'
  | 'solitary';

/**
 * Learning preference analysis result
 */
export interface LearningPreference {
  /** Primary learning modality */
  primary: LearningModality;
  /** Secondary learning modality */
  secondary?: LearningModality;
  /** Score for each modality (0-100) */
  scores: Record<LearningModality, number>;
  /** Confidence in the assessment (0-1) */
  confidence: number;
  /** Evidence from source data */
  evidence: string[];
}

/**
 * Mental model category
 */
export type MentalModelCategory =
  | 'systems-thinking'
  | 'first-principles'
  | 'probabilistic'
  | 'causal'
  | 'analogical'
  | 'spatial'
  | 'temporal'
  | 'narrative'
  | 'hierarchical'
  | 'network';

/**
 * A mental model used by the subject
 */
export interface MentalModel {
  /** Name of the mental model */
  name: string;
  /** Category of the mental model */
  category: MentalModelCategory;
  /** Frequency of use in analyzed content (0-100) */
  frequency: number;
  /** How explicitly the model is expressed (0-1) */
  explicitness: number;
  /** Evidence from source data */
  evidence: string[];
  /** Related concepts or terms */
  relatedTerms?: string[];
}

/**
 * Cognitive architecture type
 */
export type CognitiveArchitectureType =
  | 'sequential-logical'
  | 'spatial-visual'
  | 'verbal-linguistic'
  | 'intuitive-holistic'
  | 'mixed-balanced';

/**
 * Cognitive architecture analysis result
 */
export interface CognitiveArchitecture {
  /** Primary architecture type */
  type: CognitiveArchitectureType;
  /** Architecture description */
  description: string;
  /** Characteristics identified */
  characteristics: string[];
  /** Score for each architecture type (0-100) */
  typeScores: Record<CognitiveArchitectureType, number>;
  /** Confidence in the assessment (0-1) */
  confidence: number;
}

/**
 * Spatial thinking pattern indicators
 */
export interface SpatialPatterns {
  /** Use of spatial metaphors (0-100) */
  spatialMetaphorUsage: number;
  /** Visual representation preference (0-100) */
  visualRepresentation: number;
  /** Spatial reasoning examples */
  examples: string[];
  /** Spatial reasoning score (0-100) */
  score: number;
  /** Confidence in the assessment (0-1) */
  confidence: number;
}

/**
 * Information processing pattern
 */
export type ProcessingPattern =
  | 'top-down'
  | 'bottom-up'
  | 'lateral'
  | 'iterative'
  | 'parallel';

/**
 * Complete cognitive profile produced by Barbara Mind
 */
export interface CognitiveProfile {
  /** MBTI profile inference */
  mbti: MBTIProfile;
  /** Big Five traits assessment */
  bigFive: BigFiveTraits;
  /** Thinking style analysis */
  thinkingStyle: ThinkingStyle;
  /** Learning preference analysis */
  learningPreference: LearningPreference;
  /** Mental models identified */
  mentalModels: MentalModel[];
  /** Cognitive architecture analysis */
  architecture: CognitiveArchitecture;
  /** Spatial thinking patterns */
  spatialPatterns: SpatialPatterns;
  /** Information processing pattern */
  processingPattern: ProcessingPattern;
  /** Overall cognitive profile confidence */
  confidence: number;
}

/**
 * Barbara Mind analysis options
 */
export interface BarbaraMindOptions {
  /** Include MBTI analysis */
  includeMBTI?: boolean;
  /** Include Big Five analysis */
  includeBigFive?: boolean;
  /** Include thinking style analysis */
  includeThinkingStyle?: boolean;
  /** Include learning preference analysis */
  includeLearningPreference?: boolean;
  /** Include mental model mapping */
  includeMentalModels?: boolean;
  /** Minimum confidence threshold for results */
  confidenceThreshold?: number;
  /** Maximum number of mental models to return */
  maxMentalModels?: number;
}

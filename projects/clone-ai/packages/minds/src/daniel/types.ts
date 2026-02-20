/**
 * @fileoverview Type definitions for Daniel Mind - Behavioral Patterns Analysis
 * @description Types for Big Five personality, cognitive biases, and decision-making patterns
 * @module @clone-lab/minds/daniel
 */

/**
 * Big Five Personality Traits (OCEAN model)
 * Each trait is scored from 0-100
 */
export interface BigFiveTraits {
  /** Openness to experience - curiosity, creativity, preference for variety */
  openness: number;
  /** Conscientiousness - organization, dependability, self-discipline */
  conscientiousness: number;
  /** Extraversion - sociability, assertiveness, positive emotions */
  extraversion: number;
  /** Agreeableness - cooperation, trust, helpfulness */
  agreeableness: number;
  /** Neuroticism - emotional instability, anxiety, moodiness */
  neuroticism: number;
}

/**
 * Facets of each Big Five trait for more granular analysis
 */
export interface BigFiveFacets {
  openness: {
    imagination: number;
    artistic: number;
    emotionality: number;
    adventurousness: number;
    intellect: number;
    liberalism: number;
  };
  conscientiousness: {
    selfEfficacy: number;
    orderliness: number;
    dutifulness: number;
    achievementStriving: number;
    selfDiscipline: number;
    cautiousness: number;
  };
  extraversion: {
    friendliness: number;
    gregariousness: number;
    assertiveness: number;
    activityLevel: number;
    excitementSeeking: number;
    cheerfulness: number;
  };
  agreeableness: {
    trust: number;
    morality: number;
    altruism: number;
    cooperation: number;
    modesty: number;
    sympathy: number;
  };
  neuroticism: {
    anxiety: number;
    anger: number;
    depression: number;
    selfConsciousness: number;
    immoderation: number;
    vulnerability: number;
  };
}

/**
 * Known cognitive biases that can be detected in behavior
 */
export type CognitiveBiasType =
  | 'confirmation-bias'
  | 'anchoring'
  | 'availability-heuristic'
  | 'dunning-kruger'
  | 'sunk-cost-fallacy'
  | 'loss-aversion'
  | 'framing-effect'
  | 'hindsight-bias'
  | 'optimism-bias'
  | 'pessimism-bias'
  | 'status-quo-bias'
  | 'bandwagon-effect'
  | 'authority-bias'
  | 'halo-effect'
  | 'attribution-error'
  | 'projection-bias'
  | 'recency-bias'
  | 'gambler-fallacy'
  | 'negativity-bias'
  | 'in-group-bias';

/**
 * A detected cognitive bias with evidence
 */
export interface CognitiveBias {
  /** Type of cognitive bias */
  type: CognitiveBiasType;
  /** Display name of the bias */
  name: string;
  /** Brief description of this bias */
  description: string;
  /** Strength of the bias tendency (0-1) */
  strength: number;
  /** Confidence in this detection (0-1) */
  confidence: number;
  /** Source IDs supporting this detection */
  sources: string[];
  /** Examples of this bias in behavior */
  examples: string[];
}

/**
 * Decision-making style classification
 */
export type DecisionStyle =
  | 'analytical'
  | 'intuitive'
  | 'dependent'
  | 'spontaneous'
  | 'avoidant';

/**
 * Risk tolerance classification
 */
export type RiskTolerance = 'risk-averse' | 'risk-neutral' | 'risk-seeking';

/**
 * Time preference for decisions
 */
export type TimePreference = 'present-biased' | 'balanced' | 'future-oriented';

/**
 * Decision-making patterns analysis
 */
export interface DecisionPatterns {
  /** Primary decision-making style */
  primaryStyle: DecisionStyle;
  /** Secondary style if mixed */
  secondaryStyle?: DecisionStyle;
  /** Overall risk tolerance */
  riskTolerance: RiskTolerance;
  /** Time orientation for decisions */
  timePreference: TimePreference;
  /** Average deliberation time tendency (quick vs thorough) */
  deliberationStyle: 'impulsive' | 'quick' | 'moderate' | 'thorough' | 'exhaustive';
  /** Tendency to seek information before deciding (0-1) */
  informationSeeking: number;
  /** Tendency to consult others before deciding (0-1) */
  socialValidation: number;
  /** Flexibility in changing decisions (0-1) */
  adaptability: number;
  /** Confidence in decision-making (0-1) */
  decisionConfidence: number;
}

/**
 * Behavioral triggers that influence responses
 */
export interface BehavioralTrigger {
  /** Trigger category */
  category: 'emotional' | 'social' | 'environmental' | 'cognitive' | 'temporal';
  /** Trigger name */
  name: string;
  /** Typical response pattern */
  responsePattern: string;
  /** Strength of trigger influence (0-1) */
  strength: number;
  /** Source evidence */
  sources: string[];
}

/**
 * Response pattern to specific situations
 */
export interface ResponsePattern {
  /** Situation type */
  situation: string;
  /** Typical response */
  response: string;
  /** Frequency of this pattern (0-1) */
  frequency: number;
  /** Source evidence */
  sources: string[];
}

/**
 * Complete behavioral profile output from Daniel Mind
 */
export interface BehavioralProfile {
  /** Big Five personality traits */
  bigFive: BigFiveTraits;
  /** Detailed facets (optional, for deeper analysis) */
  bigFiveFacets?: BigFiveFacets;
  /** Detected cognitive biases */
  cognitiveBiases: CognitiveBias[];
  /** Decision-making patterns */
  decisionPatterns: DecisionPatterns;
  /** Behavioral triggers */
  triggers: BehavioralTrigger[];
  /** Response patterns */
  responsePatterns: ResponsePattern[];
  /** Overall profile confidence (0-1) */
  confidence: number;
  /** Summary of behavioral tendencies */
  summary: string;
}

/**
 * Options specific to Daniel Mind analysis
 */
export interface DanielMindOptions {
  /** Include detailed Big Five facets */
  includeFacets?: boolean;
  /** Minimum confidence threshold for bias detection */
  biasConfidenceThreshold?: number;
  /** Maximum number of biases to report */
  maxBiases?: number;
  /** Include behavioral triggers analysis */
  analyzeTriggers?: boolean;
  /** Include response patterns analysis */
  analyzeResponses?: boolean;
}

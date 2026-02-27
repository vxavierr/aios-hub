/**
 * @fileoverview Type definitions for Brene Mind - Values & Beliefs Analysis
 * @description Types for core values identification, belief systems, and vulnerability patterns
 * @module @clone-lab/minds/brene
 */

/**
 * Importance level of a core value
 */
export type ValueImportance = 'foundational' | 'core' | 'important' | 'situational';

/**
 * Category classification for values
 */
export type ValueCategory =
  | 'ethical'
  | 'relational'
  | 'personal-growth'
  | 'achievement'
  | 'security'
  | 'autonomy'
  | 'creativity'
  | 'spiritual'
  | 'community'
  | 'lifestyle';

/**
 * Represents a core value identified in the analysis
 */
export interface CoreValue {
  /** Unique identifier for this value */
  id: string;
  /** Name of the value (e.g., "Integrity", "Family") */
  name: string;
  /** Category of the value */
  category: ValueCategory;
  /** Importance level of this value */
  importance: ValueImportance;
  /** Description of how this value manifests */
  description: string;
  /** Behavioral indicators of this value */
  behaviors: string[];
  /** Situations where this value is most prominent */
  contexts: string[];
  /** Potential conflicts with other values */
  conflicts?: string[];
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this value */
  sources: string[];
}

/**
 * Type of belief system
 */
export type BeliefType =
  | 'worldview'
  | 'self-perception'
  | 'other-perception'
  | 'causal'
  | 'normative'
  | 'existential';

/**
 * Strength of conviction in a belief
 */
export type BeliefStrength = 'rigid' | 'strong' | 'moderate' | 'flexible' | 'exploratory';

/**
 * Represents a belief held by the individual
 */
export interface Belief {
  /** Unique identifier for this belief */
  id: string;
  /** The belief statement */
  statement: string;
  /** Type of belief */
  type: BeliefType;
  /** Strength of conviction */
  strength: BeliefStrength;
  /** Origin of this belief (upbringing, experience, etc.) */
  origin?: string;
  /** Evidence the person cites for this belief */
  supportingEvidence?: string[];
  /** Situations where this belief is challenged */
  challenges?: string[];
  /** Whether this belief is constructive or limiting */
  constructive: boolean;
  /** Impact on behavior (description) */
  behavioralImpact?: string;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this belief identification */
  sources: string[];
}

/**
 * Represents a non-negotiable boundary or principle
 */
export interface NonNegotiable {
  /** Unique identifier */
  id: string;
  /** Name/title of the non-negotiable */
  name: string;
  /** Description of what this means in practice */
  description: string;
  /** Category (ethical, practical, relational) */
  category: 'ethical' | 'practical' | 'relational' | 'personal';
  /** Behaviors that would violate this */
  violations: string[];
  /** Flexibility level (0 = absolute, 1 = somewhat flexible) */
  flexibility: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence */
  sources: string[];
}

/**
 * Vulnerability response styles
 */
export type VulnerabilityResponse =
  | 'avoidance'
  | 'intellectualization'
  | 'deflection'
  | 'numbing'
  | 'anger'
  | 'embrace'
  | 'selective-sharing';

/**
 * Represents a vulnerability pattern
 */
export interface VulnerabilityPattern {
  /** Unique identifier */
  id: string;
  /** Name/description of the pattern */
  name: string;
  /** Description of how vulnerability is experienced */
  description: string;
  /** Triggers that activate this vulnerability */
  triggers: string[];
  /** Typical response to this vulnerability */
  response: VulnerabilityResponse;
  /** Emotional states associated with this vulnerability */
  emotionalStates: string[];
  /** Physical sensations or manifestations */
  physicalManifestations?: string[];
  /** Coping mechanisms used */
  copingMechanisms: string[];
  /** How this vulnerability affects relationships */
  relationshipImpact?: string;
  /** Areas of growth identified */
  growthAreas?: string[];
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence */
  sources: string[];
}

/**
 * Types of emotional triggers
 */
export type TriggerCategory =
  | 'rejection'
  | 'failure'
  | 'criticism'
  | 'loss'
  | 'uncertainty'
  | 'injustice'
  | 'betrayal'
  | 'inadequacy'
  | 'success'
  | 'intimacy';

/**
 * Represents an emotional trigger
 */
export interface EmotionalTrigger {
  /** Unique identifier */
  id: string;
  /** Name of the trigger */
  name: string;
  /** Category of trigger */
  category: TriggerCategory;
  /** Description of the trigger */
  description: string;
  /** Typical emotional response */
  emotionalResponse: string[];
  /** Behavioral response */
  behavioralResponse: string[];
  /** Intensity of response (0-1) */
  intensity: number;
  /** Recovery time tendency */
  recoveryPattern: 'quick' | 'moderate' | 'prolonged';
  /** Related underlying fears */
  underlyingFears: string[];
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence */
  sources: string[];
}

/**
 * Authenticity assessment dimensions
 */
export interface AuthenticityMarkers {
  /** Consistency between stated values and behavior (0-1) */
  valueBehaviorAlignment: number;
  /** Comfort with expressing true self (0-1) */
  selfExpressionComfort: number;
  /** Willingness to be vulnerable (0-1) */
  vulnerabilityWillingness: number;
  /** Tendency toward people-pleasing vs. authenticity (0-1, higher = more authentic) */
  authenticityOverApproval: number;
  /** Comfort with imperfection (0-1) */
  imperfectionAcceptance: number;
  /** Overall authenticity score (0-1) */
  overallScore: number;
  /** Evidence of authentic moments */
  authenticMoments: string[];
  /** Areas where authenticity is challenged */
  authenticityChallenges: string[];
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence */
  sources: string[];
}

/**
 * Shame response patterns
 */
export type ShameResponse =
  | 'withdrawal'
  | 'attack-self'
  | 'attack-other'
  | 'denial'
  | 'processing'
  | 'resilience';

/**
 * Represents shame resilience assessment
 */
export interface ShameResilience {
  /** Recognition of shame when it occurs (0-1) */
  shameAwareness: number;
  /** Primary shame response pattern */
  primaryResponse: ShameResponse;
  /** Secondary shame responses */
  secondaryResponses: ShameResponse[];
  /** Shame triggers specific to this individual */
  shameTriggers: string[];
  /** Strategies used to build resilience */
  resilienceStrategies: string[];
  /** Areas where shame is most triggered */
  vulnerableDomains: string[];
  /** Support systems for shame resilience */
  supportSystems: string[];
  /** Overall shame resilience score (0-1) */
  resilienceScore: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence */
  sources: string[];
}

/**
 * Brene Mind analysis result extending the base MindResult
 */
export interface BreneResult {
  /** Identified core values */
  coreValues: CoreValue[];
  /** Identified beliefs */
  beliefs: Belief[];
  /** Non-negotiable boundaries */
  nonNegotiables: NonNegotiable[];
  /** Vulnerability patterns */
  vulnerabilityPatterns: VulnerabilityPattern[];
  /** Emotional triggers */
  emotionalTriggers: EmotionalTrigger[];
  /** Authenticity assessment */
  authenticity: AuthenticityMarkers;
  /** Shame resilience assessment */
  shameResilience: ShameResilience;
  /** Key insights from the analysis */
  insights: string[];
  /** Recommendations for growth */
  growthRecommendations: string[];
  /** Overall confidence in the analysis (0-1) */
  confidence: number;
}

/**
 * Options specific to Brene Mind analysis
 */
export interface BreneOptions {
  /** Minimum confidence threshold for including results */
  confidenceThreshold?: number;
  /** Whether to include detailed vulnerability analysis */
  analyzeVulnerabilityPatterns?: boolean;
  /** Whether to analyze shame resilience */
  analyzeShameResilience?: boolean;
  /** Whether to identify non-negotiables */
  identifyNonNegotiables?: boolean;
  /** Custom value categories to focus on */
  focusCategories?: ValueCategory[];
  /** Maximum number of core values to identify */
  maxCoreValues?: number;
}

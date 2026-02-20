/**
 * @fileoverview Type definitions for Victoria Mind - Feasibility Analysis
 * @description Types for trade-off analysis, constraint identification, and feasibility scoring
 * @module @clone-lab/minds/victoria
 */

/**
 * Represents a trade-off in decision-making scenarios
 */
export interface TradeOff {
  /** Unique identifier for this trade-off */
  id: string;
  /** Name of the trade-off (e.g., "Speed vs Quality") */
  name: string;
  /** Description of what is being traded off */
  description: string;
  /** The two competing factors */
  factors: {
    /** First factor in the trade-off */
    primary: TradeOffFactor;
    /** Second factor in the trade-off */
    secondary: TradeOffFactor;
  };
  /** Preferred balance point (0 = fully primary, 1 = fully secondary) */
  preference: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this trade-off */
  sources: string[];
}

/**
 * A single factor in a trade-off
 */
export interface TradeOffFactor {
  /** Name of the factor */
  name: string;
  /** Description of what this factor represents */
  description: string;
  /** Weight/importance of this factor (0-1) */
  weight: number;
}

/**
 * Types of constraints that may affect feasibility
 */
export type ConstraintType =
  | 'time'
  | 'resource'
  | 'skill'
  | 'budget'
  | 'technical'
  | 'regulatory'
  | 'social'
  | 'environmental';

/**
 * Severity level of a constraint
 */
export type ConstraintSeverity = 'hard' | 'soft' | 'flexible';

/**
 * Represents a constraint that limits options or decisions
 */
export interface Constraint {
  /** Unique identifier for this constraint */
  id: string;
  /** Name of the constraint */
  name: string;
  /** Type of constraint */
  type: ConstraintType;
  /** Severity: hard (non-negotiable), soft (can be bent), flexible (negotiable) */
  severity: ConstraintSeverity;
  /** Description of the constraint */
  description: string;
  /** Current value/limit of the constraint */
  value: string | number | boolean;
  /** Unit of measurement if applicable */
  unit?: string;
  /** Whether this constraint can be modified */
  negotiable: boolean;
  /** Impact on feasibility if constraint is violated (0-1) */
  impact: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this constraint */
  sources: string[];
}

/**
 * Risk categories for assessment
 */
export type RiskCategory =
  | 'technical'
  | 'operational'
  | 'financial'
  | 'strategic'
  | 'compliance'
  | 'reputational';

/**
 * Risk probability levels
 */
export type RiskProbability = 'low' | 'medium' | 'high' | 'certain';

/**
 * Risk impact levels
 */
export type RiskImpact = 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';

/**
 * Represents a risk identified during feasibility analysis
 */
export interface Risk {
  /** Unique identifier for this risk */
  id: string;
  /** Name/description of the risk */
  name: string;
  /** Category of risk */
  category: RiskCategory;
  /** Probability of occurrence */
  probability: RiskProbability;
  /** Impact if risk materializes */
  impact: RiskImpact;
  /** Numerical risk score (probability * impact weight) */
  score: number;
  /** Description of potential consequences */
  consequences: string;
  /** Suggested mitigation strategies */
  mitigation?: string;
  /** Whether this risk is acceptable */
  acceptable: boolean;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this risk assessment */
  sources: string[];
}

/**
 * Decision framework preferences
 */
export type DecisionFramework =
  | 'analytical'
  | 'intuitive'
  | 'collaborative'
  | 'hierarchical'
  | 'consensus-based'
  | 'data-driven';

/**
 * Decision-making style characteristics
 */
export interface DecisionStyle {
  /** Preferred decision framework */
  framework: DecisionFramework;
  /** Tendency to seek information before deciding (0-1) */
  informationSeeking: number;
  /** Willingness to take calculated risks (0-1) */
  riskTolerance: number;
  /** Speed of decision-making (0 = deliberate, 1 = rapid) */
  decisionSpeed: number;
  /** Preference for involving others in decisions (0-1) */
  collaborationPreference: number;
  /** Tendency to stick with decisions vs. revisiting (0-1) */
  decisiveness: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this assessment */
  sources: string[];
}

/**
 * Overall feasibility score and breakdown
 */
export interface FeasibilityScore {
  /** Overall feasibility score (0-100) */
  overall: number;
  /** Breakdown by dimension */
  dimensions: {
    /** Technical feasibility (tools, technology, skills) */
    technical: number;
    /** Resource feasibility (budget, people, materials) */
    resource: number;
    /** Time feasibility (deadlines, schedule, availability) */
    time: number;
    /** Risk feasibility (acceptable risk level) */
    risk: number;
    /** Strategic alignment feasibility */
    strategic: number;
  };
  /** Key factors that influenced the score */
  keyFactors: string[];
  /** Confidence in the overall assessment (0-1) */
  confidence: number;
  /** Recommendation based on feasibility */
  recommendation: 'proceed' | 'proceed-with-caution' | 'reconsider' | 'not-feasible';
  /** Rationale for the recommendation */
  rationale: string;
}

/**
 * Victoria Mind analysis result extending the base MindResult
 */
export interface VictoriaResult {
  /** Identified trade-offs */
  tradeOffs: TradeOff[];
  /** Identified constraints */
  constraints: Constraint[];
  /** Risk assessment */
  risks: Risk[];
  /** Decision-making style */
  decisionStyle: DecisionStyle;
  /** Overall feasibility score */
  feasibility: FeasibilityScore;
  /** Key insights from the analysis */
  insights: string[];
  /** Confidence in the overall analysis (0-1) */
  confidence: number;
}

/**
 * Options specific to Victoria Mind analysis
 */
export interface VictoriaOptions {
  /** Minimum confidence threshold for including results */
  confidenceThreshold?: number;
  /** Whether to include detailed risk mitigation strategies */
  includeMitigation?: boolean;
  /** Whether to analyze decision framework preferences */
  analyzeDecisionStyle?: boolean;
  /** Custom weights for feasibility dimensions */
  dimensionWeights?: {
    technical?: number;
    resource?: number;
    time?: number;
    risk?: number;
    strategic?: number;
  };
}

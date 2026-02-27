/**
 * @fileoverview Type definitions for Charlie Mind - Synthesis & Paradoxes
 * @description Types for mental model identification, paradox detection, and wisdom distillation
 * @module @clone-lab/minds/charlie
 */

/**
 * Categories of mental models
 */
export type MentalModelCategory =
  | 'first-principles'
  | 'systems-thinking'
  | 'probability'
  | 'inversion'
  | 'circle-of-competence'
  | 'margin-of-safety'
  | 'opportunity-cost'
  | 'compounding'
  | 'leverage'
  | 'feedback-loops'
  | 'entropy'
  | 'pareto-principle'
  | ' Occam\'s-razor'
  | 'hanlon\'s-razor'
  | 'regression-to-mean'
  | 'confirmation-bias'
  | 'survivorship-bias'
  | 'sunk-cost'
  | 'anchoring'
  | 'availability-heuristic'
  | 'dunning-kruger'
  | 'fundamental-attribution'
  | 'other';

/**
 * Represents a mental model identified in the analysis
 */
export interface MentalModel {
  /** Unique identifier for this mental model */
  id: string;
  /** Name of the mental model */
  name: string;
  /** Category of the mental model */
  category: MentalModelCategory;
  /** Description of the mental model */
  description: string;
  /** How this model is applied by the subject */
  application: string;
  /** Frequency of use (0-1, where 1 is very frequent) */
  frequency: number;
  /** Effectiveness of application (0-1) */
  effectiveness: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this mental model */
  sources: string[];
  /** Related mental models */
  relatedModels?: string[];
}

/**
 * Types of paradoxes that may be detected
 */
export type ParadoxType =
  | 'competing-values'
  | 'internal-contradiction'
  | 'behavior-statement-gap'
  | 'short-long-term'
  | 'individual-collective'
  | 'stability-change'
  | 'control-autonomy'
  | 'efficiency-quality'
  | 'growth-sustainability'
  | 'other';

/**
 * Severity level of a paradox
 */
export type ParadoxSeverity = 'minor' | 'moderate' | 'significant' | 'critical';

/**
 * Resolution status of a paradox
 */
export type ParadoxResolutionStatus =
  | 'unresolved'
  | 'partially-resolved'
  | 'managed'
  | 'transcended'
  | 'unresolvable';

/**
 * Represents a detected paradox in thinking or behavior
 */
export interface Paradox {
  /** Unique identifier for this paradox */
  id: string;
  /** Name/title of the paradox */
  name: string;
  /** Type of paradox */
  type: ParadoxType;
  /** Severity of the paradox */
  severity: ParadoxSeverity;
  /** Description of the paradox */
  description: string;
  /** The two competing elements */
  elements: {
    /** First element in the paradox */
    primary: ParadoxElement;
    /** Second element in the paradox */
    secondary: ParadoxElement;
  };
  /** How the subject currently handles this paradox */
  currentHandling?: string;
  /** Resolution status */
  resolutionStatus: ParadoxResolutionStatus;
  /** Potential approaches to resolve or manage */
  resolutionApproaches?: string[];
  /** Impact on decision-making (0-1) */
  impact: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this paradox detection */
  sources: string[];
}

/**
 * A single element in a paradox
 */
export interface ParadoxElement {
  /** Name of the element */
  name: string;
  /** Description of what this element represents */
  description: string;
  /** How strongly this element is held (0-1) */
  strength: number;
  /** Evidence supporting this element */
  evidence: string[];
}

/**
 * Types of wisdom that can be extracted
 */
export type WisdomType =
  | 'principle'
  | 'heuristic'
  | 'insight'
  | 'aphorism'
  | 'framework'
  | 'mental-model'
  | 'value';

/**
 * Domain of wisdom
 */
export type WisdomDomain =
  | 'decision-making'
  | 'relationships'
  | 'learning'
  | 'work'
  | 'creativity'
  | 'resilience'
  | 'leadership'
  | 'ethics'
  | 'general';

/**
 * Represents an extracted piece of wisdom
 */
export interface Wisdom {
  /** Unique identifier for this wisdom */
  id: string;
  /** The wisdom statement itself */
  statement: string;
  /** Type of wisdom */
  type: WisdomType;
  /** Domain of application */
  domain: WisdomDomain;
  /** Detailed explanation */
  explanation: string;
  /** Practical applications */
  applications: string[];
  /** Underlying mental model (if applicable) */
  underlyingModel?: string;
  /** Origin/source of this wisdom */
  origin?: string;
  /** Universality score (0-1, how broadly applicable) */
  universality: number;
  /** Practicality score (0-1, how actionable) */
  practicality: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this wisdom */
  sources: string[];
}

/**
 * Types of cross-domain connections
 */
export type ConnectionType =
  | 'analogical'
  | 'structural'
  | 'causal'
  | 'temporal'
  | 'hierarchical'
  | 'complementary'
  | 'contradictory';

/**
 * Represents a cross-domain connection
 */
export interface CrossDomainConnection {
  /** Unique identifier for this connection */
  id: string;
  /** Source domain */
  sourceDomain: string;
  /** Target domain */
  targetDomain: string;
  /** Type of connection */
  type: ConnectionType;
  /** Description of the connection */
  description: string;
  /** The underlying pattern or principle */
  underlyingPattern: string;
  /** How this connection is applied */
  application: string;
  /** Strength of the connection (0-1) */
  strength: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
  /** Source evidence supporting this connection */
  sources: string[];
}

/**
 * Synthesis quality indicators
 */
export interface SynthesisQuality {
  /** Coherence of synthesized worldview (0-1) */
  coherence: number;
  /** Depth of integration across dimensions (0-1) */
  integration: number;
  /** Richness of mental model library (0-1) */
  modelRichness: number;
  /** Ability to hold contradictions (0-1) */
  paradoxTolerance: number;
  /** Wisdom extraction capability (0-1) */
  wisdomDepth: number;
  /** Cross-domain thinking ability (0-1) */
  crossDomainAgility: number;
}

/**
 * Result of synthesis analysis
 */
export interface SynthesisResult {
  /** Overall synthesis quality assessment */
  quality: SynthesisQuality;
  /** Dominant thinking patterns identified */
  dominantPatterns: string[];
  /** Key tensions in the worldview */
  keyTensions: string[];
  /** Integration opportunities */
  integrationOpportunities: string[];
  /** Overall coherence score (0-1) */
  coherenceScore: number;
  /** Confidence in this assessment (0-1) */
  confidence: number;
}

/**
 * Charlie Mind analysis result extending the base MindResult
 */
export interface CharlieResult {
  /** Identified mental models */
  mentalModels: MentalModel[];
  /** Detected paradoxes */
  paradoxes: Paradox[];
  /** Extracted wisdom */
  wisdom: Wisdom[];
  /** Cross-domain connections */
  crossDomainConnections: CrossDomainConnection[];
  /** Synthesis analysis result */
  synthesis: SynthesisResult;
  /** Key insights from the analysis */
  insights: string[];
  /** Overall thinking sophistication score (0-100) */
  thinkingScore: number;
  /** Confidence in the overall analysis (0-1) */
  confidence: number;
}

/**
 * Options specific to Charlie Mind analysis
 */
export interface CharlieOptions {
  /** Minimum confidence threshold for including results */
  confidenceThreshold?: number;
  /** Whether to include detailed mental model analysis */
  analyzeMentalModels?: boolean;
  /** Whether to detect paradoxes */
  detectParadoxes?: boolean;
  /** Whether to extract wisdom */
  extractWisdom?: boolean;
  /** Whether to find cross-domain connections */
  findConnections?: boolean;
  /** Maximum number of mental models to return */
  maxMentalModels?: number;
  /** Maximum number of paradoxes to return */
  maxParadoxes?: number;
  /** Maximum number of wisdom items to return */
  maxWisdom?: number;
}

/**
 * @fileoverview Daniel Mind - Behavioral Patterns Analysis
 * @description Analyzes Big Five traits, cognitive biases, and decision-making patterns
 * @module @clone-lab/minds/daniel
 *
 * Inspired by Daniel Kahneman's work in behavioral economics
 */

import type {
  IMind,
  MindPersona,
  MindContext,
  MindResult,
  MindId,
  PersonalityTrait,
  Evidence,
  ValidationResult,
  MindOptions,
} from '../base/index.js';
import type {
  BigFiveTraits,
  CognitiveBias,
  DecisionPatterns,
  BehavioralTrigger,
  ResponsePattern,
  BehavioralProfile,
  DanielMindOptions,
} from './types.js';

/**
 * Daniel Mind - Behavioral Patterns Analyzer
 *
 * Analyzes behavioral patterns including:
 * - Big Five personality traits (OCEAN model)
 * - Cognitive biases (confirmation bias, anchoring, etc.)
 * - Decision-making patterns and risk tolerance
 * - Behavioral triggers and response patterns
 *
 * Dependencies: Requires Tim Mind (extraction) to run first
 */
export class DanielMind implements IMind {
  readonly persona: MindPersona = {
    id: 'daniel',
    name: 'Daniel',
    inspiration: 'Daniel Kahneman',
    expertise: [
      'Behavioral economics',
      'Decision-making patterns',
      'Cognitive biases',
      'Risk assessment',
      'Big Five personality analysis',
      'Prospect theory',
    ],
    tone: 'analytical',
    description:
      'Analyzes behavioral patterns, cognitive biases, and decision-making styles to understand how individuals think and choose.',
    version: '1.0.0',
  };

  private options: DanielMindOptions = {
    includeFacets: false,
    biasConfidenceThreshold: 0.5,
    maxBiases: 10,
    analyzeTriggers: true,
    analyzeResponses: true,
  };

  private startTime: number = 0;

  /**
   * Get the list of Minds that must run before Daniel
   * Daniel requires extraction data from Tim
   */
  getDependencies(): MindId[] {
    return ['tim'];
  }

  /**
   * Check if Daniel can handle the given context
   * Requires extracted data from Tim Mind
   */
  canHandle(context: MindContext): boolean {
    // Need at least some extracted data
    if (context.extractedData.length === 0) {
      return false;
    }

    // Check if Tim has run (optional but recommended)
    const timResult = context.previousResults?.get('tim');
    if (!timResult) {
      // Can still run but with reduced capability
      return context.extractedData.length >= 3;
    }

    return true;
  }

  /**
   * Initialize Daniel with options
   */
  async initialize(options: MindOptions): Promise<void> {
    this.options = { ...this.options, ...options };
  }

  /**
   * Analyze behavioral patterns from extracted data
   */
  async analyze(context: MindContext): Promise<MindResult> {
    this.startTime = Date.now();

    const { extractedData, previousResults } = context;
    const options = { ...this.options, ...context.options } as DanielMindOptions;

    // Build behavioral profile
    const profile = await this.buildBehavioralProfile(
      extractedData,
      previousResults,
      options
    );

    // Convert profile to MindResult format
    const traits = this.convertProfileToTraits(profile, options);
    const evidence = this.buildEvidenceList(extractedData, profile);
    const recommendations = this.generateRecommendations(profile);

    const executionTime = Date.now() - this.startTime;

    return {
      mindId: 'daniel',
      traits,
      confidence: profile.confidence,
      evidence,
      recommendations,
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version ?? '1.0.0',
        statistics: {
          executionTimeMs: executionTime,
          itemsProcessed: extractedData.length,
          traitsExtracted: traits.length,
          averageConfidence: profile.confidence,
        },
        warnings: this.generateWarnings(profile, extractedData),
        behavioralProfile: profile,
      },
    };
  }

  /**
   * Validate a Daniel Mind analysis result
   */
  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];
    let score = 100;

    // Check required trait categories
    const traitCategories = new Set(result.traits.map((t) => t.category));
    const requiredCategories = [
      'big-five',
      'cognitive-bias',
      'decision-patterns',
    ];

    for (const category of requiredCategories) {
      if (!traitCategories.has(category)) {
        issues.push({
          severity: 'warning',
          code: 'MISSING_CATEGORY',
          message: `Missing analysis category: ${category}`,
          path: 'traits',
        });
        score -= 10;
      }
    }

    // Check confidence levels
    const lowConfidenceTraits = result.traits.filter((t) => t.confidence < 0.5);
    if (lowConfidenceTraits.length > result.traits.length * 0.3) {
      issues.push({
        severity: 'warning',
        code: 'LOW_CONFIDENCE',
        message: `${lowConfidenceTraits.length} traits have low confidence (< 0.5)`,
        path: 'traits',
      });
      score -= 15;
    }

    // Check evidence sources
    const traitsWithoutSources = result.traits.filter(
      (t) => t.sources.length === 0
    );
    if (traitsWithoutSources.length > 0) {
      issues.push({
        severity: 'error',
        code: 'MISSING_SOURCES',
        message: `${traitsWithoutSources.length} traits have no source evidence`,
        path: 'traits',
      });
      score -= 20;
    }

    // Check overall confidence
    if (result.confidence < 0.3) {
      issues.push({
        severity: 'error',
        code: 'LOW_OVERALL_CONFIDENCE',
        message: `Overall confidence too low: ${result.confidence}`,
        path: 'confidence',
      });
      score -= 30;
    }

    return {
      valid: score >= 50,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Check the health of this Mind
   */
  async healthCheck(): Promise<{
    mindId: MindId;
    healthy: boolean;
    lastSuccess?: Date;
    error?: string;
  }> {
    return {
      mindId: 'daniel',
      healthy: true,
    };
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // No external resources to clean up
  }

  // Private helper methods

  /**
   * Build a complete behavioral profile from extracted data
   */
  private async buildBehavioralProfile(
    extractedData: MindContext['extractedData'],
    _previousResults?: MindContext['previousResults'],
    options?: DanielMindOptions
  ): Promise<BehavioralProfile> {
    // Analyze Big Five traits
    const bigFive = this.analyzeBigFive(extractedData);

    // Detect cognitive biases
    const cognitiveBiases = this.detectCognitiveBiases(
      extractedData,
      options?.biasConfidenceThreshold ?? 0.5,
      options?.maxBiases ?? 10
    );

    // Analyze decision patterns
    const decisionPatterns = this.analyzeDecisionPatterns(extractedData);

    // Analyze triggers and responses if enabled
    const triggers = options?.analyzeTriggers ?? true
      ? this.analyzeTriggers(extractedData)
      : [];

    const responsePatterns = options?.analyzeResponses ?? true
      ? this.analyzeResponsePatterns(extractedData)
      : [];

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(
      bigFive,
      cognitiveBiases,
      decisionPatterns,
      extractedData.length
    );

    // Generate summary
    const summary = this.generateProfileSummary(
      bigFive,
      cognitiveBiases,
      decisionPatterns
    );

    return {
      bigFive,
      cognitiveBiases,
      decisionPatterns,
      triggers,
      responsePatterns,
      confidence,
      summary,
    };
  }

  /**
   * Analyze Big Five personality traits from content
   */
  private analyzeBigFive(data: MindContext['extractedData']): BigFiveTraits {
    const content = data.map((d) => d.content).join(' ').toLowerCase();

    // Openness indicators
    const opennessMarkers = {
      positive: [
        'curious',
        'creative',
        'imagine',
        'explore',
        'novel',
        'artistic',
        'philosophical',
        'abstract',
        'innovation',
        'idea',
      ],
      negative: [
        'traditional',
        'conventional',
        'practical',
        'routine',
        'familiar',
      ],
    };

    // Conscientiousness indicators
    const conscientiousnessMarkers = {
      positive: [
        'organized',
        'planned',
        'disciplined',
        'thorough',
        'detail',
        'deadline',
        'responsible',
        'goal',
        'achieve',
        'systematic',
      ],
      negative: [
        'spontaneous',
        'flexible',
        'relaxed',
        'careless',
        'procrastinate',
      ],
    };

    // Extraversion indicators
    const extraversionMarkers = {
      positive: [
        'social',
        'party',
        'outgoing',
        'energetic',
        'talk',
        'friends',
        'meeting',
        'public',
        'expressive',
        'engaging',
      ],
      negative: [
        'quiet',
        'solitary',
        'alone',
        'introvert',
        'private',
        'reflective',
      ],
    };

    // Agreeableness indicators
    const agreeablenessMarkers = {
      positive: [
        'helpful',
        'cooperative',
        'trust',
        'kind',
        'empathetic',
        'supportive',
        'compassionate',
        'harmony',
        'agree',
        'collaborate',
      ],
      negative: [
        'critical',
        'skeptical',
        'competitive',
        'argumentative',
        'direct',
        'blunt',
      ],
    };

    // Neuroticism indicators
    const neuroticismMarkers = {
      positive: [
        'anxious',
        'worried',
        'stress',
        'nervous',
        'moody',
        'emotional',
        'sensitive',
        'fear',
        'uncertain',
        'overwhelmed',
      ],
      negative: [
        'calm',
        'stable',
        'relaxed',
        'composed',
        'resilient',
        'confident',
      ],
    };

    // Count markers and calculate scores directly
    const openness = this.calculateTraitScore(content, opennessMarkers, 50);
    const conscientiousness = this.calculateTraitScore(
      content,
      conscientiousnessMarkers,
      50
    );
    const extraversion = this.calculateTraitScore(content, extraversionMarkers, 50);
    const agreeableness = this.calculateTraitScore(content, agreeablenessMarkers, 50);
    const neuroticism = this.calculateTraitScore(content, neuroticismMarkers, 50);

    // Normalize to 0-100 range
    return {
      openness: Math.max(0, Math.min(100, openness)),
      conscientiousness: Math.max(0, Math.min(100, conscientiousness)),
      extraversion: Math.max(0, Math.min(100, extraversion)),
      agreeableness: Math.max(0, Math.min(100, agreeableness)),
      neuroticism: Math.max(0, Math.min(100, neuroticism)),
    };
  }

  /**
   * Calculate trait score based on word markers
   */
  private calculateTraitScore(
    content: string,
    markers: { positive: string[]; negative: string[] },
    baseScore: number
  ): number {
    let score = baseScore;

    for (const word of markers.positive) {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    }

    for (const word of markers.negative) {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score -= matches.length * 2;
      }
    }

    return score;
  }

  /**
   * Detect cognitive biases in the content
   */
  private detectCognitiveBiases(
    data: MindContext['extractedData'],
    threshold: number,
    maxBiases: number
  ): CognitiveBias[] {
    const content = data.map((d) => d.content).join(' ').toLowerCase();
    const sourceIds: string[] = data.map((d) => d.id);
    const biases: CognitiveBias[] = [];

    // Bias detection patterns
    const biasPatterns: Array<{
      type: CognitiveBias['type'];
      name: string;
      description: string;
      patterns: string[];
    }> = [
      {
        type: 'confirmation-bias',
        name: 'Confirmation Bias',
        description:
          'Tendency to search for and favor information that confirms existing beliefs',
        patterns: [
          'i knew',
          'exactly what i thought',
          'proves my point',
          'as expected',
          'obviously',
          'clearly shows',
        ],
      },
      {
        type: 'anchoring',
        name: 'Anchoring Bias',
        description:
          'Over-reliance on the first piece of information encountered',
        patterns: [
          'originally',
          'initially',
          'first offer',
          'starting at',
          'base price',
          'compared to the first',
        ],
      },
      {
        type: 'loss-aversion',
        name: 'Loss Aversion',
        description:
          'Preference for avoiding losses over acquiring equivalent gains',
        patterns: [
          "can't afford to lose",
          'risk losing',
          'afraid of losing',
          'protect my investment',
          'don\'t want to lose',
          'avoid any loss',
        ],
      },
      {
        type: 'optimism-bias',
        name: 'Optimism Bias',
        description:
          'Overestimating the probability of positive outcomes',
        patterns: [
          "it'll work out",
          'everything will be fine',
          'i\'m sure',
          'definitely happen',
          'certain to succeed',
          'too lucky to fail',
        ],
      },
      {
        type: 'status-quo-bias',
        name: 'Status Quo Bias',
        description:
          'Preference for the current state of affairs',
        patterns: [
          'keep things as they are',
          'no need to change',
          "if it ain't broke",
          'always done it this way',
          'stick with',
          'maintain the current',
        ],
      },
      {
        type: 'sunk-cost-fallacy',
        name: 'Sunk Cost Fallacy',
        description:
          'Continuing a behavior due to previously invested resources',
        patterns: [
          'already invested',
          'too much time',
          "can't give up now",
          'come this far',
          'spent so much',
          'after all that effort',
        ],
      },
      {
        type: 'availability-heuristic',
        name: 'Availability Heuristic',
        description:
          'Judging probability by how easily examples come to mind',
        patterns: [
          'i heard about',
          'just saw',
          'recently read',
          'in the news',
          'everyone is talking',
          'viral',
        ],
      },
      {
        type: 'hindsight-bias',
        name: 'Hindsight Bias',
        description:
          'Tendency to see past events as having been predictable',
        patterns: [
          'should have known',
          'knew all along',
          'obvious in retrospect',
          'could have predicted',
          'should have seen',
          'was inevitable',
        ],
      },
    ];

    // Detect biases based on patterns
    for (const biasInfo of biasPatterns) {
      let matchCount = 0;
      const examples: string[] = [];

      for (const pattern of biasInfo.patterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          matchCount += matches.length;
          // Extract context around match for examples
          const contextMatch = content.match(
            new RegExp(`.{50}${pattern}.{50}`, 'gi')
          );
          if (contextMatch) {
            examples.push(...contextMatch.slice(0, 2));
          }
        }
      }

      if (matchCount > 0) {
        const strength = Math.min(1, matchCount / 5);
        const confidence = Math.min(1, matchCount / 3);

        if (confidence >= threshold) {
          biases.push({
            type: biasInfo.type,
            name: biasInfo.name,
            description: biasInfo.description,
            strength,
            confidence,
            sources: sourceIds,
            examples: examples.slice(0, 3),
          });
        }
      }
    }

    // Sort by strength and return top biases
    return biases.sort((a, b) => b.strength - a.strength).slice(0, maxBiases);
  }

  /**
   * Analyze decision-making patterns
   */
  private analyzeDecisionPatterns(data: MindContext['extractedData']): DecisionPatterns {
    const content = data.map((d) => d.content).join(' ').toLowerCase();

    // Analyze decision style
    const styleScores: Record<DecisionPatterns['primaryStyle'], number> = {
      analytical: 0,
      intuitive: 0,
      dependent: 0,
      spontaneous: 0,
      avoidant: 0,
    };

    // Analytical markers
    if (/analyze|consider|evaluate|research|compare|weigh|pros and cons/i.test(content)) {
      styleScores.analytical += 3;
    }
    if (/data|evidence|facts|logical|rational/i.test(content)) {
      styleScores.analytical += 2;
    }

    // Intuitive markers
    if (/gut feeling|intuition|instinct|feel like|hunch|sense that/i.test(content)) {
      styleScores.intuitive += 3;
    }
    if (/just know|trust my|without thinking/i.test(content)) {
      styleScores.intuitive += 2;
    }

    // Dependent markers
    if (/ask|consult|advice|opinion|what do you think|recommend/i.test(content)) {
      styleScores.dependent += 3;
    }
    if (/others say|everyone thinks|approval|permission/i.test(content)) {
      styleScores.dependent += 2;
    }

    // Spontaneous markers
    if (/spur of the moment|impulse|just decided|on the spot|right away/i.test(content)) {
      styleScores.spontaneous += 3;
    }
    if (/didn't think|jump in|dive right|immediately/i.test(content)) {
      styleScores.spontaneous += 2;
    }

    // Avoidant markers
    if (/put off|later|procrastinate|avoid deciding|delay|postpone/i.test(content)) {
      styleScores.avoidant += 3;
    }
    if (/undecided|can't decide|don't know|not sure|maybe/i.test(content)) {
      styleScores.avoidant += 2;
    }

    // Find primary style
    const maxScore = Math.max(...Object.values(styleScores));
    const primaryStyle = (
      Object.keys(styleScores) as Array<keyof typeof styleScores>
    ).find((key) => styleScores[key] === maxScore) || 'analytical';

    // Analyze risk tolerance
    let riskTolerance: DecisionPatterns['riskTolerance'] = 'risk-neutral';
    const riskAverseMarkers = /safe|careful|cautious|avoid risk|conservative|secure|certain/i;
    const riskSeekingMarkers = /risk|bet|gamble|adventure|daring|bold|all in/i;

    const riskAverseCount = (content.match(riskAverseMarkers) || []).length;
    const riskSeekingCount = (content.match(riskSeekingMarkers) || []).length;

    if (riskAverseCount > riskSeekingCount + 2) {
      riskTolerance = 'risk-averse';
    } else if (riskSeekingCount > riskAverseCount + 2) {
      riskTolerance = 'risk-seeking';
    }

    // Analyze time preference
    let timePreference: DecisionPatterns['timePreference'] = 'balanced';
    if (/now|immediately|today|asap|right now|can't wait/i.test(content)) {
      const presentCount = (content.match(/now|immediately|today|asap/gi) || []).length;
      if (presentCount > 3) timePreference = 'present-biased';
    }
    if (/future|long term|later|eventually|investment|planning ahead/i.test(content)) {
      const futureCount = (content.match(/future|long term|later|eventually/gi) || []).length;
      if (futureCount > 3) timePreference = 'future-oriented';
    }

    // Analyze deliberation style
    let deliberationStyle: DecisionPatterns['deliberationStyle'] = 'moderate';
    const quickMarkers = (content.match(/quick|fast|instant|snap|immediate/gi) || []).length;
    const thoroughMarkers = (content.match(/thorough|careful|detailed|extensive|comprehensive/gi) || []).length;

    if (quickMarkers > thoroughMarkers + 2) {
      deliberationStyle = quickMarkers > 5 ? 'impulsive' : 'quick';
    } else if (thoroughMarkers > quickMarkers + 2) {
      deliberationStyle = thoroughMarkers > 5 ? 'exhaustive' : 'thorough';
    }

    return {
      primaryStyle,
      riskTolerance,
      timePreference,
      deliberationStyle,
      informationSeeking: this.calculateIndicator(content, ['research', 'read', 'learn', 'information', 'find out']),
      socialValidation: this.calculateIndicator(content, ['agree', 'approval', 'others', 'people think', 'everyone']),
      adaptability: this.calculateIndicator(content, ['change', 'adapt', 'flexible', 'adjust', 'pivot']),
      decisionConfidence: this.calculateIndicator(content, ['confident', 'certain', 'sure', 'definitely', 'absolutely']),
    };
  }

  /**
   * Calculate indicator score (0-1)
   */
  private calculateIndicator(content: string, markers: string[]): number {
    let score = 0;
    for (const marker of markers) {
      const regex = new RegExp(`\\b${marker}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    return Math.min(1, score / 10);
  }

  /**
   * Analyze behavioral triggers
   */
  private analyzeTriggers(data: MindContext['extractedData']): BehavioralTrigger[] {
    const content = data.map((d) => d.content).join(' ').toLowerCase();
    const sourceIds: string[] = data.map((d) => d.id);
    const triggers: BehavioralTrigger[] = [];

    // Emotional triggers
    const emotionalPatterns = [
      { name: 'Stress Response', pattern: /stress|pressure|overwhelm|anxious|panic/i },
      { name: 'Anger Trigger', pattern: /frustrated|angry|annoyed|irritated|upset/i },
      { name: 'Joy Response', pattern: /happy|excited|thrilled|delighted|elated/i },
      { name: 'Fear Response', pattern: /afraid|scared|terrified|fearful|worried/i },
    ];

    for (const { name, pattern } of emotionalPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length >= 2) {
        triggers.push({
          category: 'emotional',
          name,
          responsePattern: `Shows emotional response to ${name.toLowerCase()} triggers`,
          strength: Math.min(1, matches.length / 5),
          sources: sourceIds,
        });
      }
    }

    // Social triggers
    const socialPatterns = [
      { name: 'Social Approval', pattern: /approval|acceptance|belong|fit in|validate/i },
      { name: 'Competition Response', pattern: /compete|win|beat|better than|outperform/i },
      { name: 'Rejection Sensitivity', pattern: /reject|exclude|ignore|dismiss|overlook/i },
    ];

    for (const { name, pattern } of socialPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length >= 2) {
        triggers.push({
          category: 'social',
          name,
          responsePattern: `Reacts to ${name.toLowerCase()} situations`,
          strength: Math.min(1, matches.length / 5),
          sources: sourceIds,
        });
      }
    }

    return triggers;
  }

  /**
   * Analyze response patterns
   */
  private analyzeResponsePatterns(data: MindContext['extractedData']): ResponsePattern[] {
    const patterns: ResponsePattern[] = [];
    const sourceIds: string[] = data.map((d) => d.id);

    // This is a simplified analysis - in production would use more sophisticated NLP
    patterns.push({
      situation: 'Problem-solving scenarios',
      response: 'Tends to approach problems methodically based on available evidence',
      frequency: 0.7,
      sources: sourceIds,
    });

    return patterns;
  }

  /**
   * Calculate overall confidence in the profile
   */
  private calculateOverallConfidence(
    _bigFive: BigFiveTraits,
    biases: CognitiveBias[],
    _decisionPatterns: DecisionPatterns,
    dataPoints: number
  ): number {
    // Base confidence on data availability
    let confidence = Math.min(1, dataPoints / 10);

    // Adjust based on bias detection
    if (biases.length > 0) {
      confidence += 0.1;
    }

    // Cap at 0.95 for basic analysis
    return Math.min(0.95, confidence);
  }

  /**
   * Generate profile summary
   */
  private generateProfileSummary(
    bigFive: BigFiveTraits,
    biases: CognitiveBias[],
    decisionPatterns: DecisionPatterns
  ): string {
    const dominantTraits: string[] = [];

    if (bigFive.openness > 60) dominantTraits.push('open to new experiences');
    if (bigFive.conscientiousness > 60) dominantTraits.push('conscientious');
    if (bigFive.extraversion > 60) dominantTraits.push('extraverted');
    if (bigFive.agreeableness > 60) dominantTraits.push('agreeable');
    if (bigFive.neuroticism > 60) dominantTraits.push('emotionally sensitive');

    const biasSummary =
      biases.length > 0
        ? `Shows tendencies toward ${biases[0].name.toLowerCase()}${
            biases.length > 1 ? ` and ${biases[1].name.toLowerCase()}` : ''
          }.`
        : '';

    return `This individual appears to be ${dominantTraits.join(', ')}. Their decision-making style is primarily ${decisionPatterns.primaryStyle}, with a ${decisionPatterns.riskTolerance} approach to risk. ${biasSummary}`;
  }

  /**
   * Convert behavioral profile to MindResult traits
   */
  private convertProfileToTraits(
    profile: BehavioralProfile,
    _options?: DanielMindOptions
  ): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];
    const sourceIds: string[] = []; // Would be populated from actual sources

    // Big Five traits
    traits.push(
      {
        category: 'big-five',
        name: 'Openness',
        value: profile.bigFive.openness,
        confidence: profile.confidence,
        sources: sourceIds,
        notes: 'Openness to experience and novelty',
      },
      {
        category: 'big-five',
        name: 'Conscientiousness',
        value: profile.bigFive.conscientiousness,
        confidence: profile.confidence,
        sources: sourceIds,
        notes: 'Organization and dependability',
      },
      {
        category: 'big-five',
        name: 'Extraversion',
        value: profile.bigFive.extraversion,
        confidence: profile.confidence,
        sources: sourceIds,
        notes: 'Sociability and assertiveness',
      },
      {
        category: 'big-five',
        name: 'Agreeableness',
        value: profile.bigFive.agreeableness,
        confidence: profile.confidence,
        sources: sourceIds,
        notes: 'Cooperation and trust',
      },
      {
        category: 'big-five',
        name: 'Neuroticism',
        value: profile.bigFive.neuroticism,
        confidence: profile.confidence,
        sources: sourceIds,
        notes: 'Emotional stability',
      }
    );

    // Cognitive biases
    for (const bias of profile.cognitiveBiases) {
      traits.push({
        category: 'cognitive-bias',
        name: bias.name,
        value: bias.strength,
        confidence: bias.confidence,
        sources: bias.sources,
        notes: bias.description,
      });
    }

    // Decision patterns
    traits.push(
      {
        category: 'decision-patterns',
        name: 'Primary Decision Style',
        value: profile.decisionPatterns.primaryStyle,
        confidence: profile.confidence,
        sources: sourceIds,
      },
      {
        category: 'decision-patterns',
        name: 'Risk Tolerance',
        value: profile.decisionPatterns.riskTolerance,
        confidence: profile.confidence,
        sources: sourceIds,
      },
      {
        category: 'decision-patterns',
        name: 'Time Preference',
        value: profile.decisionPatterns.timePreference,
        confidence: profile.confidence,
        sources: sourceIds,
      },
      {
        category: 'decision-patterns',
        name: 'Information Seeking',
        value: profile.decisionPatterns.informationSeeking,
        confidence: profile.confidence,
        sources: sourceIds,
      },
      {
        category: 'decision-patterns',
        name: 'Social Validation Need',
        value: profile.decisionPatterns.socialValidation,
        confidence: profile.confidence,
        sources: sourceIds,
      }
    );

    return traits;
  }

  /**
   * Build evidence list from profile
   */
  private buildEvidenceList(
    data: MindContext['extractedData'],
    profile: BehavioralProfile
  ): Evidence[] {
    const evidence: Evidence[] = [];

    // Add evidence from cognitive biases
    for (const bias of profile.cognitiveBiases) {
      for (const example of bias.examples.slice(0, 2)) {
        evidence.push({
          source: bias.sources[0] || 'unknown',
          excerpt: example,
          relevance: bias.confidence,
          type: 'behavior',
        });
      }
    }

    // Add evidence from extracted data samples
    for (const item of data.slice(0, 5)) {
      evidence.push({
        source: item.id,
        excerpt: item.content.substring(0, 200),
        relevance: 0.7,
        type: 'quote',
      });
    }

    return evidence;
  }

  /**
   * Generate recommendations based on profile
   */
  private generateRecommendations(profile: BehavioralProfile): string[] {
    const recommendations: string[] = [];

    // Recommendations based on cognitive biases
    if (profile.cognitiveBiases.length > 0) {
      recommendations.push(
        `Be aware of tendency toward ${profile.cognitiveBiases[0].name.toLowerCase()} when making important decisions`
      );
    }

    // Recommendations based on decision patterns
    if (profile.decisionPatterns.riskTolerance === 'risk-averse') {
      recommendations.push(
        'Consider whether excessive caution is preventing growth opportunities'
      );
    } else if (profile.decisionPatterns.riskTolerance === 'risk-seeking') {
      recommendations.push(
        'Ensure adequate risk assessment before making significant decisions'
      );
    }

    // Recommendations based on Big Five
    if (profile.bigFive.neuroticism > 70) {
      recommendations.push(
        'Consider stress management techniques to improve emotional resilience'
      );
    }

    if (profile.decisionPatterns.socialValidation > 0.7) {
      recommendations.push(
        'Practice making independent decisions to build self-trust'
      );
    }

    return recommendations;
  }

  /**
   * Generate warnings about the analysis
   */
  private generateWarnings(
    profile: BehavioralProfile,
    data: MindContext['extractedData']
  ): string[] {
    const warnings: string[] = [];

    if (data.length < 5) {
      warnings.push(
        'Limited data available - behavioral profile may be incomplete'
      );
    }

    if (profile.confidence < 0.5) {
      warnings.push('Low confidence in behavioral analysis - more data recommended');
    }

    return warnings;
  }
}

/**
 * @fileoverview Charlie Mind - Synthesis & Paradoxes
 * @description Mental model identification, paradox detection, and wisdom distillation
 * @module @clone-lab/minds/charlie
 */

import type {
  IMind,
  MindPersona,
  MindContext,
  MindResult,
  MindId,
  ValidationResult,
  MindHealthStatus,
  Evidence,
  PersonalityTrait,
} from '../base/index.js';

import type {
  MentalModel,
  Paradox,
  Wisdom,
  CrossDomainConnection,
  SynthesisResult,
  CharlieResult,
  CharlieOptions,
  SynthesisQuality,
} from './types.js';


/**
 * Generate a unique ID
 */
function generateId(): string {
  return `charlie-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Charlie Mind - Synthesis & Paradoxes
 *
 * Inspired by Charlie Munger's approach to thinking and decision-making.
 * Specializes in mental model identification, paradox detection,
 * wisdom distillation, and cross-domain connections.
 */
export class CharlieMind implements IMind {
  readonly persona: MindPersona = {
    id: 'charlie',
    name: 'Charlie',
    inspiration: 'Charlie Munger',
    expertise: [
      'Mental models',
      'Synthesis',
      'Paradox resolution',
      'Wisdom distillation',
    ],
    tone: 'pragmatic',
    description:
      'Analyzes mental models, detects paradoxes, extracts wisdom, and synthesizes insights across all dimensions',
    version: '1.0.0',
  };

  private options: CharlieOptions = {
    confidenceThreshold: 0.5,
    analyzeMentalModels: true,
    detectParadoxes: true,
    extractWisdom: true,
    findConnections: true,
    maxMentalModels: 20,
    maxParadoxes: 10,
    maxWisdom: 15,
  };

  private initialized = false;

  /**
   * Initialize the Mind with configuration options
   */
  async initialize(options?: CharlieOptions): Promise<void> {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    this.initialized = true;
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.initialized = false;
  }

  /**
   * Perform analysis on the provided context
   */
  async analyze(context: MindContext): Promise<MindResult> {
    const startTime = Date.now();

    // Ensure dependencies are available
    const previousResults = context.previousResults;
    if (!previousResults) {
      // Analysis may be incomplete without previous results
    }

    // Analyze mental models
    const mentalModels = this.options.analyzeMentalModels
      ? this.analyzeMentalModels(context)
      : [];

    // Detect paradoxes
    const paradoxes = this.options.detectParadoxes
      ? this.detectParadoxes(context, mentalModels)
      : [];

    // Extract wisdom
    const wisdom = this.options.extractWisdom
      ? this.extractWisdom(context, mentalModels, paradoxes)
      : [];

    // Find cross-domain connections
    const crossDomainConnections = this.options.findConnections
      ? this.findCrossDomainConnections(context, mentalModels, wisdom)
      : [];

    // Perform synthesis
    const synthesis = this.performSynthesis(
      context,
      mentalModels,
      paradoxes,
      wisdom,
      crossDomainConnections
    );

    // Generate insights
    const insights = this.generateInsights(
      mentalModels,
      paradoxes,
      wisdom,
      crossDomainConnections,
      synthesis
    );

    // Calculate thinking score
    const thinkingScore = this.calculateThinkingScore(
      mentalModels,
      paradoxes,
      wisdom,
      synthesis
    );

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(
      mentalModels,
      paradoxes,
      wisdom,
      crossDomainConnections
    );

    const executionTimeMs = Date.now() - startTime;

    // Build result
    const result: MindResult = {
      mindId: 'charlie',
      traits: this.buildTraits(mentalModels, paradoxes, wisdom, synthesis),
      confidence,
      evidence: this.buildEvidence(context),
      recommendations: this.generateRecommendations(
        mentalModels,
        paradoxes,
        wisdom,
        synthesis
      ),
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version || '1.0.0',
        statistics: {
          executionTimeMs,
          itemsProcessed: context.extractedData.length,
          traitsExtracted: mentalModels.length + paradoxes.length + wisdom.length,
          averageConfidence: confidence,
        },
        charlieResult: {
          mentalModels,
          paradoxes,
          wisdom,
          crossDomainConnections,
          synthesis,
          insights,
          thinkingScore,
          confidence,
        } as CharlieResult,
      },
    };

    return result;
  }

  /**
   * Validate a MindResult for correctness and completeness
   */
  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];
    let score = 100;

    // Check confidence threshold
    if (result.confidence < (this.options.confidenceThreshold || 0.5)) {
      issues.push({
        severity: 'warning',
        code: 'LOW_CONFIDENCE',
        message: `Overall confidence ${result.confidence.toFixed(2)} is below threshold`,
      });
      score -= 10;
    }

    // Check Charlie-specific data
    const charlieResult = result.metadata.charlieResult as CharlieResult | undefined;
    if (!charlieResult) {
      issues.push({
        severity: 'error',
        code: 'MISSING_CHARLIE_RESULT',
        message: 'Charlie-specific result data is missing',
      });
      score -= 30;
    } else {
      // Validate mental models
      if (charlieResult.mentalModels.length === 0) {
        issues.push({
          severity: 'warning',
          code: 'NO_MENTAL_MODELS',
          message: 'No mental models were identified',
        });
        score -= 10;
      }

      // Validate thinking score range
      if (charlieResult.thinkingScore < 0 || charlieResult.thinkingScore > 100) {
        issues.push({
          severity: 'error',
          code: 'INVALID_THINKING_SCORE',
          message: `Thinking score ${charlieResult.thinkingScore} is out of range (0-100)`,
          path: 'metadata.charlieResult.thinkingScore',
        });
        score -= 20;
      }

      // Validate synthesis quality
      if (!charlieResult.synthesis || !charlieResult.synthesis.quality) {
        issues.push({
          severity: 'warning',
          code: 'MISSING_SYNTHESIS',
          message: 'Synthesis analysis is incomplete',
        });
        score -= 10;
      }
    }

    // Check traits
    if (result.traits.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_TRAITS',
        message: 'No traits were extracted',
      });
      score -= 15;
    }

    return {
      valid: score >= 50 && !issues.some((i) => i.severity === 'error'),
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Check if this Mind can handle the given context
   */
  canHandle(context: MindContext): boolean {
    // Charlie requires some data to analyze
    if (!context.extractedData || context.extractedData.length === 0) {
      return false;
    }

    // Charlie ideally needs results from dependencies
    // but can still function without them (with reduced effectiveness)
    return true;
  }

  /**
   * Get the list of Mind IDs that must run before this Mind
   */
  getDependencies(): MindId[] {
    return ['tim', 'daniel', 'brene', 'barbara'];
  }

  /**
   * Check the health of this Mind
   */
  async healthCheck(): Promise<MindHealthStatus> {
    return {
      mindId: 'charlie',
      healthy: this.initialized,
      error: this.initialized ? undefined : 'Charlie Mind not initialized',
    };
  }

  // Private methods

  private analyzeMentalModels(context: MindContext): MentalModel[] {
    const models: MentalModel[] = [];
    const data = context.extractedData;
    const previousResults = context.previousResults;

    // Extract content for analysis
    const content = data.map((d) => d.content).join(' ');

    // Analyze first-principles thinking
    if (this.detectFirstPrinciples(content, previousResults)) {
      models.push({
        id: generateId(),
        name: 'First-Principles Thinking',
        category: 'first-principles',
        description: 'Breaking down problems to fundamental truths rather than reasoning by analogy',
        application: 'Used when facing novel problems or questioning assumptions',
        frequency: this.assessFrequency(content, ['fundamental', 'basically', 'at its core', 'essentially']),
        effectiveness: 0.8,
        confidence: 0.75,
        sources: data.filter((d) => d.content.includes('fundamental') || d.content.includes('basically')).map((d) => d.id),
      });
    }

    // Analyze systems thinking
    if (this.detectSystemsThinking(content, previousResults)) {
      models.push({
        id: generateId(),
        name: 'Systems Thinking',
        category: 'systems-thinking',
        description: 'Understanding interconnections, feedback loops, and emergent properties',
        application: 'Applied when considering second-order effects and system-wide impacts',
        frequency: this.assessFrequency(content, ['system', 'interconnected', 'feedback', 'ripple effect', 'holistic']),
        effectiveness: 0.75,
        confidence: 0.7,
        sources: data.filter((d) => d.content.includes('system') || d.content.includes('interconnect')).map((d) => d.id),
      });
    }

    // Analyze probabilistic thinking
    if (this.detectProbabilisticThinking(content, previousResults)) {
      models.push({
        id: generateId(),
        name: 'Probabilistic Thinking',
        category: 'probability',
        description: 'Thinking in probabilities and likelihoods rather than certainties',
        application: 'Used for decision-making under uncertainty',
        frequency: this.assessFrequency(content, ['probably', 'likely', 'chance', 'odds', 'probability', 'uncertain']),
        effectiveness: 0.7,
        confidence: 0.7,
        sources: data.filter((d) => /probably|likely|chance|odds/.test(d.content)).map((d) => d.id),
      });
    }

    // Analyze inversion thinking
    if (this.detectInversionThinking(content, previousResults)) {
      models.push({
        id: generateId(),
        name: 'Inversion',
        category: 'inversion',
        description: 'Thinking about what to avoid rather than what to seek',
        application: 'Used to identify risks and avoid failures',
        frequency: this.assessFrequency(content, ['avoid', 'what not to do', 'inverted', 'reverse', 'opposite']),
        effectiveness: 0.75,
        confidence: 0.7,
        sources: data.filter((d) => /avoid|what not|reverse|inverted/.test(d.content)).map((d) => d.id),
      });
    }

    // Analyze circle of competence
    if (this.detectCircleOfCompetence(content, previousResults)) {
      models.push({
        id: generateId(),
        name: 'Circle of Competence',
        category: 'circle-of-competence',
        description: 'Knowing the boundaries of one\'s knowledge and expertise',
        application: 'Applied when deciding which opportunities to pursue or avoid',
        frequency: this.assessFrequency(content, ['expertise', 'within my area', 'know my limits', 'competence']),
        effectiveness: 0.8,
        confidence: 0.7,
        sources: data.filter((d) => /expert|competence|within my|limits/.test(d.content)).map((d) => d.id),
      });
    }

    // Analyze margin of safety
    if (this.detectMarginOfSafety(content, previousResults)) {
      models.push({
        id: generateId(),
        name: 'Margin of Safety',
        category: 'margin-of-safety',
        description: 'Building buffers to account for uncertainty and error',
        application: 'Used in planning, estimation, and risk management',
        frequency: this.assessFrequency(content, ['buffer', 'cushion', 'backup', 'contingency', 'extra', 'margin']),
        effectiveness: 0.75,
        confidence: 0.65,
        sources: data.filter((d) => /buffer|cushion|backup|contingency/.test(d.content)).map((d) => d.id),
      });
    }

    // Analyze opportunity cost
    if (this.detectOpportunityCost(content, previousResults)) {
      models.push({
        id: generateId(),
        name: 'Opportunity Cost',
        category: 'opportunity-cost',
        description: 'Considering the cost of foregone alternatives',
        application: 'Applied in resource allocation and prioritization decisions',
        frequency: this.assessFrequency(content, ['instead', 'alternative', 'trade', 'opportunity', 'forego']),
        effectiveness: 0.75,
        confidence: 0.7,
        sources: data.filter((d) => /instead|alternative|trade|opportunity/.test(d.content)).map((d) => d.id),
      });
    }

    // Detect cognitive biases
    this.detectCognitiveBiases(content, data).forEach((bias) => models.push(bias));

    // Limit results
    return models
      .filter((m) => m.confidence >= (this.options.confidenceThreshold || 0.5))
      .slice(0, this.options.maxMentalModels || 20);
  }

  private detectParadoxes(
    context: MindContext,
    _mentalModels: MentalModel[]
  ): Paradox[] {
    const paradoxes: Paradox[] = [];
    const content = context.extractedData.map((d) => d.content).join(' ');
    const data = context.extractedData;

    // Detect competing values
    if (this.detectCompetingValues(content, context)) {
      paradoxes.push({
        id: generateId(),
        name: 'Competing Values Paradox',
        type: 'competing-values',
        severity: 'moderate',
        description: 'Tension between important but conflicting values',
        elements: {
          primary: {
            name: 'Primary Value',
            description: 'The more frequently expressed value',
            strength: 0.7,
            evidence: [],
          },
          secondary: {
            name: 'Secondary Value',
            description: 'The competing value that occasionally takes precedence',
            strength: 0.6,
            evidence: [],
          },
        },
        resolutionStatus: 'managed',
        impact: 0.6,
        confidence: 0.65,
        sources: data.slice(0, 3).map((d) => d.id),
      });
    }

    // Detect short vs long term tension
    if (this.detectTimeTension(content)) {
      paradoxes.push({
        id: generateId(),
        name: 'Short vs Long Term Tension',
        type: 'short-long-term',
        severity: 'significant',
        description: 'Conflict between immediate gratification and long-term benefit',
        elements: {
          primary: {
            name: 'Short-term Focus',
            description: 'Immediate results and quick wins',
            strength: 0.5,
            evidence: [],
          },
          secondary: {
            name: 'Long-term Vision',
            description: 'Future-oriented planning and patience',
            strength: 0.6,
            evidence: [],
          },
        },
        resolutionStatus: 'partially-resolved',
        impact: 0.7,
        confidence: 0.7,
        sources: data.slice(0, 3).map((d) => d.id),
      });
    }

    // Detect stability vs change tension
    if (this.detectStabilityChangeTension(content)) {
      paradoxes.push({
        id: generateId(),
        name: 'Stability vs Change Paradox',
        type: 'stability-change',
        severity: 'moderate',
        description: 'Desire for consistency conflicts with need for growth and adaptation',
        elements: {
          primary: {
            name: 'Stability',
            description: 'Preference for consistency and predictability',
            strength: 0.55,
            evidence: [],
          },
          secondary: {
            name: 'Change',
            description: 'Drive for growth and adaptation',
            strength: 0.6,
            evidence: [],
          },
        },
        resolutionStatus: 'managed',
        impact: 0.55,
        confidence: 0.6,
        sources: data.slice(0, 3).map((d) => d.id),
      });
    }

    // Limit results
    return paradoxes
      .filter((p) => p.confidence >= (this.options.confidenceThreshold || 0.5))
      .slice(0, this.options.maxParadoxes || 10);
  }

  private extractWisdom(
    context: MindContext,
    mentalModels: MentalModel[],
    _paradoxes: Paradox[]
  ): Wisdom[] {
    const wisdomItems: Wisdom[] = [];
    const content = context.extractedData.map((d) => d.content).join(' ');
    const data = context.extractedData;

    // Extract principles
    const principles = this.extractPrinciples(content, data);
    wisdomItems.push(...principles);

    // Extract heuristics
    const heuristics = this.extractHeuristics(content, data);
    wisdomItems.push(...heuristics);

    // Extract insights
    const insights = this.extractInsights(content, data, mentalModels);
    wisdomItems.push(...insights);

    // Limit results
    return wisdomItems
      .filter((w) => w.confidence >= (this.options.confidenceThreshold || 0.5))
      .slice(0, this.options.maxWisdom || 15);
  }

  private findCrossDomainConnections(
    _context: MindContext,
    mentalModels: MentalModel[],
    _wisdom: Wisdom[]
  ): CrossDomainConnection[] {
    const connections: CrossDomainConnection[] = [];

    // Look for patterns that transfer across domains
    mentalModels.forEach((model) => {
      if (model.frequency > 0.6 && model.effectiveness > 0.6) {
        connections.push({
          id: generateId(),
          sourceDomain: 'general-thinking',
          targetDomain: 'practical-application',
          type: 'structural',
          description: `The ${model.name} model transfers across contexts`,
          underlyingPattern: model.description,
          application: model.application,
          strength: (model.frequency + model.effectiveness) / 2,
          confidence: model.confidence,
          sources: model.sources,
        });
      }
    });

    return connections;
  }

  private performSynthesis(
    _context: MindContext,
    mentalModels: MentalModel[],
    paradoxes: Paradox[],
    wisdom: Wisdom[],
    crossDomainConnections: CrossDomainConnection[]
  ): SynthesisResult {
    // Calculate quality metrics
    const quality: SynthesisQuality = {
      coherence: this.calculateCoherence(mentalModels, paradoxes),
      integration: this.calculateIntegration(mentalModels, wisdom),
      modelRichness: Math.min(1, mentalModels.length / 10),
      paradoxTolerance: this.calculateParadoxTolerance(paradoxes),
      wisdomDepth: Math.min(1, wisdom.length / 8),
      crossDomainAgility: Math.min(1, crossDomainConnections.length / 5),
    };

    // Identify dominant patterns
    const dominantPatterns = mentalModels
      .filter((m) => m.frequency > 0.6)
      .map((m) => m.name)
      .slice(0, 5);

    // Identify key tensions
    const keyTensions = paradoxes
      .filter((p) => p.impact > 0.5)
      .map((p) => p.name)
      .slice(0, 3);

    // Find integration opportunities
    const integrationOpportunities = this.findIntegrationOpportunities(
      mentalModels,
      paradoxes,
      wisdom
    );

    return {
      quality,
      dominantPatterns,
      keyTensions,
      integrationOpportunities,
      coherenceScore: quality.coherence,
      confidence: 0.75,
    };
  }

  private generateInsights(
    mentalModels: MentalModel[],
    paradoxes: Paradox[],
    wisdom: Wisdom[],
    crossDomainConnections: CrossDomainConnection[],
    synthesis: SynthesisResult
  ): string[] {
    const insights: string[] = [];

    // Add synthesis-based insights
    if (synthesis.quality.coherence > 0.7) {
      insights.push('Demonstrates coherent thinking with well-integrated mental models');
    }

    if (mentalModels.length > 5) {
      insights.push('Employs a diverse repertoire of mental models for decision-making');
    }

    if (paradoxes.some((p) => p.resolutionStatus === 'managed')) {
      insights.push('Shows ability to navigate competing values and tensions');
    }

    if (wisdom.some((w) => w.practicality > 0.8)) {
      insights.push('Extracts practical, actionable wisdom from experience');
    }

    if (crossDomainConnections.length > 3) {
      insights.push('Exhibits cross-domain thinking, applying insights across contexts');
    }

    return insights;
  }

  private calculateThinkingScore(
    mentalModels: MentalModel[],
    paradoxes: Paradox[],
    wisdom: Wisdom[],
    synthesis: SynthesisResult
  ): number {
    let score = 50; // Base score

    // Add points for mental model richness
    score += Math.min(15, mentalModels.length * 1.5);

    // Add points for effective paradox handling
    const managedParadoxes = paradoxes.filter(
      (p) => p.resolutionStatus === 'managed' || p.resolutionStatus === 'transcended'
    );
    score += Math.min(10, managedParadoxes.length * 3);

    // Add points for wisdom depth
    const highQualityWisdom = wisdom.filter((w) => w.practicality > 0.7 && w.universality > 0.7);
    score += Math.min(10, highQualityWisdom.length * 2);

    // Add points for synthesis quality
    score += synthesis.quality.coherence * 5;
    score += synthesis.quality.integration * 5;
    score += synthesis.quality.crossDomainAgility * 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private calculateOverallConfidence(
    mentalModels: MentalModel[],
    paradoxes: Paradox[],
    wisdom: Wisdom[],
    crossDomainConnections: CrossDomainConnection[]
  ): number {
    const allConfidences = [
      ...mentalModels.map((m) => m.confidence),
      ...paradoxes.map((p) => p.confidence),
      ...wisdom.map((w) => w.confidence),
      ...crossDomainConnections.map((c) => c.confidence),
    ];

    if (allConfidences.length === 0) return 0.5;
    return allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
  }

  private buildTraits(
    mentalModels: MentalModel[],
    paradoxes: Paradox[],
    wisdom: Wisdom[],
    synthesis: SynthesisResult
  ): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];

    // Mental model traits
    if (mentalModels.length > 3) {
      traits.push({
        category: 'thinking-style',
        name: 'mental-model-diversity',
        value: mentalModels.length,
        confidence: 0.8,
        sources: mentalModels.flatMap((m) => m.sources),
        notes: `Uses ${mentalModels.length} distinct mental models`,
      });
    }

    // Paradox handling trait
    const managedCount = paradoxes.filter(
      (p) => p.resolutionStatus === 'managed' || p.resolutionStatus === 'transcended'
    ).length;
    if (managedCount > 0) {
      traits.push({
        category: 'thinking-style',
        name: 'paradox-tolerance',
        value: managedCount / Math.max(paradoxes.length, 1),
        confidence: 0.75,
        sources: paradoxes.map((p) => p.id),
        notes: 'Demonstrates ability to navigate tensions',
      });
    }

    // Wisdom extraction trait
    if (wisdom.length > 2) {
      const avgPracticality = wisdom.reduce((a, w) => a + w.practicality, 0) / wisdom.length;
      traits.push({
        category: 'wisdom',
        name: 'practical-wisdom',
        value: avgPracticality,
        confidence: 0.7,
        sources: wisdom.flatMap((w) => w.sources),
        notes: 'Extracts actionable wisdom from experience',
      });
    }

    // Synthesis traits
    traits.push({
      category: 'thinking-style',
      name: 'coherence',
      value: synthesis.quality.coherence,
      confidence: 0.75,
      sources: [],
      notes: 'Overall coherence of thinking',
    });

    traits.push({
      category: 'thinking-style',
      name: 'cross-domain-agility',
      value: synthesis.quality.crossDomainAgility,
      confidence: 0.7,
      sources: [],
      notes: 'Ability to apply insights across domains',
    });

    return traits;
  }

  private buildEvidence(context: MindContext): Evidence[] {
    return context.extractedData.slice(0, 5).map((data) => ({
      source: data.id,
      excerpt: data.content.substring(0, 200),
      relevance: 0.7,
      type: 'other' as const,
    }));
  }

  private generateRecommendations(
    mentalModels: MentalModel[],
    paradoxes: Paradox[],
    _wisdom: Wisdom[],
    synthesis: SynthesisResult
  ): string[] {
    const recommendations: string[] = [];

    // Mental model recommendations
    if (mentalModels.length < 5) {
      recommendations.push('Expand mental model library to improve decision-making versatility');
    }

    // Paradox recommendations
    const unresolved = paradoxes.filter((p) => p.resolutionStatus === 'unresolved');
    if (unresolved.length > 0) {
      recommendations.push(
        `Address ${unresolved.length} unresolved paradox${unresolved.length > 1 ? 'es' : ''} for better internal alignment`
      );
    }

    // Synthesis recommendations
    if (synthesis.quality.integration < 0.6) {
      recommendations.push('Work on integrating insights across different areas of life');
    }

    if (synthesis.quality.crossDomainAgility < 0.5) {
      recommendations.push('Practice applying successful patterns from one domain to another');
    }

    return recommendations;
  }

  // Detection helper methods

  private detectFirstPrinciples(content: string, _previousResults?: Map<MindId, MindResult>): boolean {
    const indicators = ['fundamental', 'at its core', 'basically', 'essentially', 'underlying', 'root cause'];
    return indicators.some((i) => content.toLowerCase().includes(i));
  }

  private detectSystemsThinking(content: string, _previousResults?: Map<MindId, MindResult>): boolean {
    const indicators = ['system', 'interconnected', 'feedback loop', 'ripple effect', 'holistic', 'ecosystem'];
    return indicators.some((i) => content.toLowerCase().includes(i));
  }

  private detectProbabilisticThinking(content: string, _previousResults?: Map<MindId, MindResult>): boolean {
    const indicators = ['probably', 'likely', 'chance', 'odds', 'probability', 'uncertain', 'risk'];
    return indicators.some((i) => content.toLowerCase().includes(i));
  }

  private detectInversionThinking(content: string, _previousResults?: Map<MindId, MindResult>): boolean {
    const indicators = ['avoid', 'what not to do', 'inverted', 'reverse', 'opposite', 'instead of'];
    return indicators.some((i) => content.toLowerCase().includes(i));
  }

  private detectCircleOfCompetence(content: string, _previousResults?: Map<MindId, MindResult>): boolean {
    const indicators = ['expertise', 'within my area', 'know my limits', 'competence', 'specialize'];
    return indicators.some((i) => content.toLowerCase().includes(i));
  }

  private detectMarginOfSafety(content: string, _previousResults?: Map<MindId, MindResult>): boolean {
    const indicators = ['buffer', 'cushion', 'backup', 'contingency', 'extra', 'margin', 'safety'];
    return indicators.some((i) => content.toLowerCase().includes(i));
  }

  private detectOpportunityCost(content: string, _previousResults?: Map<MindId, MindResult>): boolean {
    const indicators = ['instead', 'alternative', 'trade-off', 'opportunity cost', 'forego', 'sacrifice'];
    return indicators.some((i) => content.toLowerCase().includes(i));
  }

  private detectCognitiveBiases(content: string, _data: unknown[]): MentalModel[] {
    const biases: MentalModel[] = [];

    // Check for confirmation bias
    if (/always knew|told you so|just as expected/.test(content.toLowerCase())) {
      biases.push({
        id: generateId(),
        name: 'Confirmation Bias',
        category: 'confirmation-bias',
        description: 'Tendency to search for and favor information that confirms existing beliefs',
        application: 'May lead to overlooking contradictory evidence',
        frequency: 0.5,
        effectiveness: 0.3,
        confidence: 0.6,
        sources: [],
      });
    }

    // Check for sunk cost fallacy
    if (/already invested|too far to|can't waste|spent so much/.test(content.toLowerCase())) {
      biases.push({
        id: generateId(),
        name: 'Sunk Cost Fallacy',
        category: 'sunk-cost',
        description: 'Tendency to continue an endeavor because of previously invested resources',
        application: 'May lead to throwing good money after bad',
        frequency: 0.4,
        effectiveness: 0.2,
        confidence: 0.55,
        sources: [],
      });
    }

    return biases;
  }

  private detectCompetingValues(content: string, _context: MindContext): boolean {
    // Simple heuristic: look for value conflict indicators
    const conflictIndicators = ['but also', 'on the other hand', 'however', 'although', 'despite'];
    return conflictIndicators.filter((i) => content.toLowerCase().includes(i)).length >= 2;
  }

  private detectTimeTension(content: string): boolean {
    const shortTerm = ['now', 'today', 'immediately', 'quick', 'fast', 'urgent'];
    const longTerm = ['future', 'long-term', 'eventually', 'someday', 'later', 'patience'];
    return shortTerm.some((s) => content.toLowerCase().includes(s)) &&
           longTerm.some((l) => content.toLowerCase().includes(l));
  }

  private detectStabilityChangeTension(content: string): boolean {
    const stability = ['consistent', 'stable', 'reliable', 'predictable', 'steady'];
    const change = ['change', 'grow', 'evolve', 'adapt', 'transform', 'innovate'];
    return stability.some((s) => content.toLowerCase().includes(s)) &&
           change.some((c) => content.toLowerCase().includes(c));
  }

  private assessFrequency(content: string, keywords: string[]): number {
    const matches = keywords.filter((k) => content.toLowerCase().includes(k)).length;
    return Math.min(1, matches / 3);
  }

  private extractPrinciples(content: string, data: unknown[]): Wisdom[] {
    const principles: Wisdom[] = [];

    // Look for principle indicators
    const principlePatterns = [
      /(?:I believe|my principle is|I always|I never) ([^.]+)/gi,
      /(?:the key is|what matters most is) ([^.]+)/gi,
    ];

    principlePatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        principles.push({
          id: generateId(),
          statement: match[1].trim(),
          type: 'principle',
          domain: 'general',
          explanation: `Identified principle: ${match[1].trim()}`,
          applications: [],
          universality: 0.7,
          practicality: 0.7,
          confidence: 0.65,
          sources: data.slice(0, 2).map((d: any) => d.id),
        });
      }
    });

    return principles.slice(0, 5);
  }

  private extractHeuristics(content: string, data: unknown[]): Wisdom[] {
    const heuristics: Wisdom[] = [];

    // Look for rule-of-thumb patterns
    const heuristicPatterns = [
      /(?:rule of thumb|generally|usually|typically) ([^.]+)/gi,
      /(?:if .* then|when .* I) ([^.]+)/gi,
    ];

    heuristicPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        heuristics.push({
          id: generateId(),
          statement: match[1].trim(),
          type: 'heuristic',
          domain: 'decision-making',
          explanation: `Identified heuristic: ${match[1].trim()}`,
          applications: [],
          universality: 0.6,
          practicality: 0.8,
          confidence: 0.6,
          sources: data.slice(0, 2).map((d: any) => d.id),
        });
      }
    });

    return heuristics.slice(0, 5);
  }

  private extractInsights(_content: string, _data: unknown[], mentalModels: MentalModel[]): Wisdom[] {
    const insights: Wisdom[] = [];

    // Generate insights based on mental models
    mentalModels.forEach((model) => {
      if (model.effectiveness > 0.7) {
        insights.push({
          id: generateId(),
          statement: `Effective use of ${model.name}`,
          type: 'insight',
          domain: 'learning',
          explanation: model.description,
          applications: [model.application],
          underlyingModel: model.name,
          universality: 0.6,
          practicality: 0.7,
          confidence: model.confidence * 0.9,
          sources: model.sources,
        });
      }
    });

    return insights.slice(0, 5);
  }

  private calculateCoherence(mentalModels: MentalModel[], paradoxes: Paradox[]): number {
    // Higher coherence if more mental models and fewer unresolved paradoxes
    const modelScore = Math.min(1, mentalModels.length / 8);
    const resolvedParadoxes = paradoxes.filter(
      (p) => p.resolutionStatus !== 'unresolved'
    ).length;
    const paradoxScore = paradoxes.length > 0 ? resolvedParadoxes / paradoxes.length : 1;

    return (modelScore * 0.6 + paradoxScore * 0.4);
  }

  private calculateIntegration(mentalModels: MentalModel[], wisdom: Wisdom[]): number {
    // Higher integration if wisdom references mental models
    const wisdomWithModels = wisdom.filter((w) => w.underlyingModel).length;
    const integrationScore = wisdom.length > 0 ? wisdomWithModels / wisdom.length : 0;

    return Math.min(1, (mentalModels.length / 10) * 0.5 + integrationScore * 0.5);
  }

  private calculateParadoxTolerance(paradoxes: Paradox[]): number {
    if (paradoxes.length === 0) return 0.5; // Neutral if no paradoxes detected

    const tolerant = paradoxes.filter(
      (p) => p.resolutionStatus === 'managed' || p.resolutionStatus === 'transcended'
    ).length;

    return tolerant / paradoxes.length;
  }

  private findIntegrationOpportunities(
    mentalModels: MentalModel[],
    paradoxes: Paradox[],
    wisdom: Wisdom[]
  ): string[] {
    const opportunities: string[] = [];

    // Check for unconnected mental models
    if (mentalModels.length > 3) {
      const connectedModels = mentalModels.filter((m) => m.relatedModels && m.relatedModels.length > 0);
      if (connectedModels.length < mentalModels.length / 2) {
        opportunities.push('Connect mental models to form a more integrated thinking framework');
      }
    }

    // Check for paradoxes without resolution approaches
    const paradoxesWithoutApproaches = paradoxes.filter((p) => !p.resolutionApproaches || p.resolutionApproaches.length === 0);
    if (paradoxesWithoutApproaches.length > 0) {
      opportunities.push('Develop specific approaches for managing identified tensions');
    }

    // Check for wisdom without applications
    const wisdomWithoutApplications = wisdom.filter((w) => w.applications.length === 0);
    if (wisdomWithoutApplications.length > 0) {
      opportunities.push('Identify practical applications for extracted wisdom');
    }

    return opportunities;
  }
}

// Export default instance
export default CharlieMind;

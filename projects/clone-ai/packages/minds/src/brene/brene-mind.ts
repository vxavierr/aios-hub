/**
 * @fileoverview Brene Mind - Values & Beliefs Analysis
 * @description Implements the IMind interface for analyzing core values, beliefs,
 *              vulnerability patterns, emotional triggers, and authenticity
 * @module @clone-lab/minds/brene
 */

import type {
  IMind,
  MindPersona,
  MindContext,
  MindResult,
  ValidationResult,
  MindId,
  ExtractedData,
  PersonalityTrait,
  Evidence,
} from '../base/index.js';

import type {
  BreneResult,
  BreneOptions,
  CoreValue,
  Belief,
  VulnerabilityPattern,
  EmotionalTrigger,
  AuthenticityMarkers,
  NonNegotiable,
  ShameResilience,
  ValueCategory,
  ValueImportance,
} from './types.js';

import { createAnalysisPrompt } from './prompts.js';

/**
 * Brene Mind implementation
 *
 * Specializes in analyzing values, beliefs, and vulnerability patterns.
 * Named after Brene Brown's research on vulnerability, shame, and authentic living.
 *
 * Dependencies:
 * - tim: Requires extraction data from Tim Mind
 *
 * @example
 * ```typescript
 * const brene = new BreneMind();
 * const result = await brene.analyze(context);
 * console.log(result.traits); // Core values and beliefs as traits
 * ```
 */
export class BreneMind implements IMind {
  /**
   * Brene's persona definition
   */
  readonly persona: MindPersona = {
    id: 'brene',
    name: 'Brene',
    inspiration: 'Brene Brown',
    expertise: [
      'Vulnerability',
      'Core values',
      'Emotional patterns',
      'Authenticity',
      'Shame resilience',
      'Belief systems',
    ],
    tone: 'empathetic',
    description:
      'Analyzes core values, belief systems, vulnerability patterns, and authenticity markers with empathy and nuance.',
    version: '1.0.0',
  };

  private options: BreneOptions = {};
  private initialized = false;

  /**
   * Get the list of Mind IDs that must run before Brene
   * Brene depends on Tim's extraction data
   */
  getDependencies(): MindId[] {
    return ['tim'];
  }

  /**
   * Check if Brene can handle the given context
   * Requires extracted data from Tim
   */
  canHandle(context: MindContext): boolean {
    const hasData = context.extractedData.length > 0;
    const hasTimResults =
      context.previousResults?.has('tim') ?? false;

    return hasData && hasTimResults;
  }

  /**
   * Initialize Brene Mind with configuration options
   */
  async initialize(options: BreneOptions = {}): Promise<void> {
    this.options = {
      confidenceThreshold: 0.5,
      analyzeVulnerabilityPatterns: true,
      analyzeShameResilience: true,
      identifyNonNegotiables: true,
      maxCoreValues: 10,
      ...options,
    };
    this.initialized = true;
  }

  /**
   * Perform analysis on the provided context
   */
  async analyze(context: MindContext): Promise<MindResult> {
    const startTime = Date.now();

    if (!this.initialized) {
      await this.initialize(context.options as BreneOptions);
    }

    // Perform the analysis
    const breneResult = await this.performAnalysis(context);

    // Convert to standard MindResult
    const traits = this.convertToTraits(breneResult);
    const evidence = this.collectEvidence(context.extractedData, breneResult);

    const executionTime = Date.now() - startTime;

    return {
      mindId: 'brene',
      traits,
      confidence: breneResult.confidence,
      evidence,
      recommendations: breneResult.growthRecommendations,
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version ?? '1.0.0',
        statistics: {
          executionTimeMs: executionTime,
          itemsProcessed: context.extractedData.length,
          traitsExtracted: traits.length,
          averageConfidence: this.calculateAverageConfidence(traits),
        },
        breneResult,
      },
    };
  }

  /**
   * Validate a Brene Mind result
   */
  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];
    let score = 100;

    // Check for required fields
    if (result.mindId !== 'brene') {
      issues.push({
        severity: 'error',
        code: 'INVALID_MIND_ID',
        message: `Expected mindId 'brene', got '${result.mindId}'`,
      });
      score -= 20;
    }

    // Check for traits
    if (result.traits.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_TRAITS',
        message: 'No traits were extracted from the analysis',
      });
      score -= 15;
    }

    // Check confidence range
    if (result.confidence < 0 || result.confidence > 1) {
      issues.push({
        severity: 'error',
        code: 'INVALID_CONFIDENCE',
        message: `Confidence must be between 0 and 1, got ${result.confidence}`,
        path: 'confidence',
      });
      score -= 10;
    }

    // Check for value traits
    const valueTraits = result.traits.filter(
      (t) => t.category === 'core-value' || t.category === 'belief'
    );
    if (valueTraits.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_VALUES_OR_BELIEFS',
        message: 'No core values or beliefs were identified',
      });
      score -= 10;
    }

    // Validate trait confidence values
    for (const trait of result.traits) {
      if (trait.confidence < 0 || trait.confidence > 1) {
        issues.push({
          severity: 'warning',
          code: 'INVALID_TRAIT_CONFIDENCE',
          message: `Trait '${trait.name}' has invalid confidence: ${trait.confidence}`,
          path: `traits[${trait.name}].confidence`,
        });
        score -= 5;
      }
    }

    // Check for BreneResult in metadata
    if (!result.metadata.breneResult) {
      issues.push({
        severity: 'info',
        code: 'NO_DETAILED_RESULT',
        message: 'No detailed BreneResult found in metadata',
        path: 'metadata.breneResult',
      });
    }

    return {
      valid: score >= 50,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Perform the actual analysis
   * @internal
   */
  private async performAnalysis(context: MindContext): Promise<BreneResult> {
    const promptContext = {
      extractedData: context.extractedData,
      previousResults: context.previousResults,
      options: context.options,
    };

    // Analyze each dimension
    const coreValues = this.analyzeCoreValues(promptContext);
    const beliefs = this.analyzeBeliefs(promptContext);
    const vulnerabilityPatterns = this.options.analyzeVulnerabilityPatterns
      ? this.analyzeVulnerabilityPatterns(promptContext)
      : [];
    const emotionalTriggers = this.analyzeEmotionalTriggers(promptContext);
    const authenticity = this.analyzeAuthenticity(promptContext);
    const nonNegotiables = this.options.identifyNonNegotiables
      ? this.analyzeNonNegotiables(promptContext)
      : [];
    const shameResilience = this.options.analyzeShameResilience
      ? this.analyzeShameResilience(promptContext)
      : this.getDefaultShameResilience();

    // Generate insights and recommendations
    const insights = this.generateInsights(
      coreValues,
      beliefs,
      vulnerabilityPatterns,
      authenticity
    );
    const growthRecommendations = this.generateGrowthRecommendations(
      coreValues,
      beliefs,
      vulnerabilityPatterns,
      authenticity,
      shameResilience
    );

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence({
      coreValues,
      beliefs,
      vulnerabilityPatterns,
      emotionalTriggers,
      authenticity,
      nonNegotiables,
      shameResilience,
    });

    return {
      coreValues,
      beliefs,
      nonNegotiables,
      vulnerabilityPatterns,
      emotionalTriggers,
      authenticity,
      shameResilience,
      insights,
      growthRecommendations,
      confidence,
    };
  }

  /**
   * Analyze core values from extracted data
   * @internal
   */
  private analyzeCoreValues(
    context: Parameters<typeof createAnalysisPrompt>[1]
  ): CoreValue[] {
    const values: CoreValue[] = [];
    const data = context.extractedData;

    // Keywords for value categories
    const valueKeywords: Record<ValueCategory, string[]> = {
      ethical: ['honesty', 'integrity', 'fairness', 'justice', 'truth'],
      relational: ['family', 'friendship', 'loyalty', 'trust', 'connection'],
      'personal-growth': ['learning', 'growth', 'development', 'improvement'],
      achievement: ['success', 'accomplishment', 'excellence', 'ambition'],
      security: ['safety', 'stability', 'security', 'protection'],
      autonomy: ['freedom', 'independence', 'autonomy', 'choice'],
      creativity: ['creativity', 'innovation', 'expression', 'art'],
      spiritual: ['meaning', 'purpose', 'faith', 'spirituality'],
      community: ['service', 'contribution', 'community', 'helping'],
      lifestyle: ['balance', 'health', 'adventure', 'experiences'],
    };

    // Analyze each data item for value indicators
    for (const item of data) {
      const content = item.content.toLowerCase();

      for (const [category, keywords] of Object.entries(valueKeywords)) {
        for (const keyword of keywords) {
          if (content.includes(keyword)) {
            // Extract context around the keyword
            const regex = new RegExp(`(.{0,100}${keyword}.{0,100})`, 'gi');
            const matches = content.match(regex);

            if (matches) {
              const existingValue = values.find(
                (v) =>
                  v.category === category &&
                  v.name.toLowerCase() === keyword
              );

              if (existingValue) {
                existingValue.sources.push(item.id);
                existingValue.behaviors.push(...matches.slice(0, 2));
              } else {
                values.push({
                  id: `value-${values.length + 1}`,
                  name: this.capitalizeFirst(keyword),
                  category: category as ValueCategory,
                  importance: this.determineImportance(content, keyword),
                  description: `Identified from usage in context`,
                  behaviors: matches.slice(0, 3),
                  contexts: this.extractContexts(content, keyword),
                  confidence: 0.6,
                  sources: [item.id],
                });
              }
            }
          }
        }
      }
    }

    // Deduplicate and filter by confidence
    const filteredValues = this.deduplicateValues(values);
    return filteredValues
      .filter((v) => v.confidence >= (this.options.confidenceThreshold ?? 0.5))
      .slice(0, this.options.maxCoreValues ?? 10)
      .sort((a, b) => this.importanceToNumber(b.importance) - this.importanceToNumber(a.importance));
  }

  /**
   * Analyze beliefs from extracted data
   * @internal
   */
  private analyzeBeliefs(
    context: Parameters<typeof createAnalysisPrompt>[1]
  ): Belief[] {
    const beliefs: Belief[] = [];
    const data = context.extractedData;

    // Belief indicators
    const beliefPatterns = [
      { pattern: /i believe that/gi, type: 'worldview' as const },
      { pattern: /i think that/gi, type: 'worldview' as const },
      { pattern: /i feel (?:like |that )/gi, type: 'self-perception' as const },
      { pattern: /people (?:are |should |always |never )/gi, type: 'other-perception' as const },
      { pattern: /(?:if |when ).*(?:then |always |never )/gi, type: 'causal' as const },
      { pattern: /(?:should |must |have to |ought to )/gi, type: 'normative' as const },
      { pattern: /(?:meaning |purpose |life is )/gi, type: 'existential' as const },
      { pattern: /i am (?:not |a |an |the )/gi, type: 'self-perception' as const },
    ];

    for (const item of data) {
      for (const { pattern, type } of beliefPatterns) {
        const matches = item.content.matchAll(pattern);

        for (const match of matches) {
          const startIndex = match.index ?? 0;
          const context = item.content.slice(startIndex, startIndex + 200);

          beliefs.push({
            id: `belief-${beliefs.length + 1}`,
            statement: this.extractBeliefStatement(context),
            type,
            strength: this.determineBeliefStrength(context),
            constructive: this.isBeliefConstructive(context),
            confidence: 0.5,
            sources: [item.id],
          });
        }
      }
    }

    // Deduplicate and filter
    return this.deduplicateBeliefs(beliefs)
      .filter((b) => b.confidence >= (this.options.confidenceThreshold ?? 0.5));
  }

  /**
   * Analyze vulnerability patterns
   * @internal
   */
  private analyzeVulnerabilityPatterns(
    context: Parameters<typeof createAnalysisPrompt>[1]
  ): VulnerabilityPattern[] {
    const patterns: VulnerabilityPattern[] = [];
    const data = context.extractedData;

    // Vulnerability indicators
    const vulnerabilityTriggers = [
      'vulnerable', 'exposed', 'uncertain', 'afraid', 'scared',
      'anxious', 'worried', 'uncomfortable', 'risk', 'trust',
    ];

    for (const item of data) {
      const content = item.content.toLowerCase();

      for (const trigger of vulnerabilityTriggers) {
        if (content.includes(trigger)) {
          const existingPattern = patterns.find((p) =>
            p.name.toLowerCase().includes(trigger)
          );

          if (existingPattern) {
            existingPattern.sources.push(item.id);
          } else {
            patterns.push({
              id: `pattern-${patterns.length + 1}`,
              name: `${this.capitalizeFirst(trigger)} vulnerability`,
              description: `Pattern involving ${trigger}`,
              triggers: [trigger],
              response: this.inferVulnerabilityResponse(content),
              emotionalStates: this.extractEmotionalStates(content),
              copingMechanisms: this.inferCopingMechanisms(content),
              confidence: 0.5,
              sources: [item.id],
            });
          }
        }
      }
    }

    return this.deduplicatePatterns(patterns)
      .filter((p) => p.confidence >= (this.options.confidenceThreshold ?? 0.5));
  }

  /**
   * Analyze emotional triggers
   * @internal
   */
  private analyzeEmotionalTriggers(
    context: Parameters<typeof createAnalysisPrompt>[1]
  ): EmotionalTrigger[] {
    const triggers: EmotionalTrigger[] = [];
    const data = context.extractedData;

    const triggerCategories = {
      rejection: ['rejected', 'abandoned', 'left out', 'not wanted'],
      failure: ['failed', 'mistake', 'error', 'not good enough'],
      criticism: ['criticized', 'judged', 'attacked', 'blamed'],
      loss: ['lost', 'grief', 'death', 'ending'],
      uncertainty: ['uncertain', 'unknown', 'unclear', 'ambiguous'],
      injustice: ['unfair', 'wrong', 'injustice', 'discrimination'],
      betrayal: ['betrayed', 'lied to', 'deceived', 'cheated'],
      inadequacy: ['inadequate', 'inferior', 'not enough', 'incompetent'],
      success: ['success', 'achieve', 'accomplish', 'win'],
      intimacy: ['close', 'intimate', 'connected', 'attached'],
    };

    for (const item of data) {
      const content = item.content.toLowerCase();

      for (const [category, keywords] of Object.entries(triggerCategories)) {
        for (const keyword of keywords) {
          if (content.includes(keyword)) {
            const existingTrigger = triggers.find(
              (t) => t.category === category
            );

            if (existingTrigger) {
              if (!existingTrigger.sources.includes(item.id)) {
                existingTrigger.sources.push(item.id);
              }
            } else {
              triggers.push({
                id: `trigger-${triggers.length + 1}`,
                name: `${this.capitalizeFirst(category)} trigger`,
                category: category as EmotionalTrigger['category'],
                description: `Emotional trigger related to ${category}`,
                emotionalResponse: this.inferEmotionalResponse(category),
                behavioralResponse: this.inferBehavioralResponse(content),
                intensity: 0.5,
                recoveryPattern: 'moderate',
                underlyingFears: this.inferUnderlyingFears(category),
                confidence: 0.5,
                sources: [item.id],
              });
            }
          }
        }
      }
    }

    return triggers
      .filter((t) => t.confidence >= (this.options.confidenceThreshold ?? 0.5))
      .sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Analyze authenticity markers
   * @internal
   */
  private analyzeAuthenticity(
    context: Parameters<typeof createAnalysisPrompt>[1]
  ): AuthenticityMarkers {
    const data = context.extractedData;
    let authenticityIndicators = 0;
    let totalIndicators = 0;
    const authenticMoments: string[] = [];
    const authenticityChallenges: string[] = [];

    // Authenticity indicators
    const authenticKeywords = [
      'genuine', 'authentic', 'true to myself', 'real', 'honest',
      'transparent', 'vulnerable', 'open',
    ];

    const challengeKeywords = [
      'pretend', 'fake', 'mask', 'hide', 'cover up',
      'people please', 'approval', 'impress',
    ];

    for (const item of data) {
      const content = item.content.toLowerCase();

      for (const keyword of authenticKeywords) {
        if (content.includes(keyword)) {
          authenticityIndicators++;
          totalIndicators++;
          const excerpt = this.extractExcerpt(content, keyword);
          if (excerpt) authenticMoments.push(excerpt);
        }
      }

      for (const keyword of challengeKeywords) {
        if (content.includes(keyword)) {
          totalIndicators++;
          const excerpt = this.extractExcerpt(content, keyword);
          if (excerpt) authenticityChallenges.push(excerpt);
        }
      }
    }

    const overallScore = totalIndicators > 0
      ? authenticityIndicators / totalIndicators
      : 0.5;

    return {
      valueBehaviorAlignment: 0.7,
      selfExpressionComfort: 0.6,
      vulnerabilityWillingness: 0.5,
      authenticityOverApproval: overallScore,
      imperfectionAcceptance: 0.6,
      overallScore,
      authenticMoments: authenticMoments.slice(0, 5),
      authenticityChallenges: authenticityChallenges.slice(0, 5),
      confidence: totalIndicators > 0 ? 0.6 : 0.3,
      sources: data.map((d) => d.id),
    };
  }

  /**
   * Analyze non-negotiables
   * @internal
   */
  private analyzeNonNegotiables(
    context: Parameters<typeof createAnalysisPrompt>[1]
  ): NonNegotiable[] {
    const nonNegotiables: NonNegotiable[] = [];
    const data = context.extractedData;

    const patterns = [
      /i (?:will |would |can |could )?never/i,
      /(?:that's |it's )?(?:a )?(?:hard )?(?:no|deal.?breaker)/i,
      /i (?:absolutely |definitely |really )?(?:won't|cannot|can't|refuse)/i,
      /(?:must |have to |need to )(?:always |never )/i,
    ];

    for (const item of data) {
      for (const pattern of patterns) {
        const matches = item.content.matchAll(pattern);

        for (const match of matches) {
          const startIndex = match.index ?? 0;
          const context = item.content.slice(startIndex, startIndex + 150);

          nonNegotiables.push({
            id: `nonneg-${nonNegotiables.length + 1}`,
            name: this.extractNonNegotiableName(context),
            description: context.slice(0, 100),
            category: this.categorizeNonNegotiable(context),
            violations: [],
            flexibility: this.assessFlexibility(context),
            confidence: 0.5,
            sources: [item.id],
          });
        }
      }
    }

    return this.deduplicateNonNegotiables(nonNegotiables)
      .filter((n) => n.confidence >= (this.options.confidenceThreshold ?? 0.5));
  }

  /**
   * Analyze shame resilience
   * @internal
   */
  private analyzeShameResilience(
    context: Parameters<typeof createAnalysisPrompt>[1]
  ): ShameResilience {
    const data = context.extractedData;
    let shameAwareness = 0.5;
    const shameTriggers: string[] = [];
    const resilienceStrategies: string[] = [];
    const vulnerableDomains: string[] = [];

    const shameKeywords = ['shame', 'ashamed', 'embarrassed', 'humiliated', 'worthless'];
    const resilienceKeywords = ['overcome', 'worked through', 'dealt with', 'processed', 'healed'];

    for (const item of data) {
      const content = item.content.toLowerCase();

      for (const keyword of shameKeywords) {
        if (content.includes(keyword)) {
          shameTriggers.push(keyword);
          shameAwareness = Math.min(1, shameAwareness + 0.1);
        }
      }

      for (const keyword of resilienceKeywords) {
        if (content.includes(keyword)) {
          resilienceStrategies.push(keyword);
        }
      }
    }

    return {
      shameAwareness,
      primaryResponse: 'processing',
      secondaryResponses: ['withdrawal'],
      shameTriggers: [...new Set(shameTriggers)].slice(0, 5),
      resilienceStrategies: [...new Set(resilienceStrategies)].slice(0, 5),
      vulnerableDomains: vulnerableDomains.slice(0, 5),
      supportSystems: [],
      resilienceScore: shameAwareness * (resilienceStrategies.length > 0 ? 0.8 : 0.5),
      confidence: 0.5,
      sources: data.map((d) => d.id),
    };
  }

  /**
   * Get default shame resilience when analysis is disabled
   * @internal
   */
  private getDefaultShameResilience(): ShameResilience {
    return {
      shameAwareness: 0.5,
      primaryResponse: 'processing',
      secondaryResponses: [],
      shameTriggers: [],
      resilienceStrategies: [],
      vulnerableDomains: [],
      supportSystems: [],
      resilienceScore: 0.5,
      confidence: 0.3,
      sources: [],
    };
  }

  /**
   * Generate insights from the analysis
   * @internal
   */
  private generateInsights(
    coreValues: CoreValue[],
    beliefs: Belief[],
    vulnerabilityPatterns: VulnerabilityPattern[],
    authenticity: AuthenticityMarkers
  ): string[] {
    const insights: string[] = [];

    // Value-based insights
    if (coreValues.length > 0) {
      const foundationalValues = coreValues.filter(
        (v) => v.importance === 'foundational'
      );
      if (foundationalValues.length > 0) {
        insights.push(
          `Core foundational values: ${foundationalValues.map((v) => v.name).join(', ')}`
        );
      }
    }

    // Belief-based insights
    const limitingBeliefs = beliefs.filter((b) => !b.constructive);
    if (limitingBeliefs.length > 0) {
      insights.push(
        `Identified ${limitingBeliefs.length} potentially limiting beliefs that may benefit from examination`
      );
    }

    // Vulnerability-based insights
    if (vulnerabilityPatterns.length > 3) {
      insights.push(
        'Multiple vulnerability patterns detected - may benefit from developing integrated coping strategies'
      );
    }

    // Authenticity-based insights
    if (authenticity.overallScore < 0.5) {
      insights.push(
        'Authenticity indicators suggest potential for growth in self-expression and genuine connection'
      );
    } else if (authenticity.overallScore > 0.7) {
      insights.push(
        'Strong authenticity markers present - demonstrating healthy self-expression patterns'
      );
    }

    return insights;
  }

  /**
   * Generate growth recommendations
   * @internal
   */
  private generateGrowthRecommendations(
    _coreValues: CoreValue[],
    beliefs: Belief[],
    vulnerabilityPatterns: VulnerabilityPattern[],
    authenticity: AuthenticityMarkers,
    shameResilience: ShameResilience
  ): string[] {
    const recommendations: string[] = [];

    // Value-behavior alignment
    if (authenticity.valueBehaviorAlignment < 0.7) {
      recommendations.push(
        'Explore ways to better align daily actions with identified core values'
      );
    }

    // Belief work
    const limitingBeliefs = beliefs.filter((b) => !b.constructive);
    if (limitingBeliefs.length > 0) {
      recommendations.push(
        'Consider examining limiting beliefs through journaling or therapeutic work'
      );
    }

    // Vulnerability growth
    const avoidancePatterns = vulnerabilityPatterns.filter(
      (p) => p.response === 'avoidance'
    );
    if (avoidancePatterns.length > 0) {
      recommendations.push(
        'Practice gradual exposure to vulnerability in safe contexts'
      );
    }

    // Shame resilience
    if (shameResilience.resilienceScore < 0.5) {
      recommendations.push(
        'Build shame resilience through self-compassion practices and trusted connections'
      );
    }

    // Authenticity
    if (authenticity.authenticityChallenges.length > authenticity.authenticMoments.length) {
      recommendations.push(
        'Explore what authentic self-expression looks like in different contexts'
      );
    }

    return recommendations;
  }

  // Helper methods

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private determineImportance(content: string, _keyword: string): ValueImportance {
    const importanceIndicators = {
      foundational: ['always', 'must', 'never', 'core', 'fundamental', 'essential'],
      core: ['important', 'value', 'believe', 'key', 'central'],
      important: ['prefer', 'usually', 'often', 'typically'],
      situational: ['sometimes', 'occasionally', 'depending', 'context'],
    };

    for (const [level, indicators] of Object.entries(importanceIndicators)) {
      for (const indicator of indicators) {
        if (content.includes(indicator)) {
          return level as ValueImportance;
        }
      }
    }

    return 'important';
  }

  private importanceToNumber(importance: ValueImportance): number {
    const map: Record<ValueImportance, number> = {
      foundational: 4,
      core: 3,
      important: 2,
      situational: 1,
    };
    return map[importance];
  }

  private extractContexts(content: string, keyword: string): string[] {
    const contexts: string[] = [];
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(keyword)) {
        contexts.push(sentence.trim());
      }
    }

    return contexts.slice(0, 3);
  }

  private deduplicateValues(values: CoreValue[]): CoreValue[] {
    const seen = new Map<string, CoreValue>();

    for (const value of values) {
      const key = `${value.category}-${value.name.toLowerCase()}`;
      if (!seen.has(key) || seen.get(key)!.confidence < value.confidence) {
        seen.set(key, value);
      }
    }

    return Array.from(seen.values());
  }

  private deduplicateBeliefs(beliefs: Belief[]): Belief[] {
    const seen = new Map<string, Belief>();

    for (const belief of beliefs) {
      const key = belief.statement.toLowerCase().slice(0, 50);
      if (!seen.has(key) || seen.get(key)!.confidence < belief.confidence) {
        seen.set(key, belief);
      }
    }

    return Array.from(seen.values());
  }

  private deduplicatePatterns(patterns: VulnerabilityPattern[]): VulnerabilityPattern[] {
    const seen = new Map<string, VulnerabilityPattern>();

    for (const pattern of patterns) {
      const key = pattern.name.toLowerCase();
      if (!seen.has(key) || seen.get(key)!.confidence < pattern.confidence) {
        seen.set(key, pattern);
      }
    }

    return Array.from(seen.values());
  }

  private deduplicateNonNegotiables(items: NonNegotiable[]): NonNegotiable[] {
    const seen = new Map<string, NonNegotiable>();

    for (const item of items) {
      const key = item.name.toLowerCase().slice(0, 30);
      if (!seen.has(key) || seen.get(key)!.confidence < item.confidence) {
        seen.set(key, item);
      }
    }

    return Array.from(seen.values());
  }

  private extractBeliefStatement(context: string): string {
    // Extract a clean belief statement
    const cleaned = context.replace(/\s+/g, ' ').trim();
    return cleaned.slice(0, 150) + (cleaned.length > 150 ? '...' : '');
  }

  private determineBeliefStrength(context: string): Belief['strength'] {
    if (/(?:absolutely|definitely|always|never|must)/i.test(context)) {
      return 'rigid';
    }
    if (/(?:strongly|firmly|really)/i.test(context)) {
      return 'strong';
    }
    if (/(?:somewhat|kind of|sort of|maybe)/i.test(context)) {
      return 'flexible';
    }
    if (/(?:wondering|curious|exploring|considering)/i.test(context)) {
      return 'exploratory';
    }
    return 'moderate';
  }

  private isBeliefConstructive(context: string): boolean {
    const negativePatterns = [
      /can't/i, /never/i, /impossible/i, /worthless/i,
      /failure/i, /stupid/i, /hopeless/i,
    ];

    for (const pattern of negativePatterns) {
      if (pattern.test(context)) {
        return false;
      }
    }

    return true;
  }

  private inferVulnerabilityResponse(content: string): VulnerabilityPattern['response'] {
    if (/avoid|escape|run|hide/i.test(content)) return 'avoidance';
    if (/think|analyze|rational/i.test(content)) return 'intellectualization';
    if (/joke|laugh|change subject/i.test(content)) return 'deflection';
    if (/numb|shut down|disconnect/i.test(content)) return 'numbing';
    if (/anger|frustrated|mad/i.test(content)) return 'anger';
    if (/embrace|welcome|accept/i.test(content)) return 'embrace';
    return 'selective-sharing';
  }

  private extractEmotionalStates(content: string): string[] {
    const emotions = [
      'fear', 'anxiety', 'shame', 'guilt', 'sadness',
      'anger', 'joy', 'excitement', 'hope', 'disappointment',
    ];

    return emotions.filter((e) => content.toLowerCase().includes(e));
  }

  private inferCopingMechanisms(content: string): string[] {
    const mechanisms: string[] = [];

    if (/talk|i spoke|shared/i.test(content)) mechanisms.push('seeking support');
    if (/wrote|journal/i.test(content)) mechanisms.push('journaling');
    if (/exercise|walk|run/i.test(content)) mechanisms.push('physical activity');
    if (/meditat|mindful|breath/i.test(content)) mechanisms.push('mindfulness');
    if (/think|consider|reflect/i.test(content)) mechanisms.push('reflection');

    return mechanisms.length > 0 ? mechanisms : ['unspecified'];
  }

  private inferEmotionalResponse(category: string): string[] {
    const responses: Record<string, string[]> = {
      rejection: ['hurt', 'abandoned', 'unworthy'],
      failure: ['disappointed', 'ashamed', 'frustrated'],
      criticism: ['defensive', 'hurt', 'angry'],
      loss: ['grief', 'sadness', 'emptiness'],
      uncertainty: ['anxiety', 'fear', 'discomfort'],
      injustice: ['anger', 'frustration', 'powerlessness'],
      betrayal: ['hurt', 'anger', 'distrust'],
      inadequacy: ['shame', 'embarrassment', 'self-doubt'],
      success: ['joy', 'pride', 'fulfillment'],
      intimacy: ['vulnerability', 'fear', 'connection'],
    };

    return responses[category] || ['emotional response'];
  }

  private inferBehavioralResponse(content: string): string[] {
    const responses: string[] = [];

    if(/withdraw|isolate|alone/i.test(content)) responses.push('withdrawal');
    if (/argue|defend|fight/i.test(content)) responses.push('defensive behavior');
    if (/cry|tears/i.test(content)) responses.push('emotional expression');
    if (/calm|composed/i.test(content)) responses.push('measured response');

    return responses.length > 0 ? responses : ['context-dependent'];
  }

  private inferUnderlyingFears(category: string): string[] {
    const fears: Record<string, string[]> = {
      rejection: ['being alone', 'not being wanted', 'abandonment'],
      failure: ['not being good enough', 'disappointing others', 'incompetence'],
      criticism: ['being wrong', 'judgment', 'disapproval'],
      loss: ['change', 'permanence', 'grief'],
      uncertainty: ['unknown outcomes', 'lack of control', 'unpredictability'],
      injustice: ['unfairness', 'powerlessness', 'victimization'],
      betrayal: ['trust issues', 'deception', 'loyalty'],
      inadequacy: ['self-worth', 'capability', 'comparison'],
      success: ['expectations', 'sustainability', 'imposter syndrome'],
      intimacy: ['vulnerability', 'rejection', 'loss of self'],
    };

    return fears[category] || ['underlying fear'];
  }

  private extractExcerpt(content: string, keyword: string): string | null {
    const index = content.indexOf(keyword);
    if (index === -1) return null;

    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + keyword.length + 50);

    return content.slice(start, end).trim();
  }

  private extractNonNegotiableName(context: string): string {
    const words = context.split(/\s+/).slice(0, 5);
    return words.join(' ');
  }

  private categorizeNonNegotiable(context: string): NonNegotiable['category'] {
    if (/moral|ethic|right|wrong|value/i.test(context)) return 'ethical';
    if (/relationship|partner|family|friend/i.test(context)) return 'relational';
    if (/work|time|schedule|budget|resource/i.test(context)) return 'practical';
    return 'personal';
  }

  private assessFlexibility(context: string): number {
    if (/(?:absolutely|never|always|must)/i.test(context)) return 0;
    if (/(?:usually|typically|prefer)/i.test(context)) return 0.3;
    if (/(?:sometimes|might|could)/i.test(context)) return 0.6;
    return 0.4;
  }

  private convertToTraits(result: BreneResult): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];

    // Convert core values to traits
    for (const value of result.coreValues) {
      traits.push({
        category: 'core-value',
        name: value.name,
        value: value.importance,
        confidence: value.confidence,
        sources: value.sources,
        notes: `Category: ${value.category}. ${value.description}`,
      });
    }

    // Convert key beliefs to traits
    for (const belief of result.beliefs.slice(0, 5)) {
      traits.push({
        category: 'belief',
        name: belief.type,
        value: belief.statement.slice(0, 100),
        confidence: belief.confidence,
        sources: belief.sources,
        notes: belief.constructive ? 'Constructive belief' : 'Potentially limiting belief',
      });
    }

    // Convert authenticity score to trait
    traits.push({
      category: 'authenticity',
      name: 'Overall Authenticity Score',
      value: result.authenticity.overallScore,
      confidence: result.authenticity.confidence,
      sources: result.authenticity.sources,
      notes: `Based on ${result.authenticity.authenticMoments.length} authentic moments identified`,
    });

    // Convert shame resilience to trait
    traits.push({
      category: 'shame-resilience',
      name: 'Shame Resilience Score',
      value: result.shameResilience.resilienceScore,
      confidence: result.shameResilience.confidence,
      sources: result.shameResilience.sources,
      notes: `Primary response: ${result.shameResilience.primaryResponse}`,
    });

    // Add vulnerability pattern count as trait
    traits.push({
      category: 'vulnerability',
      name: 'Vulnerability Patterns Identified',
      value: result.vulnerabilityPatterns.length,
      confidence: result.vulnerabilityPatterns.length > 0 ? 0.7 : 0.3,
      sources: result.vulnerabilityPatterns.flatMap((p) => p.sources),
    });

    return traits;
  }

  private collectEvidence(
    data: ExtractedData[],
    result: BreneResult
  ): Evidence[] {
    const evidence: Evidence[] = [];

    // Collect evidence from core values
    for (const value of result.coreValues.slice(0, 5)) {
      for (const sourceId of value.sources.slice(0, 2)) {
        const item = data.find((d) => d.id === sourceId);
        if (item) {
          evidence.push({
            source: sourceId,
            excerpt: value.behaviors[0] ?? `Evidence for ${value.name} value`,
            relevance: value.confidence,
            type: 'behavior',
          });
        }
      }
    }

    // Collect evidence from beliefs
    for (const belief of result.beliefs.slice(0, 3)) {
      for (const sourceId of belief.sources.slice(0, 1)) {
        const item = data.find((d) => d.id === sourceId);
        if (item) {
          evidence.push({
            source: sourceId,
            excerpt: belief.statement.slice(0, 100),
            relevance: belief.confidence,
            type: 'quote',
          });
        }
      }
    }

    return evidence;
  }

  private calculateAverageConfidence(traits: PersonalityTrait[]): number {
    if (traits.length === 0) return 0;
    const sum = traits.reduce((acc, t) => acc + t.confidence, 0);
    return sum / traits.length;
  }

  private calculateOverallConfidence(result: {
    coreValues: CoreValue[];
    beliefs: Belief[];
    emotionalTriggers: EmotionalTrigger[];
    authenticity: AuthenticityMarkers;
    nonNegotiables: NonNegotiable[];
    vulnerabilityPatterns: VulnerabilityPattern[];
    shameResilience: ShameResilience;
  }): number {
    const confidences = [
      result.coreValues.length > 0
        ? result.coreValues.reduce((s, v) => s + v.confidence, 0) / result.coreValues.length
        : 0,
      result.beliefs.length > 0
        ? result.beliefs.reduce((s, b) => s + b.confidence, 0) / result.beliefs.length
        : 0,
      result.authenticity.confidence,
      result.vulnerabilityPatterns.length > 0
        ? result.vulnerabilityPatterns.reduce((s, p) => s + p.confidence, 0) / result.vulnerabilityPatterns.length
        : 0.3,
      result.shameResilience.confidence,
    ];

    return confidences.reduce((s, c) => s + c, 0) / confidences.length;
  }
}

/**
 * @fileoverview Barbara Mind - Cognitive Architecture Analysis
 * @description Analyzes thinking styles, cognitive patterns, and mental models
 * @module @clone-lab/minds/barbara
 */

import type {
  IMind,
  MindPersona,
  MindContext,
  MindResult,
  MindId,
  ValidationResult,
  ExtractedData,
  PersonalityTrait,
  Evidence,
} from '../base/index.js';

import type {
  CognitiveProfile,
  MBTIProfile,
  BigFiveTraits,
  BigFiveTraitDetail,
  ThinkingStyle,
  LearningPreference,
  MentalModel,
  CognitiveArchitecture,
  CognitiveArchitectureType,
  SpatialPatterns,
  BarbaraMindOptions,
  ProcessingPattern,
  MentalModelCategory,
} from './types.js';

/**
 * Default options for Barbara Mind
 */
const DEFAULT_OPTIONS: BarbaraMindOptions = {
  includeMBTI: true,
  includeBigFive: true,
  includeThinkingStyle: true,
  includeLearningPreference: true,
  includeMentalModels: true,
  confidenceThreshold: 0.3,
  maxMentalModels: 10,
};

/**
 * Barbara Mind - Cognitive Architecture Analyst
 *
 * Inspired by Barbara Oakley, specializes in understanding how people think,
 * learn, and process information. Analyzes cognitive patterns, mental models,
 * and thinking styles from extracted data.
 *
 * @example
 * ```typescript
 * const barbara = new BarbaraMind();
 * const result = await barbara.analyze(context);
 * console.log(result.traits); // Cognitive profile traits
 * ```
 */
export class BarbaraMind implements IMind {
  readonly persona: MindPersona = {
    id: 'barbara',
    name: 'Barbara',
    inspiration: 'Barbara Oakley',
    expertise: [
      'Learning styles',
      'Cognitive patterns',
      'Thinking styles',
      'Mental models',
    ],
    tone: 'analytical',
    description:
      'Analyzes cognitive architecture, thinking styles, and mental models to understand how subjects process information',
    version: '1.0.0',
  };

  private options: BarbaraMindOptions;

  constructor(options: Partial<BarbaraMindOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Analyze extracted data for cognitive patterns
   */
  async analyze(context: MindContext): Promise<MindResult> {
    const startTime = Date.now();

    // Check dependencies
    const timResults = context.previousResults?.get('tim');

    // Use dependency results if available, otherwise use raw extracted data
    const dataToAnalyze =
      timResults?.evidence.map((e) => ({
        id: e.source,
        sourceType: 'other' as const,
        content: e.excerpt,
      })) || context.extractedData;

    if (dataToAnalyze.length === 0) {
      return this.createEmptyResult(startTime);
    }

    // Build cognitive profile
    const profile = await this.buildCognitiveProfile(dataToAnalyze, context);

    // Convert profile to MindResult format
    const result = this.convertToMindResult(profile, dataToAnalyze, startTime);

    return result;
  }

  /**
   * Validate a Barbara Mind analysis result
   */
  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];
    let score = 100;

    // Check required fields
    if (result.mindId !== 'barbara') {
      issues.push({
        severity: 'error',
        code: 'INVALID_MIND_ID',
        message: `Expected mindId 'barbara', got '${result.mindId}'`,
        path: 'mindId',
      });
      score -= 20;
    }

    // Check confidence range
    if (result.confidence < 0 || result.confidence > 1) {
      issues.push({
        severity: 'error',
        code: 'INVALID_CONFIDENCE',
        message: 'Confidence must be between 0 and 1',
        path: 'confidence',
      });
      score -= 10;
    }

    // Check for cognitive traits
    const cognitiveTraits = result.traits.filter(
      (t) =>
        t.category === 'cognitive' ||
        t.category === 'thinking-style' ||
        t.category === 'learning-preference' ||
        t.category === 'mbti' ||
        t.category === 'big-five'
    );

    if (cognitiveTraits.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_COGNITIVE_TRAITS',
        message: 'No cognitive traits identified in the result',
        path: 'traits',
      });
      score -= 15;
    }

    // Check evidence
    if (result.evidence.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_EVIDENCE',
        message: 'No evidence provided for cognitive analysis',
        path: 'evidence',
      });
      score -= 10;
    }

    return {
      valid: issues.filter((i) => i.severity === 'error').length === 0,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Check if Barbara can handle the given context
   */
  canHandle(context: MindContext): boolean {
    return (
      context.extractedData.length > 0 ||
      (context.previousResults?.has('tim') ?? false) ||
      (context.previousResults?.has('daniel') ?? false)
    );
  }

  /**
   * Get dependencies - Barbara needs Tim (extraction) and Daniel (behavioral)
   */
  getDependencies(): MindId[] {
    return ['tim', 'daniel'];
  }

  /**
   * Initialize the Mind with options
   */
  async initialize(options?: Record<string, unknown>): Promise<void> {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // Clean up resources
  }

  // ============ Private Methods ============

  /**
   * Build complete cognitive profile from extracted data
   */
  private async buildCognitiveProfile(
    data: ExtractedData[],
    _context: MindContext
  ): Promise<CognitiveProfile> {
    // Analyze each dimension
    const mbti = await this.analyzeMBTI(data);
    const bigFive = await this.analyzeBigFive(data);
    const thinkingStyle = await this.analyzeThinkingStyle(data);
    const learningPreference = await this.analyzeLearningPreference(data);
    const mentalModels = await this.analyzeMentalModels(data);
    const architecture = await this.analyzeArchitecture(data);
    const spatialPatterns = await this.analyzeSpatialPatterns(data);
    const processingPattern = this.determineProcessingPattern(
      thinkingStyle,
      architecture
    );

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence({
      mbti,
      bigFive,
      thinkingStyle,
      learningPreference,
      architecture,
      spatialPatterns,
    });

    return {
      mbti,
      bigFive,
      thinkingStyle,
      learningPreference,
      mentalModels,
      architecture,
      spatialPatterns,
      processingPattern,
      confidence,
    };
  }

  /**
   * Analyze MBTI profile from data
   */
  private async analyzeMBTI(data: ExtractedData[]): Promise<MBTIProfile> {
    const content = data.map((d) => d.content).join(' ');
    const wordCount = content.split(/\s+/).length;

    // Heuristic-based analysis (in production, this would use LLM)
    const ei = this.analyzeEI(content);
    const sn = this.analyzeSN(content);
    const tf = this.analyzeTF(content);
    const jp = this.analyzeJP(content);

    const inferredType = this.getMBTIType(ei, sn, tf, jp);

    // Confidence based on content volume
    const confidence = Math.min(0.95, 0.3 + wordCount / 2000);

    return {
      ei,
      sn,
      tf,
      jp,
      inferredType,
      confidence,
    };
  }

  /**
   * Analyze Big Five traits from data
   */
  private async analyzeBigFive(data: ExtractedData[]): Promise<BigFiveTraits> {
    const content = data.map((d) => d.content).join(' ');

    return {
      openness: this.analyzeOpenness(content),
      conscientiousness: this.analyzeConscientiousness(content),
      extraversion: this.analyzeExtraversion(content),
      agreeableness: this.analyzeAgreeableness(content),
      neuroticism: this.analyzeNeuroticism(content),
    };
  }

  /**
   * Analyze thinking style from data
   */
  private async analyzeThinkingStyle(data: ExtractedData[]): Promise<ThinkingStyle> {
    const content = data.map((d) => d.content).join(' ');

    const scores = {
      analytical: this.scoreAnalytical(content),
      intuitive: this.scoreIntuitive(content),
      creative: this.scoreCreative(content),
      practical: this.scorePractical(content),
      balanced: 0,
    };

    // Determine primary and secondary
    const sorted = Object.entries(scores)
      .filter(([key]) => key !== 'balanced')
      .sort((a, b) => b[1] - a[1]);

    const primary = sorted[0][0] as ThinkingStyleType;
    const secondary =
      sorted[1][1] > sorted[0][1] * 0.8
        ? (sorted[1][0] as ThinkingStyleType)
        : undefined;

    // Balanced if all scores are similar
    const variance = this.calculateVariance(
      Object.values(scores).filter((v) => v !== 0)
    );
    if (variance < 100) {
      scores.balanced = 70;
    }

    return {
      primary: variance < 100 ? 'balanced' : primary,
      secondary,
      scores,
      confidence: 0.7,
      evidence: this.extractThinkingStyleEvidence(content, primary),
    };
  }

  /**
   * Analyze learning preference from data
   */
  private async analyzeLearningPreference(
    data: ExtractedData[]
  ): Promise<LearningPreference> {
    const content = data.map((d) => d.content).join(' ').toLowerCase();

    const scores: Record<LearningModality, number> = {
      visual: this.scoreVisual(content),
      auditory: this.scoreAuditory(content),
      kinesthetic: this.scoreKinesthetic(content),
      'reading-writing': this.scoreReadingWriting(content),
      social: this.scoreSocial(content),
      solitary: this.scoreSolitary(content),
    };

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0] as LearningModality;
    const secondary =
      sorted[1][1] > sorted[0][1] * 0.8
        ? (sorted[1][0] as LearningModality)
        : undefined;

    return {
      primary,
      secondary,
      scores,
      confidence: 0.65,
      evidence: this.extractLearningEvidence(content, primary),
    };
  }

  /**
   * Identify mental models from data
   */
  private async analyzeMentalModels(data: ExtractedData[]): Promise<MentalModel[]> {
    const content = data.map((d) => d.content).join(' ');
    const models: MentalModel[] = [];

    // Check for various mental model patterns
    const modelPatterns = this.getMentalModelPatterns();

    for (const pattern of modelPatterns) {
      const matches = this.findPatternMatches(content, pattern.keywords);
      if (matches.length > 0) {
        models.push({
          name: pattern.name,
          category: pattern.category,
          frequency: Math.min(100, matches.length * 20),
          explicitness: matches.some((m) => m.includes('think')) ? 0.8 : 0.4,
          evidence: matches.slice(0, 3),
          relatedTerms: pattern.relatedTerms,
        });
      }
    }

    // Sort by frequency and limit
    return models
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, this.options.maxMentalModels);
  }

  /**
   * Analyze cognitive architecture
   */
  private async analyzeArchitecture(data: ExtractedData[]): Promise<CognitiveArchitecture> {
    const content = data.map((d) => d.content).join(' ');

    const typeScores: Record<CognitiveArchitectureType, number> = {
      'sequential-logical': this.scoreSequentialLogical(content),
      'spatial-visual': this.scoreSpatialVisual(content),
      'verbal-linguistic': this.scoreVerbalLinguistic(content),
      'intuitive-holistic': this.scoreIntuitiveHolistic(content),
      'mixed-balanced': 0,
    };

    const sorted = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
    const type = sorted[0][0] as CognitiveArchitectureType;

    // Check for mixed pattern
    const topScores = sorted.slice(0, 2);
    if (topScores[1] && topScores[1][1] > topScores[0][1] * 0.85) {
      typeScores['mixed-balanced'] = 60;
    }

    return {
      type: typeScores['mixed-balanced'] > 50 ? 'mixed-balanced' : type,
      description: this.getArchitectureDescription(type),
      characteristics: this.getArchitectureCharacteristics(type, content),
      typeScores,
      confidence: 0.7,
    };
  }

  /**
   * Analyze spatial thinking patterns
   */
  private async analyzeSpatialPatterns(data: ExtractedData[]): Promise<SpatialPatterns> {
    const content = data.map((d) => d.content).join(' ').toLowerCase();

    const spatialKeywords = [
      'above',
      'below',
      'left',
      'right',
      'center',
      'edge',
      'deep',
      'wide',
      'high',
      'low',
      'front',
      'back',
      'inside',
      'outside',
      'around',
      'through',
      'between',
      'beside',
      'under',
      'over',
      'map',
      'diagram',
      'chart',
      'visualize',
      'imagine',
      'picture',
      'layout',
      'structure',
    ];

    const examples: string[] = [];
    let matchCount = 0;

    for (const keyword of spatialKeywords) {
      const regex = new RegExp(`[^.]*\\b${keyword}\\b[^.]*\\.`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        matchCount += matches.length;
        examples.push(...matches.slice(0, 2));
      }
    }

    const spatialMetaphorUsage = Math.min(100, matchCount * 5);
    const visualRepresentation = this.scoreVisualRepresentation(content);
    const score = (spatialMetaphorUsage + visualRepresentation) / 2;

    return {
      spatialMetaphorUsage,
      visualRepresentation,
      examples: examples.slice(0, 5),
      score,
      confidence: matchCount > 5 ? 0.8 : 0.5,
    };
  }

  /**
   * Determine processing pattern from other analyses
   */
  private determineProcessingPattern(
    thinkingStyle: ThinkingStyle,
    architecture: CognitiveArchitecture
  ): ProcessingPattern {
    if (architecture.type === 'sequential-logical') return 'top-down';
    if (architecture.type === 'intuitive-holistic') return 'lateral';
    if (thinkingStyle.primary === 'analytical') return 'iterative';
    if (thinkingStyle.primary === 'creative') return 'lateral';
    if (architecture.type === 'mixed-balanced') return 'parallel';
    return 'bottom-up';
  }

  /**
   * Convert cognitive profile to MindResult format
   */
  private convertToMindResult(
    profile: CognitiveProfile,
    data: ExtractedData[],
    startTime: number
  ): MindResult {
    const traits: PersonalityTrait[] = [];

    // Add MBTI traits
    if (this.options.includeMBTI) {
      traits.push({
        category: 'mbti',
        name: 'mbtiType',
        value: profile.mbti.inferredType,
        confidence: profile.mbti.confidence,
        sources: data.map((d) => d.id),
        notes: `EI: ${profile.mbti.ei}, SN: ${profile.mbti.sn}, TF: ${profile.mbti.tf}, JP: ${profile.mbti.jp}`,
      });
    }

    // Add Big Five traits
    if (this.options.includeBigFive) {
      const bigFiveMap = {
        openness: profile.bigFive.openness,
        conscientiousness: profile.bigFive.conscientiousness,
        extraversion: profile.bigFive.extraversion,
        agreeableness: profile.bigFive.agreeableness,
        neuroticism: profile.bigFive.neuroticism,
      };

      for (const [name, trait] of Object.entries(bigFiveMap)) {
        traits.push({
          category: 'big-five',
          name,
          value: trait.score,
          confidence: 0.7,
          sources: data.map((d) => d.id),
          notes: `Level: ${trait.level}`,
        });
      }
    }

    // Add thinking style
    if (this.options.includeThinkingStyle) {
      traits.push({
        category: 'thinking-style',
        name: 'primaryStyle',
        value: profile.thinkingStyle.primary,
        confidence: profile.thinkingStyle.confidence,
        sources: data.map((d) => d.id),
        notes: profile.thinkingStyle.secondary
          ? `Secondary: ${profile.thinkingStyle.secondary}`
          : undefined,
      });
    }

    // Add learning preference
    if (this.options.includeLearningPreference) {
      traits.push({
        category: 'learning-preference',
        name: 'primaryModality',
        value: profile.learningPreference.primary,
        confidence: profile.learningPreference.confidence,
        sources: data.map((d) => d.id),
        notes: profile.learningPreference.secondary
          ? `Secondary: ${profile.learningPreference.secondary}`
          : undefined,
      });
    }

    // Add mental models
    if (this.options.includeMentalModels) {
      for (const model of profile.mentalModels.slice(0, 5)) {
        traits.push({
          category: 'mental-model',
          name: model.name,
          value: model.category,
          confidence: model.explicitness,
          sources: data.map((d) => d.id),
          notes: `Frequency: ${model.frequency}%`,
        });
      }
    }

    // Add architecture
    traits.push({
      category: 'cognitive',
      name: 'architectureType',
      value: profile.architecture.type,
      confidence: profile.architecture.confidence,
      sources: data.map((d) => d.id),
    });

    traits.push({
      category: 'cognitive',
      name: 'processingPattern',
      value: profile.processingPattern,
      confidence: 0.6,
      sources: data.map((d) => d.id),
    });

    // Build evidence
    const evidence: Evidence[] = data.slice(0, 10).map((d) => ({
      source: d.id,
      excerpt: d.content.slice(0, 200),
      relevance: 0.8,
      type: 'behavior' as const,
    }));

    // Add evidence from thinking style
    for (const e of profile.thinkingStyle.evidence.slice(0, 3)) {
      evidence.push({
        source: 'analysis',
        excerpt: e,
        relevance: 0.9,
        type: 'behavior',
      });
    }

    // Build recommendations
    const recommendations = this.generateRecommendations(profile);

    return {
      mindId: 'barbara',
      traits,
      confidence: profile.confidence,
      evidence,
      recommendations,
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version || '1.0.0',
        statistics: {
          executionTimeMs: Date.now() - startTime,
          itemsProcessed: data.length,
          traitsExtracted: traits.length,
          averageConfidence:
            traits.reduce((sum, t) => sum + t.confidence, 0) / traits.length,
        },
        cognitiveProfile: {
          mbtiType: profile.mbti.inferredType,
          thinkingStyle: profile.thinkingStyle.primary,
          learningModality: profile.learningPreference.primary,
          architectureType: profile.architecture.type,
          mentalModelsCount: profile.mentalModels.length,
          spatialScore: profile.spatialPatterns.score,
        },
      },
    };
  }

  /**
   * Create empty result for no data case
   */
  private createEmptyResult(startTime: number): MindResult {
    return {
      mindId: 'barbara',
      traits: [],
      confidence: 0,
      evidence: [],
      recommendations: [
        'Provide more content for cognitive analysis',
        'Include examples of problem-solving approaches',
        'Add content that reveals thinking patterns',
      ],
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version || '1.0.0',
        warnings: ['No data available for analysis'],
        statistics: {
          executionTimeMs: Date.now() - startTime,
          itemsProcessed: 0,
          traitsExtracted: 0,
          averageConfidence: 0,
        },
      },
    };
  }

  // ============ MBTI Analysis Helpers ============

  private analyzeEI(content: string): number {
    const lower = content.toLowerCase();
    const extravertIndicators = [
      'we',
      'our',
      'team',
      'together',
      'collaborate',
      'share',
      'discuss',
    ];
    const introvertIndicators = [
      'i think',
      'i believe',
      'my view',
      'alone',
      'reflect',
      'internal',
      'private',
    ];

    const eScore = this.countKeywords(lower, extravertIndicators);
    const iScore = this.countKeywords(lower, introvertIndicators);

    return Math.round(50 + (eScore - iScore) * 3);
  }

  private analyzeSN(content: string): number {
    const lower = content.toLowerCase();
    const sensingIndicators = [
      'specific',
      'detail',
      'concrete',
      'practical',
      'fact',
      'data',
      'proven',
    ];
    const intuitiveIndicators = [
      'pattern',
      'concept',
      'theory',
      'possibility',
      'potential',
      'abstract',
      'imagine',
    ];

    const sScore = this.countKeywords(lower, sensingIndicators);
    const nScore = this.countKeywords(lower, intuitiveIndicators);

    return Math.round(50 + (nScore - sScore) * 3);
  }

  private analyzeTF(content: string): number {
    const lower = content.toLowerCase();
    const thinkingIndicators = [
      'logic',
      'analyze',
      'objective',
      'rational',
      'efficient',
      'criteria',
      'systematic',
    ];
    const feelingIndicators = [
      'feel',
      'value',
      'harmony',
      'empathy',
      'personal',
      'believe',
      'care',
    ];

    const tScore = this.countKeywords(lower, thinkingIndicators);
    const fScore = this.countKeywords(lower, feelingIndicators);

    return Math.round(50 + (tScore - fScore) * 3);
  }

  private analyzeJP(content: string): number {
    const lower = content.toLowerCase();
    const judgingIndicators = [
      'plan',
      'schedule',
      'organize',
      'deadline',
      'structure',
      'decide',
      'complete',
    ];
    const perceivingIndicators = [
      'flexible',
      'adapt',
      'spontaneous',
      'open',
      'explore',
      'options',
      'later',
    ];

    const jScore = this.countKeywords(lower, judgingIndicators);
    const pScore = this.countKeywords(lower, perceivingIndicators);

    return Math.round(50 + (jScore - pScore) * 3);
  }

  private getMBTIType(ei: number, sn: number, tf: number, jp: number): string {
    const e = ei > 50 ? 'E' : 'I';
    const s = sn > 50 ? 'N' : 'S';
    const t = tf > 50 ? 'T' : 'F';
    const j = jp > 50 ? 'J' : 'P';
    return `${e}${s}${t}${j}`;
  }

  // ============ Big Five Analysis Helpers ============

  private analyzeOpenness(content: string): BigFiveTraitDetail {
    const indicators = [
      'creative',
      'curious',
      'novel',
      'artistic',
      'explore',
      'imagine',
      'new idea',
    ];
    const score = Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
    return {
      score,
      level: score > 66 ? 'high' : score > 33 ? 'moderate' : 'low',
      evidence: this.extractIndicators(content, indicators),
    };
  }

  private analyzeConscientiousness(content: string): BigFiveTraitDetail {
    const indicators = [
      'organized',
      'systematic',
      'thorough',
      'diligent',
      'discipline',
      'goal',
      'achievement',
    ];
    const score = Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
    return {
      score,
      level: score > 66 ? 'high' : score > 33 ? 'moderate' : 'low',
      evidence: this.extractIndicators(content, indicators),
    };
  }

  private analyzeExtraversion(content: string): BigFiveTraitDetail {
    const indicators = [
      'social',
      'energetic',
      'outgoing',
      'enthusiastic',
      'talk',
      'engage',
      'expressive',
    ];
    const score = Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
    return {
      score,
      level: score > 66 ? 'high' : score > 33 ? 'moderate' : 'low',
      evidence: this.extractIndicators(content, indicators),
    };
  }

  private analyzeAgreeableness(content: string): BigFiveTraitDetail {
    const indicators = [
      'helpful',
      'cooperative',
      'trust',
      'kind',
      'empathy',
      'considerate',
      'support',
    ];
    const score = Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
    return {
      score,
      level: score > 66 ? 'high' : score > 33 ? 'moderate' : 'low',
      evidence: this.extractIndicators(content, indicators),
    };
  }

  private analyzeNeuroticism(content: string): BigFiveTraitDetail {
    const indicators = [
      'anxious',
      'worried',
      'stress',
      'emotional',
      'moody',
      'tense',
      'nervous',
    ];
    const score = Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
    return {
      score,
      level: score > 66 ? 'high' : score > 33 ? 'moderate' : 'low',
      evidence: this.extractIndicators(content, indicators),
    };
  }

  // ============ Thinking Style Helpers ============

  private scoreAnalytical(content: string): number {
    const indicators = [
      'analyze',
      'logic',
      'systematic',
      'data',
      'evidence',
      'methodical',
      'step by step',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 10);
  }

  private scoreIntuitive(content: string): number {
    const indicators = [
      'sense',
      'feel',
      'intuition',
      'hunch',
      'instinct',
      'impression',
      'gut',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 10);
  }

  private scoreCreative(content: string): number {
    const indicators = [
      'create',
      'innovate',
      'novel',
      'unique',
      'original',
      'imagine',
      'brainstorm',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 10);
  }

  private scorePractical(content: string): number {
    const indicators = [
      'practical',
      'useful',
      'implement',
      'apply',
      'realistic',
      'concrete',
      'effective',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 10);
  }

  // ============ Learning Preference Helpers ============

  private scoreVisual(content: string): number {
    const indicators = [
      'see',
      'look',
      'visual',
      'diagram',
      'chart',
      'picture',
      'image',
      'show',
    ];
    return Math.min(100, this.countKeywords(content, indicators) * 10);
  }

  private scoreAuditory(content: string): number {
    const indicators = [
      'hear',
      'listen',
      'sound',
      'discuss',
      'talk',
      'speak',
      'explain',
      'verbal',
    ];
    return Math.min(100, this.countKeywords(content, indicators) * 10);
  }

  private scoreKinesthetic(content: string): number {
    const indicators = [
      'feel',
      'touch',
      'hands-on',
      'try',
      'practice',
      'do',
      'experience',
      'physical',
    ];
    return Math.min(100, this.countKeywords(content, indicators) * 10);
  }

  private scoreReadingWriting(content: string): number {
    const indicators = [
      'read',
      'write',
      'note',
      'text',
      'document',
      'article',
      'book',
      'list',
    ];
    return Math.min(100, this.countKeywords(content, indicators) * 10);
  }

  private scoreSocial(content: string): number {
    const indicators = [
      'group',
      'team',
      'together',
      'collaborate',
      'share',
      'discuss',
      'learn from',
    ];
    return Math.min(100, this.countKeywords(content, indicators) * 10);
  }

  private scoreSolitary(content: string): number {
    const indicators = [
      'alone',
      'self',
      'individual',
      'personal',
      'private',
      'independent',
      'own pace',
    ];
    return Math.min(100, this.countKeywords(content, indicators) * 10);
  }

  // ============ Architecture Helpers ============

  private scoreSequentialLogical(content: string): number {
    const indicators = [
      'first',
      'then',
      'next',
      'step',
      'sequence',
      'order',
      'logical',
      'therefore',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
  }

  private scoreSpatialVisual(content: string): number {
    const indicators = [
      'see',
      'picture',
      'map',
      'layout',
      'position',
      'arrange',
      'visual',
      'diagram',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
  }

  private scoreVerbalLinguistic(content: string): number {
    const indicators = [
      'word',
      'language',
      'phrase',
      'term',
      'express',
      'articulate',
      'describe',
      'explain',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
  }

  private scoreIntuitiveHolistic(content: string): number {
    const indicators = [
      'whole',
      'big picture',
      'overview',
      'holistic',
      'sense',
      'pattern',
      'connection',
      'overall',
    ];
    return Math.min(100, this.countKeywords(content.toLowerCase(), indicators) * 8);
  }

  private scoreVisualRepresentation(content: string): number {
    const indicators = ['diagram', 'chart', 'graph', 'visual', 'draw', 'sketch', 'layout'];
    return Math.min(100, this.countKeywords(content, indicators) * 12);
  }

  // ============ Utility Methods ============

  private countKeywords(content: string, keywords: string[]): number {
    let count = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) count += matches.length;
    }
    return count;
  }

  private extractIndicators(content: string, indicators: string[]): string[] {
    const found: string[] = [];
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      for (const indicator of indicators) {
        if (sentence.toLowerCase().includes(indicator)) {
          found.push(sentence.trim().slice(0, 100));
          break;
        }
      }
    }

    return found.slice(0, 5);
  }

  private extractThinkingStyleEvidence(content: string, style: string): string[] {
    const styleKeywords: Record<string, string[]> = {
      analytical: ['analyze', 'logic', 'systematic', 'data'],
      intuitive: ['sense', 'feel', 'intuition', 'pattern'],
      creative: ['create', 'innovate', 'novel', 'imagine'],
      practical: ['practical', 'useful', 'implement', 'apply'],
    };

    return this.extractIndicators(content, styleKeywords[style] || []);
  }

  private extractLearningEvidence(content: string, modality: string): string[] {
    const modalityKeywords: Record<string, string[]> = {
      visual: ['see', 'look', 'visual', 'show'],
      auditory: ['hear', 'listen', 'discuss', 'talk'],
      kinesthetic: ['feel', 'try', 'practice', 'do'],
      'reading-writing': ['read', 'write', 'note', 'text'],
      social: ['group', 'team', 'together', 'collaborate'],
      solitary: ['alone', 'self', 'individual', 'personal'],
    };

    return this.extractIndicators(content, modalityKeywords[modality] || []);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private getMentalModelPatterns(): Array<{
    name: string;
    category: MentalModelCategory;
    keywords: string[];
    relatedTerms: string[];
  }> {
    return [
      {
        name: 'Systems Thinking',
        category: 'systems-thinking',
        keywords: ['system', 'interconnected', 'feedback', 'loop', 'holistic'],
        relatedTerms: ['ecosystem', 'network', 'web'],
      },
      {
        name: 'First Principles',
        category: 'first-principles',
        keywords: ['fundamental', 'basic', 'foundation', 'underlying', 'principle'],
        relatedTerms: ['root cause', 'core', 'essence'],
      },
      {
        name: 'Probabilistic Thinking',
        category: 'probabilistic',
        keywords: ['probability', 'chance', 'likely', 'odds', 'uncertain'],
        relatedTerms: ['risk', 'expected', 'distribution'],
      },
      {
        name: 'Causal Reasoning',
        category: 'causal',
        keywords: ['cause', 'effect', 'result', 'because', 'therefore'],
        relatedTerms: ['consequence', 'impact', 'outcome'],
      },
      {
        name: 'Analogical Thinking',
        category: 'analogical',
        keywords: ['like', 'similar', 'analogy', 'metaphor', 'compare'],
        relatedTerms: ['parallel', 'equivalent', 'resemble'],
      },
      {
        name: 'Hierarchical Organization',
        category: 'hierarchical',
        keywords: ['level', 'hierarchy', 'tier', 'rank', 'category'],
        relatedTerms: ['layer', 'classification', 'nested'],
      },
      {
        name: 'Network Thinking',
        category: 'network',
        keywords: ['connection', 'link', 'node', 'relationship', 'network'],
        relatedTerms: ['edge', 'cluster', 'graph'],
      },
      {
        name: 'Temporal Sequencing',
        category: 'temporal',
        keywords: ['timeline', 'sequence', 'chronological', 'phase', 'stage'],
        relatedTerms: ['before', 'after', 'duration'],
      },
    ];
  }

  private findPatternMatches(content: string, keywords: string[]): string[] {
    const matches: string[] = [];
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          matches.push(sentence.trim().slice(0, 150));
          break;
        }
      }
    }

    return matches;
  }

  private getArchitectureDescription(type: CognitiveArchitectureType): string {
    const descriptions: Record<CognitiveArchitectureType, string> = {
      'sequential-logical':
        'Processes information in ordered, logical steps with clear cause-effect relationships',
      'spatial-visual':
        'Organizes information using visual and spatial representations',
      'verbal-linguistic':
        'Processes and organizes information primarily through language and words',
      'intuitive-holistic':
        'Perceives patterns and connections holistically without explicit steps',
      'mixed-balanced':
        'Employs multiple cognitive strategies depending on context and task',
    };
    return descriptions[type];
  }

  private getArchitectureCharacteristics(
    type: CognitiveArchitectureType,
    _content: string
  ): string[] {
    const characteristicsMap: Record<CognitiveArchitectureType, string[]> = {
      'sequential-logical': [
        'Step-by-step reasoning',
        'Logical progression',
        'Clear ordering of ideas',
      ],
      'spatial-visual': [
        'Uses spatial metaphors',
        'Visual organization preference',
        'Diagrammatic thinking',
      ],
      'verbal-linguistic': [
        'Articulate expression',
        'Word-focused processing',
        'Language-rich descriptions',
      ],
      'intuitive-holistic': [
        'Pattern recognition',
        'Big-picture focus',
        'Non-linear connections',
      ],
      'mixed-balanced': [
        'Flexible approach',
        'Context-dependent strategy',
        'Multiple modalities',
      ],
    };
    return characteristicsMap[type];
  }

  private calculateOverallConfidence(profile: Partial<CognitiveProfile>): number {
    const confidences = [
      profile.mbti?.confidence || 0,
      profile.thinkingStyle?.confidence || 0,
      profile.learningPreference?.confidence || 0,
      profile.architecture?.confidence || 0,
      profile.spatialPatterns?.confidence || 0,
    ];

    const validConfidences = confidences.filter((c) => c > 0);
    if (validConfidences.length === 0) return 0;

    return (
      validConfidences.reduce((sum, c) => sum + c, 0) / validConfidences.length
    );
  }

  private generateRecommendations(profile: CognitiveProfile): string[] {
    const recommendations: string[] = [];

    // Based on thinking style
    recommendations.push(
      `Optimize content for ${profile.thinkingStyle.primary} thinking style`
    );

    // Based on learning preference
    recommendations.push(
      `Present information using ${profile.learningPreference.primary} modalities`
    );

    // Based on architecture
    recommendations.push(
      `Structure communication to match ${profile.architecture.type} architecture`
    );

    // Based on mental models
    if (profile.mentalModels.length > 0) {
      recommendations.push(
        `Use ${profile.mentalModels[0].name} mental model for complex explanations`
      );
    }

    // Based on spatial patterns
    if (profile.spatialPatterns.score > 50) {
      recommendations.push(
        'Include visual diagrams and spatial representations'
      );
    }

    return recommendations;
  }
}

// Type alias for import convenience
type ThinkingStyleType = ThinkingStyle['primary'];
type LearningModality = LearningPreference['primary'];

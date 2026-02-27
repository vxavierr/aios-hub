/**
 * @fileoverview Tim Mind - Extraction Specialist
 * @description First Mind in the pipeline, responsible for source quality assessment
 * @module @clone-lab/minds/tim
 *
 * Inspired by Tim Ferriss - focuses on efficiency, quality over quantity,
 * and practical, actionable analysis of data sources.
 */

import type {
  IMind,
  MindContext,
  MindResult,
  MindPersona,
  ValidationResult,
  MindId,
  PersonalityTrait,
  Evidence,
  ExtractedData,
  MindOptions,
} from '../base/index.js';

import type {
  SourceQuality,
  DuplicateGroup,
  CoverageResult,
  TimMindOptions,
  TimAnalysisResult,
  TopicCoverage,
} from './types.js';

import {
  DEFAULT_TIM_OPTIONS,
  calculateWeightedScore,
  getWordCount,
  calculateAgeInDays,
} from './types.js';

/**
 * Tim Mind - Extraction Specialist
 *
 * Tim is the first Mind in the analysis pipeline. He assesses source quality,
 * detects duplicates, and calculates coverage to ensure the subsequent Minds
 * work with high-quality, diverse data.
 *
 * @example
 * ```typescript
 * const tim = new TimMind();
 *
 * if (tim.canHandle(context)) {
 *   const result = await tim.analyze(context);
 *   console.log(`Confidence: ${result.confidence}`);
 * }
 * ```
 */
export class TimMind implements IMind {
  readonly persona: MindPersona = {
    id: 'tim',
    name: 'Tim',
    inspiration: 'Tim Ferriss',
    expertise: [
      'Source quality assessment',
      'Content curation',
      'Data extraction optimization',
      'Efficiency in information gathering',
    ],
    tone: 'pragmatic',
    description:
      'Extraction specialist focused on identifying high-quality sources and optimizing data curation',
    version: '1.0.0',
  };

  private options: Required<TimMindOptions>;

  constructor(options?: TimMindOptions) {
    this.options = {
      ...DEFAULT_TIM_OPTIONS,
      ...options,
    };
  }

  /**
   * Initialize the Mind with configuration
   */
  async initialize(options?: MindOptions): Promise<void> {
    if (options) {
      // Extract Tim-specific options from MindOptions
      const timOptions: TimMindOptions = {
        minQualityScore: options.minQualityScore as number | undefined,
        duplicateThreshold: options.duplicateThreshold as number | undefined,
        targetCoverageScore: options.targetCoverageScore as number | undefined,
        includeLowQuality: options.includeLowQuality as boolean | undefined,
        batchSize: options.batchSize as number | undefined,
      };
      // Filter out undefined values
      const filteredOptions = Object.fromEntries(
        Object.entries(timOptions).filter(([, v]) => v !== undefined)
      );
      this.options = {
        ...DEFAULT_TIM_OPTIONS,
        ...filteredOptions,
      };
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    // Clean up resources
  }

  /**
   * Check if this Mind can handle the given context
   * Tim can handle any context that has extracted data
   */
  canHandle(context: MindContext): boolean {
    return (
      Array.isArray(context.extractedData) &&
      context.extractedData.length > 0
    );
  }

  /**
   * Get the list of Mind dependencies
   * Tim has no dependencies - he is the first Mind in the pipeline
   */
  getDependencies(): MindId[] {
    return [];
  }

  /**
   * Perform analysis on the provided context
   */
  async analyze(context: MindContext): Promise<MindResult> {
    const startTime = Date.now();

    // Validate context
    if (!this.canHandle(context)) {
      throw new Error('Tim Mind cannot handle empty extracted data');
    }

    const { extractedData } = context;

    // 1. Assess source quality
    const sourceQuality = await this.assessSourceQuality(extractedData);

    // 2. Detect duplicates
    const duplicates = await this.detectDuplicates(extractedData, sourceQuality);

    // 3. Calculate coverage
    const coverage = await this.calculateCoverage(extractedData, sourceQuality);

    // 4. Build analysis result
    const analysisResult: TimAnalysisResult = {
      sourceQuality,
      duplicates,
      coverage,
      prioritizedSources: this.prioritizeSources(sourceQuality, duplicates),
      sourcesToRemove: this.identifySourcesToRemove(duplicates, sourceQuality),
    };

    // 5. Build traits from analysis
    const traits = this.buildTraits(analysisResult);

    // 6. Collect evidence
    const evidence = this.collectEvidence(extractedData, sourceQuality);

    // 7. Generate recommendations
    const recommendations = this.generateRecommendations(analysisResult);

    // 8. Calculate overall confidence
    const confidence = this.calculateOverallConfidence(sourceQuality, coverage);

    const executionTimeMs = Date.now() - startTime;

    return {
      mindId: 'tim',
      traits,
      confidence,
      evidence,
      recommendations,
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version || '1.0.0',
        sourcesAnalyzed: extractedData.length,
        duplicateGroups: duplicates.length,
        coverageScore: coverage.score,
        averageQualityScore: this.calculateAverageQuality(sourceQuality),
        statistics: {
          executionTimeMs,
          itemsProcessed: extractedData.length,
          traitsExtracted: traits.length,
          averageConfidence: confidence,
        },
      },
    };
  }

  /**
   * Validate a MindResult for correctness and completeness
   */
  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];
    let score = 100;

    // Check mindId matches
    if (result.mindId !== 'tim') {
      issues.push({
        severity: 'error',
        code: 'INVALID_MIND_ID',
        message: `Expected mindId 'tim', got '${result.mindId}'`,
        path: 'mindId',
      });
      score -= 20;
    }

    // Check confidence is in valid range
    if (result.confidence < 0 || result.confidence > 1) {
      issues.push({
        severity: 'error',
        code: 'INVALID_CONFIDENCE',
        message: `Confidence must be between 0 and 1, got ${result.confidence}`,
        path: 'confidence',
      });
      score -= 15;
    }

    // Check traits are present
    if (!result.traits || result.traits.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_TRAITS',
        message: 'No traits were extracted from the analysis',
        path: 'traits',
      });
      score -= 10;
    }

    // Validate each trait
    if (result.traits) {
      result.traits.forEach((trait, index) => {
        if (!trait.name || trait.name.trim() === '') {
          issues.push({
            severity: 'error',
            code: 'EMPTY_TRAIT_NAME',
            message: `Trait at index ${index} has empty name`,
            path: `traits[${index}].name`,
          });
          score -= 5;
        }
        if (trait.confidence < 0 || trait.confidence > 1) {
          issues.push({
            severity: 'warning',
            code: 'INVALID_TRAIT_CONFIDENCE',
            message: `Trait '${trait.name}' has invalid confidence ${trait.confidence}`,
            path: `traits[${index}].confidence`,
          });
          score -= 3;
        }
      });
    }

    // Check evidence
    if (!result.evidence || result.evidence.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_EVIDENCE',
        message: 'No evidence was collected from the analysis',
        path: 'evidence',
      });
      score -= 5;
    }

    // Check metadata
    if (!result.metadata) {
      issues.push({
        severity: 'info',
        code: 'NO_METADATA',
        message: 'No metadata provided in result',
        path: 'metadata',
      });
    }

    // Check required metadata fields
    if (result.metadata) {
      if (typeof result.metadata.sourcesAnalyzed !== 'number') {
        issues.push({
          severity: 'warning',
          code: 'MISSING_SOURCES_ANALYZED',
          message: 'Metadata missing sourcesAnalyzed field',
          path: 'metadata.sourcesAnalyzed',
        });
        score -= 5;
      }
    }

    return {
      valid: score >= 60 && !issues.some((i) => i.severity === 'error'),
      score: Math.max(0, score),
      issues,
      metadata: {
        validatedAt: new Date().toISOString(),
        validatorVersion: '1.0.0',
      },
    };
  }

  // ==================== Private Methods ====================

  /**
   * Assess the quality of each source
   */
  private async assessSourceQuality(
    data: ExtractedData[]
  ): Promise<SourceQuality[]> {
    return data.map((item) => {
      const wordCount = getWordCount(item.content);
      const ageInDays = calculateAgeInDays(item.timestamp);

      // Calculate credibility score
      const credibility = this.assessCredibility(item, wordCount);

      // Calculate recency score
      const recency = this.assessRecency(ageInDays);

      // Calculate depth score
      const depth = this.assessDepth(item.content, wordCount);

      // Calculate relevance score
      const relevance = this.assessRelevance(item);

      // Calculate overall score (weighted average)
      const score = Math.round(
        calculateWeightedScore([
          { score: credibility.score, weight: 0.3 },
          { score: recency.score, weight: 0.2 },
          { score: depth.score, weight: 0.25 },
          { score: relevance.score, weight: 0.25 },
        ])
      );

      return {
        sourceId: item.id,
        score,
        credibility,
        recency: { ...recency, ageInDays },
        depth: { ...depth, wordCount },
        relevance,
      };
    });
  }

  /**
   * Assess credibility of a source
   */
  private assessCredibility(
    item: ExtractedData,
    wordCount: number
  ): SourceQuality['credibility'] {
    const factors: string[] = [];
    let score = 50; // Base score

    // Source type affects credibility
    if (item.sourceType === 'document') {
      score += 15;
      factors.push('Document source - typically more structured');
    } else if (item.sourceType === 'chat') {
      score += 5;
      factors.push('Chat source - authentic but informal');
    } else if (item.sourceType === 'video' || item.sourceType === 'audio') {
      score += 10;
      factors.push('Media source - rich content');
    }

    // Content length indicates depth
    if (wordCount > 500) {
      score += 10;
      factors.push('Substantial content length');
    }

    // Metadata presence indicates structure
    if (item.metadata && Object.keys(item.metadata).length > 0) {
      score += 5;
      factors.push('Has metadata');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      factors,
    };
  }

  /**
   * Assess recency of content
   */
  private assessRecency(ageInDays: number | null): { score: number } {
    if (ageInDays === null) {
      return { score: 50 }; // Unknown age gets neutral score
    }

    if (ageInDays < 30) {
      return { score: 100 };
    } else if (ageInDays < 90) {
      return { score: 85 };
    } else if (ageInDays < 180) {
      return { score: 70 };
    } else if (ageInDays < 365) {
      return { score: 50 };
    } else if (ageInDays < 730) {
      return { score: 30 };
    } else {
      return { score: 15 };
    }
  }

  /**
   * Assess depth of content
   */
  private assessDepth(
    _content: string,
    wordCount: number
  ): SourceQuality['depth'] {
    let score = 0;
    if (wordCount >= 1000) {
      score = 100;
    } else if (wordCount >= 500) {
      score = 80;
    } else if (wordCount >= 200) {
      score = 60;
    } else if (wordCount >= 100) {
      score = 40;
    } else if (wordCount >= 50) {
      score = 20;
    } else {
      score = 10;
    }

    return { score, wordCount, isSubstantive: wordCount >= 200 };
  }

  /**
   * Assess relevance of content to personality analysis
   */
  private assessRelevance(item: ExtractedData): SourceQuality['relevance'] {
    const topics: string[] = [];
    const content = item.content.toLowerCase();
    let score = 50;

    // Extract topics and adjust score based on content indicators
    const topicPatterns: Array<{ pattern: RegExp; topic: string; points: number }> = [
      { pattern: /\b(i think|i believe|in my opinion|personally)\b/i, topic: 'opinions', points: 10 },
      { pattern: /\b(i feel|i felt|emotion|emotionally)\b/i, topic: 'emotions', points: 10 },
      { pattern: /\b(my goal|i want to|i aspire|i hope)\b/i, topic: 'goals', points: 10 },
      { pattern: /\b(i value|i care about|important to me)\b/i, topic: 'values', points: 10 },
      { pattern: /\b(i always|i never|typically|usually)\b/i, topic: 'behaviors', points: 8 },
      { pattern: /\b(i learned|i realized|i discovered)\b/i, topic: 'growth', points: 8 },
      { pattern: /\b(my experience|i encountered|i faced)\b/i, topic: 'experiences', points: 8 },
    ];

    for (const { pattern, topic, points } of topicPatterns) {
      if (pattern.test(content)) {
        if (!topics.includes(topic)) {
          topics.push(topic);
        }
        score += points;
      }
    }

    return {
      score: Math.min(100, score),
      topics,
    };
  }

  /**
   * Detect duplicate content across sources
   */
  private async detectDuplicates(
    data: ExtractedData[],
    sourceQuality: SourceQuality[]
  ): Promise<DuplicateGroup[]> {
    const duplicates: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      if (processed.has(data[i].id)) continue;

      const group: DuplicateGroup = {
        groupId: `dup-${i}`,
        type: 'semantic',
        similarity: 1,
        sourceIds: [data[i].id],
        primarySourceId: data[i].id,
        primaryReason: 'First occurrence',
      };

      // Check for similar content
      for (let j = i + 1; j < data.length; j++) {
        if (processed.has(data[j].id)) continue;

        const similarity = this.calculateSimilarity(
          data[i].content,
          data[j].content
        );

        if (similarity >= this.options.duplicateThreshold) {
          group.sourceIds.push(data[j].id);
          processed.add(data[j].id);

          // Update similarity to average
          group.similarity =
            (group.similarity + similarity) / group.sourceIds.length;

          // Determine duplicate type
          if (similarity > 0.98) {
            group.type = 'exact';
          } else if (similarity > 0.9) {
            group.type = 'near';
          }
        }
      }

      // Only add as duplicate group if multiple sources
      if (group.sourceIds.length > 1) {
        // Select primary source based on quality
        const qualitiesInGroup = sourceQuality.filter((q) =>
          group.sourceIds.includes(q.sourceId)
        );
        const best = qualitiesInGroup.reduce((a, b) =>
          a.score > b.score ? a : b
        );
        group.primarySourceId = best.sourceId;
        group.primaryReason = `Highest quality score: ${best.score}`;

        duplicates.push(group);
      }

      processed.add(data[i].id);
    }

    return duplicates;
  }

  /**
   * Calculate similarity between two text strings
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity on word sets
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(Boolean));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(Boolean));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  }

  /**
   * Calculate coverage analysis
   */
  private async calculateCoverage(
    data: ExtractedData[],
    sourceQuality: SourceQuality[]
  ): Promise<CoverageResult> {
    // Analyze covered topics
    const coveredTopics = this.analyzeCoveredTopics(data, sourceQuality);

    // Identify gaps
    const gaps = this.identifyCoverageGaps(coveredTopics);

    // Analyze temporal distribution
    const temporalDistribution = this.analyzeTemporalDistribution(data);

    // Analyze format diversity
    const formatDiversity = this.analyzeFormatDiversity(data);

    // Calculate overall score
    const topicScore = this.calculateTopicScore(coveredTopics);
    const score = Math.round(
      calculateWeightedScore([
        { score: topicScore, weight: 0.4 },
        { score: temporalDistribution.spreadScore, weight: 0.2 },
        { score: formatDiversity.score, weight: 0.2 },
        { score: gaps.length === 0 ? 100 : Math.max(0, 100 - gaps.length * 15), weight: 0.2 },
      ])
    );

    return {
      score,
      coveredTopics,
      gaps,
      temporalDistribution,
      formatDiversity,
    };
  }

  /**
   * Analyze which topics are covered
   */
  private analyzeCoveredTopics(
    data: ExtractedData[],
    sourceQuality: SourceQuality[]
  ): TopicCoverage[] {
    const topicMap = new Map<string, { count: number; sourceIds: string[]; qualitySum: number }>();

    const topicPatterns: Array<{ pattern: RegExp; topic: string }> = [
      { pattern: /\b(career|work|job|profession)\b/i, topic: 'career' },
      { pattern: /\b(family|parent|child|spouse|marriage)\b/i, topic: 'family' },
      { pattern: /\b(hobby|interest|passion|enjoy)\b/i, topic: 'hobbies' },
      { pattern: /\b(education|learn|study|school|university)\b/i, topic: 'education' },
      { pattern: /\b(health|fitness|exercise|wellness)\b/i, topic: 'health' },
      { pattern: /\b(travel|trip|visit|country|city)\b/i, topic: 'travel' },
      { pattern: /\b(book|read|author|literature)\b/i, topic: 'reading' },
      { pattern: /\b(philosophy|belief|value|principle)\b/i, topic: 'philosophy' },
      { pattern: /\b(project|create|build|develop)\b/i, topic: 'projects' },
      { pattern: /\b(challenge|obstacle|struggle|overcome)\b/i, topic: 'challenges' },
    ];

    data.forEach((item) => {
      const quality = sourceQuality.find((q) => q.sourceId === item.id);
      const content = item.content.toLowerCase();

      topicPatterns.forEach(({ pattern, topic }) => {
        if (pattern.test(content)) {
          const existing = topicMap.get(topic) || { count: 0, sourceIds: [], qualitySum: 0 };
          existing.count++;
          existing.sourceIds.push(item.id);
          existing.qualitySum += quality?.score || 50;
          topicMap.set(topic, existing);
        }
      });
    });

    return Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      sourceCount: data.count,
      quality: Math.round(data.qualitySum / data.count),
      sourceIds: data.sourceIds,
    }));
  }

  /**
   * Identify gaps in coverage
   */
  private identifyCoverageGaps(coveredTopics: TopicCoverage[]): CoverageResult['gaps'] {
    const essentialTopics = [
      'career',
      'values',
      'communication',
      'relationships',
      'goals',
    ];

    const coveredTopicNames = new Set(coveredTopics.map((t) => t.topic));
    const gaps: CoverageResult['gaps'] = [];

    essentialTopics.forEach((topic) => {
      if (!coveredTopicNames.has(topic)) {
        gaps.push({
          topic,
          severity: 'critical',
          recommendation: `Add sources that discuss ${topic} to improve personality accuracy`,
        });
      }
    });

    // Check for undercovered topics
    coveredTopics.forEach((topic) => {
      if (topic.sourceCount < 2) {
        gaps.push({
          topic: topic.topic,
          severity: 'moderate',
          recommendation: `Add more sources about ${topic.topic} for better coverage`,
        });
      }
    });

    return gaps;
  }

  /**
   * Analyze temporal distribution
   */
  private analyzeTemporalDistribution(data: ExtractedData[]): CoverageResult['temporalDistribution'] {
    const dates = data
      .map((d) => d.timestamp)
      .filter((d): d is Date => d !== undefined)
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      return {
        earliestDate: null,
        latestDate: null,
        periods: [],
        spreadScore: 30, // Low score for unknown distribution
      };
    }

    const earliestDate = dates[0];
    const latestDate = dates[dates.length - 1];

    // Calculate spread score based on date range
    const rangeMs = latestDate.getTime() - earliestDate.getTime();
    const rangeDays = rangeMs / (1000 * 60 * 60 * 24);

    let spreadScore = 30;
    if (rangeDays > 365) {
      spreadScore = 100;
    } else if (rangeDays > 180) {
      spreadScore = 80;
    } else if (rangeDays > 90) {
      spreadScore = 60;
    } else if (rangeDays > 30) {
      spreadScore = 50;
    }

    // Group by month
    const periods: CoverageResult['temporalDistribution']['periods'] = [];
    const monthMap = new Map<string, number>();

    dates.forEach((date) => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    monthMap.forEach((count, period) => {
      periods.push({ period, count });
    });

    return {
      earliestDate,
      latestDate,
      periods,
      spreadScore,
    };
  }

  /**
   * Analyze format diversity
   */
  private analyzeFormatDiversity(data: ExtractedData[]): CoverageResult['formatDiversity'] {
    const byType: Record<string, number> = {};

    data.forEach((item) => {
      byType[item.sourceType] = (byType[item.sourceType] || 0) + 1;
    });

    const typeCount = Object.keys(byType).length;
    const hasVariety = typeCount >= 3;

    // Score based on number of different types
    let score = 20;
    if (typeCount >= 5) {
      score = 100;
    } else if (typeCount >= 4) {
      score = 80;
    } else if (typeCount >= 3) {
      score = 60;
    } else if (typeCount >= 2) {
      score = 40;
    }

    return { score, byType, hasVariety };
  }

  /**
   * Calculate topic coverage score
   */
  private calculateTopicScore(coveredTopics: TopicCoverage[]): number {
    if (coveredTopics.length === 0) return 0;

    const avgQuality =
      coveredTopics.reduce((sum, t) => sum + t.quality, 0) / coveredTopics.length;
    const countScore = Math.min(100, coveredTopics.length * 10);

    return Math.round((avgQuality + countScore) / 2);
  }

  /**
   * Prioritize sources based on quality and uniqueness
   */
  private prioritizeSources(
    sourceQuality: SourceQuality[],
    duplicates: DuplicateGroup[]
  ): string[] {
    // Get IDs to exclude (non-primary duplicates)
    const excludeIds = new Set<string>();
    duplicates.forEach((group) => {
      group.sourceIds.forEach((id) => {
        if (id !== group.primarySourceId) {
          excludeIds.add(id);
        }
      });
    });

    // Filter and sort by quality
    return sourceQuality
      .filter((sq) => !excludeIds.has(sq.sourceId))
      .filter((sq) => sq.score >= this.options.minQualityScore)
      .sort((a, b) => b.score - a.score)
      .map((sq) => sq.sourceId);
  }

  /**
   * Identify sources to remove (duplicates and low-quality)
   */
  private identifySourcesToRemove(
    duplicates: DuplicateGroup[],
    sourceQuality: SourceQuality[]
  ): string[] {
    const toRemove: string[] = [];

    // Add non-primary duplicates
    duplicates.forEach((group) => {
      group.sourceIds.forEach((id) => {
        if (id !== group.primarySourceId) {
          toRemove.push(id);
        }
      });
    });

    // Add low-quality sources (if configured)
    if (!this.options.includeLowQuality) {
      sourceQuality
        .filter((sq) => sq.score < this.options.minQualityScore)
        .forEach((sq) => toRemove.push(sq.sourceId));
    }

    return [...new Set(toRemove)]; // Remove duplicates
  }

  /**
   * Build personality traits from analysis
   */
  private buildTraits(analysis: TimAnalysisResult): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];

    // Data quality trait
    const avgQuality = this.calculateAverageQuality(analysis.sourceQuality);
    traits.push({
      category: 'data_quality',
      name: 'source_quality_average',
      value: avgQuality,
      confidence: Math.min(1, analysis.sourceQuality.length / 10),
      sources: analysis.sourceQuality.map((sq) => sq.sourceId),
      notes: `Average quality score across ${analysis.sourceQuality.length} sources`,
    });

    // Coverage trait
    traits.push({
      category: 'data_quality',
      name: 'content_coverage',
      value: analysis.coverage.score,
      confidence: analysis.coverage.score / 100,
      sources: analysis.coverage.coveredTopics.flatMap((t) => t.sourceIds),
      notes: `Coverage score based on ${analysis.coverage.coveredTopics.length} topics`,
    });

    // Redundancy trait
    const redundancyRatio =
      analysis.duplicates.reduce((sum, d) => sum + d.sourceIds.length - 1, 0) /
      analysis.sourceQuality.length;
    traits.push({
      category: 'data_quality',
      name: 'redundancy_ratio',
      value: Math.round(redundancyRatio * 100) / 100,
      confidence: 0.8,
      sources: analysis.duplicates.flatMap((d) => d.sourceIds),
      notes: `${analysis.duplicates.length} duplicate groups detected`,
    });

    // Format diversity trait
    traits.push({
      category: 'data_quality',
      name: 'format_diversity',
      value: analysis.coverage.formatDiversity.score,
      confidence: analysis.coverage.formatDiversity.hasVariety ? 0.9 : 0.5,
      sources: [],
      notes: analysis.coverage.formatDiversity.hasVariety
        ? 'Good variety of source formats'
        : 'Limited format diversity',
    });

    // Temporal spread trait
    if (
      analysis.coverage.temporalDistribution.earliestDate &&
      analysis.coverage.temporalDistribution.latestDate
    ) {
      traits.push({
        category: 'data_quality',
        name: 'temporal_spread',
        value: analysis.coverage.temporalDistribution.spreadScore,
        confidence: 0.7,
        sources: [],
        notes: `Content spans from ${analysis.coverage.temporalDistribution.earliestDate.toLocaleDateString()} to ${analysis.coverage.temporalDistribution.latestDate.toLocaleDateString()}`,
      });
    }

    return traits;
  }

  /**
   * Collect evidence from sources
   */
  private collectEvidence(
    data: ExtractedData[],
    sourceQuality: SourceQuality[]
  ): Evidence[] {
    const evidence: Evidence[] = [];

    // Get top quality sources
    const topSources = sourceQuality
      .filter((sq) => sq.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    topSources.forEach((sq) => {
      const source = data.find((d) => d.id === sq.sourceId);
      if (source) {
        const excerpt =
          source.content.length > 200
            ? source.content.substring(0, 200) + '...'
            : source.content;

        evidence.push({
          source: source.id,
          excerpt,
          relevance: sq.score / 100,
          type: 'other',
        });
      }
    });

    return evidence;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(analysis: TimAnalysisResult): string[] {
    const recommendations: string[] = [];

    // Quality recommendations
    const lowQualityCount = analysis.sourceQuality.filter(
      (sq) => sq.score < this.options.minQualityScore
    ).length;
    if (lowQualityCount > 0) {
      recommendations.push(
        `Remove or improve ${lowQualityCount} low-quality sources (score < ${this.options.minQualityScore})`
      );
    }

    // Duplicate recommendations
    if (analysis.duplicates.length > 0) {
      const duplicateCount = analysis.duplicates.reduce(
        (sum, d) => sum + d.sourceIds.length - 1,
        0
      );
      recommendations.push(
        `Remove ${duplicateCount} duplicate sources (${analysis.duplicates.length} groups identified)`
      );
    }

    // Coverage recommendations
    analysis.coverage.gaps.forEach((gap) => {
      recommendations.push(gap.recommendation);
    });

    // Format diversity recommendations
    if (!analysis.coverage.formatDiversity.hasVariety) {
      recommendations.push(
        'Add sources in different formats (documents, videos, audio) for richer analysis'
      );
    }

    // Temporal recommendations
    if (analysis.coverage.temporalDistribution.spreadScore < 50) {
      recommendations.push(
        'Include content from a wider time range to capture personality evolution'
      );
    }

    // General recommendations
    if (analysis.sourceQuality.length < 5) {
      recommendations.push(
        'Consider adding more sources for a more comprehensive analysis'
      );
    }

    // Prioritization recommendation
    if (analysis.prioritizedSources.length > 0) {
      recommendations.push(
        `Focus analysis on top ${Math.min(5, analysis.prioritizedSources.length)} prioritized sources`
      );
    }

    return recommendations;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    sourceQuality: SourceQuality[],
    coverage: CoverageResult
  ): number {
    // Factors affecting confidence:
    // 1. Number of quality sources
    const qualityRatio =
      sourceQuality.filter((sq) => sq.score >= 50).length / sourceQuality.length;

    // 2. Coverage score
    const coverageFactor = coverage.score / 100;

    // 3. Source count factor (diminishing returns)
    const countFactor = Math.min(1, sourceQuality.length / 10);

    // Weighted average
    const confidence = calculateWeightedScore([
      { score: qualityRatio * 100, weight: 0.4 },
      { score: coverageFactor * 100, weight: 0.35 },
      { score: countFactor * 100, weight: 0.25 },
    ]);

    return Math.round(confidence) / 100;
  }

  /**
   * Calculate average quality score
   */
  private calculateAverageQuality(sourceQuality: SourceQuality[]): number {
    if (sourceQuality.length === 0) return 0;
    return Math.round(
      sourceQuality.reduce((sum, sq) => sum + sq.score, 0) / sourceQuality.length
    );
  }
}

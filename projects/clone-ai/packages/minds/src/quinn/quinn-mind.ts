/**
 * @fileoverview Quinn Mind - Quality Assurance
 * @description Validates analysis quality, identifies gaps, and ensures consistency
 * @module @clone-lab/minds/quinn
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
  ValidationIssue,
} from '../base/index.js';
import type {
  QualityIssue,
  CoverageGap,
  ConsistencyCheckResult,
  QualityReport,
  QualityBreakdown,
  RedFlag,
  QuinnOptions,
  InconsistencyDetail,
} from './types.js';
import {
  DEFAULT_QUALITY_THRESHOLDS,
} from './types.js';

/**
 * Quinn Mind - Quality Assurance Specialist
 *
 * Quinn validates the quality of analysis from other Minds, identifies coverage gaps,
 * checks consistency across analytical perspectives, and ensures overall quality
 * before the final Clone DNA is synthesized.
 *
 * Dependencies: tim, daniel, brene, barbara (needs all analysis for validation)
 */
export class QuinnMind implements IMind {
  readonly persona: MindPersona = {
    id: 'quinn',
    name: 'Quinn',
    inspiration: 'Quality engineering principles',
    expertise: [
      'Quality validation',
      'Consistency checking',
      'Edge case detection',
      'Heuristic verification',
    ],
    tone: 'analytical',
    description: 'Validates analysis quality and ensures consistency across all Minds',
    version: '1.0.0',
  };

  private options: QuinnOptions;
  private startTime: number = 0;

  constructor(options: Partial<QuinnOptions> = {}) {
    this.options = { ...DEFAULT_QUALITY_THRESHOLDS, ...options };
  }

  /**
   * Perform quality analysis on all previous Mind results
   */
  async analyze(context: MindContext): Promise<MindResult> {
    this.startTime = Date.now();

    // Verify we have previous results to validate
    if (!context.previousResults || context.previousResults.size === 0) {
      return this.createEmptyResult('No previous results to validate');
    }

    // 1. Validate quality of each Mind's results
    const qualityIssues = await this.validateQuality(context.previousResults);

    // 2. Identify coverage gaps
    const gaps = await this.identifyGaps(context);

    // 3. Check consistency across all minds
    const consistencyResults = await this.checkConsistency(context.previousResults);

    // 4. Detect red flags
    const redFlags = await this.detectRedFlags(context.previousResults, context.extractedData);

    // 5. Calculate quality breakdown
    const breakdown = this.calculateQualityBreakdown(
      qualityIssues,
      gaps,
      consistencyResults,
      redFlags,
      context
    );

    // 6. Build quality report
    const report = this.buildQualityReport(
      breakdown,
      qualityIssues,
      gaps,
      consistencyResults,
      redFlags
    );

    // 7. Generate traits from quality analysis
    const traits = this.generateQualityTraits(report);

    // 8. Collect all evidence
    const evidence = this.collectEvidence(context.previousResults);

    // 9. Generate recommendations
    const recommendations = this.generateRecommendations(report);

    return {
      mindId: 'quinn',
      traits,
      confidence: report.overallScore / 100,
      evidence,
      recommendations,
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version || '1.0.0',
        statistics: {
          executionTimeMs: Date.now() - this.startTime,
          itemsProcessed: context.previousResults.size,
          traitsExtracted: traits.length,
          averageConfidence: report.overallScore / 100,
        },
        qualityScore: report.overallScore,
        issuesFound: qualityIssues.length,
        gapsIdentified: gaps.length,
        consistencyScore: breakdown.consistency,
        redFlagsFound: redFlags.length,
        passed: report.passed,
      },
    };
  }

  /**
   * Validate a MindResult for correctness and completeness
   */
  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check minimum requirements
    if (result.traits.length === 0) {
      issues.push({
        severity: 'error',
        code: 'Q001',
        message: 'No traits extracted in result',
        path: 'traits',
      });
      score -= 30;
    }

    if (result.evidence.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'Q002',
        message: 'No evidence provided in result',
        path: 'evidence',
      });
      score -= 20;
    }

    if (result.confidence < 0 || result.confidence > 1) {
      issues.push({
        severity: 'error',
        code: 'Q003',
        message: 'Confidence must be between 0 and 1',
        path: 'confidence',
      });
      score -= 15;
    }

    // Check trait quality
    for (const trait of result.traits) {
      if (trait.confidence < 0 || trait.confidence > 1) {
        issues.push({
          severity: 'warning',
          code: 'Q004',
          message: `Trait ${trait.name} has invalid confidence`,
          path: `traits.${trait.name}.confidence`,
        });
        score -= 5;
      }

      if (trait.sources.length === 0) {
        issues.push({
          severity: 'warning',
          code: 'Q005',
          message: `Trait ${trait.name} has no source references`,
          path: `traits.${trait.name}.sources`,
        });
        score -= 5;
      }
    }

    return {
      valid: score >= 50 && !issues.some((i) => i.severity === 'error'),
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Check if Quinn can handle the given context
   */
  canHandle(context: MindContext): boolean {
    // Quinn needs previous results from analysis minds
    if (!context.previousResults || context.previousResults.size === 0) {
      return false;
    }

    // Check for at least one analysis mind
    const requiredMinds: MindId[] = ['tim', 'daniel', 'brene', 'barbara'];
    return requiredMinds.some((mindId) => context.previousResults?.has(mindId));
  }

  /**
   * Get the list of Minds that must run before Quinn
   */
  getDependencies(): MindId[] {
    return ['tim', 'daniel', 'brene', 'barbara'];
  }

  /**
   * Validate quality of Mind results
   */
  private async validateQuality(
    results: Map<MindId, MindResult>
  ): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];

    results.forEach((result, mindId) => {
      // Check evidence coverage
      const traitsWithoutEvidence = result.traits.filter(
        (t) => t.sources.length < this.options.minimumEvidencePerTrait
      );

      traitsWithoutEvidence.forEach((trait) => {
        issues.push({
          id: `qi-${issues.length + 1}`,
          type: 'missing-evidence',
          severity: 'medium',
          description: `Trait "${trait.name}" has insufficient evidence (${trait.sources.length}/${this.options.minimumEvidencePerTrait})`,
          sourceMind: mindId,
          affectedItems: [trait.name],
          recommendation: `Add more supporting evidence for trait "${trait.name}"`,
        });
      });

      // Check confidence calibration
      const lowConfidenceTraits = result.traits.filter(
        (t) => t.confidence < 0.3 && t.sources.length > 2
      );

      lowConfidenceTraits.forEach((trait) => {
        issues.push({
          id: `qi-${issues.length + 1}`,
          type: 'low-confidence',
          severity: 'low',
          description: `Trait "${trait.name}" has low confidence despite good evidence`,
          sourceMind: mindId,
          affectedItems: [trait.name],
          recommendation: `Review confidence calibration for trait "${trait.name}"`,
        });
      });

      // Check for empty results
      if (result.traits.length === 0) {
        issues.push({
          id: `qi-${issues.length + 1}`,
          type: 'insufficient-coverage',
          severity: 'high',
          description: `${mindId} produced no traits`,
          sourceMind: mindId,
          affectedItems: [],
          recommendation: `Review ${mindId} analysis for issues`,
        });
      }
    });

    return issues;
  }

  /**
   * Identify coverage gaps in the analysis
   */
  private async identifyGaps(context: MindContext): Promise<CoverageGap[]> {
    const gaps: CoverageGap[] = [];
    const results = context.previousResults;
    if (!results) return gaps;

    // Collect all trait categories
    const categories = new Set<string>();
    results.forEach((result) => {
      result.traits.forEach((trait) => {
        categories.add(trait.category);
      });
    });

    // Check for expected categories
    const expectedCategories = [
      'communication',
      'values',
      'behavior',
      'emotional',
      'cognitive',
      'interpersonal',
    ];

    expectedCategories.forEach((expected) => {
      if (!categories.has(expected)) {
        gaps.push({
          id: `gap-${gaps.length + 1}`,
          name: `Missing ${expected} analysis`,
          category: 'missing-traits',
          description: `No traits found in the "${expected}" category`,
          impact: 0.6,
          suggestions: [
            `Analyze source data for ${expected} patterns`,
            `Request additional data sources for ${expected} traits`,
          ],
          relatedMinds: this.getRelatedMindsForCategory(expected),
        });
      }
    });

    // Check for unanalyzed data
    const analyzedSourceIds = new Set<string>();
    results.forEach((result) => {
      result.traits.forEach((trait) => {
        trait.sources.forEach((s) => analyzedSourceIds.add(s));
      });
    });

    const unanalyzedData = context.extractedData.filter(
      (d) => !analyzedSourceIds.has(d.id)
    );

    if (unanalyzedData.length > context.extractedData.length * 0.2) {
      gaps.push({
        id: `gap-${gaps.length + 1}`,
        name: 'Unanalyzed source data',
        category: 'unanalyzed-data',
        description: `${unanalyzedData.length} data items were not used in analysis`,
        impact: 0.5,
        suggestions: [
          'Review unanalyzed data for relevant patterns',
          'Check if data format is compatible with analysis',
        ],
        relatedMinds: ['tim', 'daniel'],
      });
    }

    // Check for low confidence areas
    results.forEach((result, mindId) => {
      const avgConfidence =
        result.traits.reduce((sum, t) => sum + t.confidence, 0) /
        (result.traits.length || 1);

      if (avgConfidence < 0.5) {
        gaps.push({
          id: `gap-${gaps.length + 1}`,
          name: `Low confidence in ${mindId}`,
          category: 'low-confidence',
          description: `${mindId} analysis has average confidence of ${(avgConfidence * 100).toFixed(0)}%`,
          impact: 0.7,
          suggestions: [
            'Review source data quality',
            'Consider additional data sources',
          ],
          relatedMinds: [mindId],
        });
      }
    });

    return gaps;
  }

  /**
   * Check consistency across Mind results
   */
  private async checkConsistency(
    results: Map<MindId, MindResult>
  ): Promise<ConsistencyCheckResult[]> {
    const checkResults: ConsistencyCheckResult[] = [];

    if (results.size < 2) {
      return checkResults;
    }

    // Check trait alignment
    const traitAlignment = this.checkTraitAlignment(results);
    checkResults.push(traitAlignment);

    // Check confidence correlation
    const confidenceCorrelation = this.checkConfidenceCorrelation(results);
    checkResults.push(confidenceCorrelation);

    // Check evidence overlap
    const evidenceOverlap = this.checkEvidenceOverlap(results);
    checkResults.push(evidenceOverlap);

    return checkResults;
  }

  /**
   * Check alignment of traits across minds
   */
  private checkTraitAlignment(results: Map<MindId, MindResult>): ConsistencyCheckResult {
    const inconsistencies: InconsistencyDetail[] = [];
    const mindIds = Array.from(results.keys());

    // Collect trait values by name
    const traitValues = new Map<string, Map<MindId, unknown>>();

    results.forEach((result, mindId) => {
      result.traits.forEach((trait) => {
        const key = `${trait.category}:${trait.name}`;
        if (!traitValues.has(key)) {
          traitValues.set(key, new Map());
        }
        traitValues.get(key)!.set(mindId, trait.value);
      });
    });

    // Check for contradictory values
    traitValues.forEach((values, traitKey) => {
      if (values.size > 1) {
        // Check for potential contradictions in boolean/string values
        const vals = Array.from(values.values());
        const hasContradiction =
          vals.some((v) => v === true) && vals.some((v) => v === false);

        if (hasContradiction) {
          inconsistencies.push({
            description: `Contradictory values for ${traitKey}`,
            involvedMinds: Array.from(values.keys()),
            item: traitKey,
            values: Object.fromEntries(values) as Record<MindId, unknown>,
            severity: 'high',
          });
        }
      }
    });

    const score = Math.max(0, 100 - inconsistencies.length * 15);

    return {
      check: {
        id: 'cc-001',
        name: 'Trait Alignment',
        mindIds: mindIds,
        type: 'trait-alignment',
        tolerance: 0.8,
      },
      passed: inconsistencies.length <= this.options.maximumInconsistencies,
      score: score / 100,
      inconsistencies,
    };
  }

  /**
   * Check confidence correlation across minds
   */
  private checkConfidenceCorrelation(results: Map<MindId, MindResult>): ConsistencyCheckResult {
    const inconsistencies: InconsistencyDetail[] = [];
    const mindIds = Array.from(results.keys());

    // Calculate average confidence per mind
    const avgConfidences = new Map<MindId, number>();

    results.forEach((result, mindId) => {
      const avg =
        result.traits.reduce((sum, t) => sum + t.confidence, 0) /
        (result.traits.length || 1);
      avgConfidences.set(mindId, avg);
    });

    // Check for large confidence disparities
    const confidences = Array.from(avgConfidences.values());
    const maxConf = Math.max(...confidences);
    const minConf = Math.min(...confidences);

    if (maxConf - minConf > 0.4) {
      inconsistencies.push({
        description: 'Large confidence disparity between minds',
        involvedMinds: mindIds,
        item: 'overall-confidence',
        values: Object.fromEntries(avgConfidences) as Record<MindId, unknown>,
        severity: 'medium',
      });
    }

    const score = Math.max(0, 100 - (maxConf - minConf) * 100);

    return {
      check: {
        id: 'cc-002',
        name: 'Confidence Correlation',
        mindIds: mindIds,
        type: 'confidence-correlation',
        tolerance: 0.3,
      },
      passed: maxConf - minConf <= 0.4,
      score: score / 100,
      inconsistencies,
    };
  }

  /**
   * Check evidence overlap across minds
   */
  private checkEvidenceOverlap(results: Map<MindId, MindResult>): ConsistencyCheckResult {
    const inconsistencies: InconsistencyDetail[] = [];
    const mindIds = Array.from(results.keys());

    // Collect source IDs used by each mind
    const sourceUsage = new Map<MindId, Set<string>>();

    results.forEach((result, mindId) => {
      const sources = new Set<string>();
      result.traits.forEach((trait) => {
        trait.sources.forEach((s) => sources.add(s));
      });
      sourceUsage.set(mindId, sources);
    });

    // Calculate overlap
    const allSources = new Set<string>();
    sourceUsage.forEach((sources) => {
      sources.forEach((s) => allSources.add(s));
    });

    const avgUsage =
      Array.from(sourceUsage.values()).reduce(
        (sum, sources) => sum + sources.size,
        0
      ) / sourceUsage.size;

    const overlapScore = allSources.size > 0
      ? avgUsage / allSources.size
      : 0;

    if (overlapScore < 0.3) {
      inconsistencies.push({
        description: 'Low evidence overlap between minds',
        involvedMinds: mindIds,
        item: 'evidence-overlap',
        values: Object.fromEntries(mindIds.map(id => [id, overlapScore])) as Record<MindId, unknown>,
        severity: 'low',
      });
    }

    return {
      check: {
        id: 'cc-003',
        name: 'Evidence Overlap',
        mindIds: mindIds,
        type: 'evidence-overlap',
        tolerance: 0.3,
      },
      passed: overlapScore >= 0.3,
      score: overlapScore,
      inconsistencies,
    };
  }

  /**
   * Detect red flags in the analysis
   */
  private async detectRedFlags(
    results: Map<MindId, MindResult>,
    _extractedData: unknown[]
  ): Promise<RedFlag[]> {
    const redFlags: RedFlag[] = [];

    // Check for contradictory traits within a single mind
    results.forEach((result, mindId) => {
      const traits = result.traits;

      // Check for potential contradictions
      const introvertTrait = traits.find(
        (t) => t.name.toLowerCase().includes('introvert')
      );
      const extrovertTrait = traits.find(
        (t) => t.name.toLowerCase().includes('extrovert')
      );

      if (introvertTrait && extrovertTrait) {
        const bothHigh =
          introvertTrait.confidence > 0.7 && extrovertTrait.confidence > 0.7;

        if (bothHigh) {
          redFlags.push({
            id: `rf-${redFlags.length + 1}`,
            type: 'contradictory-traits',
            description: `Both introvert and extrovert traits with high confidence detected in ${mindId}`,
            confidence: 0.8,
            evidence: [
              {
                source: mindId,
                excerpt: `${introvertTrait.name}: ${introvertTrait.value}, ${extrovertTrait.name}: ${extrovertTrait.value}`,
                relevance: 1,
              },
            ],
            action: 'investigate',
          });
        }
      }
    });

    // Check for unusually high or low confidence
    results.forEach((result, mindId) => {
      const allHighConfidence = result.traits.every((t) => t.confidence > 0.9);

      if (allHighConfidence && result.traits.length > 5) {
        redFlags.push({
          id: `rf-${redFlags.length + 1}`,
          type: 'unusual-patterns',
          description: `All traits in ${mindId} have very high confidence (>0.9)`,
          confidence: 0.6,
          evidence: [],
          action: 'warn',
        });
      }

      const allLowConfidence = result.traits.every((t) => t.confidence < 0.3);

      if (allLowConfidence && result.traits.length > 3) {
        redFlags.push({
          id: `rf-${redFlags.length + 1}`,
          type: 'confidence-mismatch',
          description: `All traits in ${mindId} have very low confidence (<0.3)`,
          confidence: 0.7,
          evidence: [],
          action: 'investigate',
        });
      }
    });

    return redFlags;
  }

  /**
   * Calculate quality breakdown scores
   */
  private calculateQualityBreakdown(
    issues: QualityIssue[],
    gaps: CoverageGap[],
    consistencyResults: ConsistencyCheckResult[],
    redFlags: RedFlag[],
    context: MindContext
  ): QualityBreakdown {
    // Completeness: based on coverage gaps
    const completeness = Math.max(
      0,
      100 - gaps.reduce((sum, g) => sum + g.impact * 20, 0)
    );

    // Consistency: average of consistency check scores
    const consistency =
      consistencyResults.length > 0
        ? consistencyResults.reduce((sum, r) => sum + r.score * 100, 0) /
          consistencyResults.length
        : 100;

    // Evidence quality: based on issues
    const evidenceIssues = issues.filter((i) => i.type === 'missing-evidence');
    const evidenceQuality = Math.max(
      0,
      100 - evidenceIssues.length * 15
    );

    // Confidence calibration: based on red flags and issues
    const confidenceIssues = issues.filter((i) => i.type === 'low-confidence');
    const confidenceRedFlags = redFlags.filter(
      (rf) => rf.type === 'confidence-mismatch'
    );
    const confidenceCalibration = Math.max(
      0,
      100 - confidenceIssues.length * 10 - confidenceRedFlags.length * 20
    );

    // Coverage: based on data utilization
    const results = context.previousResults;
    let coverage = 100;
    if (results && context.extractedData.length > 0) {
      const analyzedIds = new Set<string>();
      results.forEach((r) => {
        r.traits.forEach((t) => t.sources.forEach((s) => analyzedIds.add(s)));
      });
      coverage = (analyzedIds.size / context.extractedData.length) * 100;
    }

    return {
      completeness,
      consistency,
      evidenceQuality,
      confidenceCalibration,
      coverage,
    };
  }

  /**
   * Build the final quality report
   */
  private buildQualityReport(
    breakdown: QualityBreakdown,
    issues: QualityIssue[],
    gaps: CoverageGap[],
    consistencyResults: ConsistencyCheckResult[],
    redFlags: RedFlag[]
  ): QualityReport {
    // Calculate overall score as weighted average
    const weights = {
      completeness: 0.25,
      consistency: 0.25,
      evidenceQuality: 0.25,
      confidenceCalibration: 0.15,
      coverage: 0.10,
    };

    const overallScore =
      breakdown.completeness * weights.completeness +
      breakdown.consistency * weights.consistency +
      breakdown.evidenceQuality * weights.evidenceQuality +
      breakdown.confidenceCalibration * weights.confidenceCalibration +
      breakdown.coverage * weights.coverage;

    // Determine if passed
    const hasCriticalIssues = issues.some((i) => i.severity === 'critical');
    const hasBlockRedFlags = redFlags.some((rf) => rf.action === 'block');

    const passed =
      overallScore >= this.options.minimumOverallScore &&
      !hasCriticalIssues &&
      !hasBlockRedFlags;

    // Generate recommendations
    const recommendations: string[] = [];

    if (breakdown.completeness < 70) {
      recommendations.push('Address coverage gaps to improve analysis completeness');
    }

    if (breakdown.consistency < 70) {
      recommendations.push('Resolve inconsistencies between mind analyses');
    }

    if (breakdown.evidenceQuality < 70) {
      recommendations.push('Add more supporting evidence for extracted traits');
    }

    issues.forEach((issue) => {
      if (issue.severity === 'high' || issue.severity === 'critical') {
        recommendations.push(issue.recommendation);
      }
    });

    gaps.forEach((gap) => {
      if (gap.impact > 0.5) {
        recommendations.push(...gap.suggestions.slice(0, 1));
      }
    });

    return {
      overallScore,
      passed,
      breakdown,
      issues,
      gaps,
      consistencyResults,
      redFlags,
      recommendations: [...new Set(recommendations)].slice(0, 10),
      metadata: {
        timestamp: new Date(),
        quinnVersion: this.persona.version || '1.0.0',
        mindsAnalyzed: this.options.minimumEvidencePerTrait, // placeholder
        processingTimeMs: Date.now() - this.startTime,
      },
    };
  }

  /**
   * Generate quality traits from the report
   */
  private generateQualityTraits(report: QualityReport): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];

    // Add overall quality trait
    traits.push({
      category: 'quality',
      name: 'overall-quality-score',
      value: report.overallScore,
      confidence: report.overallScore / 100,
      sources: ['quinn-analysis'],
      notes: `Analysis ${report.passed ? 'passed' : 'failed'} quality threshold`,
    });

    // Add breakdown as traits
    Object.entries(report.breakdown).forEach(([key, value]) => {
      traits.push({
        category: 'quality-metrics',
        name: key,
        value: Math.round(value),
        confidence: value / 100,
        sources: ['quinn-analysis'],
      });
    });

    // Add counts as traits
    traits.push({
      category: 'quality-metrics',
      name: 'issues-found',
      value: report.issues.length,
      confidence: 1,
      sources: ['quinn-analysis'],
    });

    traits.push({
      category: 'quality-metrics',
      name: 'gaps-identified',
      value: report.gaps.length,
      confidence: 1,
      sources: ['quinn-analysis'],
    });

    traits.push({
      category: 'quality-metrics',
      name: 'red-flags',
      value: report.redFlags.length,
      confidence: 1,
      sources: ['quinn-analysis'],
    });

    return traits;
  }

  /**
   * Collect evidence from all previous results
   */
  private collectEvidence(results: Map<MindId, MindResult>): Evidence[] {
    const evidence: Evidence[] = [];

    results.forEach((result, mindId) => {
      // Add summary evidence from each mind
      evidence.push({
        source: mindId,
        excerpt: `${mindId} analyzed ${result.traits.length} traits with ${result.confidence.toFixed(2)} confidence`,
        relevance: 0.8,
        type: 'other',
      });

      // Include some high-relevance evidence from results
      result.evidence
        .filter((e) => e.relevance > 0.7)
        .slice(0, 3)
        .forEach((e) => {
          evidence.push({
            ...e,
            source: `${mindId}:${e.source}`,
          });
        });
    });

    return evidence;
  }

  /**
   * Generate recommendations based on the quality report
   */
  private generateRecommendations(report: QualityReport): string[] {
    const recommendations = [...report.recommendations];

    // Add general recommendations based on pass/fail
    if (!report.passed) {
      recommendations.unshift(
        'Analysis did not meet quality threshold - review issues and gaps'
      );
    }

    // Add red flag recommendations
    report.redFlags.forEach((flag) => {
      if (flag.action === 'investigate') {
        recommendations.push(`Investigate: ${flag.description}`);
      } else if (flag.action === 'warn') {
        recommendations.push(`Warning: ${flag.description}`);
      }
    });

    return recommendations;
  }

  /**
   * Get related minds for a trait category
   */
  private getRelatedMindsForCategory(category: string): MindId[] {
    const categoryMap: Record<string, MindId[]> = {
      communication: ['tim', 'daniel'],
      values: ['brene', 'barbara'],
      behavior: ['tim', 'daniel'],
      emotional: ['brene'],
      cognitive: ['daniel'],
      interpersonal: ['tim', 'brene'],
    };

    return categoryMap[category] || ['tim', 'daniel', 'brene', 'barbara'];
  }

  /**
   * Create an empty result for error cases
   */
  private createEmptyResult(reason: string): MindResult {
    return {
      mindId: 'quinn',
      traits: [
        {
          category: 'quality',
          name: 'validation-status',
          value: 'incomplete',
          confidence: 0,
          sources: [],
          notes: reason,
        },
      ],
      confidence: 0,
      evidence: [],
      recommendations: ['Provide previous Mind results for quality validation'],
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version || '1.0.0',
        warnings: [reason],
      },
    };
  }
}

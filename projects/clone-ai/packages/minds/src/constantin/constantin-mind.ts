/**
 * @fileoverview Constantin Mind - Implementation Pattern Analysis
 * @description Analyzes how things get done: patterns, preferences, and execution style
 * @module @clone-lab/minds/constantin
 *
 * Inspired by Constantin Stanislavski's methodical approach to understanding
 * human behavior through practical action and implementation.
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
  MindHealthStatus,
} from '../base/index.js';

import type {
  ConstantinMindOptions,
  ConstantinAnalysisResult,
  ImplementationPattern,
  TechnicalPreference,
  ToolChoice,
  ProblemSolvingApproach,
  ExecutionStyle,
  ResourceAllocation,
} from './types.js';

import {
  getAnalysisPrompts,
} from './prompts.js';

/**
 * Constantin Mind - The Implementation Analyst
 *
 * Analyzes implementation patterns, technical preferences, problem-solving
 * methodology, execution style, and resource allocation patterns.
 *
 * Dependencies:
 * - tim: Data extraction results
 * - charlie: Synthesis results for context
 */
export class ConstantinMind implements IMind {
  readonly persona: MindPersona = {
    id: 'constantin',
    name: 'Constantin',
    inspiration: 'Constantin Stanislavski',
    expertise: [
      'Implementation patterns',
      'Technical preferences',
      'Practical application',
      'Execution',
    ],
    tone: 'pragmatic',
    description:
      'Analyzes how things get done - patterns, preferences, and execution style',
    version: '1.0.0',
  };

  private options: ConstantinMindOptions;
  private initialized = false;

  constructor(options: ConstantinMindOptions = {}) {
    this.options = {
      patternConfidenceThreshold: 0.5,
      includeInferred: true,
      maxPatternsPerCategory: 5,
      analyzeAlternatives: true,
      ...options,
    };
  }

  /**
   * Initialize the Mind with configuration
   */
  async initialize(options: MindOptions): Promise<void> {
    this.options = {
      ...this.options,
      ...options,
    };
    this.initialized = true;
  }

  /**
   * Get the list of Mind IDs that must run before this Mind
   * Constantin requires Tim's extraction and Charlie's synthesis
   */
  getDependencies(): MindId[] {
    return ['tim', 'charlie'];
  }

  /**
   * Check if this Mind can handle the given context
   */
  canHandle(context: MindContext): boolean {
    // Need at least some extracted data to analyze
    if (context.extractedData.length === 0) {
      return false;
    }

    // Check if dependencies are satisfied
    const previousResults = context.previousResults;
    if (!previousResults) {
      return false;
    }

    // Require Tim's results
    if (!previousResults.has('tim')) {
      return false;
    }

    // Charlie is also required
    if (!previousResults.has('charlie')) {
      return false;
    }

    return true;
  }

  /**
   * Perform analysis on the provided context
   */
  async analyze(context: MindContext): Promise<MindResult> {
    const startTime = Date.now();

    // Get dependency results
    const timResult = context.previousResults?.get('tim');
    const charlieResult = context.previousResults?.get('charlie');

    // Prepare content for analysis
    const content = this.prepareContent(context);
    const previousResultsSummary = this.summarizePreviousResults(
      timResult,
      charlieResult
    );

    // Generate analysis prompts
    const prompts = getAnalysisPrompts(
      content,
      previousResultsSummary,
      this.options
    );

    // Perform analysis (in a real implementation, this would call an LLM)
    const analysisResult = await this.performAnalysis(
      content,
      previousResultsSummary,
      prompts
    );

    // Convert to MindResult format
    const result = this.convertToMindResult(
      analysisResult,
      context,
      startTime
    );

    return result;
  }

  /**
   * Validate a MindResult for correctness and completeness
   */
  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];
    let score = 100;

    // Check minimum requirements
    if (result.traits.length === 0) {
      issues.push({
        severity: 'error',
        code: 'NO_TRAITS',
        message: 'No traits were extracted from the analysis',
      });
      score -= 30;
    }

    // Check confidence levels
    const lowConfidenceTraits = result.traits.filter(
      (t) => t.confidence < 0.3
    );
    if (lowConfidenceTraits.length > result.traits.length * 0.5) {
      issues.push({
        severity: 'warning',
        code: 'LOW_CONFIDENCE',
        message: 'More than 50% of traits have low confidence (< 0.3)',
      });
      score -= 15;
    }

    // Check for evidence
    if (result.evidence.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'NO_EVIDENCE',
        message: 'No supporting evidence was provided',
      });
      score -= 20;
    }

    // Check for required categories
    const categories = new Set(result.traits.map((t) => t.category));
    const requiredCategories = [
      'implementation-pattern',
      'technical-preference',
      'problem-solving',
    ];
    for (const required of requiredCategories) {
      if (!categories.has(required)) {
        issues.push({
          severity: 'warning',
          code: 'MISSING_CATEGORY',
          message: `Missing required category: ${required}`,
          path: 'traits',
        });
        score -= 10;
      }
    }

    // Validate confidence score
    if (result.confidence < 0 || result.confidence > 1) {
      issues.push({
        severity: 'error',
        code: 'INVALID_CONFIDENCE',
        message: 'Confidence must be between 0 and 1',
        path: 'confidence',
      });
      score -= 20;
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
  async healthCheck(): Promise<MindHealthStatus> {
    return {
      mindId: this.persona.id,
      healthy: this.initialized,
      lastSuccess: this.initialized ? new Date() : undefined,
      error: this.initialized ? undefined : 'Mind not initialized',
    };
  }

  /**
   * Clean up resources when Mind is no longer needed
   */
  async dispose(): Promise<void> {
    this.initialized = false;
  }

  /**
   * Prepare content string from extracted data
   */
  private prepareContent(context: MindContext): string {
    return context.extractedData
      .map((data) => {
        const header = `[${data.sourceType}] ${data.id}`;
        const timestamp = data.timestamp
          ? ` (${data.timestamp.toISOString()})`
          : '';
        return `${header}${timestamp}\n${data.content}`;
      })
      .join('\n\n');
  }

  /**
   * Summarize previous Mind results for context
   */
  private summarizePreviousResults(
    timResult?: MindResult,
    charlieResult?: MindResult
  ): string {
    const parts: string[] = [];

    if (timResult) {
      parts.push(
        `Tim's Extraction Summary:\n` +
          `- ${timResult.traits.length} traits extracted\n` +
          `- ${timResult.evidence.length} evidence items\n` +
          `- Confidence: ${timResult.confidence.toFixed(2)}`
      );
    }

    if (charlieResult) {
      parts.push(
        `Charlie's Synthesis Summary:\n` +
          `- ${charlieResult.traits.length} synthesized traits\n` +
          `- ${charlieResult.recommendations.length} recommendations\n` +
          `- Confidence: ${charlieResult.confidence.toFixed(2)}`
      );
    }

    return parts.join('\n\n');
  }

  /**
   * Perform the core analysis
   * In a real implementation, this would call an LLM with the prompts
   */
  private async performAnalysis(
    _content: string,
    _previousResults: string,
    _prompts: Record<string, string>
  ): Promise<ConstantinAnalysisResult> {
    // This is a placeholder implementation
    // In production, this would analyze the content using LLM calls

    const implementationPatterns: ImplementationPattern[] = [
      {
        id: 'impl-001',
        category: 'iterative',
        name: 'Iterative Development',
        description: 'Prefers to work in cycles of improvement',
        confidence: 0.75,
        sources: [],
        examples: [],
        frequency: 0.8,
      },
    ];

    const technicalPreferences: TechnicalPreference[] = [
      {
        id: 'pref-001',
        type: 'methodology',
        name: 'Agile Development',
        strength: 0.8,
        context: 'General software development',
        evidence: [],
        relatedTo: [],
        explicit: true,
      },
    ];

    const toolChoices: ToolChoice[] = [
      {
        id: 'tool-001',
        category: 'version-control',
        name: 'Git',
        usage: 'Version control and collaboration',
        confidence: 0.95,
        whenUsed: 'All projects',
        alternatives: ['Mercurial', 'SVN'],
      },
    ];

    const problemSolving: ProblemSolvingApproach = {
      primaryMethod: 'analytical',
      secondaryMethods: ['research-oriented', 'systematic'],
      description: 'Approaches problems by breaking them down systematically',
      confidence: 0.7,
      evidence: [],
    };

    const executionStyle: ExecutionStyle = {
      dominantTraits: ['methodical', 'thorough'],
      description: 'Methodical and thorough execution style',
      speedPreference: 3,
      qualityVsSpeed: 0.7,
      riskTolerance: 0.4,
      confidence: 0.75,
    };

    const resourceAllocation: ResourceAllocation = {
      pattern: 'prioritized',
      timeManagement: 'Focus on high-priority items first',
      effortDistribution: 'Concentrated effort on key deliverables',
      priorityHandling: 'Clear prioritization framework',
      confidence: 0.65,
    };

    return {
      implementationPatterns,
      technicalPreferences,
      toolChoices,
      problemSolving,
      executionStyle,
      resourceAllocation,
      profileSummary:
        'A pragmatic developer who prefers iterative development with a methodical approach. Values quality over speed, with moderate risk tolerance.',
      overallConfidence: 0.72,
    };
  }

  /**
   * Convert analysis result to MindResult format
   */
  private convertToMindResult(
    analysis: ConstantinAnalysisResult,
    context: MindContext,
    startTime: number
  ): MindResult {
    const traits: PersonalityTrait[] = [];

    // Convert implementation patterns to traits
    for (const pattern of analysis.implementationPatterns) {
      if (pattern.confidence >= (this.options.patternConfidenceThreshold ?? 0.5)) {
        traits.push({
          category: 'implementation-pattern',
          name: pattern.name,
          value: pattern.category,
          confidence: pattern.confidence,
          sources: pattern.sources,
          notes: pattern.description,
        });
      }
    }

    // Convert technical preferences to traits
    for (const pref of analysis.technicalPreferences) {
      if (this.options.includeInferred || pref.explicit) {
        traits.push({
          category: 'technical-preference',
          name: pref.name,
          value: pref.type,
          confidence: pref.strength,
          sources: pref.evidence,
          notes: pref.context,
        });
      }
    }

    // Convert tool choices to traits
    for (const tool of analysis.toolChoices) {
      traits.push({
        category: 'tool-preference',
        name: tool.name,
        value: tool.category,
        confidence: tool.confidence,
        sources: [],
        notes: `${tool.usage}. Alternatives: ${tool.alternatives.join(', ') || 'none'}`,
      });
    }

    // Add problem-solving trait
    traits.push({
      category: 'problem-solving',
      name: 'Primary Method',
      value: analysis.problemSolving.primaryMethod,
      confidence: analysis.problemSolving.confidence,
      sources: analysis.problemSolving.evidence,
      notes: analysis.problemSolving.description,
    });

    // Add execution style traits
    traits.push({
      category: 'execution-style',
      name: 'Dominant Traits',
      value: analysis.executionStyle.dominantTraits.join(', '),
      confidence: analysis.executionStyle.confidence,
      sources: [],
      notes: analysis.executionStyle.description,
    });

    // Add resource allocation trait
    traits.push({
      category: 'resource-allocation',
      name: 'Allocation Pattern',
      value: analysis.resourceAllocation.pattern,
      confidence: analysis.resourceAllocation.confidence,
      sources: [],
      notes: analysis.resourceAllocation.timeManagement,
    });

    // Build evidence list
    const evidence: Evidence[] = context.extractedData.map((data) => ({
      source: data.id,
      excerpt: data.content.substring(0, 200),
      relevance: 0.8,
      type: 'behavior' as const,
    }));

    // Build recommendations
    const recommendations = this.generateRecommendations(analysis);

    return {
      mindId: this.persona.id,
      traits,
      confidence: analysis.overallConfidence,
      evidence,
      recommendations,
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version ?? '1.0.0',
        statistics: {
          executionTimeMs: Date.now() - startTime,
          itemsProcessed: context.extractedData.length,
          traitsExtracted: traits.length,
          averageConfidence:
            traits.reduce((sum, t) => sum + t.confidence, 0) / traits.length,
        },
        analysisDetails: {
          implementationPatternCount: analysis.implementationPatterns.length,
          technicalPreferenceCount: analysis.technicalPreferences.length,
          toolChoiceCount: analysis.toolChoices.length,
          profileSummary: analysis.profileSummary,
        },
      },
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    analysis: ConstantinAnalysisResult
  ): string[] {
    const recommendations: string[] = [];

    // Recommendations based on implementation patterns
    if (analysis.implementationPatterns.some((p) => p.category === 'iterative')) {
      recommendations.push(
        'Leverage iterative approach by breaking work into smaller increments'
      );
    }

    // Recommendations based on execution style
    if (analysis.executionStyle.qualityVsSpeed > 0.7) {
      recommendations.push(
        'Balance quality focus with delivery timelines using time-boxing'
      );
    }

    // Recommendations based on risk tolerance
    if (analysis.executionStyle.riskTolerance < 0.3) {
      recommendations.push(
        'Consider controlled experiments to increase innovation potential'
      );
    }

    // Recommendations based on problem-solving
    if (analysis.problemSolving.primaryMethod === 'analytical') {
      recommendations.push(
        'Complement analytical approach with creative brainstorming sessions'
      );
    }

    return recommendations;
  }
}

/**
 * Factory function to create a Constantin Mind instance
 */
export function createConstantinMind(
  options?: ConstantinMindOptions
): ConstantinMind {
  return new ConstantinMind(options);
}

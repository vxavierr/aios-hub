/**
 * @fileoverview Victoria Mind - Feasibility Analysis
 * @description Analyzes trade-offs, constraints, and feasibility of decisions
 * @module @clone-lab/minds/victoria
 */

import type {
  IMind,
  MindPersona,
  MindContext,
  MindResult,
  ValidationResult,
  MindOptions,
  Evidence,
  PersonalityTrait,
  MindId,
} from '../base/index.js';
import type {
  TradeOff,
  Constraint,
  Risk,
  DecisionStyle,
  FeasibilityScore,
  VictoriaOptions,
  VictoriaResult,
} from './types.js';

/**
 * Victoria Mind - Feasibility Analyst
 *
 * Analyzes practical constraints, trade-offs, and risks to assess feasibility.
 * Named inspired by Victoria (victory), representing practical achievement.
 */
export class VictoriaMind implements IMind {
  readonly persona: MindPersona = {
    id: 'victoria',
    name: 'Victoria',
    inspiration: 'Pragmatic feasibility analyst',
    expertise: [
      'feasibility-analysis',
      'trade-off-assessment',
      'constraint-identification',
      'risk-evaluation',
      'decision-frameworks',
    ],
    tone: 'pragmatic',
    description: 'Assesses the practicality and viability of decisions and plans',
    version: '1.0.0',
  };

  private options: VictoriaOptions = {};

  async initialize(options?: MindOptions): Promise<void> {
    if (options) {
      this.options = {
        confidenceThreshold: options.confidenceThreshold ?? 0.5,
        includeMitigation: options.includeMitigation as boolean ?? true,
        analyzeDecisionStyle: options.analyzeDecisionStyle as boolean ?? true,
        dimensionWeights: options.dimensionWeights as VictoriaOptions['dimensionWeights'],
      };
    }
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }

  canHandle(context: MindContext): boolean {
    return context.extractedData.length > 0;
  }

  getDependencies(): MindId[] {
    return ['tim']; // Depends on Tim for data extraction
  }

  async analyze(context: MindContext): Promise<MindResult> {
    const startTime = Date.now();

    // Extract data content for analysis
    const content = context.extractedData
      .map(d => d.content)
      .join('\n\n');

    // Analyze trade-offs
    const tradeOffs = this.analyzeTradeOffs(content, context);

    // Identify constraints
    const constraints = this.identifyConstraints(content, context);

    // Assess risks
    const risks = this.assessRisks(content, context);

    // Analyze decision style
    const decisionStyle = this.analyzeDecisionStyle(content, context);

    // Calculate feasibility score
    const feasibility = this.calculateFeasibility(
      tradeOffs,
      constraints,
      risks,
      decisionStyle
    );

    // Generate insights
    const insights = this.generateInsights(
      tradeOffs,
      constraints,
      risks,
      feasibility
    );

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(
      tradeOffs,
      constraints,
      risks,
      decisionStyle
    );

    const executionTime = Date.now() - startTime;

    // Build traits from analysis
    const traits: PersonalityTrait[] = this.buildTraits(
      tradeOffs,
      constraints,
      risks,
      decisionStyle,
      feasibility
    );

    // Build evidence
    const evidence: Evidence[] = this.buildEvidence(context);

    const result: MindResult = {
      mindId: 'victoria',
      traits,
      confidence,
      evidence,
      recommendations: insights,
      metadata: {
        timestamp: new Date(),
        mindVersion: this.persona.version ?? '1.0.0',
        statistics: {
          executionTimeMs: executionTime,
          itemsProcessed: context.extractedData.length,
          traitsExtracted: traits.length,
          averageConfidence: confidence,
        },
        tradeOffs,
        constraints,
        risks,
        decisionStyle,
        feasibility,
      },
    };

    return result;
  }

  async validate(result: MindResult): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];

    // Check confidence threshold
    if (result.confidence < (this.options.confidenceThreshold ?? 0.5)) {
      issues.push({
        severity: 'warning',
        code: 'LOW_CONFIDENCE',
        message: `Overall confidence ${result.confidence} is below threshold`,
      });
    }

    // Check for required metadata
    const metadata = result.metadata as Partial<VictoriaResult>;
    if (!metadata.tradeOffs || metadata.tradeOffs.length === 0) {
      issues.push({
        severity: 'info',
        code: 'NO_TRADEOFFS',
        message: 'No trade-offs were identified',
      });
    }

    if (!metadata.constraints || metadata.constraints.length === 0) {
      issues.push({
        severity: 'info',
        code: 'NO_CONSTRAINTS',
        message: 'No constraints were identified',
      });
    }

    if (!metadata.feasibility) {
      issues.push({
        severity: 'error',
        code: 'MISSING_FEASIBILITY',
        message: 'Feasibility score is required',
      });
    }

    const score = Math.max(0, 100 - issues.filter(i => i.severity === 'error').length * 25);

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      score,
      issues,
    };
  }

  private analyzeTradeOffs(content: string, _context: MindContext): TradeOff[] {
    const tradeOffs: TradeOff[] = [];
    const lowerContent = content.toLowerCase();

    // Speed vs Quality
    if (lowerContent.includes('speed') || lowerContent.includes('fast') ||
        lowerContent.includes('quality') || lowerContent.includes('thorough')) {
      const prefersSpeed = (lowerContent.match(/fast|quick|speed|rapid/gi) || []).length;
      const prefersQuality = (lowerContent.match(/quality|thorough|detailed|careful/gi) || []).length;
      const preference = prefersSpeed / (prefersSpeed + prefersQuality + 1);

      tradeOffs.push({
        id: `tradeoff-speed-quality-${Date.now()}`,
        name: 'Speed vs Quality',
        description: 'Preference for fast delivery versus high quality output',
        factors: {
          primary: { name: 'Speed', description: 'Fast delivery', weight: 0.5 },
          secondary: { name: 'Quality', description: 'High quality output', weight: 0.5 },
        },
        preference,
        confidence: Math.min((prefersSpeed + prefersQuality) / 10, 0.8),
        sources: [],
      });
    }

    // Risk vs Reward
    if (lowerContent.includes('risk') || lowerContent.includes('safe') ||
        lowerContent.includes('reward') || lowerContent.includes('opportunity')) {
      const riskTakers = (lowerContent.match(/risk|opportunity|potential|reward/gi) || []).length;
      const riskAverse = (lowerContent.match(/safe|secure|cautious|careful/gi) || []).length;
      const preference = riskTakers / (riskTakers + riskAverse + 1);

      tradeOffs.push({
        id: `tradeoff-risk-reward-${Date.now()}`,
        name: 'Risk vs Reward',
        description: 'Tolerance for risk in pursuit of rewards',
        factors: {
          primary: { name: 'Risk Taking', description: 'Accepting uncertainty', weight: 0.5 },
          secondary: { name: 'Safety', description: 'Avoiding risk', weight: 0.5 },
        },
        preference,
        confidence: Math.min((riskTakers + riskAverse) / 10, 0.8),
        sources: [],
      });
    }

    return tradeOffs.filter(t => t.confidence >= (this.options.confidenceThreshold ?? 0.5));
  }

  private identifyConstraints(content: string, _context: MindContext): Constraint[] {
    const constraints: Constraint[] = [];
    const lowerContent = content.toLowerCase();

    // Time constraints
    if (lowerContent.includes('deadline') || lowerContent.includes('time') ||
        lowerContent.includes('urgent') || lowerContent.includes('asap')) {
      constraints.push({
        id: `constraint-time-${Date.now()}`,
        name: 'Time Constraint',
        type: 'time',
        severity: lowerContent.includes('urgent') ? 'hard' : 'soft',
        description: 'Time-related limitations or deadlines',
        value: 'limited',
        negotiable: !lowerContent.includes('urgent'),
        impact: 0.7,
        confidence: 0.6,
        sources: [],
      });
    }

    // Resource constraints
    if (lowerContent.includes('budget') || lowerContent.includes('resource') ||
        lowerContent.includes('money') || lowerContent.includes('cost')) {
      constraints.push({
        id: `constraint-resource-${Date.now()}`,
        name: 'Resource Constraint',
        type: 'resource',
        severity: 'soft',
        description: 'Budget or resource limitations',
        value: 'limited',
        negotiable: true,
        impact: 0.6,
        confidence: 0.6,
        sources: [],
      });
    }

    // Skill constraints
    if (lowerContent.includes('skill') || lowerContent.includes('learn') ||
        lowerContent.includes('experience') || lowerContent.includes('training')) {
      constraints.push({
        id: `constraint-skill-${Date.now()}`,
        name: 'Skill Constraint',
        type: 'skill',
        severity: 'flexible',
        description: 'Knowledge or expertise gaps',
        value: 'can improve',
        negotiable: true,
        impact: 0.5,
        confidence: 0.5,
        sources: [],
      });
    }

    return constraints;
  }

  private assessRisks(content: string, _context: MindContext): Risk[] {
    const risks: Risk[] = [];
    const lowerContent = content.toLowerCase();

    // Technical risks
    if (lowerContent.includes('technical') || lowerContent.includes('technology') ||
        lowerContent.includes('system') || lowerContent.includes('software')) {
      risks.push({
        id: `risk-technical-${Date.now()}`,
        name: 'Technical Risk',
        category: 'technical',
        probability: 'medium',
        impact: 'moderate',
        score: 0.5,
        consequences: 'Technical challenges may delay or complicate implementation',
        mitigation: 'Ensure adequate technical review and testing',
        acceptable: true,
        confidence: 0.6,
        sources: [],
      });
    }

    // Operational risks
    if (lowerContent.includes('process') || lowerContent.includes('workflow') ||
        lowerContent.includes('operation')) {
      risks.push({
        id: `risk-operational-${Date.now()}`,
        name: 'Operational Risk',
        category: 'operational',
        probability: 'low',
        impact: 'minor',
        score: 0.3,
        consequences: 'Process disruptions may occur',
        mitigation: 'Establish backup procedures',
        acceptable: true,
        confidence: 0.5,
        sources: [],
      });
    }

    return risks;
  }

  private analyzeDecisionStyle(content: string, _context: MindContext): DecisionStyle {
    const lowerContent = content.toLowerCase();

    // Determine framework preference
    let framework: DecisionStyle['framework'] = 'analytical';
    if (lowerContent.includes('data') || lowerContent.includes('analysis')) {
      framework = 'data-driven';
    } else if (lowerContent.includes('team') || lowerContent.includes('collaborate')) {
      framework = 'collaborative';
    } else if (lowerContent.includes('intuition') || lowerContent.includes('gut')) {
      framework = 'intuitive';
    }

    // Calculate dimensions
    const infoSeekingWords = (lowerContent.match(/research|investigate|analyze|study/gi) || []).length;
    const riskWords = (lowerContent.match(/risk|opportunity|chance|try/gi) || []).length;
    const quickWords = (lowerContent.match(/quick|fast|immediately|now/gi) || []).length;
    const teamWords = (lowerContent.match(/team|together|collaborate|discuss/gi) || []).length;
    const decideWords = (lowerContent.match(/decide|decision|choice|final/gi) || []).length;

    const totalWords = content.split(/\s+/).length;

    return {
      framework,
      informationSeeking: Math.min(infoSeekingWords / (totalWords / 100), 1),
      riskTolerance: Math.min(riskWords / (totalWords / 50), 1),
      decisionSpeed: Math.min(quickWords / (totalWords / 100), 1),
      collaborationPreference: Math.min(teamWords / (totalWords / 100), 1),
      decisiveness: Math.min(decideWords / (totalWords / 100), 1),
      confidence: 0.6,
      sources: [],
    };
  }

  private calculateFeasibility(
    tradeOffs: TradeOff[],
    constraints: Constraint[],
    risks: Risk[],
    _decisionStyle: DecisionStyle
  ): FeasibilityScore {
    // Calculate dimension scores
    const hardConstraints = constraints.filter(c => c.severity === 'hard');
    const highRisks = risks.filter(r => r.score >= 0.6);

    const technical = Math.max(20, 100 - highRisks.length * 15);
    const resource = Math.max(20, 100 - constraints.filter(c => c.type === 'resource').length * 20);
    const time = Math.max(20, 100 - hardConstraints.filter(c => c.type === 'time').length * 25);
    const risk = Math.max(20, 100 - highRisks.length * 20);
    const strategic = 70; // Default moderate strategic alignment

    const overall = (technical + resource + time + risk + strategic) / 5;

    let recommendation: FeasibilityScore['recommendation'];
    if (overall >= 80) {
      recommendation = 'proceed';
    } else if (overall >= 60) {
      recommendation = 'proceed-with-caution';
    } else if (overall >= 40) {
      recommendation = 'reconsider';
    } else {
      recommendation = 'not-feasible';
    }

    return {
      overall,
      dimensions: { technical, resource, time, risk, strategic },
      keyFactors: [
        `${hardConstraints.length} hard constraints identified`,
        `${highRisks.length} high-risk items`,
        `${tradeOffs.length} trade-offs to consider`,
      ],
      confidence: 0.7,
      recommendation,
      rationale: `Based on ${constraints.length} constraints and ${risks.length} risks identified`,
    };
  }

  private generateInsights(
    tradeOffs: TradeOff[],
    constraints: Constraint[],
    risks: Risk[],
    feasibility: FeasibilityScore
  ): string[] {
    const insights: string[] = [];

    // Feasibility insight
    insights.push(`Overall feasibility: ${feasibility.overall.toFixed(0)}% - ${feasibility.recommendation.replace(/-/g, ' ')}`);

    // Constraint insight
    const hardConstraints = constraints.filter(c => c.severity === 'hard');
    if (hardConstraints.length > 0) {
      insights.push(`${hardConstraints.length} hard constraints require attention: ${hardConstraints.map(c => c.name).join(', ')}`);
    }

    // Risk insight
    const highRisks = risks.filter(r => r.score >= 0.6);
    if (highRisks.length > 0) {
      insights.push(`${highRisks.length} high-impact risks identified requiring mitigation`);
    }

    // Trade-off insight
    if (tradeOffs.length > 0) {
      const mainTradeOff = tradeOffs[0];
      const preference = mainTradeOff.preference < 0.5
        ? mainTradeOff.factors.primary.name
        : mainTradeOff.factors.secondary.name;
      insights.push(`Primary trade-off preference: ${mainTradeOff.name} favors ${preference}`);
    }

    return insights;
  }

  private calculateOverallConfidence(
    tradeOffs: TradeOff[],
    constraints: Constraint[],
    risks: Risk[],
    decisionStyle: DecisionStyle
  ): number {
    const tradeOffConfidence = tradeOffs.length > 0
      ? tradeOffs.reduce((sum, t) => sum + t.confidence, 0) / tradeOffs.length
      : 0.5;

    const constraintConfidence = constraints.length > 0
      ? constraints.reduce((sum, c) => sum + c.confidence, 0) / constraints.length
      : 0.5;

    const riskConfidence = risks.length > 0
      ? risks.reduce((sum, r) => sum + r.confidence, 0) / risks.length
      : 0.5;

    return (tradeOffConfidence + constraintConfidence + riskConfidence + decisionStyle.confidence) / 4;
  }

  private buildTraits(
    _tradeOffs: TradeOff[],
    constraints: Constraint[],
    _risks: Risk[],
    decisionStyle: DecisionStyle,
    feasibility: FeasibilityScore
  ): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];

    // Decision framework trait
    traits.push({
      category: 'decision-making',
      name: 'decisionFramework',
      value: decisionStyle.framework,
      confidence: decisionStyle.confidence,
      sources: decisionStyle.sources,
    });

    // Risk tolerance trait
    traits.push({
      category: 'risk',
      name: 'riskTolerance',
      value: decisionStyle.riskTolerance,
      confidence: decisionStyle.confidence,
      sources: decisionStyle.sources,
    });

    // Feasibility trait
    traits.push({
      category: 'feasibility',
      name: 'overallFeasibility',
      value: feasibility.overall,
      confidence: feasibility.confidence,
      sources: [],
    });

    // Constraint count trait
    traits.push({
      category: 'constraints',
      name: 'constraintCount',
      value: constraints.length,
      confidence: 0.8,
      sources: [],
    });

    return traits;
  }

  private buildEvidence(context: MindContext): Evidence[] {
    return context.extractedData.slice(0, 5).map((data, index) => ({
      source: data.id,
      excerpt: data.content.slice(0, 200),
      relevance: 1 - (index * 0.1),
      type: data.sourceType === 'chat' ? 'quote' : 'behavior',
    }));
  }
}

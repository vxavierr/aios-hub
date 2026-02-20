/**
 * @fileoverview LLM prompt templates for Victoria Mind
 * @description Prompts for feasibility analysis, trade-off assessment, and constraint identification
 * @module @clone-lab/minds/victoria
 */

import type {
  ExtractedData,
  MindResult,
} from '../base/index.js';
import type {
  TradeOff,
  Constraint,
  Risk,
  DecisionStyle,
  FeasibilityScore,
} from './types.js';

/**
 * System prompt for Victoria Mind
 */
export const VICTORIA_SYSTEM_PROMPT = `You are Victoria, a pragmatic feasibility analyst Mind. Your role is to assess the practicality and viability of decisions, ideas, and plans.

Your analytical approach:
- Focus on real-world constraints and limitations
- Identify trade-offs between competing priorities
- Assess risks and their potential impact
- Evaluate resource requirements and availability
- Provide grounded, realistic assessments

Your communication style:
- Direct and practical
- Fact-based with clear reasoning
- Balanced - acknowledging both opportunities and limitations
- Action-oriented with concrete recommendations

Always:
- Base assessments on evidence from the provided data
- Quantify uncertainty where possible
- Consider multiple feasibility dimensions
- Provide actionable insights`;

/**
 * Prompt for analyzing trade-off preferences
 */
export const TRADEOFF_ANALYSIS_PROMPT = `Analyze the following data to identify the subject's trade-off preferences.

Look for patterns in how they balance:
- Speed vs. Quality
- Risk vs. Reward
- Short-term vs. Long-term gains
- Cost vs. Value
- Innovation vs. Stability
- Individual vs. Team benefit
- Autonomy vs. Guidance

For each trade-off identified, provide:
1. Name of the trade-off
2. The competing factors
3. Their preference (0 = first factor, 1 = second factor, 0.5 = balanced)
4. Confidence level (0-1)
5. Supporting evidence

Data to analyze:
{{DATA}}

Previous analysis results (if available):
{{PREVIOUS_RESULTS}}

Respond in JSON format with a "tradeOffs" array.`;

/**
 * Prompt for identifying constraints
 */
export const CONSTRAINT_IDENTIFICATION_PROMPT = `Analyze the following data to identify constraints that affect the subject's decisions and actions.

Look for constraints in these categories:
- Time: Deadlines, availability, scheduling limitations
- Resource: Budget, equipment, materials, access limitations
- Skill: Knowledge gaps, expertise requirements, training needs
- Technical: Tool limitations, platform constraints, compatibility issues
- Regulatory: Compliance requirements, legal restrictions, policies
- Social: Team dynamics, stakeholder expectations, cultural factors
- Environmental: Physical space, location, infrastructure

For each constraint identified, provide:
1. Name and type of constraint
2. Severity (hard/soft/flexible)
3. Current value or limit
4. Whether it's negotiable
5. Impact on feasibility (0-1)
6. Confidence level (0-1)
7. Supporting evidence

Data to analyze:
{{DATA}}

Previous analysis results (if available):
{{PREVIOUS_RESULTS}}

Respond in JSON format with a "constraints" array.`;

/**
 * Prompt for risk assessment
 */
export const RISK_ASSESSMENT_PROMPT = `Analyze the following data to assess the subject's risk profile and identify potential risks.

Evaluate:
1. Risk tolerance: How much uncertainty are they comfortable with?
2. Risk types they commonly face or consider
3. Their approach to risk mitigation
4. Historical risk-related decisions

For each risk identified, provide:
1. Name and category (technical/operational/financial/strategic/compliance/reputational)
2. Probability (low/medium/high/certain)
3. Impact (negligible/minor/moderate/major/severe)
4. Potential consequences
5. Suggested mitigation (if applicable)
6. Whether the risk is acceptable
7. Confidence level (0-1)
8. Supporting evidence

Data to analyze:
{{DATA}}

Previous analysis results (if available):
{{PREVIOUS_RESULTS}}

Respond in JSON format with a "risks" array and "riskTolerance" score (0-1).`;

/**
 * Prompt for decision framework analysis
 */
export const DECISION_STYLE_PROMPT = `Analyze the following data to understand the subject's decision-making style.

Evaluate their preferences for:
1. Decision framework (analytical/intuitive/collaborative/hierarchical/consensus-based/data-driven)
2. Information-seeking behavior (how much data before deciding?)
3. Risk tolerance in decisions
4. Decision speed (deliberate vs. rapid)
5. Collaboration preference (solo vs. team decisions)
6. Decisiveness (stick to decisions vs. revisit)

For the decision style, provide:
1. Primary framework preference
2. Scores for each dimension (0-1)
3. Overall confidence in assessment
4. Supporting evidence

Data to analyze:
{{DATA}}

Previous analysis results (if available):
{{PREVIOUS_RESULTS}}

Respond in JSON format with a "decisionStyle" object.`;

/**
 * Prompt for overall feasibility scoring
 */
export const FEASIBILITY_SCORING_PROMPT = `Based on the following analysis results, calculate an overall feasibility score.

Consider these dimensions (weight equally unless specified):
- Technical: Can it be done with available technology and skills?
- Resource: Are necessary resources (budget, people, materials) available?
- Time: Is there sufficient time to complete?
- Risk: Are risks at an acceptable level?
- Strategic: Does it align with goals and priorities?

Provide:
1. Overall feasibility score (0-100)
2. Score for each dimension (0-100)
3. Key factors that influenced the score
4. Recommendation (proceed/proceed-with-caution/reconsider/not-feasible)
5. Rationale for recommendation
6. Confidence in assessment (0-1)

Analysis results:
Trade-offs: {{TRADEOFFS}}
Constraints: {{CONSTRAINTS}}
Risks: {{RISKS}}
Decision Style: {{DECISION_STYLE}}

Respond in JSON format with a "feasibility" object.`;

/**
 * Prompt for generating insights
 */
export const INSIGHTS_GENERATION_PROMPT = `Based on the complete feasibility analysis, generate key insights.

Focus on:
1. Most critical factors affecting feasibility
2. Potential deal-breakers or showstoppers
3. Opportunities that could improve feasibility
4. Recommendations for improving feasibility
5. Areas of uncertainty requiring more information

Provide 3-5 actionable insights with supporting rationale.

Analysis summary:
{{ANALYSIS_SUMMARY}}

Respond in JSON format with an "insights" array of strings.`;

/**
 * Interface for prompt context data
 */
export interface PromptContext {
  data: ExtractedData[];
  previousResults?: Map<string, MindResult>;
  tradeOffs?: TradeOff[];
  constraints?: Constraint[];
  risks?: Risk[];
  decisionStyle?: DecisionStyle;
  feasibility?: FeasibilityScore;
}

/**
 * Formats extracted data for use in prompts
 */
export function formatDataForPrompt(data: ExtractedData[]): string {
  return data.map((item, index) => {
    const metadata = item.metadata
      ? `\nMetadata: ${JSON.stringify(item.metadata)}`
      : '';
    return `[${index + 1}] Source: ${item.sourceType}
Content: ${item.content.slice(0, 500)}${item.content.length > 500 ? '...' : ''}${metadata}`;
  }).join('\n\n');
}

/**
 * Formats previous results for use in prompts
 */
export function formatPreviousResultsForPrompt(
  previousResults?: Map<string, MindResult>
): string {
  if (!previousResults || previousResults.size === 0) {
    return 'No previous results available.';
  }

  const results: string[] = [];
  previousResults.forEach((result, mindId) => {
    const traits = result.traits
      .slice(0, 5)
      .map(t => `- ${t.name}: ${t.value} (confidence: ${t.confidence})`)
      .join('\n');
    results.push(`### ${mindId} Analysis:\n${traits}`);
  });

  return results.join('\n\n');
}

/**
 * Formats trade-offs for use in prompts
 */
export function formatTradeOffsForPrompt(tradeOffs: TradeOff[]): string {
  return tradeOffs
    .map(t => `- ${t.name}: prefers ${t.preference < 0.5 ? t.factors.primary.name : t.factors.secondary.name} (${(Math.abs(t.preference - 0.5) * 200).toFixed(0)}% preference)`)
    .join('\n');
}

/**
 * Formats constraints for use in prompts
 */
export function formatConstraintsForPrompt(constraints: Constraint[]): string {
  return constraints
    .map(c => `- ${c.name} (${c.type}, ${c.severity}): ${c.value}`)
    .join('\n');
}

/**
 * Formats risks for use in prompts
 */
export function formatRisksForPrompt(risks: Risk[]): string {
  return risks
    .map(r => `- ${r.name}: ${r.probability} probability, ${r.impact} impact (score: ${r.score})`)
    .join('\n');
}

/**
 * Builds a complete prompt with data substituted
 */
export function buildPrompt(
  template: string,
  context: PromptContext
): string {
  let prompt = template;

  // Replace data placeholder
  prompt = prompt.replace(
    '{{DATA}}',
    formatDataForPrompt(context.data)
  );

  // Replace previous results placeholder
  prompt = prompt.replace(
    '{{PREVIOUS_RESULTS}}',
    formatPreviousResultsForPrompt(context.previousResults)
  );

  // Replace trade-offs placeholder
  if (context.tradeOffs) {
    prompt = prompt.replace(
      '{{TRADEOFFS}}',
      formatTradeOffsForPrompt(context.tradeOffs)
    );
  }

  // Replace constraints placeholder
  if (context.constraints) {
    prompt = prompt.replace(
      '{{CONSTRAINTS}}',
      formatConstraintsForPrompt(context.constraints)
    );
  }

  // Replace risks placeholder
  if (context.risks) {
    prompt = prompt.replace(
      '{{RISKS}}',
      formatRisksForPrompt(context.risks)
    );
  }

  // Replace decision style placeholder
  if (context.decisionStyle) {
    prompt = prompt.replace(
      '{{DECISION_STYLE}}',
      `Framework: ${context.decisionStyle.framework}, Risk Tolerance: ${context.decisionStyle.riskTolerance}`
    );
  }

  return prompt;
}

/**
 * Creates a summary of all analysis for the insights prompt
 */
export function createAnalysisSummary(
  tradeOffs: TradeOff[],
  constraints: Constraint[],
  risks: Risk[],
  decisionStyle: DecisionStyle,
  feasibility: FeasibilityScore
): string {
  const sections: string[] = [];

  sections.push(`## Trade-offs Identified: ${tradeOffs.length}`);
  if (tradeOffs.length > 0) {
    sections.push(formatTradeOffsForPrompt(tradeOffs.slice(0, 3)));
  }

  sections.push(`\n## Constraints: ${constraints.length}`);
  const hardConstraints = constraints.filter(c => c.severity === 'hard');
  if (hardConstraints.length > 0) {
    sections.push(`Hard constraints: ${hardConstraints.map(c => c.name).join(', ')}`);
  }

  sections.push(`\n## Risks: ${risks.length}`);
  const highRisks = risks.filter(r => r.score >= 0.6);
  if (highRisks.length > 0) {
    sections.push(`High-risk items: ${highRisks.map(r => r.name).join(', ')}`);
  }

  sections.push(`\n## Decision Style: ${decisionStyle.framework}`);
  sections.push(`Risk tolerance: ${(decisionStyle.riskTolerance * 100).toFixed(0)}%`);

  sections.push(`\n## Feasibility Score: ${feasibility.overall}/100`);
  sections.push(`Recommendation: ${feasibility.recommendation}`);

  return sections.join('\n');
}

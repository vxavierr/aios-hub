/**
 * @fileoverview LLM prompt templates for Charlie Mind
 * @description Prompt templates for synthesis, paradox detection, and wisdom extraction
 * @module @clone-lab/minds/charlie
 */

import type { MindId } from '../base/mind.interface.js';
import type {
  MentalModel,
  Paradox,
  Wisdom,
  CrossDomainConnection,
  SynthesisResult,
} from './types.js';

/**
 * System prompt for Charlie Mind
 */
export const CHARLIE_SYSTEM_PROMPT = `You are Charlie, an analytical mind inspired by Charlie Munger's approach to thinking and decision-making. Your expertise lies in:

1. **Mental Model Identification**: Recognizing the cognitive frameworks people use to understand and navigate the world
2. **Paradox Detection**: Identifying contradictions, competing values, and tensions in thinking and behavior
3. **Synthesis**: Integrating multiple perspectives and analyses into coherent insights
4. **Wisdom Distillation**: Extracting principles, heuristics, and actionable wisdom from patterns
5. **Cross-Domain Connections**: Finding patterns that transfer across different areas of life

Your communication style is pragmatic, direct, and focused on practical wisdom. You value:
- Clarity over complexity
- Actionable insights over abstract theory
- First-principles thinking
- Understanding both what works AND why it works
- Acknowledging the limits of knowledge

When analyzing, you:
- Look for the underlying mental models being applied
- Identify tensions and paradoxes without judgment
- Seek patterns that repeat across contexts
- Distill complex insights into memorable principles
- Connect ideas across seemingly unrelated domains`;

/**
 * Prompt template for mental model identification
 */
export const MENTAL_MODELS_PROMPT = `Analyze the following data to identify mental models and cognitive frameworks being used.

## Input Data
- Extracted Data: {{extractedData}}
- Previous Analysis Results: {{previousResults}}

## Analysis Dimensions
1. **First-Principles Thinking**: Does the subject break problems down to fundamental truths?
2. **Systems Thinking**: Does the subject consider interconnections and feedback loops?
3. **Probabilistic Reasoning**: Does the subject think in probabilities rather than certainties?
4. **Inversion**: Does the subject think about what to avoid rather than what to seek?
5. **Circle of Competence**: Does the subject know their limitations?
6. **Margin of Safety**: Does the subject build in buffers for uncertainty?
7. **Opportunity Cost**: Does the subject consider alternatives foregone?
8. **Cognitive Biases**: What biases might be affecting their thinking?

## Output Format
Return a JSON array of mental models with:
- name: string
- category: mental model category
- description: how the model is understood
- application: how it's applied in context
- frequency: 0-1 scale of usage frequency
- effectiveness: 0-1 scale of effective application
- confidence: 0-1 scale of assessment confidence
- sources: array of source IDs supporting this`;

/**
 * Prompt template for paradox detection
 */
export const PARADOX_DETECTION_PROMPT = `Analyze the following data to identify paradoxes, contradictions, and competing values.

## Input Data
- Extracted Data: {{extractedData}}
- Previous Analysis Results: {{previousResults}}
- Identified Mental Models: {{mentalModels}}

## Paradox Types to Look For
1. **Competing Values**: Two important values that sometimes conflict
2. **Internal Contradictions**: Statements or beliefs that conflict with each other
3. **Behavior-Statement Gap**: What they say vs. what they do
4. **Short vs. Long Term**: Immediate gratification vs. future benefit
5. **Individual vs. Collective**: Personal needs vs. group needs
6. **Stability vs. Change**: Desire for consistency vs. growth
7. **Control vs. Autonomy**: Desire for control vs. freedom

## Output Format
Return a JSON array of paradoxes with:
- name: string
- type: paradox type
- severity: 'minor' | 'moderate' | 'significant' | 'critical'
- description: explanation of the paradox
- elements: { primary, secondary } with name, description, strength, evidence
- currentHandling: how they currently deal with it
- resolutionStatus: 'unresolved' | 'partially-resolved' | 'managed' | 'transcended' | 'unresolvable'
- resolutionApproaches: array of potential approaches
- impact: 0-1 impact on decision-making
- confidence: 0-1 assessment confidence
- sources: array of source IDs`;

/**
 * Prompt template for wisdom extraction
 */
export const WISDOM_EXTRACTION_PROMPT = `Analyze the following data to extract wisdom, principles, and heuristics.

## Input Data
- Extracted Data: {{extractedData}}
- Previous Analysis Results: {{previousResults}}
- Mental Models: {{mentalModels}}
- Paradoxes: {{paradoxes}}

## Wisdom Types to Extract
1. **Principles**: Fundamental truths that guide behavior
2. **Heuristics**: Rules of thumb for decision-making
3. **Insights**: Deep understandings about how things work
4. **Aphorisms**: Memorable statements of wisdom
5. **Frameworks**: Structured approaches to thinking
6. **Values**: Core beliefs about what matters

## Output Format
Return a JSON array of wisdom items with:
- statement: the wisdom itself
- type: 'principle' | 'heuristic' | 'insight' | 'aphorism' | 'framework' | 'value'
- domain: 'decision-making' | 'relationships' | 'learning' | 'work' | 'creativity' | 'resilience' | 'leadership' | 'ethics' | 'general'
- explanation: detailed explanation
- applications: array of practical applications
- underlyingModel: related mental model if applicable
- origin: source if stated
- universality: 0-1 scale of broad applicability
- practicality: 0-1 scale of actionability
- confidence: 0-1 assessment confidence
- sources: array of source IDs`;

/**
 * Prompt template for cross-domain connection discovery
 */
export const CROSS_DOMAIN_PROMPT = `Analyze the following data to find cross-domain connections and pattern transfers.

## Input Data
- Extracted Data: {{extractedData}}
- Mental Models: {{mentalModels}}
- Wisdom: {{wisdom}}

## Connection Types to Look For
1. **Analogical**: Similar patterns in different domains
2. **Structural**: Similar underlying structures
3. **Causal**: Similar cause-effect relationships
4. **Temporal**: Similar time-based patterns
5. **Hierarchical**: Similar levels/relationships
6. **Complementary**: Domains that enhance each other
7. **Contradictory**: Domains with opposing lessons

## Output Format
Return a JSON array of connections with:
- sourceDomain: string
- targetDomain: string
- type: connection type
- description: explanation of the connection
- underlyingPattern: the shared pattern
- application: how the connection is applied
- strength: 0-1 strength of connection
- confidence: 0-1 assessment confidence
- sources: array of source IDs`;

/**
 * Prompt template for synthesis analysis
 */
export const SYNTHESIS_PROMPT = `Synthesize all previous analyses into a coherent understanding.

## Input Data
- Extracted Data: {{extractedData}}
- Mental Models: {{mentalModels}}
- Paradoxes: {{paradoxes}}
- Wisdom: {{wisdom}}
- Cross-Domain Connections: {{crossDomainConnections}}
- Previous Analysis Results: {{previousResults}}

## Synthesis Dimensions
1. **Coherence**: How well do the pieces fit together?
2. **Integration**: How well are different dimensions integrated?
3. **Model Richness**: How rich is the mental model library?
4. **Paradox Tolerance**: How well are contradictions handled?
5. **Wisdom Depth**: How deep is the extracted wisdom?
6. **Cross-Domain Agility**: How well do ideas transfer?

## Output Format
Return a synthesis object with:
- quality: {
    coherence: 0-1,
    integration: 0-1,
    modelRichness: 0-1,
    paradoxTolerance: 0-1,
    wisdomDepth: 0-1,
    crossDomainAgility: 0-1
  }
- dominantPatterns: array of dominant thinking patterns
- keyTensions: array of main tensions in worldview
- integrationOpportunities: array of opportunities for better integration
- coherenceScore: 0-1 overall coherence
- confidence: 0-1 assessment confidence`;

/**
 * Prompt template for overall Charlie analysis
 */
export const CHARLIE_ANALYSIS_PROMPT = `Perform a comprehensive synthesis and wisdom analysis.

## Context
{{context}}

## Analysis Tasks
1. Identify mental models and cognitive frameworks
2. Detect paradoxes and competing values
3. Extract wisdom and principles
4. Find cross-domain connections
5. Synthesize into coherent understanding

## Requirements
- Synthesize insights from all previous Minds: {{dependencies}}
- Focus on patterns that repeat across contexts
- Identify both strengths and blind spots
- Extract actionable wisdom
- Provide a thinking sophistication score (0-100)

## Output Format
Provide a comprehensive analysis including:
- mentalModels: array of identified mental models
- paradoxes: array of detected paradoxes
- wisdom: array of extracted wisdom
- crossDomainConnections: array of cross-domain patterns
- synthesis: synthesis quality assessment
- insights: array of key insights
- thinkingScore: 0-100 thinking sophistication score
- confidence: 0-1 overall confidence`;

/**
 * Build the context string for prompts
 */
export function buildContextString(
  extractedData: unknown[],
  previousResults?: Map<MindId, unknown>
): string {
  const parts: string[] = [];

  parts.push('## Extracted Data');
  parts.push(JSON.stringify(extractedData, null, 2));

  if (previousResults && previousResults.size > 0) {
    parts.push('\n## Previous Mind Results');
    for (const [mindId, result] of previousResults) {
      parts.push(`\n### ${mindId} Analysis`);
      parts.push(JSON.stringify(result, null, 2));
    }
  }

  return parts.join('\n');
}

/**
 * Get the list of dependency Mind IDs for prompt context
 */
export function getDependencyList(): string[] {
  return ['tim', 'daniel', 'brene', 'barbara'];
}

/**
 * Format mental models for inclusion in subsequent prompts
 */
export function formatMentalModels(models: MentalModel[]): string {
  return models
    .map(
      (m) =>
        `- ${m.name} (${m.category}): ${m.description} [frequency: ${m.frequency.toFixed(2)}, effectiveness: ${m.effectiveness.toFixed(2)}]`
    )
    .join('\n');
}

/**
 * Format paradoxes for inclusion in subsequent prompts
 */
export function formatParadoxes(paradoxes: Paradox[]): string {
  return paradoxes
    .map(
      (p) =>
        `- ${p.name} (${p.type}, ${p.severity}): ${p.description} [impact: ${p.impact.toFixed(2)}, status: ${p.resolutionStatus}]`
    )
    .join('\n');
}

/**
 * Format wisdom for inclusion in subsequent prompts
 */
export function formatWisdom(wisdom: Wisdom[]): string {
  return wisdom
    .map(
      (w) =>
        `- "${w.statement}" (${w.type}, ${w.domain}): ${w.explanation} [universality: ${w.universality.toFixed(2)}, practicality: ${w.practicality.toFixed(2)}]`
    )
    .join('\n');
}

/**
 * Format cross-domain connections for inclusion in subsequent prompts
 */
export function formatConnections(connections: CrossDomainConnection[]): string {
  return connections
    .map(
      (c) =>
        `- ${c.sourceDomain} -> ${c.targetDomain} (${c.type}): ${c.underlyingPattern} [strength: ${c.strength.toFixed(2)}]`
    )
    .join('\n');
}

/**
 * Format synthesis result for final output
 */
export function formatSynthesis(synthesis: SynthesisResult): string {
  const quality = synthesis.quality;
  return `
Synthesis Quality:
- Coherence: ${quality.coherence.toFixed(2)}
- Integration: ${quality.integration.toFixed(2)}
- Model Richness: ${quality.modelRichness.toFixed(2)}
- Paradox Tolerance: ${quality.paradoxTolerance.toFixed(2)}
- Wisdom Depth: ${quality.wisdomDepth.toFixed(2)}
- Cross-Domain Agility: ${quality.crossDomainAgility.toFixed(2)}

Dominant Patterns: ${synthesis.dominantPatterns.join(', ')}
Key Tensions: ${synthesis.keyTensions.join(', ')}
Overall Coherence: ${synthesis.coherenceScore.toFixed(2)}
`.trim();
}

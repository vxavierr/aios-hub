/**
 * @fileoverview LLM prompt templates for Daniel Mind - Behavioral Patterns
 * @description Prompts for behavioral analysis, cognitive bias detection, and decision-making patterns
 * @module @clone-lab/minds/daniel
 */

import type { ExtractedData } from '../base/types.js';
import type { DanielMindOptions } from './types.js';

/**
 * System prompt for Daniel Mind behavioral analysis
 */
export const DANIEL_SYSTEM_PROMPT = `You are Daniel, an AI mind inspired by Daniel Kahneman's work in behavioral economics and decision-making psychology.

Your expertise includes:
- Behavioral economics and prospect theory
- Cognitive bias identification and analysis
- Big Five personality trait assessment
- Decision-making pattern recognition
- Risk assessment and behavioral triggers

Your analytical approach:
1. Systematically evaluate evidence for behavioral patterns
2. Identify cognitive biases that may influence thinking
3. Assess personality traits through behavioral indicators
4. Analyze decision-making styles and risk tolerance
5. Recognize emotional and situational triggers

Communication style:
- Analytical and precise
- Grounded in behavioral science
- Evidence-based conclusions
- Clear about confidence levels
- Acknowledges uncertainty where appropriate

Always provide:
- Specific evidence for your assessments
- Confidence levels for each conclusion
- Alternative interpretations when relevant
- Behavioral indicators that support your analysis`;

/**
 * Generate prompt for Big Five personality analysis
 */
export function generateBigFivePrompt(data: ExtractedData[]): string {
  const contentSummary = data
    .map((d) => `[${d.sourceType}]: ${d.content.substring(0, 500)}...`)
    .join('\n\n');

  return `Analyze the following content to assess the Big Five personality traits (OCEAN model).

CONTENT TO ANALYZE:
${contentSummary}

For each trait, provide:
1. A score from 0-100
2. Confidence level (0-1)
3. Key behavioral indicators observed
4. Specific quotes or examples supporting the score

TRAITS TO ASSESS:
- Openness (curiosity, creativity, preference for novelty)
- Conscientiousness (organization, dependability, self-discipline)
- Extraversion (sociability, assertiveness, positive emotions)
- Agreeableness (cooperation, trust, helpfulness)
- Neuroticism (emotional instability, anxiety, moodiness)

Respond in JSON format:
{
  "openness": { "score": number, "confidence": number, "indicators": string[], "evidence": string[] },
  "conscientiousness": { "score": number, "confidence": number, "indicators": string[], "evidence": string[] },
  "extraversion": { "score": number, "confidence": number, "indicators": string[], "evidence": string[] },
  "agreeableness": { "score": number, "confidence": number, "indicators": string[], "evidence": string[] },
  "neuroticism": { "score": number, "confidence": number, "indicators": string[], "evidence": string[] }
}`;
}

/**
 * Generate prompt for cognitive bias detection
 */
export function generateCognitiveBiasPrompt(
  data: ExtractedData[],
  options?: DanielMindOptions
): string {
  const contentSummary = data
    .map((d) => `[${d.sourceType}]: ${d.content.substring(0, 500)}...`)
    .join('\n\n');

  const threshold = options?.biasConfidenceThreshold ?? 0.5;
  const maxBiases = options?.maxBiases ?? 10;

  return `Analyze the following content to identify cognitive biases in the subject's thinking patterns.

CONTENT TO ANALYZE:
${contentSummary}

BIASES TO LOOK FOR:
- Confirmation bias (seeking information that confirms existing beliefs)
- Anchoring (over-relying on first piece of information)
- Availability heuristic (judging by how easily examples come to mind)
- Dunning-Kruger effect (over/underestimating competence)
- Sunk cost fallacy (continuing due to invested resources)
- Loss aversion (fear of losses outweighing potential gains)
- Framing effect (decisions influenced by how options are presented)
- Hindsight bias ("I knew it all along")
- Optimism/Pessimism bias (unrealistic positive/negative expectations)
- Status quo bias (preference for current state)
- Bandwagon effect (following the crowd)
- Authority bias (deference to authority figures)
- Attribution error (attributing others' behavior to character, not situation)

For each detected bias, provide:
- Type of bias
- Strength (0-1)
- Confidence in detection (0-1)
- Specific evidence from the content
- Examples of the bias in action

CONSTRAINTS:
- Minimum confidence threshold: ${threshold}
- Maximum biases to report: ${maxBiases}
- Only report biases with strong evidence

Respond in JSON format:
{
  "biases": [
    {
      "type": "bias-type-kebab-case",
      "name": "Display Name",
      "description": "Brief description",
      "strength": number,
      "confidence": number,
      "sources": ["id1", "id2"],
      "examples": ["example 1", "example 2"]
    }
  ]
}`;
}

/**
 * Generate prompt for decision-making pattern analysis
 */
export function generateDecisionPatternPrompt(data: ExtractedData[]): string {
  const contentSummary = data
    .map((d) => `[${d.sourceType}]: ${d.content.substring(0, 500)}...`)
    .join('\n\n');

  return `Analyze the following content to identify decision-making patterns.

CONTENT TO ANALYZE:
${contentSummary}

DECISION STYLE CATEGORIES:
- Analytical: Thorough evaluation of information, logical approach
- Intuitive: Gut feelings, quick decisions based on experience
- Dependent: Seeks advice and approval from others
- Spontaneous: Impulsive, decides quickly without much deliberation
- Avoidant: Postpones or avoids making decisions

ASSESS:
1. Primary decision-making style
2. Risk tolerance (risk-averse, risk-neutral, risk-seeking)
3. Time preference (present-biased, balanced, future-oriented)
4. Deliberation style (impulsive to exhaustive)
5. Information-seeking tendency (0-1)
6. Social validation need (0-1)
7. Adaptability in changing decisions (0-1)
8. Overall decision confidence (0-1)

Look for:
- How choices are framed and evaluated
- Speed of decision-making
- Information gathering before decisions
- Comfort with uncertainty
- Reaction to outcomes (wins/losses)
- Pattern of risk-taking vs caution

Respond in JSON format:
{
  "primaryStyle": "analytical|intuitive|dependent|spontaneous|avoidant",
  "secondaryStyle": "optional secondary style",
  "riskTolerance": "risk-averse|risk-neutral|risk-seeking",
  "timePreference": "present-biased|balanced|future-oriented",
  "deliberationStyle": "impulsive|quick|moderate|thorough|exhaustive",
  "informationSeeking": number,
  "socialValidation": number,
  "adaptability": number,
  "decisionConfidence": number,
  "evidence": ["evidence 1", "evidence 2"],
  "sources": ["source ids"]
}`;
}

/**
 * Generate prompt for behavioral trigger analysis
 */
export function generateTriggerPrompt(data: ExtractedData[]): string {
  const contentSummary = data
    .map((d) => `[${d.sourceType}]: ${d.content.substring(0, 500)}...`)
    .join('\n\n');

  return `Analyze the following content to identify behavioral triggers and response patterns.

CONTENT TO ANALYZE:
${contentSummary}

TRIGGER CATEGORIES:
- Emotional: Fear, anger, joy, sadness, surprise, disgust
- Social: Approval, rejection, competition, cooperation
- Environmental: Time pressure, noise, comfort, stress
- Cognitive: Uncertainty, complexity, novelty, familiarity
- Temporal: Deadlines, seasons, time of day

For each trigger, identify:
- What triggers the response
- The typical response pattern
- Strength of the trigger influence
- Evidence from the content

Also identify recurring response patterns:
- How the subject typically responds to specific situations
- Frequency of these patterns
- Consistency across different contexts

Respond in JSON format:
{
  "triggers": [
    {
      "category": "emotional|social|environmental|cognitive|temporal",
      "name": "trigger name",
      "responsePattern": "description of typical response",
      "strength": number,
      "sources": ["source ids"]
    }
  ],
  "responsePatterns": [
    {
      "situation": "situation description",
      "response": "typical response",
      "frequency": number,
      "sources": ["source ids"]
    }
  ]
}`;
}

/**
 * Generate comprehensive behavioral profile prompt
 */
export function generateFullProfilePrompt(
  _data: ExtractedData[],
  options?: DanielMindOptions
): string {
  const includeFacets = options?.includeFacets ?? false;

  return `Based on all the behavioral analysis components, synthesize a comprehensive behavioral profile.

${includeFacets ? 'Include detailed Big Five facets analysis.' : 'Use basic Big Five trait scores only.'}

Provide:
1. A holistic summary of behavioral tendencies (2-3 paragraphs)
2. Key patterns that define this individual's behavior
3. Potential blind spots or areas for self-awareness
4. How different aspects of the profile interact

Respond in JSON format:
{
  "summary": "comprehensive behavioral profile summary",
  "keyPatterns": ["pattern 1", "pattern 2"],
  "blindSpots": ["blind spot 1", "blind spot 2"],
  "interactions": ["how traits interact 1", "how traits interact 2"],
  "overallConfidence": number
}`;
}

/**
 * All prompt templates exported as a collection
 */
export const DANIEL_PROMPTS = {
  systemPrompt: DANIEL_SYSTEM_PROMPT,
  bigFive: generateBigFivePrompt,
  cognitiveBias: generateCognitiveBiasPrompt,
  decisionPattern: generateDecisionPatternPrompt,
  trigger: generateTriggerPrompt,
  fullProfile: generateFullProfilePrompt,
};

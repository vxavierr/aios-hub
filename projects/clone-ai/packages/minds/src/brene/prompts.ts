/**
 * @fileoverview LLM prompt templates for Brene Mind analysis
 * @description Structured prompts for values, beliefs, and vulnerability pattern extraction
 * @module @clone-lab/minds/brene
 */

import type {
  ExtractedData,
  MindResult,
} from '../base/index.js';

/**
 * System prompt for Brene Mind's persona
 */
export const BRENE_SYSTEM_PROMPT = `You are Brene, an empathetic analytical Mind specializing in values, beliefs, and vulnerability patterns.

Your name is inspired by Brene Brown's research on vulnerability, shame, and authentic living.

Your expertise includes:
- Core values identification and prioritization
- Belief system mapping and analysis
- Vulnerability pattern recognition
- Emotional trigger identification
- Authenticity assessment
- Shame resilience evaluation

Your communication tone is empathetic - you approach analysis with compassion and understanding,
recognizing the deeply personal nature of values and beliefs.

When analyzing, you:
1. Look for patterns in how values are expressed through behavior
2. Identify both explicit and implicit beliefs
3. Recognize vulnerability as courage, not weakness
4. Consider the context and origins of beliefs
5. Assess alignment between stated values and demonstrated behaviors
6. Approach sensitive topics with care and nuance`;

/**
 * Prompt template for core values extraction
 */
export const CORE_VALUES_PROMPT = `Analyze the following extracted data to identify the person's core values.

Look for:
1. Values explicitly stated or discussed
2. Values implied through decision-making patterns
3. Values reflected in priorities and time allocation
4. Values underlying emotional reactions
5. Values evident in relationship dynamics

For each identified value, provide:
- Name: The core value (e.g., "Integrity", "Family", "Creativity")
- Category: ethical, relational, personal-growth, achievement, security, autonomy, creativity, spiritual, community, lifestyle
- Importance: foundational, core, important, or situational
- Description: How this value manifests for this person
- Behaviors: Observable actions that demonstrate this value
- Contexts: Situations where this value is most prominent
- Confidence: Your confidence in this identification (0-1)

Extracted Data:
{{EXTRACTED_DATA}}

Previous Analysis Results (if available):
{{PREVIOUS_RESULTS}}

Provide your analysis as a structured JSON response.`;

/**
 * Prompt template for belief system analysis
 */
export const BELIEFS_PROMPT = `Analyze the following extracted data to identify the person's belief systems.

Look for:
1. Beliefs about self (capabilities, worth, identity)
2. Beliefs about others (trust, intentions, relationships)
3. Beliefs about the world (fairness, safety, opportunity)
4. Causal beliefs (what leads to what)
5. Normative beliefs (what should be)
6. Existential beliefs (meaning, purpose)

For each identified belief, provide:
- Statement: The belief in statement form
- Type: worldview, self-perception, other-perception, causal, normative, existential
- Strength: rigid, strong, moderate, flexible, or exploratory
- Origin: Where this belief may have originated (if discernible)
- Constructive: Whether this belief serves the person well (true/false)
- Behavioral Impact: How this belief affects behavior
- Confidence: Your confidence in this identification (0-1)

Extracted Data:
{{EXTRACTED_DATA}}

Previous Analysis Results (if available):
{{PREVIOUS_RESULTS}}

Provide your analysis as a structured JSON response.`;

/**
 * Prompt template for vulnerability pattern analysis
 */
export const VULNERABILITY_PATTERNS_PROMPT = `Analyze the following extracted data to identify vulnerability patterns.

Look for:
1. Situations that trigger feelings of vulnerability
2. Emotional responses to vulnerability (fear, shame, anxiety)
3. Behavioral responses (avoidance, deflection, embrace)
4. Coping mechanisms used
5. Growth edges in vulnerability

For each vulnerability pattern, provide:
- Name: A descriptive name for this pattern
- Description: How vulnerability manifests in this area
- Triggers: What activates this vulnerability
- Response: avoidance, intellectualization, deflection, numbing, anger, embrace, or selective-sharing
- Emotional States: Emotions associated with this pattern
- Coping Mechanisms: Strategies used to manage vulnerability
- Growth Areas: Potential for developing healthier responses
- Confidence: Your confidence in this identification (0-1)

Extracted Data:
{{EXTRACTED_DATA}}

Previous Analysis Results (if available):
{{PREVIOUS_RESULTS}}

Provide your analysis as a structured JSON response.`;

/**
 * Prompt template for emotional triggers identification
 */
export const EMOTIONAL_TRIGGERS_PROMPT = `Analyze the following extracted data to identify emotional triggers.

Look for:
1. Topics or situations that provoke strong emotional reactions
2. Patterns in what causes distress, anger, or discomfort
3. Underlying fears that may drive reactions
4. Recovery patterns after being triggered

For each emotional trigger, provide:
- Name: A descriptive name for this trigger
- Category: rejection, failure, criticism, loss, uncertainty, injustice, betrayal, inadequacy, success, intimacy
- Description: What specifically triggers this response
- Emotional Response: Typical emotions experienced
- Behavioral Response: How the person typically reacts
- Intensity: How strong the response tends to be (0-1)
- Recovery Pattern: quick, moderate, or prolonged
- Underlying Fears: Core fears connected to this trigger
- Confidence: Your confidence in this identification (0-1)

Extracted Data:
{{EXTRACTED_DATA}}

Previous Analysis Results (if available):
{{PREVIOUS_RESULTS}}

Provide your analysis as a structured JSON response.`;

/**
 * Prompt template for authenticity assessment
 */
export const AUTHENTICITY_PROMPT = `Analyze the following extracted data to assess authenticity patterns.

Evaluate:
1. Value-Behavior Alignment: Consistency between stated values and actions
2. Self-Expression Comfort: Ease with expressing true self
3. Vulnerability Willingness: Openness to being seen authentically
4. Authenticity Over Approval: Prioritizing authenticity vs. people-pleasing
5. Imperfection Acceptance: Comfort with being imperfect

Provide scores (0-1) for each dimension and identify:
- Authentic Moments: Examples where the person showed genuine authenticity
- Authenticity Challenges: Situations where authenticity is difficult

Also include specific evidence from the data that supports your assessment.

Extracted Data:
{{EXTRACTED_DATA}}

Previous Analysis Results (if available):
{{PREVIOUS_RESULTS}}

Provide your analysis as a structured JSON response.`;

/**
 * Prompt template for non-negotiables extraction
 */
export const NON_NEGOTIABLES_PROMPT = `Analyze the following extracted data to identify non-negotiable boundaries and principles.

Look for:
1. Principles the person will not compromise on
2. Boundaries that are consistently maintained
3. Deal-breakers in relationships or situations
4. Ethical lines that are never crossed

For each non-negotiable, provide:
- Name: The non-negotiable principle
- Description: What this means in practice
- Category: ethical, practical, relational, or personal
- Violations: Behaviors that would violate this
- Flexibility: How flexible this boundary is (0-1, 0 = absolute)
- Confidence: Your confidence in this identification (0-1)

Extracted Data:
{{EXTRACTED_DATA}}

Previous Analysis Results (if available):
{{PREVIOUS_RESULTS}}

Provide your analysis as a structured JSON response.`;

/**
 * Prompt template for shame resilience assessment
 */
export const SHAME_RESILIENCE_PROMPT = `Analyze the following extracted data to assess shame resilience.

Evaluate:
1. Shame Awareness: Ability to recognize shame when it occurs
2. Primary Shame Response: withdrawal, attack-self, attack-other, denial, processing, or resilience
3. Shame Triggers: Topics or situations that evoke shame
4. Resilience Strategies: How the person builds shame resilience
5. Vulnerable Domains: Areas where shame is most likely triggered
6. Support Systems: People or practices that help with shame

Provide an overall shame resilience score (0-1) and detailed analysis of shame patterns.

Extracted Data:
{{EXTRACTED_DATA}}

Previous Analysis Results (if available):
{{PREVIOUS_RESULTS}}

Provide your analysis as a structured JSON response.`;

/**
 * Prompt template for growth recommendations
 */
export const GROWTH_RECOMMENDATIONS_PROMPT = `Based on the following analysis results, provide growth recommendations.

Consider:
1. Values that could be better aligned with behavior
2. Limiting beliefs that could be reframed
3. Vulnerability patterns that could be developed
4. Authenticity areas for growth
5. Shame resilience building opportunities

For each recommendation, provide:
- A specific, actionable suggestion
- The reasoning behind it
- How it relates to the analysis findings

Previous Analysis Results:
{{ANALYSIS_RESULTS}}

Provide your recommendations as a structured JSON response.`;

/**
 * Interface for prompt context
 */
export interface PromptContext {
  extractedData: ExtractedData[];
  previousResults?: Map<string, MindResult>;
  options?: Record<string, unknown>;
}

/**
 * Formats extracted data for prompt injection
 */
export function formatExtractedDataForPrompt(data: ExtractedData[]): string {
  return data
    .map((item, index) => {
      const timestamp = item.timestamp
        ? new Date(item.timestamp).toISOString()
        : 'Unknown date';
      return `[${index + 1}] Source: ${item.sourceType} | Date: ${timestamp}\n${item.content}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Formats previous results for prompt context
 */
export function formatPreviousResultsForPrompt(
  results?: Map<string, MindResult>
): string {
  if (!results || results.size === 0) {
    return 'No previous analysis results available.';
  }

  return Array.from(results.entries())
    .map(([mindId, result]) => {
      const traits = result.traits
        .slice(0, 5)
        .map((t) => `- ${t.name}: ${t.value}`)
        .join('\n');
      return `## ${mindId} Analysis\n${traits}`;
    })
    .join('\n\n');
}

/**
 * Creates a complete analysis prompt with data injected
 */
export function createAnalysisPrompt(
  template: string,
  context: PromptContext
): string {
  return template
    .replace('{{EXTRACTED_DATA}}', formatExtractedDataForPrompt(context.extractedData))
    .replace('{{PREVIOUS_RESULTS}}', formatPreviousResultsForPrompt(context.previousResults));
}

/**
 * All available prompt templates for Brene Mind
 */
export const BRENE_PROMPTS = {
  system: BRENE_SYSTEM_PROMPT,
  coreValues: CORE_VALUES_PROMPT,
  beliefs: BELIEFS_PROMPT,
  vulnerabilityPatterns: VULNERABILITY_PATTERNS_PROMPT,
  emotionalTriggers: EMOTIONAL_TRIGGERS_PROMPT,
  authenticity: AUTHENTICITY_PROMPT,
  nonNegotiables: NON_NEGOTIABLES_PROMPT,
  shameResilience: SHAME_RESILIENCE_PROMPT,
  growthRecommendations: GROWTH_RECOMMENDATIONS_PROMPT,
} as const;

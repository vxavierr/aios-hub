/**
 * @fileoverview LLM prompt templates for Barbara Mind
 * @description Prompts for cognitive architecture analysis
 * @module @clone-lab/minds/barbara
 */

import type {
  ExtractedData,
} from '../base/types.js';

/**
 * Build the system prompt for Barbara Mind
 */
export function buildSystemPrompt(): string {
  return `You are Barbara, a cognitive architecture analyst inspired by Barbara Oakley.
Your expertise is in understanding how people think, learn, and process information.

Your analytical focus areas:
- MBTI profile inference from behavioral patterns
- Big Five personality trait assessment
- Thinking style classification (analytical, intuitive, creative, practical)
- Learning preference identification (visual, auditory, kinesthetic)
- Mental model mapping and identification
- Spatial reasoning pattern detection

Your communication style is analytical, precise, and evidence-based.
Always provide confidence scores for your assessments.
Base your analysis on observable patterns in the provided content.
When evidence is insufficient, indicate low confidence rather than guessing.

Output your analysis in the requested JSON format only.`;
}

/**
 * Build prompt for MBTI profile analysis
 */
export function buildMBTIPrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  return `Analyze the following content to infer the author's MBTI profile.

Content to analyze:
${content}

Based on language patterns, decision-making approaches, and communication style,
infer the MBTI profile. Consider:

1. E/I - Extraversion vs Introversion: How do they engage with ideas and people?
2. S/N - Sensing vs Intuition: Do they prefer concrete details or abstract patterns?
3. T/F - Thinking vs Feeling: How do they make decisions?
4. J/P - Judging vs Perceiving: Do they prefer structure or flexibility?

Respond in JSON format:
{
  "ei": <number 0-100, higher = more extraverted>,
  "sn": <number 0-100, higher = more intuitive>,
  "tf": <number 0-100, higher = more thinking>,
  "jp": <number 0-100, higher = more judging>,
  "inferredType": "<4-letter MBTI code>",
  "confidence": <number 0-1>,
  "reasoning": "<brief explanation>"
}`;
}

/**
 * Build prompt for Big Five traits analysis
 */
export function buildBigFivePrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  return `Analyze the following content to assess the author's Big Five personality traits.

Content to analyze:
${content}

Assess each trait on the OCEAN model:
1. Openness - Curiosity, creativity, openness to new ideas
2. Conscientiousness - Organization, dependability, self-discipline
3. Extraversion - Sociability, assertiveness, positive emotions
4. Agreeableness - Cooperation, trust, helpfulness
5. Neuroticism - Emotional stability, anxiety, moodiness

Respond in JSON format:
{
  "openness": { "score": <0-100>, "level": "<low|moderate|high>", "evidence": ["..."] },
  "conscientiousness": { "score": <0-100>, "level": "<low|moderate|high>", "evidence": ["..."] },
  "extraversion": { "score": <0-100>, "level": "<low|moderate|high>", "evidence": ["..."] },
  "agreeableness": { "score": <0-100>, "level": "<low|moderate|high>", "evidence": ["..."] },
  "neuroticism": { "score": <0-100>, "level": "<low|moderate|high>", "evidence": ["..."] },
  "confidence": <number 0-1>
}`;
}

/**
 * Build prompt for thinking style analysis
 */
export function buildThinkingStylePrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  return `Analyze the following content to identify the author's thinking style.

Content to analyze:
${content}

Classify the thinking style across these dimensions:
- Analytical: Logical, systematic, data-driven reasoning
- Intuitive: Pattern recognition, gut feelings, holistic understanding
- Creative: Novel connections, divergent thinking, innovative approaches
- Practical: Pragmatic, results-oriented, action-focused

Respond in JSON format:
{
  "primary": "<analytical|intuitive|creative|practical|balanced>",
  "secondary": "<optional second style>",
  "scores": {
    "analytical": <0-100>,
    "intuitive": <0-100>,
    "creative": <0-100>,
    "practical": <0-100>,
    "balanced": <0-100>
  },
  "confidence": <0-1>,
  "evidence": ["example quotes or patterns"]
}`;
}

/**
 * Build prompt for learning preference analysis
 */
export function buildLearningPreferencePrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  return `Analyze the following content to identify the author's learning preferences.

Content to analyze:
${content}

Identify preferred learning modalities:
- Visual: Diagrams, charts, visual representations, "I see what you mean"
- Auditory: Discussions, explanations, "That sounds right"
- Kinesthetic: Hands-on, experiential, "Let me try it"
- Reading-Writing: Text-based learning, notes, documentation
- Social: Group learning, discussion, collaboration
- Solitary: Self-study, reflection, independent work

Respond in JSON format:
{
  "primary": "<modality>",
  "secondary": "<optional second modality>",
  "scores": {
    "visual": <0-100>,
    "auditory": <0-100>,
    "kinesthetic": <0-100>,
    "reading-writing": <0-100>,
    "social": <0-100>,
    "solitary": <0-100>
  },
  "confidence": <0-1>,
  "evidence": ["example quotes or patterns"]
}`;
}

/**
 * Build prompt for mental model identification
 */
export function buildMentalModelsPrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  return `Analyze the following content to identify mental models the author uses.

Content to analyze:
${content}

Look for these categories of mental models:
- Systems Thinking: Understanding interconnected parts, feedback loops
- First Principles: Breaking problems to fundamental truths
- Probabilistic: Thinking in probabilities, uncertainty quantification
- Causal: Cause and effect reasoning
- Analogical: Using metaphors and analogies
- Spatial: Using space and position to organize ideas
- Temporal: Time-based thinking, sequences
- Narrative: Story-based understanding
- Hierarchical: Tree structures, levels, categories
- Network: Connections, relationships, webs

Respond in JSON format:
{
  "models": [
    {
      "name": "<model name>",
      "category": "<category>",
      "frequency": <0-100>,
      "explicitness": <0-1>,
      "evidence": ["example quotes"],
      "relatedTerms": ["related concepts"]
    }
  ],
  "confidence": <0-1>
}`;
}

/**
 * Build prompt for cognitive architecture analysis
 */
export function buildArchitecturePrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  return `Analyze the following content to identify the author's cognitive architecture.

Content to analyze:
${content}

Determine the primary cognitive architecture:
- Sequential-Logical: Step-by-step, linear reasoning, structured
- Spatial-Visual: Diagrams, layouts, visual organization
- Verbal-Linguistic: Language-focused, articulate, word-based
- Intuitive-Holistic: Big picture, patterns, non-linear
- Mixed-Balanced: Combination of multiple styles

Respond in JSON format:
{
  "type": "<architecture type>",
  "description": "<brief description>",
  "characteristics": ["characteristic 1", "characteristic 2"],
  "typeScores": {
    "sequential-logical": <0-100>,
    "spatial-visual": <0-100>,
    "verbal-linguistic": <0-100>,
    "intuitive-holistic": <0-100>,
    "mixed-balanced": <0-100>
  },
  "confidence": <0-1>
}`;
}

/**
 * Build prompt for spatial pattern detection
 */
export function buildSpatialPatternsPrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  return `Analyze the following content for spatial thinking patterns.

Content to analyze:
${content}

Look for:
- Spatial metaphors: "in front of", "behind", "on top of", "deep", "wide"
- Visual representations: References to diagrams, layouts, arrangements
- Position-based reasoning: Organizing ideas by location or position
- Scale and proportion thinking: Size, distance, magnitude comparisons

Respond in JSON format:
{
  "spatialMetaphorUsage": <0-100>,
  "visualRepresentation": <0-100>,
  "examples": ["example quotes"],
  "score": <overall spatial reasoning score 0-100>,
  "confidence": <0-1>
}`;
}

/**
 * Build comprehensive cognitive analysis prompt
 */
export function buildComprehensivePrompt(extractedData: ExtractedData[]): string {
  const content = extractedData
    .map((d) => d.content)
    .join('\n\n---\n\n')
    .slice(0, 15000);

  return `${buildSystemPrompt()}

Analyze the following content and provide a comprehensive cognitive profile.

Content to analyze:
${content}

Provide a complete analysis in JSON format covering:
1. MBTI Profile (ei, sn, tf, jp scores, inferred type, confidence)
2. Big Five Traits (each trait with score, level, evidence)
3. Thinking Style (primary, secondary, dimension scores, confidence)
4. Learning Preference (primary, secondary, modality scores, confidence)
5. Mental Models (list of identified models with category, frequency, evidence)
6. Cognitive Architecture (type, description, characteristics, confidence)
7. Spatial Patterns (metaphor usage, visual representation, examples, score)
8. Processing Pattern (top-down, bottom-up, lateral, iterative, parallel)

Respond as a complete JSON object with all sections.`;
}

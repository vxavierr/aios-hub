/**
 * @fileoverview LLM Prompt templates for Constantin Mind
 * @description Prompts for analyzing implementation patterns and technical preferences
 * @module @clone-lab/minds/constantin
 */

import type { ConstantinMindOptions } from './types.js';

/**
 * System prompt for Constantin Mind
 */
export const CONSTANTIN_SYSTEM_PROMPT = `You are Constantin, an analytical Mind inspired by Constantin Stanislavski's methodical approach to understanding human behavior through practical action.

Your expertise lies in analyzing:
- Implementation patterns (how things get done)
- Technical preferences (tools, frameworks, approaches)
- Problem-solving methodology
- Execution style
- Resource allocation patterns

Your communication tone is pragmatic - you focus on what works in practice, not just theory.

When analyzing a person's implementation profile:
1. Look for recurring patterns in how they approach tasks
2. Identify explicit and implicit technical preferences
3. Detect their problem-solving methodology
4. Analyze their execution style and pace
5. Understand how they allocate resources (time, effort, attention)

Always ground your analysis in concrete evidence from the source material.
Provide confidence scores based on the strength and consistency of evidence.`;

/**
 * Prompt for analyzing implementation patterns
 */
export const IMPLEMENTATION_PATTERNS_PROMPT = `Analyze the following content to identify implementation patterns.

Look for evidence of these pattern types:
- **Iterative**: Cycles of refinement, repeated attempts, gradual improvement
- **Incremental**: Breaking work into small pieces, step-by-step progress
- **Test-driven**: Writing tests first, validation before implementation
- **Prototype-first**: Building quick versions to explore, then refining
- **Documentation-driven**: Writing docs/specs before implementation
- **Specification-driven**: Following formal specs or requirements closely
- **Exploratory**: Experimenting to find solutions, learning by doing
- **Structured**: Following established processes, checklists, methodologies

For each pattern detected:
1. Rate confidence (0-1) based on evidence strength
2. Note specific examples from the content
3. Indicate frequency (how often this pattern appears)

Content to analyze:
{content}

Previous Mind results to consider (Tim's extractions and Charlie's synthesis):
{previousResults}

Respond in JSON format with an array of implementation patterns.`;

/**
 * Prompt for analyzing technical preferences
 */
export const TECHNICAL_PREFERENCES_PROMPT = `Analyze the following content to identify technical preferences.

Look for preferences in these categories:
- **Language**: Programming languages preferred or avoided
- **Framework**: Frameworks, libraries, platforms chosen
- **Tool**: Development tools, utilities, services used
- **Methodology**: Development approaches (agile, scrum, kanban, etc.)
- **Paradigm**: Programming paradigms (OOP, functional, reactive, etc.)
- **Architecture**: Architectural patterns (microservices, monolith, serverless, etc.)
- **Testing**: Testing approaches and tools preferred
- **Deployment**: Deployment strategies and platforms

For each preference:
1. Rate the strength (0-1) of the preference
2. Note whether it's explicit (stated) or implicit (inferred from behavior)
3. Identify the context where this preference applies
4. Note any related preferences

Content to analyze:
{content}

Previous Mind results:
{previousResults}

Respond in JSON format with an array of technical preferences.`;

/**
 * Prompt for analyzing tool choices
 */
export const TOOL_CHOICES_PROMPT = `Analyze the following content to identify tool choices and preferences.

Look for tools in these categories:
- **Editor**: IDEs, text editors, development environments
- **Version-control**: Git workflows, hosting platforms (GitHub, GitLab, etc.)
- **Build**: Build tools, bundlers, task runners
- **Testing**: Test frameworks, CI/CD tools, testing platforms
- **Deployment**: Cloud platforms, containerization, orchestration
- **Monitoring**: Observability tools, logging, metrics
- **Communication**: Collaboration tools, documentation platforms
- **Documentation**: Documentation tools, wikis, knowledge bases
- **Automation**: Scripting tools, automation platforms

For each tool:
1. Note how it's used
2. Identify when it's preferred
3. List any alternatives mentioned or implied

Content to analyze:
{content}

Previous Mind results:
{previousResults}

Respond in JSON format with an array of tool choices.`;

/**
 * Prompt for analyzing problem-solving methodology
 */
export const PROBLEM_SOLVING_PROMPT = `Analyze the following content to identify problem-solving methodology.

Look for evidence of these approaches:
- **Analytical**: Breaking problems into components, systematic analysis
- **Intuitive**: Following gut feelings, quick decisions based on experience
- **Systematic**: Following defined processes, methodologies
- **Creative**: Novel approaches, thinking outside the box
- **Collaborative**: Seeking input from others, pair work, discussions
- **Research-oriented**: Looking up information, studying documentation
- **Experimentation-driven**: Trying things out, hands-on exploration

Identify:
1. The primary problem-solving method used
2. Any secondary methods observed
3. Examples demonstrating these methods

Content to analyze:
{content}

Previous Mind results:
{previousResults}

Respond in JSON format with the problem-solving analysis.`;

/**
 * Prompt for analyzing execution style
 */
export const EXECUTION_STYLE_PROMPT = `Analyze the following content to identify execution style.

Look for these execution traits:
- **Thorough**: Comprehensive, detailed, leaves nothing to chance
- **Fast-paced**: Quick execution, prioritizes speed
- **Methodical**: Step-by-step, organized approach
- **Iterative**: Multiple passes, continuous improvement
- **Perfectionist**: High standards, attention to detail
- **Pragmatic**: Practical, "good enough" mindset
- **Experimental**: Tries many approaches, explores options

Rate on these scales:
- Speed preference (1-5): 1=slow/careful, 5=fast/rapid
- Quality vs Speed (0-1): 0=prioritizes speed, 1=prioritizes quality
- Risk tolerance (0-1): 0=risk-averse, 1=risk-embracing

Content to analyze:
{content}

Previous Mind results:
{previousResults}

Respond in JSON format with the execution style analysis.`;

/**
 * Prompt for analyzing resource allocation
 */
export const RESOURCE_ALLOCATION_PROMPT = `Analyze the following content to identify resource allocation patterns.

Look for these patterns:
- **Time-boxed**: Fixed time periods for tasks, deadlines drive work
- **Effort-driven**: Work expands to fill available time, thoroughness matters
- **Outcome-focused**: Results matter more than time spent
- **Balanced**: Mix of time constraints and quality focus
- **Prioritized**: Clear priorities guide where effort goes

Analyze:
1. Time management style
2. Effort distribution preferences
3. Priority handling approach

Content to analyze:
{content}

Previous Mind results:
{previousResults}

Respond in JSON format with the resource allocation analysis.`;

/**
 * Prompt for generating implementation profile summary
 */
export const PROFILE_SUMMARY_PROMPT = `Based on all the analysis results, create a comprehensive implementation profile summary.

Summarize:
1. Key implementation patterns that define this person's approach
2. Dominant technical preferences and their implications
3. Problem-solving style and methodology
4. Execution characteristics and pace
5. Resource allocation tendencies

Provide a cohesive narrative that captures how this person approaches getting things done technically.

All analysis results:
{analysisResults}

Respond with a concise but comprehensive profile summary (2-3 paragraphs).`;

/**
 * Build a formatted prompt with variable substitution
 */
export function buildPrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Get all analysis prompts with content injected
 */
export function getAnalysisPrompts(
  content: string,
  previousResults: string,
  _options?: ConstantinMindOptions
): Record<string, string> {
  return {
    implementationPatterns: buildPrompt(IMPLEMENTATION_PATTERNS_PROMPT, {
      content,
      previousResults,
    }),
    technicalPreferences: buildPrompt(TECHNICAL_PREFERENCES_PROMPT, {
      content,
      previousResults,
    }),
    toolChoices: buildPrompt(TOOL_CHOICES_PROMPT, {
      content,
      previousResults,
    }),
    problemSolving: buildPrompt(PROBLEM_SOLVING_PROMPT, {
      content,
      previousResults,
    }),
    executionStyle: buildPrompt(EXECUTION_STYLE_PROMPT, {
      content,
      previousResults,
    }),
    resourceAllocation: buildPrompt(RESOURCE_ALLOCATION_PROMPT, {
      content,
      previousResults,
    }),
  };
}

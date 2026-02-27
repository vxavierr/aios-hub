/**
 * @fileoverview LLM Prompt Templates for Quinn Mind
 * @description Prompt templates for quality analysis and validation
 * @module @clone-lab/minds/quinn
 */

import type {
  MindResult,
  MindId,
} from '../base/index.js';
import type {
  QualityIssue,
  CoverageGap,
  ConsistencyCheckResult,
  QualityBreakdown,
  RedFlag,
} from './types.js';

/**
 * System prompt for Quinn Mind
 */
export const QUINN_SYSTEM_PROMPT = `You are Quinn, a Quality Assurance Mind specialized in validating personality analysis results.

Your role is to:
1. Validate the quality of analysis from other Minds
2. Identify coverage gaps and missing information
3. Check consistency across different analytical perspectives
4. Detect red flags and potential issues
5. Calibrate confidence scores against evidence strength

Your approach is analytical, thorough, and detail-oriented. You follow quality engineering principles inspired by W. Edwards Deming:
- Focus on continuous improvement
- Use statistical evidence for decisions
- Identify root causes of quality issues
- Promote systematic quality assurance

You respond in a structured, professional manner with clear evidence-based reasoning.`;

/**
 * Prompt template for quality validation
 */
export const QUALITY_VALIDATION_PROMPT = `Analyze the following Mind results for quality issues.

## Analysis Results to Validate
{{mindResults}}

## Quality Criteria
1. **Evidence Quality**: Each trait should have supporting evidence
2. **Confidence Alignment**: Confidence should match evidence strength
3. **Completeness**: All relevant categories should be covered
4. **Consistency**: No contradictions within the analysis

## Output Format
Provide a JSON object with:
- qualityScore (0-100): Overall quality assessment
- issues: Array of quality issues found
- recommendations: Array of improvement suggestions`;

/**
 * Prompt template for consistency checking
 */
export const CONSISTENCY_CHECK_PROMPT = `Check consistency between the following Mind results.

## Mind Results
{{mindResults}}

## Consistency Dimensions
1. **Trait Alignment**: Do traits from different minds align?
2. **Confidence Correlation**: Are confidence levels consistent?
3. **Evidence Overlap**: Is there evidence supporting multiple analyses?
4. **Value Agreement**: Do values extracted agree across minds?

## Output Format
Provide a JSON object with:
- consistencyScore (0-100): Overall consistency score
- inconsistencies: Array of specific inconsistencies found
- alignments: Array of well-aligned areas`;

/**
 * Prompt template for gap identification
 */
export const GAP_IDENTIFICATION_PROMPT = `Identify coverage gaps in the following analysis results.

## Mind Results
{{mindResults}}

## Source Data Summary
{{sourceDataSummary}}

## Gap Categories to Check
1. **Missing Traits**: Personality dimensions not analyzed
2. **Insufficient Evidence**: Traits with weak supporting evidence
3. **Unanalyzed Data**: Source data not utilized in analysis
4. **Low Confidence Areas**: Areas with unusually low confidence
5. **Incomplete Analysis**: Categories partially covered

## Output Format
Provide a JSON object with:
- gaps: Array of coverage gaps with:
  - name: Gap identifier
  - category: Type of gap
  - description: What's missing
  - impact: Impact score (0-1)
  - suggestions: How to address the gap`;

/**
 * Prompt template for red flag detection
 */
export const RED_FLAG_DETECTION_PROMPT = `Analyze the following results for red flags and potential issues.

## Mind Results
{{mindResults}}

## Red Flag Types to Detect
1. **Contradictory Traits**: Traits that logically conflict
2. **Unusual Patterns**: Anomalous patterns in the data
3. **Data Inconsistency**: Inconsistencies in source data
4. **Confidence Mismatch**: Confidence not matching evidence
5. **Missing Critical Data**: Important information not present
6. **Suspicious Source**: Concerns about data source quality

## Output Format
Provide a JSON object with:
- redFlags: Array of red flags with:
  - type: Type of red flag
  - description: What was detected
  - confidence: Confidence this is a real issue (0-1)
  - action: Recommended action (investigate/warn/block/ignore)`;

/**
 * Prompt template for final quality report generation
 */
export const QUALITY_REPORT_PROMPT = `Generate a comprehensive quality report based on the following analysis.

## Quality Scores
{{qualityScores}}

## Issues Found
{{issues}}

## Gaps Identified
{{gaps}}

## Consistency Results
{{consistencyResults}}

## Red Flags
{{redFlags}}

## Output Format
Provide a JSON object with:
- overallScore: Overall quality score (0-100)
- passed: Boolean indicating if analysis passes quality threshold
- breakdown: Object with scores for each category
- recommendations: Array of prioritized recommendations
- summary: Brief text summary of quality status`;

/**
 * Builds a formatted prompt for quality validation
 */
export function buildQualityValidationPrompt(
  mindResults: Map<MindId, MindResult>
): string {
  const formattedResults = formatMindResults(mindResults);
  return QUALITY_VALIDATION_PROMPT.replace('{{mindResults}}', formattedResults);
}

/**
 * Builds a formatted prompt for consistency checking
 */
export function buildConsistencyCheckPrompt(
  mindResults: Map<MindId, MindResult>
): string {
  const formattedResults = formatMindResults(mindResults);
  return CONSISTENCY_CHECK_PROMPT.replace('{{mindResults}}', formattedResults);
}

/**
 * Builds a formatted prompt for gap identification
 */
export function buildGapIdentificationPrompt(
  mindResults: Map<MindId, MindResult>,
  sourceDataSummary: string
): string {
  const formattedResults = formatMindResults(mindResults);
  return GAP_IDENTIFICATION_PROMPT
    .replace('{{mindResults}}', formattedResults)
    .replace('{{sourceDataSummary}}', sourceDataSummary);
}

/**
 * Builds a formatted prompt for red flag detection
 */
export function buildRedFlagDetectionPrompt(
  mindResults: Map<MindId, MindResult>
): string {
  const formattedResults = formatMindResults(mindResults);
  return RED_FLAG_DETECTION_PROMPT.replace('{{mindResults}}', formattedResults);
}

/**
 * Builds a formatted prompt for quality report generation
 */
export function buildQualityReportPrompt(
  qualityScores: QualityBreakdown,
  issues: QualityIssue[],
  gaps: CoverageGap[],
  consistencyResults: ConsistencyCheckResult[],
  redFlags: RedFlag[]
): string {
  return QUALITY_REPORT_PROMPT
    .replace('{{qualityScores}}', JSON.stringify(qualityScores, null, 2))
    .replace('{{issues}}', JSON.stringify(issues, null, 2))
    .replace('{{gaps}}', JSON.stringify(gaps, null, 2))
    .replace('{{consistencyResults}}', JSON.stringify(consistencyResults, null, 2))
    .replace('{{redFlags}}', JSON.stringify(redFlags, null, 2));
}

/**
 * Formats Mind results for prompt inclusion
 */
function formatMindResults(mindResults: Map<MindId, MindResult>): string {
  const entries: string[] = [];

  mindResults.forEach((result, mindId) => {
    entries.push(`### ${mindId.toUpperCase()} Mind Results`);
    entries.push(`Confidence: ${result.confidence.toFixed(2)}`);
    entries.push(`Traits (${result.traits.length}):`);
    result.traits.forEach((trait) => {
      entries.push(`  - ${trait.category}/${trait.name}: ${trait.value} (confidence: ${trait.confidence.toFixed(2)})`);
    });
    entries.push(`Evidence items: ${result.evidence.length}`);
    entries.push(`Recommendations: ${result.recommendations.length}`);
    entries.push('');
  });

  return entries.join('\n');
}

/**
 * Template for trait validation
 */
export const TRAIT_VALIDATION_TEMPLATE = `Validate the following trait for quality:

Trait: {{traitName}}
Category: {{category}}
Value: {{value}}
Confidence: {{confidence}}
Sources: {{sources}}

Check:
1. Is the evidence sufficient for this trait?
2. Is the confidence appropriate for the evidence?
3. Are there any contradictions?
4. Is the trait well-defined?`;

/**
 * Template for evidence quality assessment
 */
export const EVIDENCE_QUALITY_TEMPLATE = `Assess the quality of the following evidence:

Source: {{source}}
Excerpt: {{excerpt}}
Relevance: {{relevance}}
Type: {{type}}

Rate the evidence on:
1. Clarity (1-5)
2. Relevance (1-5)
3. Reliability (1-5)
4. Specificity (1-5)`;

/**
 * Template for confidence calibration
 */
export const CONFIDENCE_CALIBRATION_TEMPLATE = `Calibrate confidence scores for the following analysis:

Trait Count: {{traitCount}}
Evidence Count: {{evidenceCount}}
Average Confidence: {{avgConfidence}}
Confidence Range: {{confidenceRange}}

Assess:
1. Is average confidence appropriate for evidence volume?
2. Are there outliers in confidence?
3. Do high-confidence traits have strong evidence?
4. Are low-confidence areas appropriately flagged?`;

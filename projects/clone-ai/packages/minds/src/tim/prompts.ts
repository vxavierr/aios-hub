/**
 * @fileoverview LLM prompt templates for Tim Mind analysis
 * @description Prompts for source quality assessment, duplicate detection, and coverage analysis
 * @module @clone-lab/minds/tim
 */

import type { ExtractedData } from '../base/types.js';

/**
 * System prompt for Tim Mind persona
 */
export const TIM_SYSTEM_PROMPT = `You are Tim, an extraction specialist inspired by Tim Ferriss.

Your expertise is in identifying high-quality sources and curating content efficiently. You have a pragmatic approach to data extraction and analysis.

Your core principles:
1. Quality over quantity - focus on the best sources
2. Efficiency - eliminate redundancy and noise
3. Actionability - provide clear, practical recommendations
4. Depth - value substantive content over superficial mentions

You analyze extracted data to assess source quality, detect duplicates, and calculate coverage.`;

/**
 * Prompt for assessing source quality
 */
export const SOURCE_QUALITY_PROMPT = `Analyze the following extracted data and assess its quality.

For each source, evaluate:
1. Credibility (0-100): How reliable and trustworthy is this source?
2. Recency (0-100): How current is the content?
3. Depth (0-100): How substantive and detailed is the content?
4. Relevance (0-100): How relevant is this to understanding the person's personality?

Data to analyze:
{{data}}

Respond in JSON format:
{
  "assessments": [
    {
      "sourceId": "string",
      "credibility": { "score": number, "factors": ["string"] },
      "recency": { "score": number, "ageInDays": number | null },
      "depth": { "score": number, "wordCount": number, "isSubstantive": boolean },
      "relevance": { "score": number, "topics": ["string"] },
      "overallScore": number
    }
  ]
}`;

/**
 * Prompt for detecting duplicates
 */
export const DUPLICATE_DETECTION_PROMPT = `Analyze the following sources and identify duplicates or near-duplicates.

Look for:
1. Exact duplicates: Identical or nearly identical content
2. Semantic duplicates: Different wording but same information
3. Redundant sources: Same topics covered with similar depth

Data to analyze:
{{data}}

Respond in JSON format:
{
  "duplicateGroups": [
    {
      "type": "exact" | "near" | "semantic",
      "similarity": number (0-1),
      "sourceIds": ["string"],
      "primarySourceId": "string",
      "primaryReason": "string explaining why this source is best"
    }
  ]
}`;

/**
 * Prompt for coverage analysis
 */
export const COVERAGE_ANALYSIS_PROMPT = `Analyze the coverage of topics in the following extracted data.

Evaluate:
1. What topics are well covered?
2. What topics are missing or underrepresented?
3. How is the temporal distribution of content?
4. What is the format diversity?

Data to analyze:
{{data}}

Respond in JSON format:
{
  "coveredTopics": [
    {
      "topic": "string",
      "sourceCount": number,
      "quality": number (0-100),
      "sourceIds": ["string"]
    }
  ],
  "gaps": [
    {
      "topic": "string",
      "severity": "critical" | "moderate" | "minor",
      "recommendation": "string"
    }
  ],
  "temporalDistribution": {
    "earliestDate": "ISO date string or null",
    "latestDate": "ISO date string or null",
    "spreadScore": number (0-100)
  },
  "formatDiversity": {
    "score": number (0-100),
    "hasVariety": boolean
  },
  "overallCoverageScore": number (0-100)
}`;

/**
 * Prompt for generating recommendations
 */
export const RECOMMENDATIONS_PROMPT = `Based on the following analysis results, generate actionable recommendations.

Analysis results:
- Source quality assessments: {{sourceQuality}}
- Duplicate groups: {{duplicates}}
- Coverage analysis: {{coverage}}

Generate recommendations for:
1. Which sources to prioritize for analysis
2. Which sources to remove or de-prioritize
3. What additional sources to seek
4. How to improve overall data quality

Respond in JSON format:
{
  "prioritizedSources": ["sourceId1", "sourceId2"],
  "sourcesToRemove": ["sourceId3"],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "additionalSourcesNeeded": [
    {
      "type": "source type",
      "reason": "why needed"
    }
  ]
}`;

/**
 * Format extracted data for prompt inclusion
 */
export function formatDataForPrompt(data: ExtractedData[]): string {
  return data
    .map((item, index) => {
      const preview =
        item.content.length > 500
          ? item.content.substring(0, 500) + '...'
          : item.content;
      return `[${index + 1}] ID: ${item.id}
Type: ${item.sourceType}
Timestamp: ${item.timestamp?.toISOString() || 'Unknown'}
Content Preview: ${preview}`;
    })
    .join('\n\n');
}

/**
 * Build a complete analysis prompt
 */
export function buildAnalysisPrompt(
  data: ExtractedData[],
  promptTemplate: string
): string {
  const formattedData = formatDataForPrompt(data);
  return promptTemplate.replace('{{data}}', formattedData);
}

/**
 * Get the full Tim Mind analysis prompt (combines all analysis steps)
 */
export function getFullAnalysisPrompt(data: ExtractedData[]): string {
  const formattedData = formatDataForPrompt(data);

  return `${TIM_SYSTEM_PROMPT}

Analyze the following extracted data comprehensively:

${formattedData}

Provide a complete analysis including:
1. Source quality assessment for each source
2. Duplicate detection
3. Coverage analysis
4. Prioritized list of sources
5. Recommendations

Respond in JSON format:
{
  "sourceQuality": [
    {
      "sourceId": "string",
      "score": number (0-100),
      "credibility": { "score": number, "factors": ["string"] },
      "recency": { "score": number, "ageInDays": number | null },
      "depth": { "score": number, "wordCount": number, "isSubstantive": boolean },
      "relevance": { "score": number, "topics": ["string"] }
    }
  ],
  "duplicates": [
    {
      "groupId": "string",
      "type": "exact" | "near" | "semantic",
      "similarity": number (0-1),
      "sourceIds": ["string"],
      "primarySourceId": "string",
      "primaryReason": "string"
    }
  ],
  "coverage": {
    "score": number (0-100),
    "coveredTopics": [{ "topic": "string", "sourceCount": number, "quality": number, "sourceIds": ["string"] }],
    "gaps": [{ "topic": "string", "severity": "critical" | "moderate" | "minor", "recommendation": "string" }],
    "temporalDistribution": {
      "earliestDate": "ISO date or null",
      "latestDate": "ISO date or null",
      "spreadScore": number
    },
    "formatDiversity": { "score": number, "hasVariety": boolean }
  },
  "prioritizedSources": ["string"],
  "recommendations": ["string"]
}`;
}

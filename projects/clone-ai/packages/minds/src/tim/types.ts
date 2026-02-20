/**
 * @fileoverview Types specific to Tim Mind (Extraction Specialist)
 * @description Source quality, duplicate detection, and coverage analysis types
 * @module @clone-lab/minds/tim
 */

/**
 * Quality assessment for a single source
 */
export interface SourceQuality {
  /** ID of the source being assessed */
  sourceId: string;
  /** Overall quality score (0-100) */
  score: number;
  /** Credibility assessment */
  credibility: {
    /** Credibility score (0-100) */
    score: number;
    /** Factors contributing to credibility */
    factors: string[];
  };
  /** Recency of the content */
  recency: {
    /** Recency score (0-100) */
    score: number;
    /** Age of content in days (null if unknown) */
    ageInDays: number | null;
  };
  /** Depth of content */
  depth: {
    /** Depth score (0-100) */
    score: number;
    /** Word count of content */
    wordCount: number;
    /** Whether content appears substantive */
    isSubstantive: boolean;
  };
  /** Relevance to the target persona */
  relevance: {
    /** Relevance score (0-100) */
    score: number;
    /** Keywords/topics found */
    topics: string[];
  };
}

/**
 * Group of duplicate or near-duplicate content
 */
export interface DuplicateGroup {
  /** Unique identifier for this group */
  groupId: string;
  /** Type of duplication */
  type: 'exact' | 'near' | 'semantic';
  /** Similarity score (0-1) */
  similarity: number;
  /** IDs of sources in this group */
  sourceIds: string[];
  /** ID of the primary (best quality) source to keep */
  primarySourceId: string;
  /** Reason for selecting primary source */
  primaryReason: string;
}

/**
 * Coverage analysis result
 */
export interface CoverageResult {
  /** Overall coverage score (0-100) */
  score: number;
  /** Topics that are well covered */
  coveredTopics: TopicCoverage[];
  /** Topics that are missing or underrepresented */
  gaps: CoverageGap[];
  /** Temporal distribution of content */
  temporalDistribution: TemporalDistribution;
  /** Format diversity metrics */
  formatDiversity: FormatDiversity;
}

/**
 * Coverage details for a specific topic
 */
export interface TopicCoverage {
  /** Topic name */
  topic: string;
  /** Number of sources covering this topic */
  sourceCount: number;
  /** Coverage quality score (0-100) */
  quality: number;
  /** IDs of sources covering this topic */
  sourceIds: string[];
}

/**
 * Gap in coverage for a topic
 */
export interface CoverageGap {
  /** Topic that is missing or underrepresented */
  topic: string;
  /** Gap severity */
  severity: 'critical' | 'moderate' | 'minor';
  /** Recommended action to fill the gap */
  recommendation: string;
}

/**
 * Temporal distribution of content
 */
export interface TemporalDistribution {
  /** Earliest content date */
  earliestDate: Date | null;
  /** Latest content date */
  latestDate: Date | null;
  /** Distribution by time period */
  periods: TimePeriod[];
  /** Spread score (0-100) - higher means better distribution */
  spreadScore: number;
}

/**
 * Content count for a time period
 */
export interface TimePeriod {
  /** Period identifier (e.g., '2024-Q1') */
  period: string;
  /** Number of sources in this period */
  count: number;
}

/**
 * Format diversity metrics
 */
export interface FormatDiversity {
  /** Diversity score (0-100) */
  score: number;
  /** Count by source type */
  byType: Record<string, number>;
  /** Whether there is good format variety */
  hasVariety: boolean;
}

/**
 * Configuration options for Tim Mind
 */
export interface TimMindOptions {
  /** Minimum quality score to consider a source (0-100) */
  minQualityScore?: number;
  /** Similarity threshold for duplicate detection (0-1) */
  duplicateThreshold?: number;
  /** Minimum coverage score target (0-100) */
  targetCoverageScore?: number;
  /** Whether to include low-quality sources in analysis */
  includeLowQuality?: boolean;
  /** Batch size for processing large datasets */
  batchSize?: number;
}

/**
 * Default configuration for Tim Mind
 */
export const DEFAULT_TIM_OPTIONS: Required<TimMindOptions> = {
  minQualityScore: 30,
  duplicateThreshold: 0.85,
  targetCoverageScore: 70,
  includeLowQuality: false,
  batchSize: 50,
};

/**
 * Analysis result specific to Tim Mind
 */
export interface TimAnalysisResult {
  /** Source quality assessments */
  sourceQuality: SourceQuality[];
  /** Detected duplicate groups */
  duplicates: DuplicateGroup[];
  /** Coverage analysis */
  coverage: CoverageResult;
  /** Recommended sources to prioritize */
  prioritizedSources: string[];
  /** Sources recommended for removal */
  sourcesToRemove: string[];
}

/**
 * Helper function to calculate a weighted average score
 */
export function calculateWeightedScore(
  components: Array<{ score: number; weight: number }>
): number {
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = components.reduce(
    (sum, c) => sum + c.score * c.weight,
    0
  );
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Helper to check if a source meets minimum quality threshold
 */
export function meetsQualityThreshold(
  quality: SourceQuality,
  minScore: number
): boolean {
  return quality.score >= minScore;
}

/**
 * Extract word count from content
 */
export function getWordCount(content: string): number {
  if (!content || typeof content !== 'string') return 0;
  return content.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate age of content in days
 */
export function calculateAgeInDays(timestamp: Date | undefined): number | null {
  if (!timestamp) return null;
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

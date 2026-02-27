/**
 * @fileoverview Core types for the Mind Orchestrator
 * @description Type definitions for orchestration, execution planning, and results
 * @module @clone-lab/orchestrator
 */

import type { MindId, MindResult } from '@clone-lab/minds';

/**
 * Configuration options for the Mind Orchestrator
 */
export interface OrchestratorConfig {
  /** Default timeout for each Mind execution in milliseconds */
  defaultTimeout?: number;
  /** Whether to continue execution if a Mind fails */
  continueOnError?: boolean;
  /** Maximum number of parallel Minds to execute per wave */
  maxParallelism?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom timeouts per Mind ID */
  mindTimeouts?: Partial<Record<MindId, number>>;
  /** Hook called before each Mind execution */
  onMindStart?: (mindId: MindId, wave: number) => void;
  /** Hook called after each Mind completes */
  onMindComplete?: (mindId: MindId, result: MindResult, wave: number) => void;
  /** Hook called when a Mind fails */
  onMindError?: (mindId: MindId, error: Error, wave: number) => void;
  /** Hook called when a wave starts */
  onWaveStart?: (wave: number, mindIds: MindId[]) => void;
  /** Hook called when a wave completes */
  onWaveComplete?: (wave: number, results: Map<MindId, MindResult>) => void;
}

/**
 * Represents a single execution wave containing Minds that can run in parallel
 */
export interface Wave {
  /** Wave number (0-indexed) */
  waveNumber: number;
  /** Mind IDs in this wave */
  mindIds: MindId[];
  /** Minds in this wave that have completed */
  completed: MindId[];
  /** Minds in this wave that failed */
  failed: MindId[];
}

/**
 * Represents the full execution plan with dependency-ordered waves
 */
export interface ExecutionPlan {
  /** All Mind IDs in the plan */
  mindIds: MindId[];
  /** Execution waves (topologically sorted) */
  waves: Wave[];
  /** Map of Mind ID to its dependencies */
  dependencies: Map<MindId, MindId[]>;
  /** Total number of waves */
  totalWaves: number;
}

/**
 * Status of a single Mind execution
 */
export type MindExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * Information about a single Mind's execution
 */
export interface MindExecutionInfo {
  /** Mind ID */
  mindId: MindId;
  /** Current status */
  status: MindExecutionStatus;
  /** Wave this Mind belongs to */
  wave: number;
  /** Execution start time */
  startTime?: Date;
  /** Execution end time */
  endTime?: Date;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Error if failed */
  error?: Error;
  /** Result if completed */
  result?: MindResult;
}

/**
 * Result of the orchestration execution
 */
export interface OrchestrationResult {
  /** Session ID for this execution */
  sessionId: string;
  /** Whether all Minds completed successfully */
  success: boolean;
  /** All Mind results, keyed by Mind ID */
  results: Map<MindId, MindResult>;
  /** Execution info for each Mind */
  executionInfo: Map<MindId, MindExecutionInfo>;
  /** Total execution time in milliseconds */
  totalDurationMs: number;
  /** Number of Minds that completed successfully */
  completedCount: number;
  /** Number of Minds that failed */
  failedCount: number;
  /** Number of Minds that were skipped */
  skippedCount: number;
  /** The execution plan that was used */
  executionPlan: ExecutionPlan;
  /** Any errors that occurred */
  errors: OrchestrationError[];
  /** Timestamp when execution started */
  startedAt: Date;
  /** Timestamp when execution completed */
  completedAt: Date;
}

/**
 * Represents an error that occurred during orchestration
 */
export interface OrchestrationError {
  /** Mind ID where the error occurred */
  mindId: MindId;
  /** The error that was thrown */
  error: Error;
  /** Wave number where the error occurred */
  wave: number;
  /** Whether the error was recoverable */
  recoverable: boolean;
}

/**
 * Internal state for tracking execution progress
 */
export interface OrchestrationState {
  /** Current wave being executed */
  currentWave: number;
  /** Minds that have completed */
  completedMinds: Set<MindId>;
  /** Minds that have failed */
  failedMinds: Set<MindId>;
  /** Minds that were skipped */
  skippedMinds: Set<MindId>;
  /** Results from completed Minds */
  results: Map<MindId, MindResult>;
  /** Errors that occurred */
  errors: OrchestrationError[];
}

/**
 * Default configuration values
 */
export const DEFAULT_ORCHESTRATOR_CONFIG: Required<
  Pick<
    OrchestratorConfig,
    'defaultTimeout' | 'continueOnError' | 'maxParallelism' | 'verbose'
  >
> & Pick<OrchestratorConfig, 'mindTimeouts' | 'onMindStart' | 'onMindComplete' | 'onMindError' | 'onWaveStart' | 'onWaveComplete'> = {
  defaultTimeout: 30000, // 30 seconds
  continueOnError: true,
  maxParallelism: Infinity, // No limit by default
  verbose: false,
  mindTimeouts: undefined,
  onMindStart: undefined,
  onMindComplete: undefined,
  onMindError: undefined,
  onWaveStart: undefined,
  onWaveComplete: undefined,
};

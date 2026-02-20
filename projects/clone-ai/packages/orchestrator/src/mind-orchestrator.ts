/**
 * @fileoverview Mind Orchestrator
 * @description Main orchestrator class for executing Minds in dependency-ordered waves
 * @module @clone-lab/orchestrator
 */

import type {
  IMind,
  MindId,
  MindContext,
} from '@clone-lab/minds';
import type { ExtractedData } from '@clone-lab/core';
import type {
  OrchestratorConfig,
  ExecutionPlan,
  OrchestrationResult,
  OrchestrationState,
  MindExecutionInfo,
  Wave,
} from './types.js';
import {
  DEFAULT_ORCHESTRATOR_CONFIG,
} from './types.js';
import { SharedContext } from './shared-context.js';
import { ExecutionPlanner } from './execution-planner.js';

/**
 * MindOrchestrator coordinates the execution of multiple Minds in dependency order.
 * It performs topological sorting to create execution waves, then executes Minds
 * in parallel within each wave while respecting dependencies.
 *
 * @example
 * ```typescript
 * const minds: IMind[] = [new TimMind(), new DanielMind(), ...];
 * const orchestrator = new MindOrchestrator(minds, {
 *   continueOnError: true,
 *   defaultTimeout: 30000
 * });
 *
 * const result = await orchestrator.execute(extractedData, 'session-123');
 * if (result.success) {
 *   console.log('All Minds completed successfully');
 * }
 * ```
 */
export class MindOrchestrator {
  private readonly minds: Map<MindId, IMind>;
  private readonly config: Required<
    Pick<
      OrchestratorConfig,
      'defaultTimeout' | 'continueOnError' | 'maxParallelism' | 'verbose'
    >
  > &
    Pick<
      OrchestratorConfig,
      | 'mindTimeouts'
      | 'onMindStart'
      | 'onMindComplete'
      | 'onMindError'
      | 'onWaveStart'
      | 'onWaveComplete'
    >;
  private readonly planner: ExecutionPlanner;
  private executionPlan: ExecutionPlan | null = null;

  /**
   * Create a new Mind Orchestrator
   * @param minds - Array of Minds to orchestrate
   * @param config - Optional configuration
   */
  constructor(minds: IMind[], config?: OrchestratorConfig) {
    this.minds = new Map(minds.map((mind) => [mind.persona.id, mind]));
    this.config = { ...DEFAULT_ORCHESTRATOR_CONFIG, ...config };
    this.planner = new ExecutionPlanner(minds);

    // Build the execution plan on construction
    this.executionPlan = this.planner.buildPlan();
  }

  /**
   * Execute all Minds in dependency order
   * @param extractedData - Data to analyze
   * @param sessionId - Unique session identifier
   * @returns Orchestration result with all Mind results
   */
  async execute(
    extractedData: ExtractedData[],
    sessionId: string
  ): Promise<OrchestrationResult> {
    const startedAt = new Date();
    const sharedContext = new SharedContext(extractedData, sessionId);

    // Initialize state
    const state: OrchestrationState = {
      currentWave: 0,
      completedMinds: new Set(),
      failedMinds: new Set(),
      skippedMinds: new Set(),
      results: new Map(),
      errors: [],
    };

    const executionInfo = new Map<MindId, MindExecutionInfo>();

    // Initialize execution info for all Minds
    for (const mindId of this.executionPlan!.mindIds) {
      const wave = this.planner.getWaveForMind(mindId, this.executionPlan!);
      executionInfo.set(mindId, {
        mindId,
        status: 'pending',
        wave,
      });
    }

    try {
      // Execute waves sequentially
      for (const wave of this.executionPlan!.waves) {
        state.currentWave = wave.waveNumber;

        // Skip wave if all Minds failed dependencies and we're not continuing
        if (!this.config.continueOnError && state.failedMinds.size > 0) {
          // Skip remaining Minds
          for (const mindId of wave.mindIds) {
            if (!state.completedMinds.has(mindId) && !state.failedMinds.has(mindId)) {
              state.skippedMinds.add(mindId);
              const info = executionInfo.get(mindId)!;
              info.status = 'skipped';
            }
          }
          continue;
        }

        // Call wave start hook
        this.config.onWaveStart?.(wave.waveNumber, wave.mindIds);

        // Execute Minds in this wave (with parallelism limit)
        await this.executeWave(
          wave,
          sharedContext,
          state,
          executionInfo
        );

        // Call wave complete hook
        this.config.onWaveComplete?.(wave.waveNumber, state.results);
      }
    } catch (error) {
      // Unexpected error - record it
      this.log(`Orchestration error: ${error}`);
    }

    const completedAt = new Date();
    const totalDurationMs = completedAt.getTime() - startedAt.getTime();

    // Build final result
    return {
      sessionId,
      success: state.failedMinds.size === 0 && state.skippedMinds.size === 0,
      results: state.results,
      executionInfo,
      totalDurationMs,
      completedCount: state.completedMinds.size,
      failedCount: state.failedMinds.size,
      skippedCount: state.skippedMinds.size,
      executionPlan: this.executionPlan!,
      errors: state.errors,
      startedAt,
      completedAt,
    };
  }

  /**
   * Execute a single wave of Minds
   */
  private async executeWave(
    wave: Wave,
    sharedContext: SharedContext,
    state: OrchestrationState,
    executionInfo: Map<MindId, MindExecutionInfo>
  ): Promise<void> {
    const { mindIds } = wave;

    // Check which Minds can actually run (dependencies satisfied)
    const runnableMinds = mindIds.filter((mindId) => {
      const mind = this.minds.get(mindId)!;
      const deps = mind.getDependencies();

      // Check if any dependency failed
      const hasFailedDep = deps.some((dep) => state.failedMinds.has(dep));
      if (hasFailedDep) {
        state.skippedMinds.add(mindId);
        const info = executionInfo.get(mindId)!;
        info.status = 'skipped';
        return false;
      }

      // Check if all dependencies completed
      const allDepsComplete = deps.every((dep) => state.completedMinds.has(dep));
      return allDepsComplete;
    });

    // Apply parallelism limit
    const limitedMinds = this.config.maxParallelism < Infinity
      ? runnableMinds.slice(0, this.config.maxParallelism)
      : runnableMinds;

    // Skip Minds that exceed parallelism limit
    if (limitedMinds.length < runnableMinds.length) {
      const skipped = runnableMinds.slice(this.config.maxParallelism);
      for (const mindId of skipped) {
        state.skippedMinds.add(mindId);
        const info = executionInfo.get(mindId)!;
        info.status = 'skipped';
      }
    }

    if (limitedMinds.length === 0) {
      return;
    }

    // Execute Minds in parallel
    const promises = limitedMinds.map((mindId) =>
      this.executeMind(mindId, sharedContext, state, executionInfo, wave.waveNumber)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Execute a single Mind
   */
  private async executeMind(
    mindId: MindId,
    sharedContext: SharedContext,
    state: OrchestrationState,
    executionInfo: Map<MindId, MindExecutionInfo>,
    waveNumber: number
  ): Promise<void> {
    const mind = this.minds.get(mindId)!;
    const info = executionInfo.get(mindId)!;
    const startTime = new Date();

    info.status = 'running';
    info.startTime = startTime;

    // Call start hook
    this.config.onMindStart?.(mindId, waveNumber);

    try {
      // Get timeout for this Mind
      const timeout =
        this.config.mindTimeouts?.[mindId] ?? this.config.defaultTimeout;

      // Build context with previous results
      const context: MindContext = {
        extractedData: sharedContext.getExtractedData(),
        previousResults: sharedContext.getAllResults(),
        options: { waveNumber },
        sessionId: sharedContext.getSessionId(),
        metadata: {
          createdAt: startTime,
        },
      };

      // Check if Mind can handle the context
      if (!mind.canHandle(context)) {
        this.log(`Mind ${mindId} cannot handle the current context`);
        throw new Error(`Mind ${mindId} cannot handle the current context`);
      }

      // Execute with timeout
      const result = await this.executeWithTimeout(
        mind.analyze(context),
        timeout,
        mindId
      );

      // Store result
      const endTime = new Date();
      info.status = 'completed';
      info.endTime = endTime;
      info.durationMs = endTime.getTime() - startTime.getTime();
      info.result = result;

      sharedContext.setResult(mindId, result);
      state.results.set(mindId, result);
      state.completedMinds.add(mindId);

      // Call complete hook
      this.config.onMindComplete?.(mindId, result, waveNumber);

      this.log(
        `Mind ${mindId} completed in ${info.durationMs}ms with confidence ${result.confidence}`
      );
    } catch (error) {
      const endTime = new Date();
      const err = error instanceof Error ? error : new Error(String(error));

      info.status = 'failed';
      info.endTime = endTime;
      info.durationMs = endTime.getTime() - startTime.getTime();
      info.error = err;

      state.failedMinds.add(mindId);
      state.errors.push({
        mindId,
        error: err,
        wave: waveNumber,
        recoverable: this.config.continueOnError,
      });

      // Call error hook
      this.config.onMindError?.(mindId, err, waveNumber);

      this.log(`Mind ${mindId} failed: ${err.message}`);

      // Re-throw if not continuing on error
      if (!this.config.continueOnError) {
        throw err;
      }
    }
  }

  /**
   * Execute a promise with timeout
   */
  private executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    mindId: MindId
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Mind ${mindId} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Get the execution plan
   * @returns The execution plan
   */
  getExecutionPlan(): ExecutionPlan {
    if (!this.executionPlan) {
      this.executionPlan = this.planner.buildPlan();
    }
    return this.executionPlan;
  }

  /**
   * Get registered Minds
   * @returns Array of registered Minds
   */
  getMinds(): IMind[] {
    return Array.from(this.minds.values());
  }

  /**
   * Get a specific Mind by ID
   * @param mindId - The Mind ID
   * @returns The Mind or undefined
   */
  getMind(mindId: MindId): IMind | undefined {
    return this.minds.get(mindId);
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[Orchestrator] ${message}`);
    }
  }
}

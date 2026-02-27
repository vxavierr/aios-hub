/**
 * @fileoverview Shared Context for Mind Orchestrator
 * @description Manages results and state sharing between Minds during execution
 * @module @clone-lab/orchestrator
 */

import type { MindId, MindResult } from '@clone-lab/minds';
import type { ExtractedData } from '@clone-lab/core';

/**
 * SharedContext manages the results and state between Minds during orchestration.
 * It provides a thread-safe way for Minds to access results from their dependencies.
 */
export class SharedContext {
  private readonly results: Map<MindId, MindResult> = new Map();
  private readonly extractedData: ExtractedData[];
  private readonly sessionId: string;
  private readonly metadata: Record<string, unknown>;

  constructor(
    extractedData: ExtractedData[],
    sessionId: string,
    metadata: Record<string, unknown> = {}
  ) {
    this.extractedData = extractedData;
    this.sessionId = sessionId;
    this.metadata = metadata;
  }

  /**
   * Store a Mind's result in the shared context
   * @param mindId - The Mind ID
   * @param result - The result to store
   */
  setResult(mindId: MindId, result: MindResult): void {
    this.results.set(mindId, result);
  }

  /**
   * Get a Mind's result from the shared context
   * @param mindId - The Mind ID
   * @returns The result or undefined if not found
   */
  getResult(mindId: MindId): MindResult | undefined {
    return this.results.get(mindId);
  }

  /**
   * Check if a Mind has completed and stored its result
   * @param mindId - The Mind ID
   * @returns Whether the result exists
   */
  hasResult(mindId: MindId): boolean {
    return this.results.has(mindId);
  }

  /**
   * Get all results stored in the context
   * @returns Map of all Mind results
   */
  getAllResults(): Map<MindId, MindResult> {
    return new Map(this.results);
  }

  /**
   * Get results for specific Mind IDs
   * @param mindIds - The Mind IDs to get results for
   * @returns Map of requested Mind results
   */
  getResults(mindIds: MindId[]): Map<MindId, MindResult> {
    const filtered = new Map<MindId, MindResult>();
    for (const mindId of mindIds) {
      const result = this.results.get(mindId);
      if (result) {
        filtered.set(mindId, result);
      }
    }
    return filtered;
  }

  /**
   * Get the extracted data
   * @returns The extracted data array
   */
  getExtractedData(): ExtractedData[] {
    return this.extractedData;
  }

  /**
   * Get the session ID
   * @returns The session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get metadata
   * @returns The metadata object
   */
  getMetadata(): Record<string, unknown> {
    return { ...this.metadata };
  }

  /**
   * Get a specific metadata value
   * @param key - The metadata key
   * @returns The metadata value or undefined
   */
  getMetadataValue<T = unknown>(key: string): T | undefined {
    return this.metadata[key] as T | undefined;
  }

  /**
   * Set a metadata value
   * @param key - The metadata key
   * @param value - The value to set
   */
  setMetadataValue(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Check if all dependencies have completed
   * @param dependencies - The Mind IDs to check
   * @returns Whether all dependencies have results
   */
  areDependenciesComplete(dependencies: MindId[]): boolean {
    return dependencies.every((dep) => this.results.has(dep));
  }

  /**
   * Get the number of completed Minds
   * @returns The count of completed Minds
   */
  getCompletedCount(): number {
    return this.results.size;
  }

  /**
   * Clear all results (useful for re-running)
   */
  clearResults(): void {
    this.results.clear();
  }

  /**
   * Create a serializable snapshot of the context
   * @returns JSON-safe representation of the context
   */
  toSnapshot(): {
    sessionId: string;
    metadata: Record<string, unknown>;
    results: Record<string, MindResult>;
    extractedDataCount: number;
  } {
    const resultsRecord: Record<string, MindResult> = {};
    this.results.forEach((result, mindId) => {
      resultsRecord[mindId] = result;
    });

    return {
      sessionId: this.sessionId,
      metadata: this.metadata,
      results: resultsRecord,
      extractedDataCount: this.extractedData.length,
    };
  }
}

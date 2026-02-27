/**
 * @fileoverview Execution Planner for Mind Orchestrator
 * @description Builds execution plans with topological sort based on Mind dependencies
 * @module @clone-lab/orchestrator
 */

import type { IMind, MindId } from '@clone-lab/minds';
import type { ExecutionPlan, Wave } from './types.js';

/**
 * ExecutionPlanner builds an execution plan by performing topological sorting
 * on the Mind dependency graph. Minds are grouped into waves where all Minds
 * in a wave can execute in parallel.
 *
 * Dependency structure:
 * - Wave 1: Tim (no deps)
 * - Wave 2: Daniel, Brene, Barbara (all depend on Tim) - PARALLEL
 * - Wave 3: Charlie (depends on Daniel, Brene, Barbara)
 * - Wave 4: Constantin (depends on Charlie)
 * - Wave 5: Quinn, Victoria (both depend on Constantin) - PARALLEL
 */
export class ExecutionPlanner {
  private readonly minds: IMind[];
  private readonly mindMap: Map<MindId, IMind>;

  constructor(minds: IMind[]) {
    this.minds = minds;
    this.mindMap = new Map(minds.map((mind) => [mind.persona.id, mind]));
  }

  /**
   * Build the execution plan with topological sort
   * @returns The execution plan with waves of Minds
   */
  buildPlan(): ExecutionPlan {
    // Build dependency map
    const dependencies = this.buildDependencyMap();

    // Perform topological sort to create waves
    const waves = this.topologicalSort(dependencies);

    // Get all Mind IDs
    const mindIds = this.minds.map((mind) => mind.persona.id);

    return {
      mindIds,
      waves,
      dependencies,
      totalWaves: waves.length,
    };
  }

  /**
   * Build a map of Mind ID to its dependencies
   * @returns Map of Mind ID to array of dependency Mind IDs
   */
  private buildDependencyMap(): Map<MindId, MindId[]> {
    const dependencies = new Map<MindId, MindId[]>();

    for (const mind of this.minds) {
      const mindId = mind.persona.id;
      const deps = mind.getDependencies();

      // Validate dependencies exist
      for (const dep of deps) {
        if (!this.mindMap.has(dep)) {
          throw new Error(
            `Mind "${mindId}" depends on "${dep}" which is not registered in the orchestrator`
          );
        }
      }

      dependencies.set(mindId, deps);
    }

    return dependencies;
  }

  /**
   * Perform topological sort to create execution waves
   * Uses Kahn's algorithm with wave tracking
   * @param dependencies - Map of Mind ID to dependencies
   * @returns Array of waves
   */
  private topologicalSort(dependencies: Map<MindId, MindId[]>): Wave[] {
    const waves: Wave[] = [];

    // Track in-degree (number of dependencies) for each Mind
    const inDegree = new Map<MindId, number>();
    const remainingDeps = new Map<MindId, Set<MindId>>();

    for (const [mindId, deps] of dependencies) {
      inDegree.set(mindId, deps.length);
      remainingDeps.set(mindId, new Set(deps));
    }

    // Track which Minds are ready (no remaining dependencies)
    const ready: MindId[] = [];
    const processed = new Set<MindId>();

    // Find initially ready Minds (no dependencies)
    for (const [mindId, degree] of inDegree) {
      if (degree === 0) {
        ready.push(mindId);
      }
    }

    // Process in waves
    while (ready.length > 0 || processed.size < this.minds.length) {
      // Get all currently ready Minds as a wave
      if (ready.length === 0) {
        // Circular dependency detected - no Minds are ready but not all processed
        const remaining = this.minds
          .map((m) => m.persona.id)
          .filter((id) => !processed.has(id));
        throw new Error(
          `Circular dependency detected among Minds: ${remaining.join(', ')}`
        );
      }

      const waveMindIds = [...ready];
      ready.length = 0; // Clear ready array

      // Create wave
      waves.push({
        waveNumber: waves.length,
        mindIds: waveMindIds,
        completed: [],
        failed: [],
      });

      // Mark Minds as processed and update dependencies
      for (const mindId of waveMindIds) {
        processed.add(mindId);

        // Update in-degrees of Minds that depend on this one
        for (const [otherId, otherDeps] of remainingDeps) {
          if (otherDeps.has(mindId)) {
            otherDeps.delete(mindId);
            const newDegree = (inDegree.get(otherId) ?? 0) - 1;
            inDegree.set(otherId, newDegree);

            if (newDegree === 0 && !processed.has(otherId)) {
              ready.push(otherId);
            }
          }
        }
      }
    }

    return waves;
  }

  /**
   * Validate the execution plan for issues
   * @param plan - The execution plan to validate
   * @returns Array of validation issues (empty if valid)
   */
  validatePlan(plan: ExecutionPlan): string[] {
    const issues: string[] = [];

    // Check for duplicate Mind IDs
    const seenIds = new Set<MindId>();
    for (const mindId of plan.mindIds) {
      if (seenIds.has(mindId)) {
        issues.push(`Duplicate Mind ID: ${mindId}`);
      }
      seenIds.add(mindId);
    }

    // Check that all Minds have their dependencies satisfied
    for (const [mindId, deps] of plan.dependencies) {
      for (const dep of deps) {
        if (!seenIds.has(dep)) {
          issues.push(
            `Mind "${mindId}" depends on "${dep}" which is not in the plan`
          );
        }
      }
    }

    // Check for isolated Minds (no deps and nothing depends on them)
    const dependedOn = new Set<MindId>();
    for (const deps of plan.dependencies.values()) {
      for (const dep of deps) {
        dependedOn.add(dep);
      }
    }

    return issues;
  }

  /**
   * Get the expected wave for a specific Mind
   * @param mindId - The Mind ID
   * @param plan - The execution plan
   * @returns The wave number or -1 if not found
   */
  getWaveForMind(mindId: MindId, plan: ExecutionPlan): number {
    for (const wave of plan.waves) {
      if (wave.mindIds.includes(mindId)) {
        return wave.waveNumber;
      }
    }
    return -1;
  }

  /**
   * Get Minds that must complete before a given Mind can run
   * @param mindId - The Mind ID
   * @returns Array of dependency Mind IDs
   */
  getDependenciesForMind(mindId: MindId): MindId[] {
    const mind = this.mindMap.get(mindId);
    return mind ? mind.getDependencies() : [];
  }

  /**
   * Get Minds that depend on a given Mind
   * @param mindId - The Mind ID
   * @returns Array of dependent Mind IDs
   */
  getDependentsForMind(mindId: MindId): MindId[] {
    const dependents: MindId[] = [];
    for (const mind of this.minds) {
      if (mind.getDependencies().includes(mindId)) {
        dependents.push(mind.persona.id);
      }
    }
    return dependents;
  }
}

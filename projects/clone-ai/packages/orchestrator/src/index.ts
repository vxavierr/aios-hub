/**
 * @fileoverview Mind Orchestrator Package Entry Point
 * @description Public API for the @clone-lab/orchestrator package
 * @module @clone-lab/orchestrator
 */

// Main exports
export { MindOrchestrator } from './mind-orchestrator.js';
export { ExecutionPlanner } from './execution-planner.js';
export { SharedContext } from './shared-context.js';

// Type exports
export type {
  OrchestratorConfig,
  ExecutionPlan,
  Wave,
  OrchestrationResult,
  OrchestrationError,
  OrchestrationState,
  MindExecutionInfo,
  MindExecutionStatus,
} from './types.js';

// Constants
export { DEFAULT_ORCHESTRATOR_CONFIG } from './types.js';

/**
 * Pure presentation rules for the one-way workflow.
 *
 * Processing ownership remains in the existing authorities. This module only
 * answers which step is current, complete or still ahead, so a display change
 * cannot create a second source of truth for the job itself.
 */

export const WORKFLOW_STAGES = ['select', 'review', 'processing', 'result'] as const

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number]
export type WorkflowStepState = 'current' | 'complete' | 'upcoming'

/** Returns the display state of one step for a given current stage. */
export function workflowStepState(current: WorkflowStage, step: WorkflowStage): WorkflowStepState {
  const currentIndex = WORKFLOW_STAGES.indexOf(current)
  const stepIndex = WORKFLOW_STAGES.indexOf(step)
  if (stepIndex === currentIndex) return 'current'
  return stepIndex < currentIndex ? 'complete' : 'upcoming'
}

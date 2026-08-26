import { describe, expect, it } from 'vitest'

import { WORKFLOW_STAGES, workflowStepState } from './workflow'

describe('workflowStepState', () => {
  it('expands only the current stage and marks earlier work complete', () => {
    expect(WORKFLOW_STAGES.map((stage) => workflowStepState('processing', stage))).toEqual([
      'complete',
      'complete',
      'current',
      'upcoming',
    ])
  })

  it('returns to review without claiming processing is complete after a failure', () => {
    expect(WORKFLOW_STAGES.map((stage) => workflowStepState('review', stage))).toEqual([
      'complete',
      'current',
      'upcoming',
      'upcoming',
    ])
  })

  it('marks the conveyor complete only when a result exists', () => {
    expect(WORKFLOW_STAGES.map((stage) => workflowStepState('result', stage))).toEqual([
      'complete',
      'complete',
      'complete',
      'current',
    ])
  })
})

/** A decoded measurement used to decide acceptance criterion 2. */
export interface OutputLoudnessMeasurement {
  readonly integratedLufs: number
  readonly truePeakDbtp: number
  readonly contentFrames: number
  readonly expectedContentFrames: number
  /** Also proves there were no timestamp gaps or overlaps inside the region. */
  readonly contentCoverageComplete: boolean
}

export interface LoudnessCorpusVerdict {
  readonly pass: boolean
  readonly measured: number
  readonly expected: number
  readonly fullyCovered: number
  readonly worstDeviationLu: number
  readonly highestPeakDbtp: number
}

/**
 * Fails closed when any expected file did not produce a finite measurement.
 * A missing decoder result is absent evidence, never a zero-error pass.
 */
export function loudnessCorpusVerdict(
  measurements: readonly OutputLoudnessMeasurement[],
  expected: number,
  targetLufs: number,
  toleranceLu: number,
  ceilingDbtp: number,
): LoudnessCorpusVerdict {
  const finite = measurements.filter(
    ({ integratedLufs, truePeakDbtp }) =>
      Number.isFinite(integratedLufs) && Number.isFinite(truePeakDbtp),
  )
  const worstDeviationLu = finite.reduce(
    (worst, measurement) => Math.max(worst, Math.abs(measurement.integratedLufs - targetLufs)),
    0,
  )
  const highestPeakDbtp = finite.reduce(
    (highest, measurement) => Math.max(highest, measurement.truePeakDbtp),
    Number.NEGATIVE_INFINITY,
  )
  const fullyCovered = measurements.filter(
    ({ contentCoverageComplete, contentFrames, expectedContentFrames }) =>
      contentCoverageComplete &&
      Number.isInteger(contentFrames) &&
      Number.isInteger(expectedContentFrames) &&
      contentFrames === expectedContentFrames,
  ).length
  const complete =
    expected > 0 &&
    finite.length === expected &&
    fullyCovered === expected &&
    measurements.length === expected

  return {
    pass: complete && worstDeviationLu <= toleranceLu && highestPeakDbtp <= ceilingDbtp,
    measured: finite.length,
    expected,
    fullyCovered,
    worstDeviationLu,
    highestPeakDbtp,
  }
}

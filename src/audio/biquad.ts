/**
 * A second-order IIR section, in Direct Form II transposed.
 *
 * DF-II-T is chosen over DF-I because its state is numerically better
 * behaved, which matters here: an hour of audio is ~170 million samples
 * through two cascaded sections, and drift accumulates. State is Float64
 * for the same reason, even though the samples arriving are Float32.
 */

export interface BiquadCoefficients {
  /** Feed-forward, already normalised so a0 === 1. */
  readonly b0: number
  readonly b1: number
  readonly b2: number
  /** Feedback, already normalised so a0 === 1. */
  readonly a1: number
  readonly a2: number
}

export class Biquad {
  private s1 = 0
  private s2 = 0

  constructor(private readonly c: BiquadCoefficients) {}

  /**
   * Filters `input` in place into `output` (may be the same array).
   *
   * @param input - Samples for one channel.
   * @param output - Destination. Pass the same array to filter in place.
   */
  process(input: Float32Array, output: Float32Array): void {
    const { b0, b1, b2, a1, a2 } = this.c
    let s1 = this.s1
    let s2 = this.s2

    for (let i = 0; i < input.length; i++) {
      const x = input[i]!
      const y = b0 * x + s1
      s1 = b1 * x - a1 * y + s2
      s2 = b2 * x - a2 * y
      output[i] = y
    }

    this.s1 = s1
    this.s2 = s2
  }

  reset(): void {
    this.s1 = 0
    this.s2 = 0
  }
}

/** Cascade of biquads applied in order. */
export class BiquadCascade {
  private readonly sections: Biquad[]

  constructor(coefficients: readonly BiquadCoefficients[]) {
    this.sections = coefficients.map((c) => new Biquad(c))
  }

  process(input: Float32Array, output: Float32Array): void {
    let source = input
    for (const section of this.sections) {
      section.process(source, output)
      source = output
    }
  }

  reset(): void {
    for (const section of this.sections) section.reset()
  }
}

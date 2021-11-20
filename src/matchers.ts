export interface Result {
  received: unknown;
  expected: unknown;
  pass: boolean;
}

export const matchers = {
  toBe(received: unknown, expected: unknown) {
    const pass = Object.is(received, expected);
    return { received, expected, pass };
  },

  // https://github.com/facebook/jest/blob/7bb400c373/packages/expect/src/matchers.ts#L129
  // under MIT License and modified
  toBeCloseTo(received: number, expected: number, precision: number = 2) {
    if (typeof expected !== "number" || typeof received !== "number") {
      return { received, expected, pass: false };
    }

    let pass = false;
    let expectedDiff = 0;
    let receivedDiff = 0;

    if (received === Infinity && expected === Infinity) {
      pass = true; // Infinity - Infinity is NaN
    } else if (received === -Infinity && expected === -Infinity) {
      pass = true; // -Infinity - -Infinity is NaN
    } else {
      expectedDiff = Math.pow(10, -precision) / 2;
      receivedDiff = Math.abs(expected - received);
      pass = receivedDiff < expectedDiff;
    }

    return { received, expected, pass };
  },
};

export type MatcherName = keyof typeof matchers;

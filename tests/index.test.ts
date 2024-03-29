import { test, beforeAll, expect } from "vitest";
import { test as myTest, expect as myExpect, run } from "../src";
import { performance } from "perf_hooks";

beforeAll(() => {
  // @ts-expect-error
  globalThis.performance = performance;
});

test("sum", async () => {
  myTest("sum(1, 2) should be 3", () => {
    const sum = (a: number, b: number) => a + b;
    myExpect(sum(1, 2)).toBe(3);
    myExpect(sum(1, 2)).not.toBe(4);
  });

  myTest("toBe, toBeCloseTo, and each not version", () => {
    myExpect(1).toBe(1);
    myExpect(1).not.toBe(2);
    myExpect(1).toBeCloseTo(1);
    myExpect(1).not.toBeCloseTo(2);

    myExpect(1.234).toBeCloseTo(1.233, 2);
    myExpect(1.234).not.toBeCloseTo(1.233, 4);
  });

  myTest("fail test", () => {
    myExpect(10).toBe(-1);
  });

  myTest("async function (no timeout)", async () => {
    const actual = await new Promise((resolve) => {
      setTimeout(() => resolve("1"), 1000);
    });
    myExpect(actual).toBe("1");
  });

  myTest(
    "async function (timeout)",
    async () => {
      const actual = await new Promise((resolve) => {
        setTimeout(() => resolve("1"), 1000);
      });
      myExpect(actual).toBe("1");
    },
    100
  );

  // this test will be broken snapshot
  // myTest("throw error", () => {
  //   throw new Error("this is error");
  // });

  const { result, duration } = await run();
  expect(Number.isFinite(duration)).toBeTruthy();
  expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(`
    "[
      {
        \\"testName\\": \\"sum(1, 2) should be 3\\",
        \\"type\\": \\"done\\",
        \\"result\\": {
          \\"passed\\": [
            {
              \\"received\\": 3,
              \\"expected\\": 3,
              \\"pass\\": true,
              \\"matcherName\\": \\"toBe\\"
            },
            {
              \\"received\\": 3,
              \\"expected\\": 4,
              \\"pass\\": true,
              \\"matcherName\\": \\"not.toBe\\"
            }
          ],
          \\"failed\\": []
        }
      },
      {
        \\"testName\\": \\"toBe, toBeCloseTo, and each not version\\",
        \\"type\\": \\"done\\",
        \\"result\\": {
          \\"passed\\": [
            {
              \\"received\\": 1,
              \\"expected\\": 1,
              \\"pass\\": true,
              \\"matcherName\\": \\"toBe\\"
            },
            {
              \\"received\\": 1,
              \\"expected\\": 2,
              \\"pass\\": true,
              \\"matcherName\\": \\"not.toBe\\"
            },
            {
              \\"received\\": 1,
              \\"expected\\": 1,
              \\"pass\\": true,
              \\"matcherName\\": \\"toBeCloseTo\\"
            },
            {
              \\"received\\": 1,
              \\"expected\\": 2,
              \\"pass\\": true,
              \\"matcherName\\": \\"not.toBeCloseTo\\"
            },
            {
              \\"received\\": 1.234,
              \\"expected\\": 1.233,
              \\"pass\\": true,
              \\"matcherName\\": \\"toBeCloseTo\\"
            },
            {
              \\"received\\": 1.234,
              \\"expected\\": 1.233,
              \\"pass\\": true,
              \\"matcherName\\": \\"not.toBeCloseTo\\"
            }
          ],
          \\"failed\\": []
        }
      },
      {
        \\"testName\\": \\"fail test\\",
        \\"type\\": \\"done\\",
        \\"result\\": {
          \\"passed\\": [],
          \\"failed\\": [
            {
              \\"received\\": 10,
              \\"expected\\": -1,
              \\"pass\\": false,
              \\"matcherName\\": \\"toBe\\"
            }
          ]
        }
      },
      {
        \\"testName\\": \\"async function (no timeout)\\",
        \\"type\\": \\"done\\",
        \\"result\\": {
          \\"passed\\": [
            {
              \\"received\\": \\"1\\",
              \\"expected\\": \\"1\\",
              \\"pass\\": true,
              \\"matcherName\\": \\"toBe\\"
            }
          ],
          \\"failed\\": []
        }
      },
      {
        \\"type\\": \\"error\\",
        \\"testName\\": \\"async function (timeout)\\",
        \\"error\\": {
          \\"message\\": \\"timeout (specified time: 100ms)\\"
        }
      }
    ]"
  `);
});

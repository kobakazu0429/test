import { test as myTest, expect as myExpect, run } from "./index";

test("sum", async () => {
  myTest("sum(1, 2) should be 3", () => {
    const sum = (a: number, b: number) => a + b;
    myExpect(sum(1, 2)).toBe(3);
    myExpect(sum(1, 2)).not.toBe(4);
  });

  myTest("toBe, toBeCloseTo, and each not version", () => {
    myExpect(1).toBe(1);
    myExpect(1).not.toBe(1);
    myExpect(1).toBeCloseTo(1);
    myExpect(1).not.toBeCloseTo(1);

    myExpect(1).toBeCloseTo(1, 2);
    myExpect(1).not.toBeCloseTo(1, 2);
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

  const result = await run();

  expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(`
    "[
      {
        \\"testName\\": \\"sum(1, 2) should be 3\\",
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
              \\"expected\\": 1,
              \\"pass\\": true,
              \\"matcherName\\": \\"toBeCloseTo\\"
            },
            {
              \\"received\\": 1,
              \\"expected\\": 1,
              \\"pass\\": true,
              \\"matcherName\\": \\"toBeCloseTo\\"
            }
          ],
          \\"failed\\": [
            {
              \\"received\\": 1,
              \\"expected\\": 1,
              \\"pass\\": false,
              \\"matcherName\\": \\"not.toBe\\"
            },
            {
              \\"received\\": 1,
              \\"expected\\": 1,
              \\"pass\\": false,
              \\"matcherName\\": \\"not.toBeCloseTo\\"
            },
            {
              \\"received\\": 1,
              \\"expected\\": 1,
              \\"pass\\": false,
              \\"matcherName\\": \\"not.toBeCloseTo\\"
            }
          ]
        }
      },
      {
        \\"testName\\": \\"async function (no timeout)\\",
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
        \\"testName\\": \\"async function (timeout)\\",
        \\"error\\": \\"timeout (specified time: 100ms)\\"
      }
    ]"
  `);
});

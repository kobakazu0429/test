import { test as myTest, expect as myExpect, run } from "../src";
import { constructResultsHTML } from "../src/prettify";
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

  const result = await run();
  result.duration = 1;
  const html = constructResultsHTML(result);
  expect(html).toMatchInlineSnapshot(`
    "
        
        <div class=\\"test-report__result\\">
          <span class=\\"test-report__status-icon\\">✓</span>
          <span class=\\"test-report__status test-report__status--pass\\">
            PASS
          </span>
          sum(1, 2) should be 3
          
        </div>
      
        <div class=\\"test-report__result\\">
          <span class=\\"test-report__status-icon\\">×</span>
          <span class=\\"test-report__status test-report__status--fail\\">
            FAIL
          </span>
          fail test
          
        </div>
      
        <div class=\\"test-report__result\\">
          <span class=\\"test-report__status-icon\\">✓</span>
          <span class=\\"test-report__status test-report__status--pass\\">
            PASS
          </span>
          async function (no timeout)
          
        </div>
      
        <div class=\\"test-report__result\\">
          <span class=\\"test-report__status-icon\\">×</span>
          <span class=\\"test-report__status test-report__status--fail\\">
            FAIL
          </span>
          async function (timeout)
          <div class=\\"test-report__errors\\">timeout (specified time: 100ms)</div>
        </div>
      
        
        <span class=\\"test-report__summary-status test-report__summary-status--fail\\">
          Tests: 2 failed, 2 passed, 4 total<br>
          Time: 0.001 [s]
        </span>
      
      "
  `);
});

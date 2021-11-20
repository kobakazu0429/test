import { clone } from "./clone";
import { matchers } from "./matchers";
import type { MatcherName, Result } from "./matchers";

type TestName = string;
type TestFn = () => void | Promise<void>;
type TestCase = [testName: TestName, testFn: TestFn, timeout?: number];

const _tests: TestCase[] = [];
export const test = (...t: TestCase) => {
  _tests.push(t);
};

const _result: Record<
  "passed" | "failed",
  Array<
    Partial<Pick<Result, "expected" | "received">> &
      Pick<Result, "pass"> & { matcherName: string } & { error?: any }
  >
> = {
  passed: [],
  failed: [],
};
const _ClearResult = () => {
  _result.passed = [];
  _result.failed = [];
};

type Expected = (expected: unknown, ...rest: any[]) => void;
type Matchers = Record<MatcherName, Expected>;

interface Expectation extends Matchers {
  not: Matchers;
}

export const expect = (received: unknown) => {
  const expectation: Expectation = { not: {} } as any;

  (Object.keys(matchers) as Array<MatcherName>).forEach((matcherName) => {
    const matcher = matchers[matcherName];
    expectation[matcherName] = (expected, ...rest) => {
      const result = matcher(received as any, expected as any, ...rest);
      (result.pass ? _result.passed : _result.failed).push({
        ...result,
        matcherName,
      });
    };
    expectation.not[matcherName] = (expected, ...rest) => {
      const result = matcher(received as any, expected as any, ...rest);
      (!result.pass ? _result.passed : _result.failed).push({
        ...result,
        pass: !result.pass,
        matcherName: `not.${matcherName}`,
      });
    };
  });

  return expectation;
};

export const run = async () => {
  const startTime = globalThis.performance.now();
  const result: any[] = [];
  for await (const [testName, testFn, timeout] of _tests) {
    // Refactor: me
    // eslint-disable-next-line no-async-promise-executor
    const testResult = await new Promise<any>(async (resolve, _reject) => {
      try {
        if (timeout) {
          const timeoutId = setTimeout(() => {
            resolve({
              testName,
              error: `timeout (specified time: ${timeout}ms)`,
            });
          }, timeout);
          await testFn();
          clearTimeout(timeoutId);
          resolve(null);
        } else {
          await testFn();
          resolve(null);
        }
      } catch (error) {
        resolve(error);
      }
    });

    if (testResult) {
      result.push(testResult);
    } else {
      result.push({ testName, result: clone(_result) });
    }
    _ClearResult();
  }
  const duration = globalThis.performance.now() - startTime;
  return { result, duration };
};

import { clone } from "./clone";
import { matchers } from "./matchers";
import type { MatcherName } from "./matchers";
export { constructResultsHTML } from "./prettify";

type TestName = string;
type TestFn = () => void | Promise<void>;
type TestCase = [testName: TestName, testFn: TestFn, timeout?: number];

const _tests: TestCase[] = [];
export const test = (...t: TestCase) => {
  _tests.push(t);
};

export interface AssertionResult {
  matcherName: string;
  pass: boolean;
  received: unknown;
  expected: unknown;
}

type TestResult = Record<"passed" | "failed", AssertionResult[]>;

const _testResult: TestResult = {
  passed: [],
  failed: [],
};
const _ClearResult = () => {
  _testResult.passed = [];
  _testResult.failed = [];
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
      (result.pass ? _testResult.passed : _testResult.failed).push({
        ...result,
        matcherName,
      });
    };
    expectation.not[matcherName] = (expected, ...rest) => {
      const result = matcher(received as any, expected as any, ...rest);
      (!result.pass ? _testResult.passed : _testResult.failed).push({
        ...result,
        pass: !result.pass,
        matcherName: `not.${matcherName}`,
      });
    };
  });

  return expectation;
};

interface ErrorResult {
  type: "error";
  testName: string;
  error: any;
}

interface DoneResult {
  type: "done";
  testName: string;
  result: TestResult;
}

export type Result = DoneResult | ErrorResult;
export type RunResult = {
  duration: number;
  result: Result[];
};

export const run = async (): Promise<RunResult> => {
  const startTime = globalThis.performance.now();
  const result: Array<Result> = [];
  for await (const [testName, testFn, timeout] of _tests) {
    // Refactor: me
    // eslint-disable-next-line no-async-promise-executor
    const r = await new Promise<any>(async (resolve, _reject) => {
      try {
        if (timeout) {
          const timeoutId = setTimeout(() => {
            resolve({
              type: "error",
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

    if (r) {
      result.push(r);
    } else {
      result.push({
        testName,
        type: "done",
        result: clone<TestResult>(_testResult),
      });
    }
    _ClearResult();
  }
  const duration = globalThis.performance.now() - startTime;
  return { result, duration };
};

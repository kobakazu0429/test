import { clone } from "./clone";
import { matchers } from "./matchers";
import type { MatcherName, Result } from "./matchers";

export type TestContext = Record<string, unknown>;

type ValidTestReturnValues = void | undefined;
type TestReturnValuePromise = Promise<unknown>;

export type TestReturnValue = ValidTestReturnValues | TestReturnValuePromise;

export type PromiseReturningTestFn = (
  this: TestContext | undefined
) => TestReturnValue;

type TestName = string;
type TestFn = () => void | Promise<void>;
type TestCase = [testName: TestName, testFn: TestFn, timeout?: number];

const _tests: TestCase[] = [];
export const test = (...t: TestCase) => {
  _tests.push(t);
};

const _result: Record<"passed" | "failed", Result[]> = {
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
      (result.pass ? _result.passed : _result.failed).push(result);
    };
    expectation.not[matcherName] = (expected, ...rest) => {
      const result = matcher(received as any, expected as any, ...rest);
      (!result.pass ? _result.passed : _result.failed).push(result);
    };
  });

  return expectation;
};

export const run = async () => {
  const result = [];
  for await (const [testName, testFn, timeout] of _tests) {
    await new Promise<void>(async (resovle, reject) => {
      try {
        const timeoutId = setTimeout(reject, timeout);
        await testFn();
        clearTimeout(timeoutId);
        resovle();
      } catch (error) {
        reject();
      }
    });
    result.push({ testName, result: clone(_result) });
    _ClearResult();
  }
  return result;
};

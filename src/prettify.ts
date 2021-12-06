import type { RunResult } from "./index";

type Status = "pass" | "fail";

export function constructResultsHTML({
  result,
  duration,
  precision = 3,
}: RunResult & { precision?: number }) {
  let passed = 0;
  let failed = 0;
  const testsResultsHTML = result.reduce((currentOutput: string, r) => {
    let testResultHTML = "";
    if (r.type === "error") {
      failed++;
      testResultHTML += constructResultHTML("fail", r.testName, r.error);
    } else if (r.type === "done" && r.result.failed.length !== 0) {
      failed++;
      testResultHTML += constructResultHTML("fail", r.testName);
    } else {
      passed++;
      testResultHTML += constructResultHTML("pass", r.testName);
    }
    return `${currentOutput}${testResultHTML}`;
  }, "");

  return `
    ${testsResultsHTML}
    ${constructSummaryHTML(
      failed > 0 ? "fail" : "pass",
      failed,
      passed,
      duration,
      precision
    )}
  `;
}

function constructSummaryHTML(
  status: Status,
  failed: number,
  passed: number,
  timeInMilliseconds: number,
  precision: number
) {
  return `
    <span class="test-report__summary-status test-report__summary-status--${status}">
      Tests: ${failed} failed, ${passed} passed, ${passed + failed} total<br>
      Time: ${(timeInMilliseconds / 1000).toFixed(precision)} [s]
    </span>
  `;
}

function constructResultHTML(status: Status, testName: string, error?: string) {
  const statusIcon = status === "fail" ? "×" : "✓";

  const errorHTML = error
    ? `<div class="test-report__errors">${escapeHTML(error)}</div>`
    : "";

  return `
    <div class="test-report__result">
      <span class="test-report__status-icon">${statusIcon}</span>
      <span class="test-report__status test-report__status--${status}">
        ${status.toUpperCase()}
      </span>
      ${escapeHTML(testName)}
      ${errorHTML}
    </div>
  `;
}

function escapeHTML(html: string) {
  return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

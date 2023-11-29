import type { Result, RunResult } from "./index";

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
      testResultHTML += constructResultHTML("fail", r);
    } else if (r.type === "done" && r.result.failed.length !== 0) {
      failed++;
      testResultHTML += constructResultHTML("fail", r);
    } else {
      passed++;
      testResultHTML += constructResultHTML("pass", r);
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

function constructResultHTML(status: Status, result: Result) {
  const statusIcon = status === "fail" ? "×" : "✓";

  const failedHTML =
    result.type === "done"
      ? result.result.failed
          .map(
            (f) =>
              `<div class="test-report__errors">expected: ${escapeHTML(
                String(f.expected)
              )}, received: ${escapeHTML(String(f.received))}</div>`
          )
          .join("\n")
      : "";

  const errorHTML =
    result.type === "error" && result.error
      ? `<div class="test-report__errors">${escapeHTML(
          result.error.message
        )}</div>`
      : "";

  return `
    <div class="test-report__result">
      <span class="test-report__status-icon">${statusIcon}</span>
      <span class="test-report__status test-report__status--${status}">
        ${status.toUpperCase()}
      </span>
      ${escapeHTML(result.testName)}
      ${failedHTML}
      ${errorHTML}
    </div>
  `;
}

function escapeHTML(html: string) {
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replaceAll("\n", "\\n")
    .replaceAll("\t", "\\t");
}

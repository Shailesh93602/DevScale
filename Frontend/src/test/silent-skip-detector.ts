import ts from 'typescript';

/**
 * Guard against Playwright specs that pass while doing nothing.
 *
 * The bug class this catches, from a real instance: `journeys.spec.ts` looked
 * for a button named /^run$/ and wrapped the whole run-and-assert step in
 * `if (await runButton.count()) { ... }`. The real label is "Run Code", so the
 * guard was false, the step never executed, and the test was green for as long
 * as the guard existed. Rule 2b of this workspace: a passing test only proves
 * the test passes.
 *
 * THE RULE, precisely. Every `tests/**\/*.spec.ts` file, and every
 * `*.steps.ts` module a spec registers its tests from, is parsed with the
 * TypeScript compiler and fails the guard if it contains any of:
 *
 *  V1  A state-guarded step: an `if`, a ternary, or a short-circuit `&&`/`||`
 *      whose condition reads element state — a call to one of STATE_CALLS
 *      (`isVisible`, `isHidden`, `isEnabled`, `isDisabled`, `isChecked`,
 *      `isEditable`, `count`, `all`), or an identifier that was initialised
 *      from such a call anywhere in the file — and whose branch contains an
 *      `expect(...)`, a step (one of STEP_CALLS: `click`, `fill`, `press`,
 *      `check`, `uncheck`, `selectOption`, `hover`, `tap`, `type`, `dblclick`,
 *      `setInputFiles`, `dragTo`), or an early exit (`return`, `break`,
 *      `continue`, `test.skip`).
 *
 *      Exemption: the receiver of the state call is an identifier that was
 *      ALREADY hard-asserted earlier in the same function with
 *      `await expect(<that identifier>).toBeVisible()` (or `toBeAttached`,
 *      `toHaveCount`, `toBeEnabled`, `toBeInViewport`). Then the conditional is
 *      branching on the state of a control proven to exist, which is fine.
 *
 *  V2  A runtime skip: any call to `test.skip(...)`, `test.fixme(...)`,
 *      `testInfo.skip(...)` or `test.info().skip(...)`. A skipped test reports
 *      green in every summary line people actually read. If a journey needs
 *      data, seed it; if a test belongs to one project only, express that in
 *      the config (`testMatch` / `testIgnore`), not at runtime.
 *
 *  V3  A swallowed step: `.catch(` chained onto an expression that contains an
 *      `expect(...)`, a STATE_CALL, a STEP_CALL, `waitForResponse`, `waitForURL`
 *      or `waitFor`; or a `try { ... } catch` whose try block contains an
 *      `expect(...)` or a STEP_CALL. (`waitForLoadState(...).catch(() => {})`
 *      is not a step and stays allowed.)
 *
 */

// Entries are `{ file, line, reason }` for a skip that is genuinely intended.
// It is empty and should stay empty.
const ALLOW_LIST: { file: string; line: number; reason: string }[] = [];

const STATE_CALLS = new Set([
  'isVisible',
  'isHidden',
  'isEnabled',
  'isDisabled',
  'isChecked',
  'isEditable',
  'count',
  'all',
]);

const STEP_CALLS = new Set([
  'click',
  'fill',
  'press',
  'check',
  'uncheck',
  'selectOption',
  'hover',
  'tap',
  'type',
  'dblclick',
  'setInputFiles',
  'dragTo',
]);

const WAIT_CALLS = new Set(['waitForResponse', 'waitForURL', 'waitFor']);

const HARD_ASSERTIONS = new Set([
  'toBeVisible',
  'toBeAttached',
  'toHaveCount',
  'toBeEnabled',
  'toBeInViewport',
]);

interface Violation {
  file: string;
  line: number;
  kind: 'V1' | 'V2' | 'V3';
  detail: string;
}

function calleeName(call: ts.CallExpression): string | undefined {
  const e = call.expression;
  if (ts.isPropertyAccessExpression(e)) return e.name.text;
  if (ts.isIdentifier(e)) return e.text;
  return undefined;
}

/** `expect(...)`, `expect.poll(...)`, `expect.soft(...)` — anything rooted at `expect`. */
function isExpectCall(node: ts.Node): boolean {
  if (!ts.isCallExpression(node)) return false;
  let e: ts.Expression = node.expression;
  while (ts.isPropertyAccessExpression(e) || ts.isCallExpression(e)) {
    e = e.expression;
  }
  return ts.isIdentifier(e) && e.text === 'expect';
}

/** True if `pred` holds for `node` or a descendant; `skip` stops descent below a node. */
function someNode(
  node: ts.Node,
  pred: (n: ts.Node) => boolean,
  skip?: (n: ts.Node) => boolean,
): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (pred(n)) {
      found = true;
      return;
    }
    if (skip?.(n)) return;
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

function containsCallNamed(node: ts.Node, names: Set<string>): boolean {
  return someNode(node, (n) => {
    if (!ts.isCallExpression(n)) return false;
    const name = calleeName(n);
    return !!name && names.has(name);
  });
}

function containsExpect(node: ts.Node): boolean {
  return someNode(node, isExpectCall);
}

function containsIdentifier(node: ts.Node, names: Set<string>): boolean {
  return someNode(node, (n) => ts.isIdentifier(n) && names.has(n.text));
}

function containsEarlyExit(node: ts.Node): boolean {
  return someNode(
    node,
    (n) =>
      ts.isReturnStatement(n) ||
      ts.isBreakStatement(n) ||
      ts.isContinueStatement(n) ||
      (ts.isCallExpression(n) && isRuntimeSkip(n)),
    // A `return` inside a callback is not an early exit of the guarded branch.
    ts.isFunctionLike,
  );
}

function isRuntimeSkip(call: ts.CallExpression): boolean {
  const e = call.expression;
  if (!ts.isPropertyAccessExpression(e)) return false;
  const method = e.name.text;
  if (method !== 'skip' && method !== 'fixme') return false;
  const recv = e.expression.getText();
  return (
    recv === 'test' ||
    recv === 'it' ||
    recv === 'testInfo' ||
    recv === 'test.info()'
  );
}

/** Identifiers whose initialiser reads element state, file-wide. */
function collectStateIdentifiers(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  const visit = (n: ts.Node) => {
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.initializer &&
      containsCallNamed(n.initializer, STATE_CALLS)
    ) {
      names.add(n.name.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return names;
}

/** Receivers of the state calls in a condition (`runButton` in `runButton.count()`). */
function stateCallReceivers(cond: ts.Node): (ts.Expression | null)[] {
  const out: (ts.Expression | null)[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n)) {
      const name = calleeName(n);
      if (name && STATE_CALLS.has(name)) {
        out.push(
          ts.isPropertyAccessExpression(n.expression)
            ? n.expression.expression
            : null,
        );
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(cond);
  return out;
}

function enclosingFunction(node: ts.Node): ts.Node {
  let cur: ts.Node | undefined = node.parent;
  while (cur && !ts.isFunctionLike(cur)) cur = cur.parent;
  return cur ?? node.getSourceFile();
}

/** `await expect(<ident>).toBeVisible(...)` textually before `before` in the same function. */
function hasPriorHardAssertion(
  ident: string,
  before: ts.Node,
  scope: ts.Node,
): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (n.getStart() >= before.getStart()) return;
    if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      HARD_ASSERTIONS.has(n.expression.name.text)
    ) {
      // walk down to the expect(...) call and check its first argument
      let inner: ts.Expression = n.expression.expression;
      while (
        ts.isPropertyAccessExpression(inner) ||
        (ts.isCallExpression(inner) && !isExpectCall(inner))
      ) {
        inner = inner.expression;
      }
      if (
        ts.isCallExpression(inner) &&
        isExpectCall(inner) &&
        inner.arguments.length > 0 &&
        ts.isIdentifier(inner.arguments[0]) &&
        inner.arguments[0].text === ident
      ) {
        found = true;
        return;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(scope);
  return found;
}

/** `console.error('USABILITY ISSUE: ...')` where an assertion belongs. */
function containsConsoleCall(node: ts.Node): boolean {
  return someNode(
    node,
    (n) =>
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      ts.isIdentifier(n.expression.expression) &&
      n.expression.expression.text === 'console',
  );
}

function branchIsAStep(branch: ts.Node | undefined): boolean {
  if (!branch) return false;
  return (
    containsExpect(branch) ||
    containsCallNamed(branch, STEP_CALLS) ||
    containsEarlyExit(branch) ||
    containsConsoleCall(branch)
  );
}

export function findViolations(file: string, text: string): Violation[] {
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const stateIdents = collectStateIdentifiers(sf);
  const violations: Violation[] = [];
  const lineOf = (n: ts.Node) =>
    sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;

  const conditionReadsState = (cond: ts.Node) =>
    containsCallNamed(cond, STATE_CALLS) ||
    containsIdentifier(cond, stateIdents);

  const isExempt = (cond: ts.Node, at: ts.Node) => {
    if (containsIdentifier(cond, stateIdents)) return false;
    const receivers = stateCallReceivers(cond);
    if (receivers.length === 0) return false;
    const scope = enclosingFunction(at);
    return receivers.every(
      (r) =>
        r !== null &&
        ts.isIdentifier(r) &&
        hasPriorHardAssertion(r.text, at, scope),
    );
  };

  const reportGuard = (
    at: ts.Node,
    cond: ts.Node,
    branches: (ts.Node | undefined)[],
    // A ternary on element state is ALWAYS a fallback — `count() > 0 ? the
    // fixture : whatever is first` swaps in a substitute when the fixture is
    // missing — so it is reported whatever its branches hold.
    requireStepInBranch = true,
  ) => {
    if (!conditionReadsState(cond)) return;
    if (requireStepInBranch && !branches.some(branchIsAStep)) return;
    if (isExempt(cond, at)) return;
    violations.push({
      file,
      line: lineOf(at),
      kind: 'V1',
      detail: `step guarded by element state: ${cond.getText().slice(0, 80)}`,
    });
  };

  const visit = (n: ts.Node) => {
    if (ts.isIfStatement(n)) {
      reportGuard(n, n.expression, [n.thenStatement, n.elseStatement]);
    } else if (ts.isConditionalExpression(n)) {
      reportGuard(n, n.condition, [n.whenTrue, n.whenFalse], false);
    } else if (
      ts.isBinaryExpression(n) &&
      (n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        n.operatorToken.kind === ts.SyntaxKind.BarBarToken) &&
      ts.isExpressionStatement(n.parent)
    ) {
      reportGuard(n, n.left, [n.right]);
    } else if (ts.isCallExpression(n) && isRuntimeSkip(n)) {
      violations.push({
        file,
        line: lineOf(n),
        kind: 'V2',
        detail: `runtime skip: ${n.getText().slice(0, 80)}`,
      });
    } else if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      n.expression.name.text === 'catch'
    ) {
      const recv = n.expression.expression;
      if (
        containsExpect(recv) ||
        containsCallNamed(recv, STATE_CALLS) ||
        containsCallNamed(recv, STEP_CALLS) ||
        containsCallNamed(recv, WAIT_CALLS)
      ) {
        violations.push({
          file,
          line: lineOf(n),
          kind: 'V3',
          detail: `swallowed step: ${recv.getText().slice(0, 80)}`,
        });
      }
    } else if (ts.isTryStatement(n) && n.catchClause) {
      // try/finally (no catch) swallows nothing — only a catch clause does.
      if (
        containsExpect(n.tryBlock) ||
        containsCallNamed(n.tryBlock, STEP_CALLS)
      ) {
        violations.push({
          file,
          line: lineOf(n),
          kind: 'V3',
          detail: 'try/catch around an assertion or step',
        });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);

  return violations.filter(
    (v) => !ALLOW_LIST.some((a) => a.file === v.file && a.line === v.line),
  );
}

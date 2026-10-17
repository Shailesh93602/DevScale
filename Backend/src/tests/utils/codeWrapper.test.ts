// eduscale-backend#27-02 — the harness must not hide a solution's own exception.
import { describe, it, expect } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import type { Challenge } from '@prisma/client';
import { wrapCode } from '../../utils/codeWrapper';

const challenge = (signature: string) =>
  ({ function_signature: signature }) as unknown as Challenge;

const run = (cmd: string, args: string[], program: string, input: string) =>
  spawnSync(cmd, [...args, program], { input, encoding: 'utf8' });

describe('wrapCode (javascript)', () => {
  it('reports an exception thrown by the solution on stderr with a non-zero exit', () => {
    const program = wrapCode(
      'function solve(a) { return a.missing.deep; }',
      'javascript',
      challenge('function solve(a)')
    );
    const out = run(process.execPath, ['-e'], program, '{"a": 1}');
    expect(out.status).not.toBe(0);
    expect(out.stderr).toMatch(/TypeError/);
  });

  it('still runs a solution that declares its own `fs`', () => {
    const program = wrapCode(
      "const fs = require('fs');\nfunction add(a, b) { return a + b; }",
      'javascript',
      challenge('function add(a, b)')
    );
    const out = run(process.execPath, ['-e'], program, '{"a": 2, "b": 3}');
    expect(out.status).toBe(0);
    expect(out.stdout.trim()).toBe('5');
  });
});

const python = spawnSync('python3', ['--version']).status === 0;
(python ? describe : describe.skip)('wrapCode (python)', () => {
  it('reports an exception thrown by the solution with a non-zero exit', () => {
    const program = wrapCode(
      'def solve(a):\n    return [][a]',
      'python',
      challenge('def solve(a)')
    );
    const out = run('python3', ['-c'], program, '{"a": 3}');
    expect(out.status).not.toBe(0);
    expect(out.stderr).toMatch(/IndexError/);
  });
});

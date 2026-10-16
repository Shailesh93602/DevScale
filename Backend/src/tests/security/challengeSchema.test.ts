/**
 * eduscale-backend#28-01 — the challenge schema rejected every real body.
 *
 * Joi object keys are literal property names, so 'testCases.*.input' demanded
 * a top-level key with that exact name; POST and PATCH /challenges returned
 * 400 for every well-formed challenge while the items went unvalidated. This
 * drives the body through the validateRequest middleware actually mounted on
 * each route, then hands the validated body to the real handler and checks
 * the Prisma arguments against the generated Challenge model.
 */
import { describe, it, expect, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { runHandler } from '../helpers/runHandler';

const calls: Record<string, Array<{ data?: Record<string, unknown> }>> = {
  create: [],
  update: [],
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    challenge: {
      create: async (a: { data?: Record<string, unknown> }) => {
        calls.create.push(a);
        return { id: 'c1' };
      },
      update: async (a: { data?: Record<string, unknown> }) => {
        calls.update.push(a);
        return { id: 'c1' };
      },
    },
  },
}));
jest.mock('../../services/auditTrail', () => ({
  recordActionBestEffort: async () => undefined,
}));

import { ChallengeRoutes } from '../../routes/challengeRoutes';
import ChallengeController from '../../controllers/challengeController';

type Fn = (req: Request, res: Response, next: NextFunction) => void;
type Layer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ name?: string; handle: Fn }>;
  };
};

const validatorFor = (method: string, path: string): Fn => {
  const router = new ChallengeRoutes().getRouter() as unknown as {
    stack: Layer[];
  };
  const layer = router.stack.find(
    (l) => l.route?.path === path && l.route.methods[method]
  );
  const v = layer?.route?.stack.find((h) => h.name === 'validateRequest');
  if (!v) throw new Error(`${method} ${path} has no validateRequest`);
  return v.handle;
};

const validate = (fn: Fn, body: unknown) => {
  let err: unknown;
  fn(
    { body } as Request,
    {} as Response,
    ((e?: unknown) => (err = e)) as NextFunction
  );
  return err as { statusCode?: number } | undefined;
};

const wellFormed = {
  title: 'Two Sum',
  description: 'Find two numbers that add up to a target.',
  difficulty: 'EASY',
  category: 'arrays',
  inputFormat: 'n, then n ints',
  outputFormat: 'two indices',
  points: 10,
  exampleInput: '2 7 11 15',
  exampleOutput: '0 1',
  constraints: 'n <= 10^4',
  functionSignature: 'twoSum(nums, target)',
  testCases: [{ input: '2 7 11 15\n9', output: '0 1' }],
  language: 'javascript',
};

describe('POST /challenges validation', () => {
  const v = validatorFor('post', '/');
  it('accepts a well-formed challenge', () => {
    expect(validate(v, wellFormed)).toBeUndefined();
  });
  it('rejects a test case without an output', () => {
    expect(
      validate(v, { ...wellFormed, testCases: [{ input: 'x' }] })?.statusCode
    ).toBe(400);
  });
});

describe('PATCH /challenges/:id validation', () => {
  const v = validatorFor('patch', '/:id');
  it('accepts a partial update', () => {
    expect(validate(v, { title: 'Two Sum II' })).toBeUndefined();
  });
  it('rejects an empty update', () => {
    expect(validate(v, {})?.statusCode).toBe(400);
  });
});

const model = Prisma.dmmf.datamodel.models.find((m) => m.name === 'Challenge')!;
const fields = new Map(model.fields.map((f) => [f.name, f]));
// Columns Prisma insists on for a create: required, no default, not a list
// (Postgres lists default to []), not a relation.
const requiredOnCreate = model.fields
  .filter(
    (f) =>
      f.kind === 'scalar' &&
      f.isRequired &&
      !f.isList &&
      !f.hasDefaultValue &&
      !f.isUpdatedAt
  )
  .map((f) => f.name);

const validated = (method: string, path: string, body: unknown) => {
  const req = { body } as Request;
  validatorFor(method, path)(req, {} as Response, (() => {}) as NextFunction);
  return req.body as unknown;
};

describe('challenge handlers write what the Challenge model accepts', () => {
  const controller = new ChallengeController();

  it('POST builds a create whose data uses real columns and nests test cases', async () => {
    const out = await runHandler(controller.createNewChallenge, {
      body: validated('post', '/', wellFormed),
      headers: {},
    });
    expect(out.error).toBeUndefined();
    const data = calls.create[0]?.data;
    expect(data).toBeDefined();
    for (const k of Object.keys(data!)) expect(fields.has(k)).toBe(true);
    for (const k of requiredOnCreate) expect(data).toHaveProperty(k);
    expect(data!.test_cases).toEqual({
      create: [{ input: '2 7 11 15\n9', output: '0 1' }],
    });
  });

  it('PATCH maps camelCase keys to columns and replaces test cases', async () => {
    const out = await runHandler(controller.updateExistingChallenge, {
      params: { id: 'c1' },
      body: validated('patch', '/:id', {
        inputFormat: 'n',
        testCases: [{ input: '1', output: '1' }],
      }),
      headers: {},
    });
    expect(out.error).toBeUndefined();
    expect(calls.update[0]?.data).toEqual({
      input_format: 'n',
      test_cases: { deleteMany: {}, create: [{ input: '1', output: '1' }] },
    });
  });
});

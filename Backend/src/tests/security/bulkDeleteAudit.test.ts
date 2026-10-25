import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterAll,
} from '@jest/globals';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { NextFunction, Request, Response } from 'express';

// Real routers, real authorizeRoles, real withAudit. The fake $transaction
// stages writes and commits only if the callback resolves (a real rollback).

type Row = { id: string };
const db = {
  subject: [] as Row[],
  mainConcept: [] as Row[],
  job: [] as Row[],
  audit: [] as Array<Record<string, unknown>>,
};
let failAudit = false;

const notFound = () =>
  Object.assign(new Error('Record to delete does not exist.'), {
    code: 'P2025',
  });

type Table = 'subject' | 'mainConcept' | 'job';
const txClient = (staged: typeof db) => {
  const table = (name: Table) => ({
    findMany: async ({ where }: { where: { id: { in: string[] } } }) =>
      staged[name].filter((r) => where.id.in.includes(r.id)),
    deleteMany: async ({ where }: { where: { id: { in: string[] } } }) => {
      const before = staged[name].length;
      staged[name] = staged[name].filter((r) => !where.id.in.includes(r.id));
      return { count: before - staged[name].length };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const row = staged[name].find((r) => r.id === where.id);
      if (!row) throw notFound();
      staged[name] = staged[name].filter((r) => r.id !== where.id);
      return row;
    },
  });
  return {
    subject: table('subject'),
    mainConcept: table('mainConcept'),
    job: table('job'),
    adminAuditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        if (failAudit) throw new Error('audit insert failed');
        staged.audit.push(data);
        return data;
      },
    },
  };
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: async (fn: (t: unknown) => Promise<unknown>) => {
      const staged = {
        subject: [...db.subject],
        mainConcept: [...db.mainConcept],
        job: [...db.job],
        audit: [...db.audit],
      };
      const result = await fn(txClient(staged));
      Object.assign(db, staged);
      return result;
    },
  },
}));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn(), exists: jest.fn() },
}));
jest.mock('../../middlewares/authMiddleware', () => {
  const actual = jest.requireActual(
    '../../middlewares/authMiddleware'
  ) as Record<string, unknown>;
  return {
    ...actual,
    authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
      const role = req.headers['x-test-role'] as string;
      (req as unknown as { user: unknown }).user = {
        id: `${role.toLowerCase()}-1`,
        role: { name: role },
      };
      next();
    },
  };
});

import express from 'express';
import { ResourceRoutes } from '../../routes/resourceRoutes';
import mainConceptRouter from '../../routes/mainConceptRoutes';
import jobRouter from '../../routes/jobRoutes';
import { errorHandler } from '../../utils/errorHandler';

const app = express();
app.use(express.json());
app.use('/resources', new ResourceRoutes().getRouter());
app.use('/main-concepts', mainConceptRouter);
app.use('/jobs', jobRouter);
app.use(errorHandler);

let server: Server | undefined;
let baseUrl = '';
const base = () =>
  new Promise<string>((resolve) => {
    if (server) return resolve(baseUrl);
    const s = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${(s.address() as AddressInfo).port}`;
      resolve(baseUrl);
    });
    server = s;
  });

const call = async (
  method: string,
  path: string,
  role: string,
  body?: unknown
) =>
  fetch(`${await base()}${path}`, {
    method,
    headers: { 'content-type': 'application/json', 'x-test-role': role },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  failAudit = false;
  db.subject = [{ id: 's1' }, { id: 's2' }, { id: 's3' }];
  db.mainConcept = [{ id: 'mc1' }];
  db.job = [{ id: 'j1' }];
  db.audit = [];
});

afterAll(
  () => new Promise<void>((r) => (server ? server.close(() => r()) : r()))
);

describe('POST /resources/delete-subjects', () => {
  it('writes one audit row with requested ids, deleted ids and count', async () => {
    const res = await call('POST', '/resources/delete-subjects', 'ADMIN', {
      ids: ['s1', 's3', 'ghost'],
    });
    expect(res.status).toBe(200);
    expect(db.subject).toEqual([{ id: 's2' }]);
    expect(db.audit).toHaveLength(1);
    expect(db.audit[0]).toMatchObject({
      admin_id: 'admin-1',
      action: 'BULK_DELETE_SUBJECTS',
      entity: 'SUBJECT',
      details: {
        requested_ids: ['s1', 's3', 'ghost'],
        deleted_ids: ['s1', 's3'],
        count: 2,
      },
    });
  });

  it('a failed audit write rolls the delete back: nothing deleted, no row', async () => {
    failAudit = true;
    const res = await call('POST', '/resources/delete-subjects', 'ADMIN', {
      ids: ['s1'],
    });
    expect(res.status).toBe(500);
    expect(db.subject).toHaveLength(3);
    expect(db.audit).toHaveLength(0);
  });

  it('a non-admin gets 403 and nothing is deleted or recorded', async () => {
    const res = await call('POST', '/resources/delete-subjects', 'STUDENT', {
      ids: ['s1'],
    });
    expect(res.status).toBe(403);
    expect(db.subject).toHaveLength(3);
    expect(db.audit).toHaveLength(0);
  });
});

describe('DELETE /main-concepts/:id', () => {
  it('writes an audit row for the deleted main concept', async () => {
    const res = await call('DELETE', '/main-concepts/mc1', 'ADMIN');
    expect(res.status).toBe(200);
    expect(db.mainConcept).toHaveLength(0);
    expect(db.audit).toEqual([
      expect.objectContaining({
        admin_id: 'admin-1',
        action: 'DELETE_MAIN_CONCEPT',
        entity: 'MAIN_CONCEPT',
        entity_id: 'mc1',
        details: { requested_ids: ['mc1'], deleted_ids: ['mc1'], count: 1 },
      }),
    ]);
  });

  it('a delete of a missing id fails and writes no audit row', async () => {
    const res = await call('DELETE', '/main-concepts/nope', 'ADMIN');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(db.mainConcept).toHaveLength(1);
    expect(db.audit).toHaveLength(0);
  });

  it('a non-admin gets 403', async () => {
    const res = await call('DELETE', '/main-concepts/mc1', 'STUDENT');
    expect(res.status).toBe(403);
    expect(db.mainConcept).toHaveLength(1);
    expect(db.audit).toHaveLength(0);
  });
});

describe('DELETE /jobs/delete/:id', () => {
  it('writes an audit row for the deleted job', async () => {
    const res = await call('DELETE', '/jobs/delete/j1', 'ADMIN');
    expect(res.status).toBe(200);
    expect(db.job).toHaveLength(0);
    expect(db.audit).toEqual([
      expect.objectContaining({
        admin_id: 'admin-1',
        action: 'DELETE_JOB',
        entity: 'JOB',
        entity_id: 'j1',
        details: { requested_ids: ['j1'], deleted_ids: ['j1'], count: 1 },
      }),
    ]);
  });

  it('a delete of a missing id fails and writes no audit row', async () => {
    const res = await call('DELETE', '/jobs/delete/nope', 'ADMIN');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(db.job).toHaveLength(1);
    expect(db.audit).toHaveLength(0);
  });

  it('a non-admin gets 403', async () => {
    const res = await call('DELETE', '/jobs/delete/j1', 'STUDENT');
    expect(res.status).toBe(403);
    expect(db.job).toHaveLength(1);
    expect(db.audit).toHaveLength(0);
  });
});

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * The audit trail's two guarantees, and the difference between them.
 *
 * `withAudit` is ATOMIC: the mutation and its record commit together or not at
 * all. `recordActionBestEffort` is not, and is named so that the weaker
 * guarantee is visible at every call site.
 *
 * The bug this replaces: the mutation committed, then a separate audit insert
 * threw a 500. On `DELETE /users/:id` that told the admin the deletion had
 * failed while the user was already gone — and the natural response to a 500 is
 * to retry.
 */

// Typed explicitly: a bare jest.fn() infers its resolved type as `never`, so
// every mockResolvedValue below would fail to compile.
const tx = {
  create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  delete: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
};

const auditCreateOutsideTx = jest.fn<() => Promise<unknown>>();

/**
 * $transaction runs the callback with a transaction client. The mock rethrows
 * whatever the callback throws WITHOUT applying anything — standing in for the
 * rollback, so "did the mutation survive?" is answerable in the assertions.
 */
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: async (fn: (t: unknown) => Promise<unknown>) =>
      fn({
        adminAuditLog: { create: (...a: unknown[]) => tx.create(...a) },
        user: { delete: (...a: unknown[]) => tx.delete(...a) },
      }),
    adminAuditLog: { create: () => auditCreateOutsideTx() },
  },
}));

import { withAudit, recordActionBestEffort } from '../../services/auditTrail';

const entry = {
  admin_id: 'admin-1',
  action: 'DELETE_USER',
  entity: 'USER',
  entity_id: 'victim-1',
  ip_address: '10.0.0.1',
  user_agent: 'jest',
};

const silentLogger = { error: jest.fn() };

beforeEach(() => {
  tx.create.mockReset().mockResolvedValue({ id: 'log-1' });
  tx.delete.mockReset().mockResolvedValue({ id: 'victim-1' });
  auditCreateOutsideTx.mockReset().mockResolvedValue({ id: 'log-1' });
  silentLogger.error.mockReset();
});

describe('withAudit', () => {
  it('writes the audit row with the SAME transaction client as the mutation', () => {
    // The load-bearing property. A write issued on the global prisma client
    // would run outside the transaction and silently lose the guarantee, while
    // every other assertion here still passed.
    return withAudit(entry, (t) =>
      t.user.delete({ where: { id: 'victim-1' } })
    ).then(() => {
      expect(tx.delete).toHaveBeenCalled();
      expect(tx.create).toHaveBeenCalled();
      expect(auditCreateOutsideTx).not.toHaveBeenCalled();
    });
  });

  it('propagates a failed audit write so the mutation rolls back with it', async () => {
    tx.create.mockRejectedValue(new Error('audit insert failed'));

    await expect(
      withAudit(entry, (t) => t.user.delete({ where: { id: 'victim-1' } }))
    ).rejects.toThrow('audit insert failed');

    // The error is NOT swallowed — that is what makes the resulting 500 true,
    // and therefore what makes retrying safe.
  });

  it('does not write an audit row when the mutation itself fails', async () => {
    tx.delete.mockRejectedValue(new Error('no such user'));

    await expect(
      withAudit(entry, (t) => t.user.delete({ where: { id: 'nobody' } }))
    ).rejects.toThrow('no such user');

    // No record of something that did not happen. A trail that logs attempts
    // as if they were actions is worse than one with gaps.
    expect(tx.create).not.toHaveBeenCalled();
  });

  it('lets the entry be derived from the mutation result', async () => {
    tx.delete.mockResolvedValue({ id: 'generated-id' });

    await withAudit(
      (result: { id: string }) => ({ ...entry, entity_id: result.id }),
      (t) => t.user.delete({ where: { id: 'x' } }) as Promise<{ id: string }>
    );

    expect(tx.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ entity_id: 'generated-id' }),
      })
    );
  });

  it('records who, what, which, and from where', async () => {
    await withAudit(entry, (t) => t.user.delete({ where: { id: 'victim-1' } }));

    expect(tx.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        admin_id: 'admin-1',
        action: 'DELETE_USER',
        entity: 'USER',
        entity_id: 'victim-1',
        ip_address: '10.0.0.1',
        user_agent: 'jest',
      }),
    });
  });
});

describe('recordActionBestEffort', () => {
  it('never throws — the action it describes has already committed', async () => {
    // Throwing here would recreate the original bug exactly: reporting failure
    // for work that was done, on an action with nothing to roll back.
    auditCreateOutsideTx.mockRejectedValue(new Error('db down'));

    await expect(
      recordActionBestEffort(entry, silentLogger)
    ).resolves.toBeUndefined();
  });

  it('logs loudly when it cannot record, so the gap is not silent', async () => {
    auditCreateOutsideTx.mockRejectedValue(new Error('db down'));

    await recordActionBestEffort(entry, silentLogger);

    expect(silentLogger.error).toHaveBeenCalled();
    const meta = silentLogger.error.mock.calls[0][1] as Record<string, unknown>;
    expect(meta).toMatchObject({
      action: 'DELETE_USER',
      entity_id: 'victim-1',
    });
  });

  it('writes the row on the happy path', async () => {
    await recordActionBestEffort(entry, silentLogger);
    expect(auditCreateOutsideTx).toHaveBeenCalled();
    expect(silentLogger.error).not.toHaveBeenCalled();
  });
});

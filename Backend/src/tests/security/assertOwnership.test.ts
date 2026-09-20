/**
 * `assertOwnership` had no test at all, and that is precisely how it shipped
 * broken.
 *
 * The bug: it read `(req.user as { role?: string })?.role` and compared it to
 * `'ADMIN'`. `authMiddleware` builds `req.user` with `include: { role: true }`,
 * so `role` is the Prisma relation OBJECT. An object is never `===` a string,
 * so the admin bypass could not fire and an ADMIN was 403'd on every resource
 * they had not personally created — including on `PUT /roadmaps/:id` and
 * `DELETE /roadmaps/:id`, which are admin-gated for exactly that purpose.
 *
 * 🔴 THE POINT OF THIS FILE, and why the first test is written to fail if the
 * bug ever comes back the other way round: a test that had been written for
 * this function would almost certainly have built `req.user = { role: 'ADMIN' }`
 * — a plain string — because that is the shape the broken code implied. Such a
 * test PASSES against the broken implementation. The shape a fixture invents is
 * not evidence about the shape production sends, so these tests are written
 * against the shape `authMiddleware` actually produces, and `shape contract`
 * below pins that shape to the query that produces it rather than to my memory
 * of it.
 */
import type { Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertOwnership } from '../../utils/assertOwnership';
import { getRoleName, hasRole } from '../../utils/requestRole';

/** A response double that records what actually reached the wire. */
const makeRes = () => {
  const sent: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      sent.status = code;
      return this;
    },
    json(body: unknown) {
      sent.body = body;
      return this;
    },
    setHeader() {
      return this;
    },
  } as unknown as Response;
  return { res, sent };
};

/**
 * The shape `authMiddleware` puts on the request: a Prisma `User` row with the
 * `role` RELATION included. Only the fields these guards read are filled in.
 */
const requestFrom = (user: Record<string, unknown> | undefined): Request =>
  ({ user }) as unknown as Request;

const OWNER = 'user-owner';
const OTHER = 'user-other';

const asStudent = (id: string) =>
  requestFrom({ id, role: { id: 'role-student', name: 'STUDENT' } });

const asAdmin = (id: string) =>
  requestFrom({ id, role: { id: 'role-admin', name: 'ADMIN' } });

describe('assertOwnership', () => {
  describe('the owner', () => {
    it('is allowed through and nothing is written to the response', () => {
      const { res, sent } = makeRes();
      expect(assertOwnership(asStudent(OWNER), res, OWNER)).toBe(false);
      expect(sent.status).toBeUndefined();
      expect(sent.body).toBeUndefined();
    });
  });

  describe('a non-owner', () => {
    it('is denied with a real 403 on the wire, not just a return value', () => {
      const { res, sent } = makeRes();
      expect(assertOwnership(asStudent(OTHER), res, OWNER)).toBe(true);
      expect(sent.status).toBe(403);
    });

    it('is denied when the resource has no owner recorded at all', () => {
      for (const ownerId of [null, undefined]) {
        const { res, sent } = makeRes();
        expect(assertOwnership(asStudent(OTHER), res, ownerId)).toBe(true);
        expect(sent.status).toBe(403);
      }
    });

    it('is denied when there is no authenticated user', () => {
      const { res, sent } = makeRes();
      expect(assertOwnership(requestFrom(undefined), res, OWNER)).toBe(true);
      expect(sent.status).toBe(403);
    });

    it('fails CLOSED for an unauthenticated request even if the resource is ownerless', () => {
      // Both sides undefined must not compare equal into an allow.
      const { res, sent } = makeRes();
      expect(assertOwnership(requestFrom(undefined), res, undefined)).toBe(
        true
      );
      expect(sent.status).toBe(403);
    });
  });

  describe('the admin bypass — the regression this file exists for', () => {
    it('lets an ADMIN act on a resource they do not own', () => {
      // THIS IS THE ASSERTION THAT FAILED BEFORE THE FIX. `role` is the
      // relation object, which is what a real request carries.
      const { res, sent } = makeRes();
      expect(assertOwnership(asAdmin('admin-1'), res, OWNER)).toBe(false);
      expect(sent.status).toBeUndefined();
    });

    it('still matches when a route declares the role in lower case', () => {
      // roadMapRoutes declares `authorizeRoles('admin')` while every other
      // route uses 'ADMIN'. The reader normalises so the two cannot disagree.
      const { res } = makeRes();
      const req = requestFrom({
        id: 'admin-1',
        role: { id: 'r', name: 'admin' },
      });
      expect(assertOwnership(req, res, OWNER)).toBe(false);
    });

    it('does NOT extend to other roles — a MODERATOR is still held to ownership', () => {
      // Deliberate and worth stating: the documented contract is an ADMIN
      // bypass only. Whether MODERATOR should also bypass is a product
      // decision, not something this fix quietly widened.
      const { res, sent } = makeRes();
      const req = requestFrom({
        id: 'mod-1',
        role: { id: 'r', name: 'MODERATOR' },
      });
      expect(assertOwnership(req, res, OWNER)).toBe(true);
      expect(sent.status).toBe(403);
    });

    it('does not treat a user with no role as an admin', () => {
      for (const role of [null, undefined]) {
        const { res, sent } = makeRes();
        expect(
          assertOwnership(requestFrom({ id: OTHER, role }), res, OWNER)
        ).toBe(true);
        expect(sent.status).toBe(403);
      }
    });
  });

  describe('the shape this guard reads', () => {
    it('reads the role from the RELATION, not from a string field', () => {
      // The broken implementation passed for `role: 'ADMIN'` and failed for the
      // real shape. Pin both directions so neither can be reintroduced: a bare
      // string is NOT a role this codebase ever receives, and must not grant
      // anything.
      const stringShape = requestFrom({ id: 'admin-1', role: 'ADMIN' });
      expect(getRoleName(stringShape)).toBeUndefined();
      expect(hasRole(stringShape, 'ADMIN')).toBe(false);

      const realShape = asAdmin('admin-1');
      expect(getRoleName(realShape)).toBe('ADMIN');
      expect(hasRole(realShape, 'ADMIN')).toBe(true);
    });

    it('shape contract: authMiddleware really does include the role relation', () => {
      // A fixture only proves what the fixture says. This reads the middleware
      // that builds `req.user` and asserts the include that makes `role` an
      // object — so if someone changes it to a scalar, the fixtures above stop
      // being a description of production and this test says so.
      const src = readFileSync(
        join(__dirname, '..', '..', 'middlewares', 'authMiddleware.ts'),
        'utf8'
      );
      expect(src).toMatch(/include:\s*\{\s*role:\s*true/);
    });
  });
});

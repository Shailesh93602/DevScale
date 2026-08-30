# Access control: roles, permissions, and per-person overrides

## The problem this replaces

The database already had `Role`, `Permission`, `RolePermission` and
`UserPermission` tables, an `RBACRepository.checkPermission`, and a
`requirePermission` middleware. None of it worked, and both call sites were
found commented out:

```ts
(authMiddleware,
  // requirePermission('tickets', 'update'),
  this.supportController.updateTicketStatus);
```

The reason was in the data. The seeded permission catalogue was four bare verbs
— `create`, `read`, `update`, `delete` — with no resource attached.
`checkPermission` builds the key `${resource}:${action}`, so a lookup for
`tickets:update` matched nothing and returned **false for every user, including
admins**. Turning the middleware on would have locked everyone out of the
application, so somebody turned it off instead. The tables stayed, looking like
a working feature.

A second gap sat underneath it: `checkPermission` only ever read **role**
permissions. `UserPermission` — the per-person table — was never queried at
all, so every row in it was inert. It contained 0 rows, which is what a table
nothing reads eventually contains.

## The model

```
role defaults   →  the baseline for everyone holding that role
user overrides  →  the exceptions, ALLOW or DENY, optionally time-boxed
```

Resolution, most specific first:

| #   | Rule                             | Result          |
| --- | -------------------------------- | --------------- |
| 1   | An unexpired user **DENY**       | refused, always |
| 2   | An unexpired user **ALLOW**      | permitted       |
| 3   | The role grants it, or holds `*` | permitted       |
| 4   | Otherwise                        | refused         |

### Why DENY wins

An additive-only model — where any grant anywhere permits — cannot express
_"this person specifically may not do this."_ The only ways to revoke would be
to change the person's **role**, which changes everything else about them at the
same time, or to edit the **role**, which changes it for everyone who holds it.
Both turn a small reversible decision into a large one. DENY is therefore
absolute, as it is in the major cloud IAM systems.

The cost is named rather than hidden: a DENY on someone who later becomes an
admin still applies. That is why `*` is evaluated _after_ user denies — an admin
with an explicit deny is a deliberate state. It is also why every override
records `granted_by` and `reason`.

### Why overrides expire

An exception outlives its reason. Standing access nobody remembers granting is
the single most common access-review finding. `expires_at` turns "remember to
take this away" into something the system does, and expiry is evaluated at
**read** time, so a lapsed override stops working the moment it lapses even if
no cleanup job has run.

## Where each guard belongs

| Guard                                     | Use it when                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `authorizeRoles('ADMIN')`                 | "only admins" — a coarse gate on a whole admin router. Still correct, still used, not deprecated. |
| `requirePermission(Resource.X, Action.Y)` | "whoever may do this" — when the answer should be able to differ per person.                      |

`requirePermission` **replaces** the role check on a route rather than layering
on top of it. Layering would mean a support volunteer granted `tickets:update`
still hit a 403 from the role gate — precisely the case overrides exist for.

## Caching

A permission check runs on every guarded request and resolves across four
tables. The cache is in-process with a 30s TTL, a hard entry cap, and explicit
invalidation on every write path that can change an answer.

Deliberately **not** Redis: this must keep working when Redis is down. An
authorisation cache that fails open during a cache outage is a far worse bug
than a few extra queries — and the rate limiter in this same codebase already
demonstrated how quietly that happens (it nulled its client on one transient
error and silently disabled itself until redeploy).

The TTL is the backstop for invalidations made in another process; the explicit
invalidation is what makes a revocation take effect immediately in the process
that performed it.

## Operating it

```bash
npm run seed:permissions          # idempotent: catalogue + role defaults
npm run seed:permissions -- --prune   # also REMOVE role grants no longer in defaults
```

The seed never deletes by default. Revoking access is a decision, and a script
running unattended on deploy is the wrong place to make it — a typo in a
constant should not silently strip a role.

### API

| Method   | Route                                   | Purpose                                          |
| -------- | --------------------------------------- | ------------------------------------------------ |
| `POST`   | `/api/v1/rbac/user-permissions`         | grant or deny one permission for one person      |
| `DELETE` | `/api/v1/rbac/user-permissions`         | remove an override, returning them to their role |
| `GET`    | `/api/v1/rbac/user-permissions/:userId` | effective permissions **and their provenance**   |

The GET returns the resolved list plus what came from the role and what came
from an override, including expired ones marked `active: false` — because
_"why can they do that?"_ is the question an access review actually asks, and a
flat list of effective permissions cannot answer it.

## Verified

Against a real database, not mocks: role defaults, an ALLOW granting a student
one extra power without affecting other students, a DENY removing one capability
from a moderator without demoting them, DENY beating the `*` wildcard on an
admin, and expiry enforced at read time. Every override created by that run was
deleted afterwards and the table verified back to 0 rows.

Precedence itself is covered exhaustively by `permissionResolution.test.ts`,
which tests `decide` as a pure function — precedence is the part nobody can hold
in their head, and an override that silently fails to apply looks exactly like
one nobody created.

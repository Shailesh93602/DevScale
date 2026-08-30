/**
 * The permission catalogue — the single source of truth for authorisation.
 *
 * WHY THIS FILE EXISTS AT ALL.
 *
 * The database already had `Role`, `Permission`, `RolePermission` and
 * `UserPermission` tables, and a `requirePermission` middleware. None of it
 * worked, and the reason was here: the seeded permissions were four verbs with
 * no resource — `create`, `read`, `update`, `delete`. `checkPermission` builds
 * the key `${resource}:${action}`, so a call like
 * `requirePermission('tickets', 'update')` looked for `tickets:update`, which
 * did not exist, and returned false for EVERY user including admins.
 *
 * That is why the middleware was found commented out at its two call sites.
 * Wiring it would have 403'd the entire application, so somebody disabled it
 * instead of building the catalogue — and the tables sat there looking like a
 * working feature. Permissions are a vocabulary; without one written down, a
 * permission table is just three empty joins.
 *
 * SHAPE: `resource:action`, lower-case, colon-separated. `*` is a superuser
 * wildcard held only by ADMIN.
 */

/** Actions, kept small on purpose. A verb per resource, not per endpoint. */
export const Action = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MODERATE: 'moderate',
  MANAGE: 'manage',
} as const;
export type Action = (typeof Action)[keyof typeof Action];

/**
 * Resources are things a person can hold an opinion about, not tables.
 * `tickets` and `help` exist because those are the two places the original
 * (disabled) `requirePermission` calls pointed at.
 */
export const Resource = {
  ARTICLES: 'articles',
  CHALLENGES: 'challenges',
  ROADMAPS: 'roadmaps',
  FORUMS: 'forums',
  TOPICS: 'topics',
  CURRICULUM: 'curriculum',
  TICKETS: 'tickets',
  HELP: 'help',
  USERS: 'users',
  ROLES: 'roles',
  REPORTS: 'reports',
  AUDIT: 'audit',
  JOBS: 'jobs',
} as const;
export type Resource = (typeof Resource)[keyof typeof Resource];

export const SUPERUSER = '*';

/** Build a permission key. Use this rather than string-concatenating inline. */
export const perm = (resource: Resource, action: Action): string =>
  `${resource}:${action}`;

/**
 * Every permission the system recognises, with a human description.
 *
 * The seed is driven from this list, so adding a permission is a code change
 * that ships with the code that uses it — rather than a row somebody has to
 * remember to insert in every environment.
 */
export const PERMISSION_CATALOGUE: ReadonlyArray<{
  key: string;
  name: string;
  description: string;
}> = [
  {
    key: SUPERUSER,
    name: 'SUPERUSER',
    description: 'Every permission. Held only by ADMIN.',
  },

  {
    key: perm(Resource.ARTICLES, Action.READ),
    name: 'ARTICLES_READ',
    description: 'View articles, including unpublished ones.',
  },
  {
    key: perm(Resource.ARTICLES, Action.MODERATE),
    name: 'ARTICLES_MODERATE',
    description: 'Publish, reject, and add moderation notes to articles.',
  },
  {
    key: perm(Resource.ARTICLES, Action.UPDATE),
    name: 'ARTICLES_UPDATE',
    description: "Edit another author's article content.",
  },
  {
    key: perm(Resource.ARTICLES, Action.DELETE),
    name: 'ARTICLES_DELETE',
    description: 'Delete articles.',
  },

  {
    key: perm(Resource.CHALLENGES, Action.CREATE),
    name: 'CHALLENGES_CREATE',
    description: 'Create coding challenges, including their test cases.',
  },
  {
    key: perm(Resource.CHALLENGES, Action.UPDATE),
    name: 'CHALLENGES_UPDATE',
    description:
      'Edit challenges and the expected outputs people are graded against.',
  },
  {
    key: perm(Resource.CHALLENGES, Action.DELETE),
    name: 'CHALLENGES_DELETE',
    description: 'Delete challenges.',
  },

  {
    key: perm(Resource.ROADMAPS, Action.CREATE),
    name: 'ROADMAPS_CREATE',
    description: 'Create learning roadmaps.',
  },
  {
    key: perm(Resource.ROADMAPS, Action.UPDATE),
    name: 'ROADMAPS_UPDATE',
    description: 'Edit roadmaps and their ordering.',
  },
  {
    key: perm(Resource.ROADMAPS, Action.DELETE),
    name: 'ROADMAPS_DELETE',
    description: 'Delete roadmaps.',
  },

  {
    key: perm(Resource.CURRICULUM, Action.MANAGE),
    name: 'CURRICULUM_MANAGE',
    description: 'Create, edit and delete main concepts, subjects and topics.',
  },
  {
    key: perm(Resource.TOPICS, Action.READ),
    name: 'TOPICS_READ_UNPUBLISHED',
    description: 'View unpublished (draft) topics.',
  },

  {
    key: perm(Resource.FORUMS, Action.MODERATE),
    name: 'FORUMS_MODERATE',
    description: "Edit or delete other people's discussions.",
  },

  {
    key: perm(Resource.TICKETS, Action.UPDATE),
    name: 'TICKETS_UPDATE',
    description: 'Change the status of, and assign, support tickets.',
  },
  {
    key: perm(Resource.HELP, Action.CREATE),
    name: 'HELP_CREATE',
    description: 'Publish help-centre articles.',
  },

  {
    key: perm(Resource.JOBS, Action.MANAGE),
    name: 'JOBS_MANAGE',
    description: 'Create, edit and delete job postings.',
  },

  {
    key: perm(Resource.USERS, Action.READ),
    name: 'USERS_READ',
    description: 'View the user directory.',
  },
  {
    key: perm(Resource.USERS, Action.MANAGE),
    name: 'USERS_MANAGE',
    description: 'Change roles, suspend and delete users.',
  },
  {
    key: perm(Resource.ROLES, Action.MANAGE),
    name: 'ROLES_MANAGE',
    description: 'Create roles and change what each role may do.',
  },
  {
    key: perm(Resource.REPORTS, Action.READ),
    name: 'REPORTS_READ',
    description: 'Generate and export platform reports.',
  },
  {
    key: perm(Resource.AUDIT, Action.READ),
    name: 'AUDIT_READ',
    description: 'Read the audit trail.',
  },
];

/**
 * What each role can do by DEFAULT.
 *
 * Defaults belong to the role; exceptions belong to the person (UserPermission).
 * That split is the whole point: granting a capable student one extra power
 * must not mean inventing a new role for them, and it must not mean widening
 * STUDENT for everybody.
 *
 * ADMIN holds `*` rather than an enumerated list, so a permission added to the
 * catalogue later cannot silently leave admins locked out of a new feature —
 * a failure mode that looks like a bug in the feature, not in the seed.
 */
export const ROLE_DEFAULTS: Readonly<Record<string, readonly string[]>> = {
  ADMIN: [SUPERUSER],
  MODERATOR: [
    perm(Resource.ARTICLES, Action.READ),
    perm(Resource.ARTICLES, Action.MODERATE),
    perm(Resource.ARTICLES, Action.UPDATE),
    perm(Resource.FORUMS, Action.MODERATE),
    perm(Resource.TOPICS, Action.READ),
    perm(Resource.TICKETS, Action.UPDATE),
    perm(Resource.HELP, Action.CREATE),
  ],
  // Deliberately empty. Everything a student does — submitting, enrolling,
  // posting, liking — is self-service on their own data and is guarded by
  // authentication plus ownership, not by a permission. Giving STUDENT a list
  // of permissions it does not need is how a role quietly becomes powerful.
  STUDENT: [],
};

/** Effects an override can have. DENY wins over ALLOW — see permissionService. */
export const PermissionEffect = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
} as const;
export type PermissionEffect =
  (typeof PermissionEffect)[keyof typeof PermissionEffect];

/**
 * A minimal stand-in for what Prisma returns for a given `select`/`include`/
 * `omit`, applied to a fully-populated fixture row. Lets a test assert on the
 * fields that would actually reach the client instead of on query arguments.
 * Relations in the fixture are arrays or plain objects; scalars are the rest,
 * so give Json columns string values in fixtures or they read as relations.
 */
type Sel = {
  select?: Record<string, unknown>;
  include?: Record<string, unknown>;
  omit?: Record<string, boolean>;
};

const isRelation = (v: unknown) =>
  Array.isArray(v) ||
  (v !== null && typeof v === 'object' && !(v instanceof Date));

export function project(row: unknown, sel: unknown): unknown {
  if (Array.isArray(row)) return row.map((r) => project(r, sel));
  if (row === null || typeof row !== 'object') return row;
  const src = row as Record<string, unknown>;
  const s = (sel === true || sel === undefined ? {} : sel) as Sel;
  const out: Record<string, unknown> = {};
  if (s.select) {
    for (const [k, v] of Object.entries(s.select)) {
      if (v && k in src)
        out[k] = isRelation(src[k]) ? project(src[k], v) : src[k];
    }
    return out;
  }
  for (const [k, v] of Object.entries(src)) {
    if (s.omit?.[k]) continue;
    if (!isRelation(v)) out[k] = v;
    else if (s.include?.[k]) out[k] = project(v, s.include[k]);
  }
  return out;
}

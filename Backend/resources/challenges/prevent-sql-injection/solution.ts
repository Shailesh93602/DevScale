// SQL Injection Prevention - Complete Solution
// Implements parameterized queries, input validation, and injection detection

function sanitizeQuery(
  rawQuery: string,
  userInputs: Record<string, string>
): { query: string; params: string[] } {
  const params: string[] = [];
  let paramIndex = 1;

  // Replace concatenated user inputs with parameterized placeholders
  let query = rawQuery;
  for (const [key, value] of Object.entries(userInputs)) {
    // Replace patterns like: ' + key + ' or ${key} or " + key + "
    const patterns = [
      new RegExp(`'\\s*\\+\\s*${key}\\s*\\+\\s*'`, "g"),
      new RegExp(`"\\s*\\+\\s*${key}\\s*\\+\\s*"`, "g"),
      new RegExp(`\\$\\{${key}\\}`, "g"),
      new RegExp(`'\\s*\\+\\s*${key}`, "g"),
      new RegExp(`${key}\\s*\\+\\s*'`, "g"),
    ];

    for (const pattern of patterns) {
      if (pattern.test(query)) {
        query = query.replace(pattern, `$${paramIndex}`);
        params.push(value);
        paramIndex++;
        break;
      }
    }
  }

  return { query, params };
}

function detectSQLInjection(input: string): {
  isMalicious: boolean;
  patterns: string[];
} {
  const detections: string[] = [];
  const checks: Array<[RegExp, string]> = [
    [/('\s*(OR|AND)\s+\d+\s*=\s*\d+)/i, "Boolean-based injection"],
    [/('\s*(OR|AND)\s+'[^']*'\s*=\s*'[^']*')/i, "String-based injection"],
    [/(;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE))/i, "Stacked query injection"],
    [/(\bUNION\b\s+(ALL\s+)?SELECT\b)/i, "UNION-based injection"],
    [/('--\s*$)/i, "Comment-based injection"],
    [/(\/\*.*\*\/)/i, "Inline comment injection"],
    [/(WAITFOR\s+DELAY|SLEEP\s*\()/i, "Time-based blind injection"],
    [/(BENCHMARK\s*\()/i, "Benchmark-based injection"],
  ];

  for (const [pattern, name] of checks) {
    if (pattern.test(input)) {
      detections.push(name);
    }
  }

  return { isMalicious: detections.length > 0, patterns: detections };
}

function validateInput(
  input: string,
  type: "username" | "integer" | "email" | "uuid"
): { valid: boolean; sanitized: string } {
  const validators: Record<string, RegExp> = {
    username: /^[a-zA-Z0-9_.-]{1,64}$/,
    integer: /^\d{1,10}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  };

  const valid = validators[type]?.test(input) ?? false;
  const sanitized = valid ? input : "";

  return { valid, sanitized };
}

// Secure query builder helper
function secureSelect(
  table: string,
  conditions: Record<string, unknown>
): { query: string; params: unknown[] } {
  const allowedTables = ["users", "products", "orders", "sessions"];
  if (!allowedTables.includes(table)) {
    throw new Error(`Invalid table: ${table}`);
  }

  const keys = Object.keys(conditions);
  const whereClauses = keys.map((k, i) => `${k} = $${i + 1}`);
  const params = Object.values(conditions);

  return {
    query: `SELECT * FROM ${table} WHERE ${whereClauses.join(" AND ")}`,
    params,
  };
}

// Shared plumbing for the functional QA runner (qa/run.mjs).
import 'dotenv/config';
import './localOnly.mjs';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { TEST_USERS as USERS } from './testUsers.mjs';

const BASE = process.env.QA_BASE || 'http://localhost:4000/api/v1';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
const prisma = new PrismaClient();

const results = [];
function rec(area, name, pass, detail = '') {
  results.push({ area, name, pass, detail });
  const tag = pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`${tag}  [${area}] ${name}${detail ? '  — ' + detail : ''}`);
}

async function login(which) {
  const u = USERS[which];
  const { data, error } = await sb.auth.signInWithPassword(u);
  if (error) throw new Error(`login ${which} failed: ${error.message}`);
  return data.session.access_token;
}

// Double-submit CSRF: the middleware only checks cookie === header, so we send
// a matching pair on state-changing methods (exactly what the browser does).
const CSRF = 'qa-csrf-token';
async function api(method, path, { token, body } = {}) {
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(mutating ? { 'x-xsrf-token': CSRF, Cookie: `XSRF-TOKEN=${CSRF}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-json */ }
  return { status: res.status, json };
}

export { api, login, prisma, rec, results, sb, USERS };

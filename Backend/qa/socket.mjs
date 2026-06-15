// Realtime WebSocket QA — proves the socket handshake (auth) + live event
// delivery work end to end. Run: node qa/socket.mjs   (backend up on :4000)
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { io } from "socket.io-client";

const BASE = process.env.QA_BASE || "http://localhost:4000/api/v1";
const WS = process.env.QA_WS || "http://localhost:4000";
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
const prisma = new PrismaClient();
const CSRF = "qa-csrf-token";

const results = [];
function rec(name, pass, detail = "") {
  results.push({ name, pass });
  console.log(`${pass ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  [socket] ${name}${detail ? "  — " + detail : ""}`);
}
async function login(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.session.access_token;
}
async function api(method, path, token, body) {
  const mutating = !["GET", "HEAD"].includes(method);
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(mutating ? { "x-xsrf-token": CSRF, Cookie: `XSRF-TOKEN=${CSRF}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* */ }
  return { status: res.status, json };
}
function connect(token) {
  return io(WS, { transports: ["websocket"], auth: token ? { token } : undefined, reconnection: false, timeout: 8000 });
}
function waitConnect(socket) {
  return new Promise((resolve) => {
    socket.on("connect", () => resolve({ ok: true }));
    socket.on("connect_error", (e) => resolve({ ok: false, err: e.message }));
  });
}

async function main() {
  const tok = await login("testuser@yopmail.com", "Test@123");
  const tok2 = await login("battleplayer2@yopmail.com", "Test@1234");

  // 1) Auth handshake
  const sOk = connect(tok);
  const okRes = await waitConnect(sOk);
  rec("connect with valid Supabase token → connected", okRes.ok === true, okRes.err || "");
  sOk.disconnect();

  const sNo = connect(null);
  const noRes = await waitConnect(sNo);
  rec("connect with NO token → rejected (connect_error)", noRes.ok === false, noRes.err || "");
  sNo.close();

  const sBad = connect("garbage.token.value");
  const badRes = await waitConnect(sBad);
  rec("connect with BAD token → rejected", badRes.ok === false, badRes.err || "");
  sBad.close();

  // 2) Live event delivery: set up a battle, join the room, start, expect event
  const qrow = await prisma.question.findFirst({ where: { quiz: { topic_id: { not: null } } }, select: { quiz: { select: { topic_id: true } } } }).catch(() => null);
  const topicId = qrow?.quiz?.topic_id;
  if (!topicId) { rec("realtime precondition: topic with questions", false); return finish(); }

  const create = await api("POST", "/battles", tok, {
    title: "QA Socket " + topicId.slice(0, 6), difficulty: "EASY", type: "QUICK",
    max_participants: 4, total_questions: 5, question_source: { type: "topic", id: topicId, count: 5 },
  });
  const battleId = create.json?.data?.id || create.json?.data?.battle?.id;
  if (!battleId) { rec("realtime precondition: battle created", false, `status=${create.status}`); return finish(); }

  await api("POST", `/battles/${battleId}/join`, tok);
  await api("POST", `/battles/${battleId}/join`, tok2);

  const s1 = connect(tok);
  await waitConnect(s1);
  // listen for ANY of the start-related events broadcast to the room
  const started = new Promise((resolve) => {
    for (const ev of ["battle:started", "battle:status_changed", "battle:question", "battle:state"]) {
      s1.on(ev, () => resolve(ev));
    }
    setTimeout(() => resolve(null), 7000);
  });
  s1.emit("battle:join", { battle_id: battleId });
  await new Promise((r) => setTimeout(r, 500)); // let the room-join settle

  await api("POST", `/battles/${battleId}/lobby`, tok);
  await api("POST", `/battles/${battleId}/ready`, tok);
  await api("POST", `/battles/${battleId}/ready`, tok2);
  const start = await api("POST", `/battles/${battleId}/start`, tok);

  const ev = await started;
  rec("socket receives a live battle event after start", !!ev, ev ? `event=${ev}` : `none within 7s (start status=${start.status})`);

  s1.disconnect();
  await api("PATCH", `/battles/${battleId}/cancel`, tok).catch(() => {});
  finish();
}

function finish() {
  const fail = results.filter((r) => !r.pass);
  console.log(`\n──────── ${results.length - fail.length}/${results.length} passed ────────`);
  prisma.$disconnect();
  setTimeout(() => process.exit(fail.length ? 1 : 0), 200);
}

main().catch((e) => { console.error(e); process.exit(2); });

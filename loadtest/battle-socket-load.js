/**
 * Socket.io battle-flow load simulation.
 *
 * k6 can't speak the Socket.io protocol, so this uses the same `socket.io-client`
 * the app depends on. It spawns N concurrent clients, has them join battle rooms
 * in pairs, and measures the latency from "join" to the "battle:started" event —
 * i.e. the real-time path that Redlock + the Redis adapter coordinate.
 *
 *   WS_URL=http://localhost:5000 PAIRS=100 node loadtest/battle-socket-load.js
 *
 * ⚠️ ADJUST the event names / payloads marked below to match your actual client
 *    protocol (see Frontend socket usage + src/services/socket.ts). This is a
 *    template wired to the event names documented in the README.
 */
import { io } from "socket.io-client";

const WS_URL = process.env.WS_URL || "http://localhost:5000";
const PAIRS = Number(process.env.PAIRS || 50); // concurrent battles
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 10000);

function now() {
  return Number(process.hrtime.bigint() / 1000000n);
}

function connectClient() {
  return new Promise((resolve, reject) => {
    const socket = io(WS_URL, { transports: ["websocket"], reconnection: false });
    const t = setTimeout(() => reject(new Error("connect timeout")), TIMEOUT_MS);
    socket.on("connect", () => {
      clearTimeout(t);
      resolve(socket);
    });
    socket.on("connect_error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

// One battle = two clients joining the same room; measure join → battle:started.
async function runBattle(roomId) {
  const [a, b] = await Promise.all([connectClient(), connectClient()]);
  const start = now();
  const started = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("battle:started timeout")), TIMEOUT_MS);
    a.on("battle:started", () => {
      clearTimeout(t);
      resolve(now() - start);
    });
  });
  // ⚠️ ADJUST: emit whatever your client emits to join/ready a battle room.
  a.emit("battle:join", { roomId });
  b.emit("battle:join", { roomId });
  try {
    const latency = await started;
    return { ok: true, latency };
  } finally {
    a.close();
    b.close();
  }
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function main() {
  console.log(`Simulating ${PAIRS} concurrent battles against ${WS_URL}...`);
  const results = await Promise.allSettled(
    Array.from({ length: PAIRS }, (_, i) => runBattle(`loadtest-room-${i}`))
  );

  const ok = results.filter((r) => r.status === "fulfilled" && r.value.ok);
  const latencies = ok.map((r) => r.value.latency).sort((x, y) => x - y);
  const failed = PAIRS - ok.length;

  console.log("\n── Battle-start latency (ms) ──");
  console.log(`  battles:   ${PAIRS}  (failed: ${failed})`);
  console.log(`  p50:       ${percentile(latencies, 50)}`);
  console.log(`  p95:       ${percentile(latencies, 95)}`);
  console.log(`  p99:       ${percentile(latencies, 99)}`);
  console.log(`  max:       ${latencies.at(-1) ?? 0}`);
  process.exit(failed > PAIRS * 0.05 ? 1 : 0); // fail if >5% errored
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

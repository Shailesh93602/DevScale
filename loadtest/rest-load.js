// k6 REST load test for EduScale's read-heavy endpoints.
//
//   BASE_URL=http://localhost:5000 k6 run loadtest/rest-load.js
//
// Produces p50/p90/p95/p99 latency + throughput. Use the numbers in the
// portfolio INSTEAD of unverified claims like "<200ms". Label them honestly
// as a local benchmark (machine + concurrency) — not production figures.
import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://localhost:5000";
const API = `${BASE}/api/v1`;

// Per-endpoint latency trends so the summary breaks down by route.
const healthLatency = new Trend("health_latency", true);
const battleListLatency = new Trend("battle_list_latency", true);

export const options = {
  scenarios: {
    // Ramp 0→100 VUs over 2m, hold, ramp down. Adjust to your machine.
    ramp: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "1m", target: 100 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% errors
    http_req_duration: ["p(95)<500", "p(99)<1000"],
  },
};

export default function () {
  // Deep health check — verifies DB + Redis + queue are live.
  const health = http.get(`${API}/health`);
  healthLatency.add(health.timings.duration);
  check(health, { "health 200": (r) => r.status === 200 });

  // Battle listing (paginated, cached). NOTE: confirm this path matches your
  // router; adjust if your route differs (e.g. /battles vs /battle).
  const battles = http.get(`${API}/battles?page=1&limit=12`);
  battleListLatency.add(battles.timings.duration);
  check(battles, { "battles 200|401": (r) => r.status === 200 || r.status === 401 });

  sleep(1);
}

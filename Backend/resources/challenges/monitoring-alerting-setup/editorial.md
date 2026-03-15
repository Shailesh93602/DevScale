# Editorial -- Monitoring and Alerting Setup

## Problem Summary

Design a complete monitoring and alerting pipeline implementing SLI recording rules, multi-burn-rate SLO alerts, Grafana dashboards, and Alertmanager routing. This tests understanding of observability, SRE practices, and the Prometheus ecosystem.

---

## Approach -- Full Observability Stack

### Step 1: Recording Rules

Pre-compute SLIs for efficient dashboard queries:

```yaml
groups:
  - name: api-gateway-sli
    interval: 30s
    rules:
      - record: job:http_requests_total:rate5m
        expr: rate(http_requests_total{job="api-gateway"}[5m])
      - record: job:http_errors_total:rate5m
        expr: rate(http_requests_total{job="api-gateway", status=~"5.."}[5m])
      - record: job:http_error_ratio:rate5m
        expr: job:http_errors_total:rate5m / job:http_requests_total:rate5m
      - record: job:http_request_duration_seconds:p99
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job="api-gateway"}[5m]))
```

### Step 2: Multi-Burn-Rate Alerts

```yaml
groups:
  - name: api-gateway-alerts
    rules:
      - alert: HighErrorRate_FastBurn
        expr: job:http_error_ratio:rate5m > (14.4 * 0.001)
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Fast error budget burn detected"

      - alert: HighErrorRate_SlowBurn
        expr: job:http_error_ratio:rate5m > 0.001
        for: 1h
        labels:
          severity: warning
```

### Step 3: Alertmanager Routing

```yaml
route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  repeat_interval: 1h
  receiver: 'slack-default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
    - match:
        severity: warning
      receiver: 'slack-warnings'
```

---

## Key Concepts

### RED Method
- **R**ate: Request throughput (QPS)
- **E**rrors: Error percentage
- **D**uration: Latency distribution

### Multi-Burn-Rate Alerting
- Fast burn (14.4x): catches outages quickly, pages in minutes
- Slow burn (1x): catches gradual degradation, tickets over hours

### Error Budget
- For 99.9% SLO: budget = 0.1% of requests can fail
- Alerts fire when burn rate threatens to exhaust budget before period ends

---

## Common Mistakes

- Alerting on instantaneous values (causes flapping)
- Not using recording rules (expensive queries)
- Single burn rate (misses either fast outages or slow degradation)
- Missing `send_resolved: true` in alertmanager

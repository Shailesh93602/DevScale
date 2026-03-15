# Monitoring and Alerting Setup

You are an SRE tasked with setting up a comprehensive monitoring and alerting pipeline for a microservice using Prometheus, Grafana, and Alertmanager.

## Problem

Given a service configuration with SLO targets, generate a complete monitoring stack configuration including:

1. **Prometheus Recording Rules** -- Pre-computed SLI metrics for efficient querying
2. **Prometheus Alert Rules** -- Alerts that fire when SLOs are at risk using multi-burn-rate approach
3. **Grafana Dashboard** -- Visual dashboard with RED metrics (Rate, Errors, Duration)
4. **Alertmanager Configuration** -- Alert routing to appropriate channels by severity

---

## Requirements

### Prometheus Recording Rules
- Request rate (`rate()` over 5m window)
- Error rate and error ratio
- Latency percentiles (P50, P90, P99) using `histogram_quantile()`

### Alert Rules
- **Fast burn** (14.4x): Critical alert, fires within minutes
- **Slow burn** (1x): Warning alert, fires over hours
- **High latency**: P99 exceeding SLO threshold
- **Service down**: Target is unreachable
- All alerts must include `severity` label and `for` duration

### Grafana Dashboard
- Request rate (QPS) panel
- Error rate percentage panel
- Latency distribution panel (P50/P90/P99)
- Error budget remaining gauge

### Alertmanager
- Route critical alerts to PagerDuty + Slack
- Route warnings to Slack only
- Group by `alertname` and `service`

---

## Examples

**Example 1:**
```text
Input: {
  serviceName: "api-gateway",
  slo: { availability: 99.9, latencyP99Ms: 500 },
  alertChannels: ["slack", "pagerduty"]
}

Output: {
  prometheusRules: "groups:\n  - name: api-gateway-sli\n    rules: ...",
  grafanaDashboard: "{ dashboard with 4 panels }",
  alertmanagerConfig: "route:\n  group_by: ['alertname', 'service']\n  ..."
}
```

---

## Constraints

- Recording rules must follow naming convention `level:metric:operations`
- Alert rules must include `for` duration to prevent flapping
- Error budget burn rates: fast=14.4x over 1h, slow=1x over 3d
- Dashboard default time range: last 6 hours
- Error budget = (100 - availability_slo) / 100

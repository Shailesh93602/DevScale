// Complete monitoring and alerting configuration generator
// Implements SLI recording rules, multi-burn-rate alerts, Grafana dashboard, and Alertmanager routing

interface MonitoringConfig {
  serviceName: string;
  slo: { availability: number; latencyP99Ms: number };
  alertChannels: string[];
}

function generateMonitoringConfig(config: MonitoringConfig): {
  prometheusRules: string;
  grafanaDashboard: string;
  alertmanagerConfig: string;
} {
  const { serviceName, slo, alertChannels } = config;
  const errorBudget = (100 - slo.availability) / 100;
  const latencyThreshold = slo.latencyP99Ms / 1000;

  const prometheusRules = `groups:
  - name: ${serviceName}-sli
    interval: 30s
    rules:
      - record: job:http_requests_total:rate5m
        expr: rate(http_requests_total{job="${serviceName}"}[5m])
      - record: job:http_errors_total:rate5m
        expr: rate(http_requests_total{job="${serviceName}", status=~"5.."}[5m])
      - record: job:http_error_ratio:rate5m
        expr: job:http_errors_total:rate5m / job:http_requests_total:rate5m
      - record: job:http_request_duration_seconds:p99
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job="${serviceName}"}[5m]))
      - record: job:http_request_duration_seconds:p90
        expr: histogram_quantile(0.90, rate(http_request_duration_seconds_bucket{job="${serviceName}"}[5m]))
      - record: job:http_request_duration_seconds:p50
        expr: histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job="${serviceName}"}[5m]))

  - name: ${serviceName}-alerts
    rules:
      - alert: ${serviceName}_HighErrorRate_FastBurn
        expr: job:http_error_ratio:rate5m > ${(14.4 * errorBudget).toFixed(6)}
        for: 2m
        labels:
          severity: critical
          service: ${serviceName}
        annotations:
          summary: "Fast error budget burn on ${serviceName}"

      - alert: ${serviceName}_HighErrorRate_SlowBurn
        expr: job:http_error_ratio:rate5m > ${errorBudget}
        for: 1h
        labels:
          severity: warning
          service: ${serviceName}

      - alert: ${serviceName}_HighLatencyP99
        expr: job:http_request_duration_seconds:p99 > ${latencyThreshold}
        for: 5m
        labels:
          severity: warning
          service: ${serviceName}

      - alert: ${serviceName}_ServiceDown
        expr: up{job="${serviceName}"} == 0
        for: 1m
        labels:
          severity: critical
          service: ${serviceName}`;

  const grafanaDashboard = JSON.stringify({
    dashboard: {
      title: `${serviceName} - SLO Dashboard`,
      time: { from: "now-6h", to: "now" },
      panels: [
        { title: "Request Rate (QPS)", type: "timeseries", targets: [{ expr: `job:http_requests_total:rate5m{job="${serviceName}"}` }] },
        { title: "Error Rate (%)", type: "timeseries", targets: [{ expr: `job:http_error_ratio:rate5m{job="${serviceName}"} * 100` }] },
        { title: "Latency Distribution", type: "timeseries", targets: [
          { expr: `job:http_request_duration_seconds:p50`, legendFormat: "P50" },
          { expr: `job:http_request_duration_seconds:p90`, legendFormat: "P90" },
          { expr: `job:http_request_duration_seconds:p99`, legendFormat: "P99" },
        ]},
        { title: "Error Budget Remaining", type: "gauge", targets: [{ expr: `1 - (sum(increase(http_requests_total{job="${serviceName}",status=~"5.."}[30d])) / sum(increase(http_requests_total{job="${serviceName}"}[30d]))) / ${errorBudget}` }] },
      ],
    },
  }, null, 2);

  const alertmanagerConfig = `route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  repeat_interval: 1h
  receiver: 'slack-default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      repeat_interval: 5m
    - match:
        severity: warning
      receiver: 'slack-warnings'
      repeat_interval: 4h

receivers:
  - name: 'slack-default'
    slack_configs:
      - channel: '#alerts-${serviceName}'
        send_resolved: true
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '<KEY>'
  - name: 'slack-warnings'
    slack_configs:
      - channel: '#alerts-warning'
        send_resolved: true`;

  return { prometheusRules, grafanaDashboard, alertmanagerConfig };
}

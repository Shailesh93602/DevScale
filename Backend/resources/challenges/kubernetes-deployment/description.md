# Kubernetes Deployment Configuration

Create production-ready Kubernetes manifests for deploying a containerized application. Your configuration must include a Deployment, Service, HorizontalPodAutoscaler, and Ingress.

## Problem

Given an application configuration, generate complete Kubernetes YAML manifests that follow best practices for production workloads.

---

## Requirements

### Deployment
- Rolling update strategy with `maxUnavailable: 0` and `maxSurge: 1`
- Resource requests AND limits for both CPU and memory
- Liveness probe (HTTP GET on health endpoint)
- Readiness probe (HTTP GET on ready endpoint)
- Pod anti-affinity to spread across nodes
- Security context: non-root, read-only filesystem

### Service
- ClusterIP type for internal communication
- Correct port mapping (port -> targetPort)
- Proper label selectors matching deployment

### HorizontalPodAutoscaler (HPA)
- Scale between `replicas` (min) and `replicas * 3` (max)
- Target CPU utilization: 70%
- Scale-down stabilization: 300 seconds

### Ingress
- Path-based routing to the service
- TLS configuration
- Rate limiting annotations

---

## Examples

**Example 1:**
```text
Input: {
  name: "api",
  image: "myregistry/api:v1.0.0",
  replicas: 3,
  port: 3000,
  resources: { cpu: "500m", memory: "512Mi" }
}

Output: (4 YAML documents separated by ---)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: api
  template:
    spec:
      containers:
        - name: api
          image: myregistry/api:v1.0.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
...
```

---

## Constraints

- All manifests must be valid Kubernetes YAML
- Resource requests should be 50% of limits
- Probes must have appropriate timeouts and periods
- Must use apps/v1 API version for Deployment
- Must use autoscaling/v2 for HPA
- Labels must be consistent across all resources

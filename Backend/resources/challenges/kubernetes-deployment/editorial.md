# Editorial -- Kubernetes Deployment Configuration

## Problem Summary

Generate production-ready Kubernetes manifests including Deployment, Service, HPA, and Ingress with proper resource management, health checks, scaling, and security.

---

## Approach -- Complete Manifest Generation

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
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
    metadata:
      labels:
        app: api
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
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
            initialDelaySeconds: 15
            periodSeconds: 20
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values: [api]
                topologyKey: kubernetes.io/hostname
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
```

### HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 9
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

---

## Key Concepts

- **Rolling Update**: `maxUnavailable: 0` ensures zero downtime during deploys
- **Resource Management**: Requests for scheduling, limits for protection. Requests = 50% of limits
- **Health Probes**: Liveness detects deadlocks (restarts pod), readiness controls traffic routing
- **Pod Anti-Affinity**: Spreads pods across nodes for high availability
- **HPA Stabilization**: Prevents thrashing during transient load spikes

---

## Common Mistakes

- Missing resource limits (leads to noisy neighbor problems)
- Same probe for liveness and readiness (can cause cascading restarts)
- `maxUnavailable: 1` instead of 0 (allows brief downtime)
- Not setting `initialDelaySeconds` (probe fails during startup)

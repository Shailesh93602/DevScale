// Kubernetes manifest generator
// Produces Deployment, Service, HPA, and Ingress YAML

function generateK8sManifests(config: {
  name: string;
  image: string;
  replicas: number;
  port: number;
  resources: { cpu: string; memory: string };
}): string {
  const { name, image, replicas, port, resources } = config;

  // Parse resource values to compute requests (50% of limits)
  const cpuVal = parseInt(resources.cpu);
  const memVal = parseInt(resources.memory);
  const cpuReq = `${Math.floor(cpuVal / 2)}m`;
  const memReq = `${Math.floor(memVal / 2)}Mi`;

  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  labels:
    app: ${name}
spec:
  replicas: ${replicas}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
      containers:
        - name: ${name}
          image: ${image}
          ports:
            - containerPort: ${port}
          resources:
            requests:
              cpu: "${cpuReq}"
              memory: "${memReq}"
            limits:
              cpu: "${resources.cpu}"
              memory: "${resources.memory}"
          livenessProbe:
            httpGet:
              path: /health
              port: ${port}
            initialDelaySeconds: 15
            periodSeconds: 20
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: ${port}
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
                      values: [${name}]
                topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: ${name}
spec:
  type: ClusterIP
  selector:
    app: ${name}
  ports:
    - port: 80
      targetPort: ${port}
      protocol: TCP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${name}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${name}
  minReplicas: ${replicas}
  maxReplicas: ${replicas * 3}
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
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name}
  annotations:
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
    - hosts:
        - ${name}.example.com
      secretName: ${name}-tls
  rules:
    - host: ${name}.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${name}
                port:
                  number: 80`;
}

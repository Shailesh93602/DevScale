# Editorial -- Implement Distributed Tracing

## Problem Summary

Build a distributed tracing library implementing span management, W3C context propagation, Express middleware, and trace analysis. This tests understanding of observability in microservice architectures.

---

## Approach -- OpenTelemetry-Style Tracer

### Core Data Structures

```typescript
interface SpanContext {
  traceId: string;  // 32 hex chars
  spanId: string;   // 16 hex chars
  traceFlags: number; // 01 = sampled
}

interface Span {
  context: SpanContext;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, string | number | boolean>;
  events: Array<{ name: string; timestamp: number; attributes?: Record<string, string> }>;
  status: "OK" | "ERROR" | "UNSET";
  setAttribute(key: string, value: string | number | boolean): void;
  addEvent(name: string, attributes?: Record<string, string>): void;
  end(): void;
}
```

### ID Generation

```typescript
function generateId(bytes: number): string {
  const hex = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < bytes * 2; i++) {
    result += hex[Math.floor(Math.random() * 16)];
  }
  return result;
}
```

### Context Propagation (W3C Trace Context)

```typescript
function injectContext(span: Span): Record<string, string> {
  const { traceId, spanId, traceFlags } = span.context;
  return {
    traceparent: `00-${traceId}-${spanId}-${traceFlags.toString(16).padStart(2, "0")}`,
  };
}

function extractContext(headers: Record<string, string>): SpanContext | undefined {
  const traceparent = headers["traceparent"];
  if (!traceparent) return undefined;
  const parts = traceparent.split("-");
  if (parts.length !== 4) return undefined;
  return {
    traceId: parts[1],
    spanId: parts[2],
    traceFlags: parseInt(parts[3], 16),
  };
}
```

### Trace Tree Reconstruction

```typescript
function buildTraceTree(spans: Span[]): TraceNode {
  const spanMap = new Map(spans.map(s => [s.context.spanId, s]));
  const root = spans.find(s => !s.parentSpanId)!;

  function buildNode(span: Span): TraceNode {
    const children = spans
      .filter(s => s.parentSpanId === span.context.spanId)
      .map(buildNode);
    return { span, children };
  }

  return buildNode(root);
}
```

---

## Key Concepts

- **Trace**: End-to-end request path, identified by traceId
- **Span**: Single operation within a trace, with parent-child relationships
- **Context Propagation**: Passing traceId/spanId via HTTP headers between services
- **Sampling**: Deciding which traces to record (probability, rate-limiting, etc.)
- **Critical Path**: The longest chain of sequential operations determining total latency

---

## Common Mistakes

- Not propagating context (orphaned spans with no parent)
- Using non-standard header format
- Not handling missing traceparent header (should start new trace)
- Forgetting to end spans (memory leaks and incorrect durations)
- Not recording span status on errors

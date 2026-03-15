# Implement Distributed Tracing

Build a distributed tracing system that tracks requests across microservices. Implement span creation, context propagation, and trace analysis following OpenTelemetry conventions.

## Problem

Implement a tracing library that can:

1. **Create Spans**: Start and end spans with names, attributes, and events
2. **Propagate Context**: Pass trace context between services via HTTP headers (W3C Trace Context format)
3. **Build Trace Trees**: Reconstruct the full request path from collected spans
4. **Analyze Traces**: Find bottlenecks and critical paths

---

## Requirements

### Span Management
- Generate unique trace IDs (128-bit) and span IDs (64-bit)
- Support parent-child relationships
- Record start time, end time, duration
- Support span attributes (key-value metadata)
- Support span events (timestamped log entries)
- Track span status (OK, ERROR)

### Context Propagation
- Implement W3C `traceparent` header format: `{version}-{traceId}-{spanId}-{flags}`
- Extract incoming context from request headers
- Inject context into outgoing request headers
- Support baggage propagation for cross-service data

### Express Middleware
- Automatically create a span for each incoming request
- Extract parent context from incoming headers
- Set span attributes: http.method, http.url, http.status_code
- End span when response finishes

### Trace Analysis
- Given a list of spans, reconstruct the trace tree
- Calculate critical path (longest chain of sequential spans)
- Identify bottleneck spans (highest self-time)

---

## Examples

**Example 1:**
```text
Input: Creating a span
const tracer = createTracer("api-gateway");
const span = tracer.startSpan("GET /users");
span.setAttribute("http.method", "GET");
span.end();

Output: Span object with traceId, spanId, name, startTime, endTime, attributes
```

**Example 2:**
```text
Input: Context propagation
const headers = { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" };
const context = tracer.extractContext(headers);
const childSpan = tracer.startSpan("db-query", context);

Output: Child span with same traceId, parent spanId = 00f067aa0ba902b7
```

---

## Constraints

- Trace IDs must be 32 hex characters (128-bit)
- Span IDs must be 16 hex characters (64-bit)
- traceparent header must follow format: `00-{traceId}-{spanId}-{flags}`
- Spans must record timestamps in milliseconds
- Must implement at least probability-based sampling

// Distributed tracing implementation
// Follows OpenTelemetry conventions with W3C Trace Context propagation

interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
}

interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string>;
}

interface Span {
  context: SpanContext;
  parentSpanId?: string;
  name: string;
  serviceName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
  status: "OK" | "ERROR" | "UNSET";
  setAttribute(key: string, value: string | number | boolean): void;
  addEvent(name: string, attributes?: Record<string, string>): void;
  setStatus(status: "OK" | "ERROR", message?: string): void;
  end(): void;
}

interface TraceNode {
  span: Span;
  children: TraceNode[];
}

function generateHexId(bytes: number): string {
  const hex = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < bytes * 2; i++) {
    result += hex[Math.floor(Math.random() * 16)];
  }
  return result;
}

function createTracer(serviceName: string, sampleRate: number = 1.0) {
  const spans: Span[] = [];

  function startSpan(name: string, parentContext?: SpanContext): Span {
    const sampled = Math.random() < sampleRate;
    const context: SpanContext = {
      traceId: parentContext?.traceId || generateHexId(16),
      spanId: generateHexId(8),
      traceFlags: sampled ? 1 : 0,
    };

    const span: Span = {
      context,
      parentSpanId: parentContext?.spanId,
      name,
      serviceName,
      startTime: Date.now(),
      attributes: {},
      events: [],
      status: "UNSET",
      setAttribute(key, value) { this.attributes[key] = value; },
      addEvent(evtName, attrs) { this.events.push({ name: evtName, timestamp: Date.now(), attributes: attrs }); },
      setStatus(status, message) { this.status = status; if (message) this.attributes["error.message"] = message; },
      end() {
        this.endTime = Date.now();
        this.duration = this.endTime - this.startTime;
        spans.push(this);
      },
    };

    return span;
  }

  function extractContext(headers: Record<string, string>): SpanContext | undefined {
    const traceparent = headers["traceparent"];
    if (!traceparent) return undefined;
    const parts = traceparent.split("-");
    if (parts.length !== 4) return undefined;
    return { traceId: parts[1], spanId: parts[2], traceFlags: parseInt(parts[3], 16) };
  }

  function injectContext(span: Span): Record<string, string> {
    const { traceId, spanId, traceFlags } = span.context;
    return { traceparent: `00-${traceId}-${spanId}-${traceFlags.toString(16).padStart(2, "0")}` };
  }

  function middleware() {
    return (req: any, res: any, next: any) => {
      const parentContext = extractContext(req.headers);
      const span = startSpan(`${req.method} ${req.path}`, parentContext);
      span.setAttribute("http.method", req.method);
      span.setAttribute("http.url", req.url);
      span.setAttribute("service.name", serviceName);

      res.on("finish", () => {
        span.setAttribute("http.status_code", res.statusCode);
        span.setStatus(res.statusCode < 400 ? "OK" : "ERROR");
        span.end();
      });

      // Inject context for downstream calls
      req.traceContext = span.context;
      req.injectHeaders = () => injectContext(span);
      next();
    };
  }

  function buildTraceTree(traceSpans: Span[]): TraceNode | null {
    if (traceSpans.length === 0) return null;
    const root = traceSpans.find(s => !s.parentSpanId);
    if (!root) return null;

    function buildNode(span: Span): TraceNode {
      const children = traceSpans
        .filter(s => s.parentSpanId === span.context.spanId)
        .sort((a, b) => a.startTime - b.startTime)
        .map(buildNode);
      return { span, children };
    }
    return buildNode(root);
  }

  function findCriticalPath(node: TraceNode): Span[] {
    if (node.children.length === 0) return [node.span];
    const paths = node.children.map(child => findCriticalPath(child));
    const longestChild = paths.reduce((a, b) => {
      const aDur = a.reduce((s, sp) => s + (sp.duration || 0), 0);
      const bDur = b.reduce((s, sp) => s + (sp.duration || 0), 0);
      return aDur > bDur ? a : b;
    });
    return [node.span, ...longestChild];
  }

  return { startSpan, extractContext, injectContext, middleware, buildTraceTree, findCriticalPath, getSpans: () => spans };
}

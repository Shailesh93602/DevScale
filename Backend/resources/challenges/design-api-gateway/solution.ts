type Request = { path: string; headers: any; method: string };
type Response = { status: number; body: any };

class ApiGateway {
  private routes: Map<string, string> = new Map();
  private rateLimiter: Map<string, number[]> = new Map();

  addRoute(pathPattern: string, serviceUrl: string) {
    this.routes.set(pathPattern, serviceUrl);
  }

  async handleRequest(req: Request): Promise<Response> {
    // 1. Authentication
    try {
      this.authenticate(req.headers);
    } catch (e) {
      return { status: 401, body: "Unauthorized" };
    }

    // 2. Rate Limiting
    const clientId = req.headers['x-client-id'] || 'default';
    if (!this.checkRateLimit(clientId)) {
      return { status: 429, body: "Too Many Requests" };
    }

    // 3. Routing
    const serviceUrl = this.getServiceUrl(req.path);
    if (!serviceUrl) {
      return { status: 404, body: "Service Not Found" };
    }

    // 4. Forwarding (Conceptual)
    console.log(`Forwarding ${req.method} ${req.path} to ${serviceUrl}`);
    return { status: 200, body: "Success" };
  }

  private authenticate(headers: any) {
    if (!headers.authorization) throw new Error("No token");
    // Token validation logic here
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const windowMs = 60000;
    const limit = 100;
    
    let calls = this.rateLimiter.get(clientId) || [];
    calls = calls.filter(t => now - t < windowMs);
    
    if (calls.length >= limit) return false;
    
    calls.push(now);
    this.rateLimiter.set(clientId, calls);
    return true;
  }

  private getServiceUrl(path: string): string | null {
    for (const [pattern, url] of this.routes.entries()) {
      if (path.startsWith(pattern)) return url;
    }
    return null;
  }
}

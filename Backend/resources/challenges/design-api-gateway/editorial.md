# Editorial — Design an API Gateway

### Architectural Components
1. **Entry Point (Listener)**: Handles SSL termination and accepts incoming connections.
2. **Middleware Pipeline**:
   - **Authenticator**: Validates JWT/OAuth tokens.
   - **Rate Limiter**: Tracks request counts per user/IP (often using Redis).
   - **Whitelist/Blacklist**: Basic security filters.
3. **Router**: Matches the URL path to a target service ID.
4. **Service Discovery Integration**: Resolves the service ID to a physical IP/Port.
5. **Load Balancer**: If multiple instances of a service exist, picks one (Round Robin, Least Connections).
6. **Reverse Proxy/Forwarder**: Sends the request and streams the response back.

### Key Optimization Decisions
- **Non-blocking I/O**: Essential for handling 100k+ concurrent connections without spawning 100k threads.
- **Protocol Translation**: The Gateway can expose REST/GraphQL to clients while communicating via gRPC internally for better performance.
- **Circuit Breaker**: Prevent the Gateway from hanging if a backend service is down.

### Performance & Scaling
- **Horizontal Scaling**: Since the Gateway is stateless, we can deploy many instances behind a Layer-4 Load Balancer (like AWS NLB).
- **Caching**: Cache the Service Discovery results to avoid heart-beat lookups on every request.

**Complexity**
- Time: $O(1)$ for routing lookup (using Hash Maps or Prefix Trees).
- Space: $O(S)$ where $S$ is the number of services/routes.

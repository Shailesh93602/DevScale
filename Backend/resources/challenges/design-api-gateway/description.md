# Design an API Gateway

Design a high-performance API Gateway that acts as a single entry point for a microservices architecture. The gateway should handle core cross-cutting concerns such as authentication, rate limiting, request routing, and protocol translation.

## Requirements

### Functional Requirements
1. **Request Routing**: Route incoming HTTP requests to the appropriate backend microservice based on URL patterns.
2. **Authentication/Authorization**: Validate tokens (JWT/OAuth) before forwarding requests.
3. **Rate Limiting**: Prevent abuse by limiting the number of requests per user or IP address.
4. **Service Discovery Integration**: Dynamically discover backend service endpoints.
5. **Protocol Translation**: Support translating between external protocols (REST/GraphQL) and internal ones (gRPC).

### Non-Functional Requirements
1. **Ultra-Low Latency**: Adding the gateway should not increase request latency by more than a few milliseconds.
2. **High Availability**: The gateway is a critical point of failure; it must be highly redundant.
3. **Observability**: Log every request and provide metrics for monitoring service health.

## Examples

**Example Scenario**:
- **Input**: `GET /orders/123` with `Authorization: Bearer <token>`
- **Processing**:
    1. Authenticate the Bearer token.
    2. Check if the user/IP has exceeded the rate limit.
    3. Look up the `order-service` endpoint via Service Discovery.
    4. Forward the request.
- **Result**: Request successfully routed to `order-service:8080/orders/123`.

## Constraints
- Support 100k+ concurrent connections.
- Minimal memory footprint for caching routing tables.
- Seamlessly scale horizontally.
- SSL Termination and logging overhead must be minimal.

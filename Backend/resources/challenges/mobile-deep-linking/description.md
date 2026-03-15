# Mobile Deep Linking Setup

## Problem Description

Implement a **deep link parser** for a mobile application. Given a URL and a set of route configurations, parse the URL to determine which screen to navigate to and extract path parameters and query parameters.

## Requirements

1. Parse the deep link URL scheme (e.g., `myapp://path/to/screen`)
2. Match against route patterns with path parameters (`:param`)
3. Extract path parameters and query parameters
4. Return null if no route matches

## Function Signature

```typescript
interface Route {
  pattern: string;  // e.g., "products/:id"
  screen: string;   // e.g., "ProductDetail"
}

function parseDeepLink(
  url: string,
  routes: Route[]
): { screen: string; params: Record<string, string>; query: Record<string, string> } | null
```

## Example

```
Input:
  url = "myapp://products/123?ref=home"
  routes = [{ pattern: "products/:id", screen: "ProductDetail" }]

Output:
  { screen: "ProductDetail", params: { id: "123" }, query: { ref: "home" } }
```

## Constraints

- URLs follow format: `scheme://path?query`
- Route patterns use `:paramName` for dynamic segments
- Query parameters are optional
- Return first matching route

# Editorial — Mobile Deep Linking Setup

## Approach: Pattern Matching with URL Parsing

### Algorithm
1. Parse the URL to extract scheme, path, and query string
2. Split path into segments
3. For each route pattern, split into segments and try to match
4. Dynamic segments (`:param`) match any value and capture it
5. Parse query string into key-value pairs

### TypeScript Solution

```typescript
interface Route {
  pattern: string;
  screen: string;
}

function parseDeepLink(
  url: string,
  routes: Route[]
): { screen: string; params: Record<string, string>; query: Record<string, string> } | null {
  // Parse URL
  const schemeEnd = url.indexOf("://");
  if (schemeEnd === -1) return null;
  const rest = url.substring(schemeEnd + 3);

  const [pathPart, queryPart] = rest.split("?");
  const pathSegments = pathPart.split("/").filter(Boolean);

  // Parse query params
  const query: Record<string, string> = {};
  if (queryPart) {
    queryPart.split("&").forEach(pair => {
      const [key, val] = pair.split("=");
      query[decodeURIComponent(key)] = decodeURIComponent(val || "");
    });
  }

  // Match routes
  for (const route of routes) {
    const routeSegments = route.pattern.split("/").filter(Boolean);
    if (routeSegments.length !== pathSegments.length) continue;

    const params: Record<string, string> = {};
    let match = true;

    for (let i = 0; i < routeSegments.length; i++) {
      if (routeSegments[i].startsWith(":")) {
        params[routeSegments[i].substring(1)] = pathSegments[i];
      } else if (routeSegments[i] !== pathSegments[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return { screen: route.screen, params, query };
    }
  }

  return null;
}
```

### Complexity
- **Time**: O(r * s) where r = routes, s = max segments
- **Space**: O(p + q) for params and query

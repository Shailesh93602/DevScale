interface Route {
  pattern: string;
  screen: string;
}

function parseDeepLink(
  url: string,
  routes: Route[]
): {
  screen: string;
  params: Record<string, string>;
  query: Record<string, string>;
} | null {
  const schemeEnd = url.indexOf("://");
  if (schemeEnd === -1) return null;
  const rest = url.substring(schemeEnd + 3);

  const [pathPart, queryPart] = rest.split("?");
  const pathSegments = pathPart.split("/").filter(Boolean);

  const query: Record<string, string> = {};
  if (queryPart) {
    queryPart.split("&").forEach((pair) => {
      const [key, val] = pair.split("=");
      query[decodeURIComponent(key)] = decodeURIComponent(val || "");
    });
  }

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

export { parseDeepLink, Route };

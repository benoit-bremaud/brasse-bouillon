export type RouteParamValue = string | string[] | undefined;

export function normalizeRouteParam(
  routeParam: RouteParamValue,
): string | undefined {
  if (Array.isArray(routeParam)) {
    return routeParam[0];
  }

  return routeParam;
}

import { authSession } from "@/core/auth/session";
import { env } from "@/core/config/env";

import { HttpError, HttpTimeoutError } from "./http-error";

/**
 * Per-request ceiling. `fetch` has no built-in timeout, so without one a hung
 * connection leaves the caller awaiting forever — the UI sits on a spinner with
 * no way out. Sized well above the API's cold start: the Fly.io machine scales
 * to zero and takes ~9-10s to answer the first request, so a tighter budget
 * would abort legitimate wake-ups.
 *
 * Implemented with a plain `AbortController` + `setTimeout` rather than
 * `AbortSignal.timeout()`: React Native polyfills `AbortController` from the
 * `abort-controller` package (see `setUpXHR.js`), which ships neither the
 * `timeout` nor the `any` static — both are `undefined` under Hermes.
 */
const DEFAULT_TIMEOUT_MS = 20_000;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  /**
   * Override the default base URL (`env.apiUrl`, NestJS product backend).
   * Pass `env.encyclopediaUrl` to target the Python beer-encyclopedia
   * knowledge base instead. See ADR-0005 for the split.
   */
  baseUrl?: string;
  /**
   * Forwarded to `fetch` so the caller (e.g. a TanStack `queryFn`) can
   * abort the network request when the query is superseded. Without it,
   * a queryKey change only discards the stale result client-side.
   */
  signal?: AbortSignal;
  /**
   * Override the default timeout for this call. Use a longer budget for
   * known-slow endpoints rather than removing the ceiling.
   */
  timeoutMs?: number;
};

async function parseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T>(
  path: string,
  {
    method = "GET",
    body,
    auth = true,
    headers = {},
    baseUrl,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: RequestOptions = {},
): Promise<T> {
  const resolvedBase = baseUrl ?? env.apiUrl;
  const url = `${resolvedBase}${path.startsWith("/") ? path : `/${path}`}`;

  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Captured outside the block so the 401 path below can tell whether the
  // token that produced the 401 is still the current one.
  let attachedToken: string | null = null;
  if (auth) {
    attachedToken = authSession.getAccessToken();
    if (attachedToken) {
      mergedHeaders.Authorization = `Bearer ${attachedToken}`;
    }
  }

  // Own controller so the timeout can abort the request. The caller's signal
  // is chained onto it rather than passed straight to `fetch`, because `fetch`
  // accepts a single signal and both sources must be able to cancel.
  // `AbortSignal.any()` would express this natively but is undefined in Hermes.
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const abortFromCaller = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abortFromCaller);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    // An abort surfaces as a generic `AbortError` whichever side triggered it;
    // the flag is what separates "we gave up waiting" from "the caller
    // cancelled", and only the former is a failure worth reporting.
    if (timedOut) {
      throw new HttpTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortFromCaller);
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    // A 401 on an *authenticated* request means the token expired or was
    // invalidated mid-session — notify so the session can be purged. Gated
    // on `auth` so a 401 from an unauthenticated call (e.g. login with bad
    // credentials, which passes `auth: false`) is treated as a normal
    // failure and never triggers a logout/redirect. Also require the token
    // that produced this 401 to still be the current one: a stale in-flight
    // request from before a logout/re-login must not purge the fresh session.
    if (
      response.status === 401 &&
      auth &&
      attachedToken &&
      attachedToken === authSession.getAccessToken()
    ) {
      authSession.notifyUnauthorized();
    }

    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : response.statusText;
    throw new HttpError(response.status, message, payload);
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

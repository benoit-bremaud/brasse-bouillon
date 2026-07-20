export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Raised by `request()` when a call exceeds its timeout budget.
 *
 * Deliberately not an `HttpError`: no response was ever received, so there is
 * no status to report and fabricating one (408) would let callers branch on a
 * status the server never sent.
 */
export class HttpTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(
      "Le serveur met trop de temps à répondre. Vérifie ta connexion et réessaie.",
    );
    this.name = "HttpTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export function getErrorMessage(
  error: unknown,
  fallback = "Une erreur est survenue",
): string {
  if (error instanceof HttpError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

/**
 * Named catalogue errors, per the conception error-variants sequence
 * (`docs/architecture/diagrams/mobile-catalog/05-sequence-errors.md`):
 * 404 → CatalogNotFoundError; 503 / timeout / network → CatalogUnavailableError.
 * The catalogue is encyclopedia-only — no NestJS fallback (unlike scan UC4).
 */
import { HttpError } from "@/core/http/http-error";

export class CatalogNotFoundError extends Error {
  constructor(message = "Catalog entity not found") {
    super(message);
    this.name = "CatalogNotFoundError";
  }
}

export class CatalogUnavailableError extends Error {
  constructor(message = "Beer encyclopedia unavailable") {
    super(message);
    this.name = "CatalogUnavailableError";
  }
}

/**
 * Maps a transport-level failure to the named catalogue errors. Abort
 * rejections are re-thrown untouched so TanStack can recognise its own
 * cancellation instead of surfacing a misleading "unavailable" state.
 */
export function rethrowCatalogError(error: unknown): never {
  if (error instanceof Error && error.name === "AbortError") {
    throw error;
  }
  if (error instanceof HttpError) {
    if (error.status === 404) {
      throw new CatalogNotFoundError(error.message);
    }
    throw new CatalogUnavailableError(error.message);
  }
  throw new CatalogUnavailableError(
    error instanceof Error ? error.message : "Network failure",
  );
}

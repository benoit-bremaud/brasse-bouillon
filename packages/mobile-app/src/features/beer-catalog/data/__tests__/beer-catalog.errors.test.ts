/**
 * Direct unit tests of the `rethrowCatalogError` mapping table
 * (`05-sequence-errors.md`): abort pass-through, 404 → NotFound,
 * other HttpError → Unavailable, non-HttpError → Unavailable.
 */
import { HttpError } from "@/core/http/http-error";

import {
  CatalogNotFoundError,
  CatalogUnavailableError,
  rethrowCatalogError,
} from "@/features/beer-catalog/data/beer-catalog.errors";

function capture(error: unknown): unknown {
  try {
    rethrowCatalogError(error);
  } catch (thrown) {
    return thrown;
  }
  // `never` return type — rethrowCatalogError must always throw.
  throw new Error("rethrowCatalogError did not throw");
}

describe("beer-catalog.errors / rethrowCatalogError", () => {
  it("branch 1 — rethrows an AbortError as the same instance, untouched", () => {
    const abortError = new Error("Aborted");
    abortError.name = "AbortError";

    const thrown = capture(abortError);

    expect(thrown).toBe(abortError);
    expect((thrown as Error).name).toBe("AbortError");
  });

  it("branch 2 — HttpError 404 → CatalogNotFoundError carrying the original message", () => {
    const thrown = capture(new HttpError(404, "Beer not found"));

    expect(thrown).toBeInstanceOf(CatalogNotFoundError);
    expect((thrown as CatalogNotFoundError).name).toBe("CatalogNotFoundError");
    expect((thrown as CatalogNotFoundError).message).toBe("Beer not found");
  });

  it("branch 3 — any other HttpError status → CatalogUnavailableError", () => {
    for (const status of [500, 503, 422]) {
      const thrown = capture(new HttpError(status, `HTTP ${status}`));

      expect(thrown).toBeInstanceOf(CatalogUnavailableError);
      expect((thrown as CatalogUnavailableError).message).toBe(
        `HTTP ${status}`,
      );
    }
  });

  it("branch 4 — non-HttpError Error → CatalogUnavailableError carrying its message", () => {
    const thrown = capture(new TypeError("Network request failed"));

    expect(thrown).toBeInstanceOf(CatalogUnavailableError);
    expect((thrown as CatalogUnavailableError).name).toBe(
      "CatalogUnavailableError",
    );
    expect((thrown as CatalogUnavailableError).message).toBe(
      "Network request failed",
    );
  });

  it("branch 4 (edge) — a non-Error throw value falls back to the generic message", () => {
    const thrown = capture("boom");

    expect(thrown).toBeInstanceOf(CatalogUnavailableError);
    expect((thrown as CatalogUnavailableError).message).toBe("Network failure");
  });

  it("error classes expose default messages and stable names", () => {
    expect(new CatalogNotFoundError().message).toBe("Catalog entity not found");
    expect(new CatalogNotFoundError().name).toBe("CatalogNotFoundError");
    expect(new CatalogUnavailableError().message).toBe(
      "Beer encyclopedia unavailable",
    );
    expect(new CatalogUnavailableError().name).toBe("CatalogUnavailableError");
  });
});

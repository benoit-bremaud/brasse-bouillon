import { authSession } from "@/core/auth/session";
import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";

jest.mock("@/core/auth/session", () => ({
  authSession: {
    getAccessToken: jest.fn(),
    notifyUnauthorized: jest.fn(),
  },
}));

jest.mock("@/core/config/env", () => ({
  env: {
    apiUrl: "http://default-api.test:3000",
    encyclopediaUrl: "http://default-encyclopedia.test:8000",
    encyclopediaUrlIsConfigured: true,
    useDemoData: false,
  },
}));

const mockGetAccessToken = authSession.getAccessToken as jest.MockedFunction<
  typeof authSession.getAccessToken
>;

const mockNotifyUnauthorized =
  authSession.notifyUnauthorized as jest.MockedFunction<
    typeof authSession.notifyUnauthorized
  >;

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

function buildResponse(
  body: unknown,
  init: { status?: number } = {},
): Response {
  const status = init.status ?? 200;
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

describe("http-client / request", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockGetAccessToken.mockReset();
    mockNotifyUnauthorized.mockReset();
  });

  describe("URL construction", () => {
    it("targets env.apiUrl by default", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("/foo");

      expect(fetchMock).toHaveBeenCalledWith(
        "http://default-api.test:3000/foo",
        expect.any(Object),
      );
    });

    it("uses the baseUrl override (PR #871 — encyclopedia fallback)", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("/beers/import-by-ean", {
        method: "POST",
        body: { ean: "3760231860119" },
        baseUrl: "http://encyclopedia.test:8000",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "http://encyclopedia.test:8000/beers/import-by-ean",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("normalises a path that does not start with a slash", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("foo/bar");

      expect(fetchMock).toHaveBeenCalledWith(
        "http://default-api.test:3000/foo/bar",
        expect.any(Object),
      );
    });
  });

  describe("auth", () => {
    it("attaches the bearer token by default when one exists", async () => {
      mockGetAccessToken.mockReturnValueOnce("the-jwt");
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("/me");

      const headers = (fetchMock.mock.calls[0][1] as RequestInit)
        .headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer the-jwt");
    });

    it("omits the Authorization header when auth=false (PR #871 Python backend)", async () => {
      mockGetAccessToken.mockReturnValueOnce("the-jwt");
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("/beers/import-by-ean", { auth: false });

      const headers = (fetchMock.mock.calls[0][1] as RequestInit)
        .headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });

    it("does not set Authorization when no token is available", async () => {
      mockGetAccessToken.mockReturnValueOnce(null);
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("/me");

      const headers = (fetchMock.mock.calls[0][1] as RequestInit)
        .headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe("body + Content-Type", () => {
    it("serialises the body as JSON when provided", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("/foo", { method: "POST", body: { hello: "world" } });

      const opts = fetchMock.mock.calls[0][1] as RequestInit;
      expect(opts.body).toBe(JSON.stringify({ hello: "world" }));
      const headers = opts.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("omits body when none is provided", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse({ ok: true }));

      await request("/foo");

      const opts = fetchMock.mock.calls[0][1] as RequestInit;
      expect(opts.body).toBeUndefined();
    });
  });

  describe("response parsing", () => {
    it("auto-unwraps the `data` envelope used by the NestJS API", async () => {
      fetchMock.mockResolvedValueOnce(
        buildResponse({ data: { id: "u-1", email: "a@b.c" } }),
      );

      const result = await request<{ id: string; email: string }>("/me");

      expect(result).toEqual({ id: "u-1", email: "a@b.c" });
    });

    it("returns raw payload when the response has no `data` field", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse({ id: "raw" }));

      const result = await request<{ id: string }>("/foo");

      expect(result).toEqual({ id: "raw" });
    });

    it("returns null on HTTP 204 (no content)", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse("", { status: 204 }));

      const result = await request("/foo", { method: "DELETE" });

      expect(result).toBeNull();
    });

    it("returns null when the body is empty", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse(""));

      const result = await request("/foo");

      expect(result).toBeNull();
    });

    it("returns the raw text when the body is not valid JSON", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse("plain text"));

      const result = await request("/foo");

      expect(result).toBe("plain text");
    });
  });

  describe("error mapping", () => {
    it("throws HttpError carrying the status, message and payload on a 4xx", async () => {
      fetchMock.mockResolvedValueOnce(
        buildResponse(
          { message: "Beer not found", errorCode: "BEER_NOT_FOUND" },
          { status: 404 },
        ),
      );

      const rejected = await request("/scan/lookup/123").catch(
        (e: unknown) => e,
      );

      expect(rejected).toBeInstanceOf(HttpError);
      expect((rejected as HttpError).status).toBe(404);
      expect((rejected as HttpError).message).toBe("Beer not found");
      expect((rejected as HttpError).details).toEqual({
        message: "Beer not found",
        errorCode: "BEER_NOT_FOUND",
      });
    });

    it("falls back to statusText when the body has no message", async () => {
      fetchMock.mockResolvedValueOnce(buildResponse("", { status: 500 }));

      const rejected = await request("/foo").catch((e: unknown) => e);

      expect(rejected).toBeInstanceOf(HttpError);
      expect((rejected as HttpError).status).toBe(500);
    });
  });

  describe("401 / session expiry (#1130)", () => {
    it("happy: notifies unauthorized on a 401 from an authenticated request", async () => {
      fetchMock.mockResolvedValueOnce(
        buildResponse({ message: "Unauthorized" }, { status: 401 }),
      );

      await request("/auth/me").catch(() => undefined);

      expect(mockNotifyUnauthorized).toHaveBeenCalledTimes(1);
    });

    it("sad: does NOT notify on a 401 from an unauthenticated request (login with bad credentials)", async () => {
      fetchMock.mockResolvedValueOnce(
        buildResponse({ message: "Invalid credentials" }, { status: 401 }),
      );

      await request("/auth/login", {
        method: "POST",
        body: { email: "a@b.c", password: "wrong" },
        auth: false,
      }).catch(() => undefined);

      expect(mockNotifyUnauthorized).not.toHaveBeenCalled();
    });

    it("edge: does NOT notify on a non-401 error from an authenticated request", async () => {
      fetchMock.mockResolvedValueOnce(
        buildResponse({ message: "Forbidden" }, { status: 403 }),
      );

      await request("/recipes").catch(() => undefined);

      expect(mockNotifyUnauthorized).not.toHaveBeenCalled();
    });
  });
});

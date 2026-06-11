/**
 * AbortSignal forwarding through `request()` (beer-catalog foundation):
 * the `signal` option must reach `fetch` untouched so TanStack Query can
 * cancel superseded requests. Kept separate from `http-client.test.ts`
 * (pre-existing suite) — this file only covers the new `signal` option.
 */
import { authSession } from "@/core/auth/session";
import { request } from "@/core/http/http-client";

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

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

function buildOkResponse(): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve('{"x":1}'),
  } as unknown as Response;
}

describe("http-client / request — AbortSignal forwarding", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockGetAccessToken.mockReset();
    mockGetAccessToken.mockReturnValue(null);
  });

  it("happy: forwards the exact AbortSignal instance to fetch", async () => {
    fetchMock.mockResolvedValueOnce(buildOkResponse());
    const controller = new AbortController();

    await request("/p", { signal: controller.signal });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBe(controller.signal);
  });

  it("sad: leaves fetch init.signal undefined when no signal is given", async () => {
    fetchMock.mockResolvedValueOnce(buildOkResponse());

    await request("/p");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBeUndefined();
  });

  it("edge: signal option does not disturb pre-existing behavior — auth:false still adds no Authorization header", async () => {
    mockGetAccessToken.mockReturnValue("the-jwt");
    fetchMock.mockResolvedValueOnce(buildOkResponse());
    const controller = new AbortController();

    const result = await request<{ x: number }>("/beers", {
      auth: false,
      signal: controller.signal,
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(init.signal).toBe(controller.signal);
    // Payload parsing untouched by the new option.
    expect(result).toEqual({ x: 1 });
  });
});

import { describe, expect, it } from "vitest";
import {
  assertHar,
  har,
  HarValidationError,
  isHar,
  validateHar,
  validateRequest,
  validateResponse
} from "../src/index.js";

const request = {
  method: "GET",
  url: "https://example.com/",
  httpVersion: "HTTP/1.1",
  cookies: [],
  headers: [{ name: "accept", value: "*/*" }],
  queryString: [],
  headersSize: -1,
  bodySize: 0
};

const response = {
  status: 200,
  statusText: "OK",
  httpVersion: "HTTP/1.1",
  cookies: [],
  headers: [{ name: "content-type", value: "text/html" }],
  content: { size: 12, mimeType: "text/html" },
  redirectURL: "",
  headersSize: -1,
  bodySize: 12
};

const sampleHar = {
  log: {
    version: "1.2",
    creator: { name: "test", version: "1.0.0" },
    entries: [
      {
        startedDateTime: "2026-05-19T23:00:00.000Z",
        time: 10,
        request,
        response,
        timings: { send: 1, wait: 8, receive: 1 }
      }
    ]
  }
};

describe("validateHar", () => {
  it("validates a HAR object", () => {
    const result = validateHar(sampleHar);

    expect(result.valid).toBe(true);
    expect(result.value).toBe(sampleHar);
    expect(isHar(sampleHar)).toBe(true);
    expect(() => assertHar(sampleHar)).not.toThrow();
  });

  it("returns structured issues", () => {
    const result = validateHar({
      log: {
        version: "1.2",
        creator: { name: "test", version: "1.0.0" },
        entries: [{ ...sampleHar.log.entries[0], time: -1, request: { ...request, url: "/x" } }]
      }
    });

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "$.log.entries[0].time", code: "range" }),
        expect.objectContaining({ path: "$.log.entries[0].request.url", code: "format" })
      ])
    );
  });

  it("rejects promise wrappers with HarValidationError", async () => {
    await expect(har({})).rejects.toBeInstanceOf(HarValidationError);
  });
});

describe("fragment validators", () => {
  it("validates request and response fragments", () => {
    expect(validateRequest(request).valid).toBe(true);
    expect(validateResponse(response).valid).toBe(true);
  });

  it("catches invalid response status and timings", () => {
    const result = validateResponse({ ...response, status: 1200 });

    expect(result.valid).toBe(false);
    expect(result.issues[0]).toMatchObject({ path: "$.status", code: "range" });
  });
});


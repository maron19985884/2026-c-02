import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchJson } from "../src/app/lib/apiClient";

describe("fetchJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed JSON body on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ hello: "world" }),
      })
    );

    const result = await fetchJson<{ hello: string }>("/api/books");

    expect(result).toEqual({ hello: "world" });
  });

  it("returns null on a 404 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 404,
        ok: false,
        json: async () => ({ error: "book_not_found" }),
      })
    );

    const result = await fetchJson("/api/books/999");

    expect(result).toBeNull();
  });

  it("throws for a non-404 error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 500,
        ok: false,
        json: async () => ({ error: "internal_server_error" }),
      })
    );

    await expect(fetchJson("/api/books")).rejects.toThrow();
  });

  it("propagates network exceptions from fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchJson("/api/books")).rejects.toThrow("network down");
  });
});

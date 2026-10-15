import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./api";

describe("apiFetch authentication errors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preserves the HTTP status for an expired Sanctum session", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthenticated." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/user")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Unauthenticated.",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/user"),
      expect.objectContaining({ credentials: "include" }),
    );
  });
});

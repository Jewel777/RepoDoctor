import { afterEach, describe, expect, it, vi } from "vitest";

import { analyzeRepo } from "../lib/github/analyzeRepo";

describe("analyzeRepo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws a clear error when the repository cannot be resolved", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      analyzeRepo("missing-owner", "missing-repository")
    ).rejects.toThrow(
      "Repository not found or the GitHub API request could not be completed."
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

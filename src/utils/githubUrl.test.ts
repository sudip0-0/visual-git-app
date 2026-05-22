import { describe, expect, it } from "vitest";
import { canSubmitGithubUrl, normalizeGithubUrlInput } from "./githubUrl";

describe("github URL form helpers", () => {
  it("trims URL input before submit", () => {
    expect(normalizeGithubUrlInput(" https://github.com/openai/codex ")).toBe(
      "https://github.com/openai/codex",
    );
  });

  it("requires a non-empty URL", () => {
    expect(canSubmitGithubUrl("   ", false)).toBe(false);
  });

  it("disables duplicate submissions while loading", () => {
    expect(canSubmitGithubUrl("https://github.com/openai/codex", true)).toBe(
      false,
    );
  });
});

import { describe, expect, it } from "vitest";
import type { GraphCommitNode } from "../types/graph";
import { searchCommits } from "./graphSearch";

describe("searchCommits", () => {
  const commits = [
    commit({
      id: "abc123456789",
      shortId: "abc1234",
      message: "Add graph rendering\n\nDetailed body",
      summary: "Add graph rendering",
      authorName: "Ada Lovelace",
    }),
    commit({
      id: "def987654321",
      shortId: "def9876",
      message: "Fix sidebar",
      summary: "Fix sidebar",
      authorName: "Grace Hopper",
    }),
  ];

  it("matches full hash", () => {
    expect(searchCommits(commits, "abc123456789")).toEqual([commits[0]]);
  });

  it("matches short hash", () => {
    expect(searchCommits(commits, "def9876")).toEqual([commits[1]]);
  });

  it("matches commit message", () => {
    expect(searchCommits(commits, "detailed body")).toEqual([commits[0]]);
  });

  it("matches author name", () => {
    expect(searchCommits(commits, "hopper")).toEqual([commits[1]]);
  });

  it("returns no results for blank query", () => {
    expect(searchCommits(commits, "   ")).toEqual([]);
  });
});

function commit(
  overrides: Pick<
    GraphCommitNode,
    "id" | "shortId" | "message" | "summary" | "authorName"
  >,
): GraphCommitNode {
  return {
    ...overrides,
    authorTime: 1,
    branchNames: [],
    isHead: false,
    isMerge: false,
    lane: 0,
    parents: [],
    tagNames: [],
    x: 0,
    y: 0,
  };
}

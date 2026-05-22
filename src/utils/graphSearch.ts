import type { GraphCommitNode } from "../types/graph";

export function searchCommits(
  commits: GraphCommitNode[],
  query: string,
): GraphCommitNode[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return commits.filter((commit) =>
    [
      commit.id,
      commit.shortId,
      commit.message,
      commit.summary,
      commit.authorName ?? "",
    ].some((value) => normalize(value).includes(normalizedQuery)),
  );
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

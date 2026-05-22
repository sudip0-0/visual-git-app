import { memo, useMemo } from "react";
import type { CommitGraphResponse } from "../../types/graph";
import { CommitEdge } from "./CommitEdge";
import { CommitNode } from "./CommitNode";

type CommitGraphProps = {
  graph: CommitGraphResponse;
  selectedCommitId: string | null;
  matchingCommitIds: Set<string>;
  visibleCommitIds: Set<string>;
  onSelectCommit: (commitId: string) => void;
};

export const CommitGraph = memo(function CommitGraph({
  graph,
  selectedCommitId,
  matchingCommitIds,
  visibleCommitIds,
  onSelectCommit,
}: CommitGraphProps) {
  const nodesById = useMemo(
    () => new Map(graph.commits.map((commit) => [commit.id, commit])),
    [graph.commits],
  );
  const width = useMemo(
    () => Math.max(720, ...graph.commits.map((commit) => commit.x + 420)),
    [graph.commits],
  );
  const height = useMemo(
    () => Math.max(480, ...graph.commits.map((commit) => commit.y + 64)),
    [graph.commits],
  );

  return (
    <svg
      className="block"
      height={height}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <title>Commit graph</title>
      <g>
        {graph.edges.map((edge) => {
          const from = nodesById.get(edge.from);
          const to = nodesById.get(edge.to);

          if (!from || !to) {
            return null;
          }

          return (
            <CommitEdge
              edge={edge}
              from={from}
              key={`${edge.from}-${edge.to}`}
              to={to}
            />
          );
        })}
      </g>
      <g>
        {graph.commits.map((commit) => (
          <CommitNode
            commit={commit}
            isDimmed={!visibleCommitIds.has(commit.id)}
            isSearchMatch={matchingCommitIds.has(commit.id)}
            isSelected={commit.id === selectedCommitId}
            key={commit.id}
            onSelectCommit={onSelectCommit}
          />
        ))}
      </g>
    </svg>
  );
});

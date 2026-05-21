import type { CommitGraphResponse } from "../../types/graph";
import type {
  RepositoryError,
  RepositorySummary,
} from "../../types/repository";
import { GraphViewport } from "../graph/GraphViewport";

type GraphAreaProps = {
  graph: CommitGraphResponse | null;
  repository: RepositorySummary | null;
  error: RepositoryError | null;
  isLoading: boolean;
  selectedCommitId: string | null;
  onOpenRepository: () => void;
  onSelectCommit: (commitId: string) => void;
};

export function GraphArea({
  graph,
  repository,
  error,
  isLoading,
  selectedCommitId,
  onOpenRepository,
  onSelectCommit,
}: GraphAreaProps) {
  return (
    <GraphViewport
      error={error}
      graph={graph}
      isLoading={isLoading}
      onOpenRepository={onOpenRepository}
      onSelectCommit={onSelectCommit}
      repository={repository}
      selectedCommitId={selectedCommitId}
    />
  );
}

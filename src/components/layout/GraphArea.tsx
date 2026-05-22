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
  matchingCommitIds: Set<string>;
  visibleCommitIds: Set<string>;
  pan: { x: number; y: number };
  zoom: number;
  canLoadMore: boolean;
  commitLimit: number;
  onLoadMore: () => void;
  onOpenRepository: () => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onResetView: () => void;
  onSelectCommit: (commitId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function GraphArea({
  graph,
  repository,
  error,
  isLoading,
  selectedCommitId,
  matchingCommitIds,
  visibleCommitIds,
  pan,
  zoom,
  canLoadMore,
  commitLimit,
  onLoadMore,
  onOpenRepository,
  onPan,
  onResetView,
  onSelectCommit,
  onZoomIn,
  onZoomOut,
}: GraphAreaProps) {
  return (
    <main className="h-full min-h-0 overflow-auto">
      <GraphViewport
        error={error}
        graph={graph}
        isLoading={isLoading}
        matchingCommitIds={matchingCommitIds}
        canLoadMore={canLoadMore}
        commitLimit={commitLimit}
        onLoadMore={onLoadMore}
        onOpenRepository={onOpenRepository}
        onPan={onPan}
        onResetView={onResetView}
        onSelectCommit={onSelectCommit}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        pan={pan}
        repository={repository}
        selectedCommitId={selectedCommitId}
        visibleCommitIds={visibleCommitIds}
        zoom={zoom}
      />
    </main>
  );
}

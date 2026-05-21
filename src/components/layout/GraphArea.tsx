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
  pan: { x: number; y: number };
  zoom: number;
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
  pan,
  zoom,
  onOpenRepository,
  onPan,
  onResetView,
  onSelectCommit,
  onZoomIn,
  onZoomOut,
}: GraphAreaProps) {
  return (
    <GraphViewport
      error={error}
      graph={graph}
      isLoading={isLoading}
      onOpenRepository={onOpenRepository}
      onPan={onPan}
      onResetView={onResetView}
      onSelectCommit={onSelectCommit}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      pan={pan}
      repository={repository}
      selectedCommitId={selectedCommitId}
      zoom={zoom}
    />
  );
}

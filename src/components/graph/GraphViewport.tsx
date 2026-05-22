import { useRef, useState } from "react";
import type { CommitGraphResponse } from "../../types/graph";
import type { RepositoryError, RepositorySummary } from "../../types/repository";
import { OpenRepositoryButton } from "../repository/OpenRepositoryButton";
import { CommitGraph } from "./CommitGraph";
import { GraphToolbar } from "./GraphToolbar";

type GraphViewportProps = {
  graph: CommitGraphResponse | null;
  repository: RepositorySummary | null;
  error: RepositoryError | null;
  isLoading: boolean;
  selectedCommitId: string | null;
  matchingCommitIds: Set<string>;
  visibleCommitIds: Set<string>;
  pan: { x: number; y: number };
  zoom: number;
  onOpenRepository: () => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onResetView: () => void;
  onSelectCommit: (commitId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function GraphViewport({
  graph,
  repository,
  error,
  isLoading,
  selectedCommitId,
  matchingCommitIds,
  visibleCommitIds,
  pan,
  zoom,
  onOpenRepository,
  onPan,
  onResetView,
  onSelectCommit,
  onZoomIn,
  onZoomOut,
}: GraphViewportProps) {
  const [isPanning, setIsPanning] = useState(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  if (isLoading) {
    return (
      <GraphShell>
        <StatusPanel title="Loading commit graph">
          <p className="text-sm leading-6 text-slate-400">
            Reading repository history and preparing graph lanes.
          </p>
        </StatusPanel>
      </GraphShell>
    );
  }

  if (error) {
    return (
      <GraphShell>
        <StatusPanel title="Graph could not load">
          <p className="text-sm leading-6 text-red-200">{error.message}</p>
          <div className="mt-5">
            <OpenRepositoryButton
              isLoading={isLoading}
              onOpenRepository={onOpenRepository}
            />
          </div>
        </StatusPanel>
      </GraphShell>
    );
  }

  if (!repository) {
    return (
      <GraphShell>
        <StatusPanel title="Open a repository to begin">
          <p className="text-sm leading-6 text-slate-400">
            Select a local Git repository. The app validates the folder without
            running repository files or changing Git state.
          </p>
          <div className="mt-6">
            <OpenRepositoryButton
              isLoading={isLoading}
              onOpenRepository={onOpenRepository}
            />
          </div>
        </StatusPanel>
      </GraphShell>
    );
  }

  if (!graph || graph.commits.length === 0) {
    return (
      <GraphShell>
        <StatusPanel title="No commits found">
          <p className="break-all text-sm leading-6 text-slate-400">
            {repository.path}
          </p>
        </StatusPanel>
      </GraphShell>
    );
  }

  return (
    <div className="relative h-full min-h-[calc(100vh-3.5rem)] overflow-auto bg-[#0c1018]">
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium text-slate-200">
              {repository.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {graph.commits.length} commits, {graph.edges.length} edges
            </p>
          </div>
          <div className="shrink-0 rounded border border-slate-800 px-2 py-1 text-xs text-slate-400">
            SVG
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-20 z-20">
        <GraphToolbar
          onReset={onResetView}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          zoom={zoom}
        />
      </div>
      <div
        className={isPanning ? "h-full cursor-grabbing" : "h-full cursor-grab"}
        onPointerCancel={() => {
          lastPointer.current = null;
          setIsPanning(false);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }

          event.currentTarget.setPointerCapture(event.pointerId);
          lastPointer.current = { x: event.clientX, y: event.clientY };
          setIsPanning(true);
        }}
        onPointerMove={(event) => {
          if (!lastPointer.current) {
            return;
          }

          const nextPointer = { x: event.clientX, y: event.clientY };
          onPan(
            nextPointer.x - lastPointer.current.x,
            nextPointer.y - lastPointer.current.y,
          );
          lastPointer.current = nextPointer;
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }

          lastPointer.current = null;
          setIsPanning(false);
        }}
      >
        <div
          className="min-h-full min-w-full p-6"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <CommitGraph
            graph={graph}
            matchingCommitIds={matchingCommitIds}
            onSelectCommit={onSelectCommit}
            selectedCommitId={selectedCommitId}
            visibleCommitIds={visibleCommitIds}
          />
        </div>
      </div>
    </div>
  );
}

function GraphShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative overflow-hidden bg-[#0c1018]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative flex h-full min-h-[calc(100vh-3.5rem)] items-center justify-center p-8">
        {children}
      </div>
    </main>
  );
}

function StatusPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-950/90 p-8 text-center shadow-2xl shadow-black/30">
      <div className="mx-auto mb-5 h-12 w-12 rounded-full border border-cyan-400/40 bg-cyan-400/10" />
      <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

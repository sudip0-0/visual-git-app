import { useEffect, useRef } from "react";
import { DetailsPanel } from "./DetailsPanel";
import { GraphArea } from "./GraphArea";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useGraphStore } from "../../stores/graphStore";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useUiStore } from "../../stores/uiStore";

export function AppShell() {
  const repositoryStore = useRepositoryStore();
  const graphStore = useGraphStore();
  const uiStore = useUiStore();
  const loadedGraphPath = useRef<string | null>(null);
  const isLoading = repositoryStore.isLoading || graphStore.isLoading;
  const error = repositoryStore.error ?? graphStore.error;

  useEffect(() => {
    const path = repositoryStore.repository?.path ?? null;

    if (!path) {
      loadedGraphPath.current = null;
      graphStore.clearGraph();
      return;
    }

    if (loadedGraphPath.current === path) {
      return;
    }

    loadedGraphPath.current = path;
    void graphStore.loadCommitGraph(path, 500).catch(() => {
      // The graph store keeps the user-safe error for the viewport.
    });
  }, [graphStore, repositoryStore.repository?.path]);

  return (
    <div className="flex min-h-screen flex-col bg-[#090b10] text-slate-100">
      <TopBar
        isLoading={isLoading}
        onOpenRepository={repositoryStore.openRepositoryPicker}
        repository={repositoryStore.repository}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_320px] border-t border-slate-800">
        <Sidebar
          isLoading={isLoading}
          matchingCommits={graphStore.matchingCommits}
          onClearBranchFilter={() => graphStore.setBranchFilter(null)}
          onClearSearch={graphStore.clearSearch}
          onOpenRecentRepository={repositoryStore.validateRepositoryPath}
          onRemoveRecentRepository={repositoryStore.removeRecentRepository}
          onSearchChange={graphStore.setSearch}
          onSelectBranch={graphStore.setBranchFilter}
          onSelectCommit={graphStore.selectCommit}
          onSelectTag={graphStore.selectCommit}
          recentRepositories={repositoryStore.recentRepositories}
          repository={repositoryStore.repository}
          repositoryData={repositoryStore.repositoryData}
          searchQuery={graphStore.searchQuery}
          selectedBranchName={graphStore.selectedBranchName}
          selectedCommitId={graphStore.selectedCommitId}
        />
        <GraphArea
          error={error}
          graph={graphStore.graph}
          isLoading={isLoading}
          matchingCommitIds={graphStore.matchingCommitIds}
          onOpenRepository={repositoryStore.openRepositoryPicker}
          onPan={uiStore.panGraph}
          onResetView={uiStore.resetGraphView}
          onSelectCommit={graphStore.selectCommit}
          onZoomIn={uiStore.zoomIn}
          onZoomOut={uiStore.zoomOut}
          pan={uiStore.graphPan}
          repository={repositoryStore.repository}
          selectedCommitId={graphStore.selectedCommitId}
          visibleCommitIds={graphStore.visibleCommitIds}
          zoom={uiStore.graphZoom}
        />
        <DetailsPanel
          repository={repositoryStore.repository}
          selectedCommit={graphStore.selectedCommit}
        />
      </div>
    </div>
  );
}

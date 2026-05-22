import { useEffect, useMemo, useRef } from "react";
import { DetailsPanel } from "./DetailsPanel";
import { GraphArea } from "./GraphArea";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useCommitDetailsStore } from "../../stores/commitDetailsStore";
import { useGraphStore } from "../../stores/graphStore";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useUiStore } from "../../stores/uiStore";

export function AppShell() {
  const repositoryStore = useRepositoryStore();
  const graphStore = useGraphStore();
  const commitDetailsStore = useCommitDetailsStore();
  const uiStore = useUiStore();
  const loadedGraphPath = useRef<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isLoading = repositoryStore.isLoading || graphStore.isLoading;
  const error = repositoryStore.error ?? graphStore.error;
  const branchOptions = useMemo(() => {
    const branchNames = repositoryStore.repositoryData?.branches.map(
      (branch) => branch.name,
    ) ?? [];

    return Array.from(new Set(branchNames));
  }, [repositoryStore.repositoryData?.branches]);

  useEffect(() => {
    const path = repositoryStore.repository?.path ?? null;

    if (!path) {
      loadedGraphPath.current = null;
      graphStore.clearGraph();
      commitDetailsStore.clear();
      return;
    }

    if (loadedGraphPath.current === path) {
      return;
    }

    loadedGraphPath.current = path;
    void graphStore.loadCommitGraph(path, 500).catch(() => {
      // The graph store keeps the user-safe error for the viewport.
    });
  }, [commitDetailsStore, graphStore, repositoryStore.repository?.path]);

  useEffect(() => {
    const path = repositoryStore.repository?.path;
    const commitHash = graphStore.selectedCommit?.id;

    if (!path || !commitHash) {
      return;
    }

    void commitDetailsStore.loadChangedFiles(path, commitHash).catch(() => {
      // Commit details store keeps user-safe error state.
    });
  }, [
    commitDetailsStore,
    graphStore.selectedCommit?.id,
    repositoryStore.repository?.path,
  ]);

  useEffect(() => {
    const path = repositoryStore.repository?.path;

    if (!path) {
      return;
    }

    void commitDetailsStore
      .loadGitInternals(path, graphStore.selectedCommit?.id ?? null)
      .catch(() => {
        // Commit details store keeps user-safe error state.
      });
  }, [
    commitDetailsStore,
    graphStore.selectedCommit?.id,
    repositoryStore.repository?.path,
  ]);

  useEffect(() => {
    const path = repositoryStore.repository?.path;
    if (!path || branchOptions.length < 2) {
      return;
    }

    const baseBranch =
      repositoryStore.repository?.currentBranch &&
      branchOptions.includes(repositoryStore.repository.currentBranch)
        ? repositoryStore.repository.currentBranch
        : branchOptions[0];
    const targetBranch = branchOptions.find((branch) => branch !== baseBranch);

    if (!baseBranch || !targetBranch) {
      return;
    }

    void commitDetailsStore
      .loadBranchComparison(path, baseBranch, targetBranch)
      .catch(() => {
        // Commit details store keeps user-safe error state.
      });
  }, [
    branchOptions,
    commitDetailsStore,
    repositoryStore.repository?.currentBranch,
    repositoryStore.repository?.path,
  ]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") {
        event.preventDefault();
        void repositoryStore.openRepositoryPicker();
        return;
      }

      if (!isTyping && event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (!isTyping && event.key === "0") {
        event.preventDefault();
        uiStore.resetGraphView();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [repositoryStore, uiStore]);

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
          searchInputRef={searchInputRef}
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
          onLoadMore={() => {
            const path = repositoryStore.repository?.path;

            if (!path) {
              return;
            }

            void graphStore.loadMoreCommitGraph(path).catch(() => {
              // The graph store keeps the user-safe error for the viewport.
            });
          }}
          onSelectCommit={graphStore.selectCommit}
          onZoomIn={uiStore.zoomIn}
          onZoomOut={uiStore.zoomOut}
          pan={uiStore.graphPan}
          repository={repositoryStore.repository}
          selectedCommitId={graphStore.selectedCommitId}
          visibleCommitIds={graphStore.visibleCommitIds}
          zoom={uiStore.graphZoom}
          canLoadMore={graphStore.canLoadMore}
          commitLimit={graphStore.commitLimit}
        />
        <DetailsPanel
          branchComparison={commitDetailsStore.branchComparison}
          branchComparisonError={commitDetailsStore.branchComparisonError}
          branchOptions={branchOptions}
          changedFiles={commitDetailsStore.changedFiles}
          changedFilesError={commitDetailsStore.changedFilesError}
          diffError={commitDetailsStore.diffError}
          isBranchComparisonLoading={commitDetailsStore.isBranchComparisonLoading}
          isChangedFilesLoading={commitDetailsStore.isChangedFilesLoading}
          isDiffLoading={commitDetailsStore.isDiffLoading}
          gitInternals={commitDetailsStore.gitInternals}
          gitInternalsError={commitDetailsStore.gitInternalsError}
          isGitInternalsLoading={commitDetailsStore.isGitInternalsLoading}
          onSelectBranchComparison={(baseBranch, targetBranch) => {
            const path = repositoryStore.repository?.path;

            if (!path) {
              return;
            }

            void commitDetailsStore
              .loadBranchComparison(path, baseBranch, targetBranch)
              .catch(() => {
                // Commit details store keeps user-safe error state.
              });
          }}
          onSelectChangedFile={(filePath) => {
            const path = repositoryStore.repository?.path;
            const commitHash = graphStore.selectedCommit?.id;

            if (!path || !commitHash) {
              return;
            }

            void commitDetailsStore
              .loadFileDiff(path, commitHash, filePath)
              .catch(() => {
                // Commit details store keeps user-safe error state.
              });
          }}
          repository={repositoryStore.repository}
          selectedChangedFilePath={commitDetailsStore.selectedFilePath}
          selectedCommit={graphStore.selectedCommit}
          selectedDiff={commitDetailsStore.selectedDiff}
        />
      </div>
    </div>
  );
}

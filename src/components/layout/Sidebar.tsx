import { BranchList } from "../branches/BranchList";
import { TagList } from "../branches/TagList";
import { RecentRepositories } from "../repository/RecentRepositories";
import { CommitSearch } from "../search/CommitSearch";
import { SearchResults } from "../search/SearchResults";
import type { Ref } from "react";
import type { RepositoryData } from "../../types/git";
import type { GraphCommitNode } from "../../types/graph";
import type {
  RecentRepository,
  RepositorySummary,
} from "../../types/repository";

type SidebarProps = {
  repository: RepositorySummary | null;
  repositoryData: RepositoryData | null;
  recentRepositories: RecentRepository[];
  isLoading: boolean;
  matchingCommits: GraphCommitNode[];
  searchQuery: string;
  selectedBranchName: string | null;
  selectedCommitId: string | null;
  searchInputRef?: Ref<HTMLInputElement>;
  onClearBranchFilter: () => void;
  onClearSearch: () => void;
  onOpenRecentRepository: (path: string) => void;
  onRemoveRecentRepository: (path: string) => void;
  onSearchChange: (query: string) => void;
  onSelectBranch: (branchName: string) => void;
  onSelectCommit: (commitId: string) => void;
  onSelectTag: (commitId: string) => void;
};

export function Sidebar({
  repository,
  repositoryData,
  recentRepositories,
  isLoading,
  matchingCommits,
  searchQuery,
  selectedBranchName,
  selectedCommitId,
  searchInputRef,
  onClearBranchFilter,
  onClearSearch,
  onOpenRecentRepository,
  onRemoveRecentRepository,
  onSearchChange,
  onSelectBranch,
  onSelectCommit,
  onSelectTag,
}: SidebarProps) {
  return (
    <aside className="h-full overflow-y-auto border-r border-slate-800 bg-slate-950/80 p-4">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Repository
          </h2>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-400">
            read-only
          </span>
        </div>
        {repository ? (
          <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
            <p className="truncate text-sm font-medium text-slate-300">
              {repository.name}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {repository.path}
            </p>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Current branch</dt>
                <dd className="truncate text-slate-300">
                  {repository.isDetached
                    ? "Detached HEAD"
                    : repository.currentBranch ?? "Unavailable"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">HEAD</dt>
                <dd className="truncate font-mono text-slate-300">
                  {repository.headHash
                    ? repository.headHash.slice(0, 12)
                    : "Unavailable"}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="rounded-md border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-500">
            No repository selected.
          </p>
        )}
      </section>

      {repositoryData ? (
        <section className="mt-6">
          <CommitSearch
            inputRef={searchInputRef}
            onClearSearch={onClearSearch}
            onSearchChange={onSearchChange}
            query={searchQuery}
            resultCount={matchingCommits.length}
          />
          <SearchResults
            commits={matchingCommits}
            onSelectCommit={onSelectCommit}
            query={searchQuery}
            selectedCommitId={selectedCommitId}
          />
        </section>
      ) : null}

      {repositoryData ? (
        <section className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Refs
          </h2>
          <div className="space-y-4 rounded-md border border-slate-800 bg-slate-900/50 p-3">
            <BranchList
              branches={repositoryData.branches}
              onClearBranchFilter={onClearBranchFilter}
              onSelectBranch={onSelectBranch}
              selectedBranchName={selectedBranchName}
            />
            <TagList onSelectTag={(tag) => tag.target && onSelectTag(tag.target)} tags={repositoryData.tags} />
          </div>
        </section>
      ) : null}

      <RecentRepositories
        isLoading={isLoading}
        onOpenRecentRepository={onOpenRecentRepository}
        onRemoveRecentRepository={onRemoveRecentRepository}
        recentRepositories={recentRepositories}
      />
    </aside>
  );
}

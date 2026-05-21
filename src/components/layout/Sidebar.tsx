import { RecentRepositories } from "../repository/RecentRepositories";
import type { RepositoryData } from "../../types/git";
import type {
  RecentRepository,
  RepositorySummary,
} from "../../types/repository";

type SidebarProps = {
  repository: RepositorySummary | null;
  repositoryData: RepositoryData | null;
  recentRepositories: RecentRepository[];
  isLoading: boolean;
  onOpenRecentRepository: (path: string) => void;
  onRemoveRecentRepository: (path: string) => void;
};

export function Sidebar({
  repository,
  repositoryData,
  recentRepositories,
  isLoading,
  onOpenRecentRepository,
  onRemoveRecentRepository,
}: SidebarProps) {
  return (
    <aside className="border-r border-slate-800 bg-slate-950/80 p-4">
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
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Refs
          </h2>
          <div className="space-y-4 rounded-md border border-slate-800 bg-slate-900/50 p-3">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">Branches</span>
                <span className="text-slate-500">
                  {repositoryData.branches.length}
                </span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {repositoryData.branches.slice(0, 6).map((branch) => (
                  <li className="flex justify-between gap-3" key={branch.fullName}>
                    <span className="truncate">
                      {branch.isCurrent ? "* " : ""}
                      {branch.name}
                    </span>
                    <span className="shrink-0 text-slate-500">
                      {branch.isRemote ? "remote" : "local"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">Tags</span>
                <span className="text-slate-500">{repositoryData.tags.length}</span>
              </div>
              {repositoryData.tags.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-300">
                  {repositoryData.tags.slice(0, 6).map((tag) => (
                    <li className="truncate" key={tag.name}>
                      {tag.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No tags found.</p>
              )}
            </div>
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

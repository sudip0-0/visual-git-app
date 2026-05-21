import type { RecentRepository } from "../../types/repository";

type RecentRepositoriesProps = {
  recentRepositories: RecentRepository[];
  isLoading: boolean;
  onOpenRecentRepository: (path: string) => void;
  onRemoveRecentRepository: (path: string) => void;
};

export function RecentRepositories({
  recentRepositories,
  isLoading,
  onOpenRecentRepository,
  onRemoveRecentRepository,
}: RecentRepositoriesProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Recent Repositories
      </h2>

      {recentRepositories.length === 0 ? (
        <p className="rounded-md border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-500">
          Open a repository to pin it here.
        </p>
      ) : (
        <div className="space-y-2">
          {recentRepositories.map((repository) => (
            <div
              className="rounded-md border border-slate-800 bg-slate-900/60 p-3"
              key={repository.path}
            >
              <button
                className="block w-full truncate text-left text-sm font-medium text-slate-300 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                onClick={() => onOpenRecentRepository(repository.path)}
                title={repository.path}
                type="button"
              >
                {repository.name}
              </button>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-slate-500">
                  {repository.path}
                </span>
                <button
                  className="shrink-0 text-xs text-slate-500 hover:text-slate-300"
                  onClick={() => onRemoveRecentRepository(repository.path)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

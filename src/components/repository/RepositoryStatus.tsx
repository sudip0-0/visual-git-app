import type { RepositorySummary } from "../../types/repository";

type RepositoryStatusProps = {
  repository: RepositorySummary | null;
};

export function RepositoryStatus({ repository }: RepositoryStatusProps) {
  if (!repository) {
    return (
      <p className="text-xs text-slate-500">No repository selected</p>
    );
  }

  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-medium text-slate-300">
        {repository.name}
      </p>
      <p className="truncate text-xs text-slate-500">{repository.path}</p>
    </div>
  );
}

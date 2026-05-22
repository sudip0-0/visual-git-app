import { GithubRepositoryForm } from "../repository/GithubRepositoryForm";
import { OpenRepositoryButton } from "../repository/OpenRepositoryButton";
import { RepositoryStatus } from "../repository/RepositoryStatus";
import type { RepositorySummary } from "../../types/repository";

type TopBarProps = {
  repository: RepositorySummary | null;
  isLoading: boolean;
  onCloneRepository: (url: string) => Promise<void>;
  onOpenRepository: () => void;
};

export function TopBar({
  repository,
  isLoading,
  onCloneRepository,
  onOpenRepository,
}: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950 px-5">
      <div className="shrink-0">
        <h1 className="text-sm font-semibold text-slate-100">
          Visual Git Commit Graph
        </h1>
        <p className="text-xs text-slate-500">Read-only repository explorer</p>
      </div>
      <div className="min-w-0 flex-1">
        <RepositoryStatus repository={repository} />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <GithubRepositoryForm
          isLoading={isLoading}
          onCloneRepository={onCloneRepository}
        />
        <OpenRepositoryButton
          isLoading={isLoading}
          onOpenRepository={onOpenRepository}
        />
      </div>
    </header>
  );
}

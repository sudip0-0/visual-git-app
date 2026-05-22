import { CommitDetailsPanel } from "../commit/CommitDetailsPanel";
import type { BranchComparison, ChangedFile, CommitFileDiff } from "../../types/git";
import type { GraphCommitNode } from "../../types/graph";
import type { RepositoryError, RepositorySummary } from "../../types/repository";

type DetailsPanelProps = {
  selectedCommit: GraphCommitNode | null;
  repository: RepositorySummary | null;
  branchOptions: string[];
  changedFiles: ChangedFile[];
  changedFilesError: RepositoryError | null;
  selectedDiff: CommitFileDiff | null;
  diffError: RepositoryError | null;
  branchComparison: BranchComparison | null;
  branchComparisonError: RepositoryError | null;
  isChangedFilesLoading: boolean;
  isDiffLoading: boolean;
  isBranchComparisonLoading: boolean;
  onSelectChangedFile: (filePath: string) => void;
  onSelectBranchComparison: (baseBranch: string, targetBranch: string) => void;
  selectedChangedFilePath: string | null;
};

export function DetailsPanel({
  repository,
  selectedCommit,
  branchOptions,
  changedFiles,
  changedFilesError,
  selectedDiff,
  diffError,
  branchComparison,
  branchComparisonError,
  isChangedFilesLoading,
  isDiffLoading,
  isBranchComparisonLoading,
  onSelectChangedFile,
  onSelectBranchComparison,
  selectedChangedFilePath,
}: DetailsPanelProps) {
  return (
    <aside className="overflow-y-auto border-l border-slate-800 bg-slate-950 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Commit Details
      </h2>
      <div className="mt-4">
        <CommitDetailsPanel
          branchComparison={branchComparison}
          branchComparisonError={branchComparisonError}
          changedFiles={changedFiles}
          changedFilesError={changedFilesError}
          commit={selectedCommit}
          diffError={diffError}
          isBranchComparisonLoading={isBranchComparisonLoading}
          isChangedFilesLoading={isChangedFilesLoading}
          isDiffLoading={isDiffLoading}
          onSelectBranchComparison={onSelectBranchComparison}
          onSelectChangedFile={onSelectChangedFile}
          repository={repository}
          branchOptions={branchOptions}
          selectedChangedFilePath={selectedChangedFilePath}
          selectedDiff={selectedDiff}
        />
      </div>
      {repository ? (
        <section className="mt-6 rounded-md border border-slate-800 bg-slate-900/40 p-3">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Repository
          </h3>
          <p className="mt-2 truncate text-sm text-slate-300">{repository.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {repository.isDetached
              ? "Detached HEAD"
              : repository.currentBranch ?? "Branch unavailable"}
          </p>
        </section>
      ) : null}
    </aside>
  );
}

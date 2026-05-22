import { useMemo, useState } from "react";
import type { BranchComparison, ChangedFile, CommitFileDiff } from "../../types/git";
import type { GraphCommitNode } from "../../types/graph";
import type { RepositoryError, RepositorySummary } from "../../types/repository";

type CommitDetailsPanelProps = {
  commit: GraphCommitNode | null;
  repository: RepositorySummary | null;
  changedFiles: ChangedFile[];
  changedFilesError: RepositoryError | null;
  selectedDiff: CommitFileDiff | null;
  diffError: RepositoryError | null;
  branchComparison: BranchComparison | null;
  branchComparisonError: RepositoryError | null;
  isChangedFilesLoading: boolean;
  isDiffLoading: boolean;
  isBranchComparisonLoading: boolean;
  selectedChangedFilePath: string | null;
  onSelectChangedFile: (filePath: string) => void;
  onSelectBranchComparison: (baseBranch: string, targetBranch: string) => void;
  branchOptions: string[];
};

export function CommitDetailsPanel({
  commit,
  repository,
  changedFiles,
  changedFilesError,
  selectedDiff,
  diffError,
  branchComparison,
  branchComparisonError,
  isChangedFilesLoading,
  isDiffLoading,
  isBranchComparisonLoading,
  selectedChangedFilePath,
  onSelectChangedFile,
  onSelectBranchComparison,
  branchOptions,
}: CommitDetailsPanelProps) {
  const [baseBranch, setBaseBranch] = useState<string>("");
  const [targetBranch, setTargetBranch] = useState<string>("");

  const currentBranch = repository?.currentBranch ?? "";
  const defaultBase = baseBranch || currentBranch || branchOptions[0] || "";
  const defaultTarget = useMemo(() => {
    if (targetBranch) {
      return targetBranch;
    }

    return branchOptions.find((branch) => branch !== defaultBase) ?? "";
  }, [branchOptions, defaultBase, targetBranch]);

  if (!commit) {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-500">
        Select a commit in the graph.
      </div>
    );
  }

  const rows = [
    ["Summary", commit.summary || "No summary"],
    ["Hash", commit.id],
    ["Author", commit.authorName ?? "Unavailable"],
    ["Author time", formatUnixTime(commit.authorTime)],
    [
      "Parents",
      commit.parents.length > 0
        ? commit.parents.map((parent) => parent.slice(0, 12)).join(", ")
        : "Root commit",
    ],
    ["Branches", commit.branchNames.join(", ") || "None"],
    ["Tags", commit.tagNames.join(", ") || "None"],
  ];

  return (
    <div className="space-y-3">
      {rows.map(([label, value]) => (
        <div
          className="rounded-md border border-slate-800 bg-slate-900/50 p-3"
          key={label}
        >
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className="mt-1 break-words text-sm text-slate-300">{value}</div>
        </div>
      ))}

      <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Changed Files
        </div>
        {isChangedFilesLoading ? (
          <p className="mt-2 text-xs text-slate-500">Loading files...</p>
        ) : changedFilesError ? (
          <p className="mt-2 text-xs text-red-200">{changedFilesError.message}</p>
        ) : changedFiles.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">No changed files.</p>
        ) : (
          <ul className="mt-2 max-h-44 space-y-1 overflow-auto pr-1 text-xs">
            {changedFiles.map((file) => (
              <li key={`${file.path}-${file.previousPath ?? ""}`}>
                <button
                  className={
                    selectedChangedFilePath === file.path
                      ? "w-full rounded border border-cyan-700 bg-cyan-950/30 px-2 py-1 text-left text-slate-200"
                      : "w-full rounded border border-transparent px-2 py-1 text-left text-slate-300 hover:border-slate-800 hover:bg-slate-900/40"
                  }
                  onClick={() => onSelectChangedFile(file.path)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{file.path}</span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-500">
                      {file.status}
                    </span>
                  </div>
                  {file.previousPath ? (
                    <div className="truncate text-[11px] text-slate-500">
                      from {file.previousPath}
                    </div>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Diff Preview
        </div>
        {selectedChangedFilePath ? (
          <p className="mt-2 truncate text-xs text-slate-500">{selectedChangedFilePath}</p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Select a changed file.</p>
        )}
        {isDiffLoading ? <p className="mt-2 text-xs text-slate-500">Loading diff...</p> : null}
        {diffError ? <p className="mt-2 text-xs text-red-200">{diffError.message}</p> : null}
        {selectedDiff ? (
          <div className="mt-2">
            {selectedDiff.isBinary ? (
              <p className="text-xs text-slate-400">{selectedDiff.diffText}</p>
            ) : (
              <pre className="max-h-60 overflow-auto rounded border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-300">
                {selectedDiff.diffText}
              </pre>
            )}
            {selectedDiff.isTruncated ? (
              <p className="mt-2 text-[11px] text-amber-300">
                This diff preview was truncated for safety.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Branch Comparison
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select
            className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200"
            onChange={(event) => {
              const nextBase = event.target.value;
              setBaseBranch(nextBase);
              if (defaultTarget) {
                onSelectBranchComparison(nextBase, defaultTarget);
              }
            }}
            value={defaultBase}
          >
            <option value="">Base branch</option>
            {branchOptions.map((branch) => (
              <option key={`base-${branch}`} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <select
            className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200"
            onChange={(event) => {
              const nextTarget = event.target.value;
              setTargetBranch(nextTarget);
              if (defaultBase) {
                onSelectBranchComparison(defaultBase, nextTarget);
              }
            }}
            value={defaultTarget}
          >
            <option value="">Target branch</option>
            {branchOptions.map((branch) => (
              <option key={`target-${branch}`} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
        {isBranchComparisonLoading ? (
          <p className="mt-2 text-xs text-slate-500">Comparing branches...</p>
        ) : branchComparisonError ? (
          <p className="mt-2 text-xs text-red-200">{branchComparisonError.message}</p>
        ) : branchComparison ? (
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            <p>
              <span className="text-slate-500">Ahead:</span> {branchComparison.ahead}
            </p>
            <p>
              <span className="text-slate-500">Behind:</span> {branchComparison.behind}
            </p>
            <p>
              <span className="text-slate-500">Merge base:</span>{" "}
              {branchComparison.mergeBase
                ? branchComparison.mergeBase.slice(0, 12)
                : "Not available"}
            </p>
            <p className="text-slate-400">
              {divergenceExplanation(branchComparison)}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Select base and target branches to compare.
          </p>
        )}
      </div>
    </div>
  );
}

function divergenceExplanation(comparison: BranchComparison) {
  if (comparison.ahead === 0 && comparison.behind === 0) {
    return `${comparison.targetBranch} is aligned with ${comparison.baseBranch}.`;
  }

  if (comparison.ahead > 0 && comparison.behind === 0) {
    return `${comparison.targetBranch} is ahead of ${comparison.baseBranch} by ${comparison.ahead} commit(s).`;
  }

  if (comparison.ahead === 0 && comparison.behind > 0) {
    return `${comparison.targetBranch} is behind ${comparison.baseBranch} by ${comparison.behind} commit(s).`;
  }

  return `${comparison.targetBranch} has diverged from ${comparison.baseBranch} (${comparison.ahead} ahead, ${comparison.behind} behind).`;
}

function formatUnixTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(seconds * 1000));
}

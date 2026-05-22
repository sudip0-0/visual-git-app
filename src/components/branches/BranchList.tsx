import type { BranchInfo } from "../../types/git";

type BranchListProps = {
  branches: BranchInfo[];
  selectedBranchName: string | null;
  onClearBranchFilter: () => void;
  onSelectBranch: (branchName: string) => void;
};

export function BranchList({
  branches,
  selectedBranchName,
  onClearBranchFilter,
  onSelectBranch,
}: BranchListProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">Branches</span>
        {selectedBranchName ? (
          <button
            className="text-slate-500 hover:text-slate-300"
            onClick={onClearBranchFilter}
            type="button"
          >
            Clear
          </button>
        ) : (
          <span className="text-slate-500">{branches.length}</span>
        )}
      </div>
      <ul className="max-h-48 space-y-1 overflow-auto pr-1 text-xs text-slate-300">
        {branches.map((branch) => (
          <li key={branch.fullName}>
            <button
              className={
                branch.name === selectedBranchName
                  ? "flex w-full justify-between gap-3 rounded border border-cyan-800 bg-cyan-950/30 p-1.5 text-left"
                  : "flex w-full justify-between gap-3 rounded border border-transparent p-1.5 text-left hover:border-slate-800 hover:bg-slate-900/50"
              }
              onClick={() => onSelectBranch(branch.name)}
              type="button"
            >
              <span className="truncate text-slate-200">{branch.name}</span>
              <span className={branchBadgeClass(branch)}>
                {branch.isCurrent ? "current" : branch.isRemote ? "remote" : "local"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function branchBadgeClass(branch: BranchInfo) {
  if (branch.isCurrent) {
    return "shrink-0 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200";
  }

  if (branch.isRemote) {
    return "shrink-0 rounded border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-200";
  }

  return "shrink-0 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-300";
}

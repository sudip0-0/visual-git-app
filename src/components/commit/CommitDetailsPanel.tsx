import type { GraphCommitNode } from "../../types/graph";

type CommitDetailsPanelProps = {
  commit: GraphCommitNode | null;
};

export function CommitDetailsPanel({ commit }: CommitDetailsPanelProps) {
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
    </div>
  );
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

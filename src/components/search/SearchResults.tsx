import type { GraphCommitNode } from "../../types/graph";

type SearchResultsProps = {
  commits: GraphCommitNode[];
  query: string;
  selectedCommitId: string | null;
  onSelectCommit: (commitId: string) => void;
};

export function SearchResults({
  commits,
  query,
  selectedCommitId,
  onSelectCommit,
}: SearchResultsProps) {
  if (!query) {
    return null;
  }

  return (
    <section className="mt-4">
      <ul className="max-h-48 space-y-1 overflow-auto pr-1">
        {commits.length > 0 ? (
          commits.slice(0, 20).map((commit) => (
            <li key={commit.id}>
              <button
                className={
                  commit.id === selectedCommitId
                    ? "w-full rounded border border-cyan-700 bg-cyan-950/40 p-2 text-left"
                    : "w-full rounded border border-slate-800 bg-slate-900/40 p-2 text-left hover:border-slate-700"
                }
                onClick={() => onSelectCommit(commit.id)}
                type="button"
              >
                <span className="block truncate text-xs font-medium text-slate-300">
                  {commit.summary || commit.shortId}
                </span>
                <span className="mt-1 block font-mono text-[11px] text-slate-500">
                  {commit.shortId}
                </span>
              </button>
            </li>
          ))
        ) : (
          <li className="rounded border border-slate-800 bg-slate-900/40 p-2 text-xs text-slate-500">
            No matching commits.
          </li>
        )}
      </ul>
    </section>
  );
}

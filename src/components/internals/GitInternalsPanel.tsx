import type { ReactNode } from "react";
import type { GitInternals } from "../../types/git";
import type { RepositoryError } from "../../types/repository";

type GitInternalsPanelProps = {
  internals: GitInternals | null;
  error: RepositoryError | null;
  isLoading: boolean;
};

export function GitInternalsPanel({
  internals,
  error,
  isLoading,
}: GitInternalsPanelProps) {
  return (
    <details className="mt-6 rounded-md border border-slate-800 bg-slate-900/40 p-3">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-400">
        Git Internals
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-xs text-slate-500">
          Read-only view of how Git stores the current position and selected commit.
        </p>

        {isLoading ? <p className="text-xs text-slate-500">Loading internals...</p> : null}
        {error ? <p className="text-xs text-red-200">{error.message}</p> : null}

        {internals ? (
          <>
          <InternalsCard title="HEAD">
            <KeyValue label="Raw HEAD" value={internals.head.rawValue ?? "Unavailable"} />
            <KeyValue
              label="Mode"
              value={internals.head.isDetached ? "Detached commit" : "Symbolic ref"}
            />
            <KeyValue
              label="Current ref"
              value={internals.head.currentRefPath ?? "No branch ref"}
            />
            <KeyValue
              label="Current branch"
              value={internals.head.currentBranch ?? "Detached or unavailable"}
            />
            <KeyValue
              label="Resolved commit"
              value={shortenHash(internals.head.resolvedCommit)}
            />
            <KeyValue
              label="Ref target"
              value={shortenHash(internals.head.refTargetCommit)}
            />
            <p className="mt-2 text-xs text-slate-400">{internals.head.explanation}</p>
          </InternalsCard>

          {internals.selectedCommit ? (
            <InternalsCard title="Selected Commit Object">
              <KeyValue label="Object type" value={internals.selectedCommit.objectType} />
              <KeyValue label="Commit hash" value={internals.selectedCommit.commitHash} />
              <KeyValue label="Tree hash" value={internals.selectedCommit.treeHash} />
              <KeyValue
                label="Parents"
                value={
                  internals.selectedCommit.parentHashes.length > 0
                    ? internals.selectedCommit.parentHashes.join(", ")
                    : "Root commit"
                }
              />
              <KeyValue
                label="Author"
                value={internals.selectedCommit.author ?? "Unavailable"}
              />
              <KeyValue
                label="Committer"
                value={internals.selectedCommit.committer ?? "Unavailable"}
              />
              <KeyValue
                label="Object path"
                value={internals.selectedCommit.objectPath}
              />
              <p className="mt-2 text-xs text-slate-400">
                {internals.selectedCommit.objectPathExplanation}
              </p>
              <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-300">
                {internals.selectedCommit.message || "No commit message."}
              </pre>
            </InternalsCard>
          ) : (
            <InternalsCard title="Selected Commit Object">
              <p className="text-xs text-slate-500">
                Select a commit to inspect its raw commit metadata.
              </p>
            </InternalsCard>
          )}

          {internals.looseObject ? (
            <InternalsCard title="Loose Object Parser">
              <KeyValue label="Loose path" value={internals.looseObject.objectPath} />
              <KeyValue
                label="Availability"
                value={internals.looseObject.isAvailable ? "Loose object found" : "Not loose"}
              />
              <KeyValue
                label="Object type"
                value={internals.looseObject.objectType ?? "Unavailable"}
              />
              <KeyValue
                label="Declared size"
                value={
                  internals.looseObject.declaredSize === undefined
                    ? "Unavailable"
                    : `${internals.looseObject.declaredSize} bytes`
                }
              />
              <KeyValue
                label="Tree"
                value={internals.looseObject.treeHash ?? "Unavailable"}
              />
              <p className="mt-2 text-xs text-slate-400">
                {internals.looseObject.explanation}
              </p>
            </InternalsCard>
          ) : null}

          <InternalsCard title="Plain Language Map">
            <ul className="space-y-2 text-xs text-slate-400">
              {internals.explanations.map((explanation) => (
                <li key={explanation}>{explanation}</li>
              ))}
            </ul>
          </InternalsCard>
          </>
        ) : null}
      </div>
    </details>
  );
}

function InternalsCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <span className="text-slate-500">{label}:</span>{" "}
      <span className="break-words font-mono text-slate-300">{value}</span>
    </div>
  );
}

function shortenHash(hash?: string) {
  return hash ? hash.slice(0, 12) : "Unavailable";
}

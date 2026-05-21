const placeholderBranches = ["main", "feature/layout", "release/v0.1"];
const placeholderTags = ["v0.1.0", "prototype"];

export function Sidebar() {
  return (
    <aside className="border-r border-slate-800 bg-slate-950/80 p-4">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Branches
          </h2>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-400">
            empty
          </span>
        </div>
        <div className="space-y-1.5">
          {placeholderBranches.map((branch) => (
            <div
              className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-500"
              key={branch}
            >
              {branch}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Tags
        </h2>
        <div className="flex flex-wrap gap-2">
          {placeholderTags.map((tag) => (
            <span
              className="rounded border border-slate-800 px-2 py-1 text-xs text-slate-500"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}

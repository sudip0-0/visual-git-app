export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950 px-5">
      <div>
        <h1 className="text-sm font-semibold text-slate-100">
          Visual Git Commit Graph
        </h1>
        <p className="text-xs text-slate-500">Read-only repository explorer</p>
      </div>
      <button
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 shadow-sm transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        type="button"
      >
        Open Repository
      </button>
    </header>
  );
}

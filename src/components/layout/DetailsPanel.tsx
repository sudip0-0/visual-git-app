const detailRows = [
  ["Commit", "No commit selected"],
  ["Author", "Unavailable"],
  ["Parents", "Unavailable"],
  ["Refs", "Unavailable"],
];

export function DetailsPanel() {
  return (
    <aside className="border-l border-slate-800 bg-slate-950 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Commit Details
      </h2>
      <div className="mt-4 space-y-3">
        {detailRows.map(([label, value]) => (
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3" key={label}>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {label}
            </div>
            <div className="mt-1 text-sm text-slate-300">{value}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

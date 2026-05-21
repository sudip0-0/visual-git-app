type GraphToolbarProps = {
  zoom: number;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function GraphToolbar({
  zoom,
  onReset,
  onZoomIn,
  onZoomOut,
}: GraphToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950/95 p-1 shadow-lg shadow-black/20">
      <button
        className="h-8 w-8 rounded border border-slate-800 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-900"
        onClick={onZoomOut}
        title="Zoom out"
        type="button"
      >
        -
      </button>
      <div className="min-w-14 text-center text-xs tabular-nums text-slate-400">
        {Math.round(zoom * 100)}%
      </div>
      <button
        className="h-8 w-8 rounded border border-slate-800 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-900"
        onClick={onZoomIn}
        title="Zoom in"
        type="button"
      >
        +
      </button>
      <button
        className="h-8 rounded border border-slate-800 px-3 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-900"
        onClick={onReset}
        type="button"
      >
        Reset
      </button>
    </div>
  );
}

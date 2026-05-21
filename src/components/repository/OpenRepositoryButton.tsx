type OpenRepositoryButtonProps = {
  isLoading: boolean;
  onOpenRepository: () => void;
};

export function OpenRepositoryButton({
  isLoading,
  onOpenRepository,
}: OpenRepositoryButtonProps) {
  return (
    <button
      className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 shadow-sm transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={onOpenRepository}
      type="button"
    >
      {isLoading ? "Opening..." : "Open Repository"}
    </button>
  );
}

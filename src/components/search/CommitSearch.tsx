import type { Ref } from "react";

type CommitSearchProps = {
  query: string;
  resultCount: number;
  inputRef?: Ref<HTMLInputElement>;
  onClearSearch: () => void;
  onSearchChange: (query: string) => void;
};

export function CommitSearch({
  query,
  resultCount,
  inputRef,
  onClearSearch,
  onSearchChange,
}: CommitSearchProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Search
        </h2>
        {query ? (
          <button
            className="text-xs text-slate-500 hover:text-slate-300"
            onClick={onClearSearch}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>
      <input
        className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-700"
        ref={inputRef}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Hash, message, author"
        type="search"
        value={query}
      />
      {query ? (
        <p className="mt-2 text-xs text-slate-500">
          {resultCount} {resultCount === 1 ? "match" : "matches"}
        </p>
      ) : null}
    </section>
  );
}

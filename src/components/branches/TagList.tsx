import type { TagInfo } from "../../types/git";

type TagListProps = {
  tags: TagInfo[];
  onSelectTag: (tag: TagInfo) => void;
};

export function TagList({ tags, onSelectTag }: TagListProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">Tags</span>
        <span className="text-slate-500">{tags.length}</span>
      </div>
      {tags.length > 0 ? (
        <ul className="max-h-40 space-y-1 overflow-auto pr-1 text-xs text-slate-300">
          {tags.map((tag) => (
            <li key={tag.name}>
              <button
                className="w-full truncate rounded border border-transparent p-1.5 text-left hover:border-slate-800 hover:bg-slate-900/50"
                disabled={!tag.target}
                onClick={() => onSelectTag(tag)}
                title={tag.target ?? "Tag target unavailable"}
                type="button"
              >
                {tag.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">No tags found.</p>
      )}
    </div>
  );
}

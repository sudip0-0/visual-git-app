import type { GraphCommitNode as GraphCommitNodeType } from "../../types/graph";

type CommitNodeProps = {
  commit: GraphCommitNodeType;
  isSelected: boolean;
  onSelectCommit: (commitId: string) => void;
};

export function CommitNode({
  commit,
  isSelected,
  onSelectCommit,
}: CommitNodeProps) {
  const refs = [
    ...commit.branchNames,
    ...commit.tagNames.map((tag) => `#${tag}`),
  ];

  return (
    <g
      className="cursor-pointer outline-none"
      onClick={() => onSelectCommit(commit.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectCommit(commit.id);
        }
      }}
      role="button"
      tabIndex={0}
      transform={`translate(${commit.x} ${commit.y})`}
    >
      <title>{commit.summary || commit.shortId}</title>
      <circle
        className={
          isSelected
            ? "fill-cyan-300 stroke-cyan-100"
            : commit.isHead
              ? "fill-emerald-300 stroke-emerald-100"
              : commit.isMerge
                ? "fill-amber-300 stroke-amber-100"
                : "fill-slate-300 stroke-slate-100"
        }
        r={isSelected ? 7 : 5.5}
        strokeWidth={2}
      />
      <text
        className={
          isSelected
            ? "select-none fill-cyan-100 text-[12px] font-medium"
            : "select-none fill-slate-300 text-[12px]"
        }
        dominantBaseline="middle"
        x={18}
        y={0}
      >
        {commit.summary || commit.shortId}
      </text>
      {refs.length > 0 ? (
        <text
          className="select-none fill-slate-500 text-[10px]"
          dominantBaseline="middle"
          x={18}
          y={16}
        >
          {refs.slice(0, 3).join("  ")}
        </text>
      ) : null}
    </g>
  );
}

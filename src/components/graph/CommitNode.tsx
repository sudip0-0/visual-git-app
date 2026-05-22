import { memo } from "react";
import type { GraphCommitNode as GraphCommitNodeType } from "../../types/graph";

type CommitNodeProps = {
  commit: GraphCommitNodeType;
  isDimmed: boolean;
  isSearchMatch: boolean;
  isSelected: boolean;
  onSelectCommit: (commitId: string) => void;
};

export const CommitNode = memo(function CommitNode({
  commit,
  isDimmed,
  isSearchMatch,
  isSelected,
  onSelectCommit,
}: CommitNodeProps) {
  const refs = [
    ...commit.branchNames,
    ...commit.tagNames.map((tag) => `#${tag}`),
  ];

  return (
    <g
      className={isDimmed ? "cursor-pointer opacity-25 outline-none" : "cursor-pointer outline-none"}
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
            : isSearchMatch
              ? "fill-fuchsia-300 stroke-fuchsia-100"
            : commit.isHead
              ? "fill-emerald-300 stroke-emerald-100"
              : commit.isMerge
                ? "fill-amber-300 stroke-amber-100"
                : "fill-slate-300 stroke-slate-100"
        }
        r={isSelected ? 7 : 5.5}
        strokeWidth={2}
      />
      {isSearchMatch && !isSelected ? (
        <circle
          className="fill-transparent stroke-fuchsia-300/60"
          r={10}
          strokeWidth={1.5}
        />
      ) : null}
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
});

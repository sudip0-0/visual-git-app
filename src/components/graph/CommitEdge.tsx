import type {
  GraphCommitNode,
  GraphEdge as GraphEdgeType,
} from "../../types/graph";

type CommitEdgeProps = {
  edge: GraphEdgeType;
  from: GraphCommitNode;
  to: GraphCommitNode;
};

export function CommitEdge({ edge, from, to }: CommitEdgeProps) {
  const midY = from.y + (to.y - from.y) / 2;
  const isMerge = edge.edgeType === "merge";
  const path =
    edge.laneFrom === edge.laneTo
      ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
      : `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;

  return (
    <path
      className={isMerge ? "stroke-amber-300/80" : "stroke-slate-500/70"}
      d={path}
      fill="none"
      strokeDasharray={isMerge ? "5 5" : undefined}
      strokeLinecap="round"
      strokeWidth={isMerge ? 2.25 : 1.75}
    />
  );
}

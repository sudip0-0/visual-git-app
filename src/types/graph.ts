import type { BranchInfo, TagInfo } from "./git";
import type { RepositorySummary } from "./repository";

export type GraphEdgeType = "parent" | "merge";

export type GraphCommitNode = {
  id: string;
  shortId: string;
  summary: string;
  authorName?: string;
  authorTime: number;
  parents: string[];
  branchNames: string[];
  tagNames: string[];
  x: number;
  y: number;
  lane: number;
  isMerge: boolean;
  isHead: boolean;
};

export type GraphEdge = {
  from: string;
  to: string;
  laneFrom: number;
  laneTo: number;
  edgeType: GraphEdgeType;
};

export type CommitGraphResponse = {
  repository: RepositorySummary;
  commits: GraphCommitNode[];
  edges: GraphEdge[];
  branches: BranchInfo[];
  tags: TagInfo[];
  head?: string;
  currentBranch?: string;
};

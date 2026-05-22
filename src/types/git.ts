export type BranchInfo = {
  name: string;
  fullName: string;
  target?: string;
  isCurrent: boolean;
  isRemote: boolean;
};

export type TagInfo = {
  name: string;
  target?: string;
};

export type CommitInfo = {
  id: string;
  shortId: string;
  message: string;
  summary: string;
  authorName?: string;
  authorEmail?: string;
  authorTime: number;
  committerName?: string;
  committerEmail?: string;
  committerTime: number;
  parents: string[];
  isMerge: boolean;
};

export type ChangedFileStatus = "ADDED" | "MODIFIED" | "DELETED" | "RENAMED";

export type ChangedFile = {
  path: string;
  previousPath?: string;
  status: ChangedFileStatus;
};

export type CommitFileDiff = {
  commitHash: string;
  path: string;
  status: ChangedFileStatus;
  isBinary: boolean;
  isTruncated: boolean;
  diffText: string;
};

export type BranchComparison = {
  baseBranch: string;
  targetBranch: string;
  ahead: number;
  behind: number;
  mergeBase?: string;
};

export type HeadInternals = {
  rawValue?: string;
  isDetached: boolean;
  currentRefPath?: string;
  currentBranch?: string;
  resolvedCommit?: string;
  refTargetCommit?: string;
  explanation: string;
};

export type CommitInternals = {
  objectType: string;
  commitHash: string;
  treeHash: string;
  parentHashes: string[];
  author?: string;
  committer?: string;
  message: string;
  objectPath: string;
  objectPathExplanation: string;
};

export type LooseCommitObject = {
  objectPath: string;
  isAvailable: boolean;
  objectType?: string;
  declaredSize?: number;
  treeHash?: string;
  parentHashes: string[];
  author?: string;
  committer?: string;
  message?: string;
  explanation: string;
};

export type GitInternals = {
  head: HeadInternals;
  selectedCommit?: CommitInternals;
  looseObject?: LooseCommitObject;
  explanations: string[];
};

export type RepositoryData = {
  branches: BranchInfo[];
  tags: TagInfo[];
  commits: CommitInfo[];
};

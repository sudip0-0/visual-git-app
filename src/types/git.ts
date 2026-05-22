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

export type RepositoryData = {
  branches: BranchInfo[];
  tags: TagInfo[];
  commits: CommitInfo[];
};

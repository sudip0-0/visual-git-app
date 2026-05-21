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

export type RepositoryData = {
  branches: BranchInfo[];
  tags: TagInfo[];
  commits: CommitInfo[];
};

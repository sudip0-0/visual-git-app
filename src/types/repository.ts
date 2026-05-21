export type RepositorySummary = {
  path: string;
  name: string;
  currentBranch?: string;
  headHash?: string;
  isBare: boolean;
  isEmpty: boolean;
  isDetached: boolean;
};

export type RecentRepository = {
  path: string;
  name: string;
  lastOpened: string;
};

export type RepositoryError = {
  code: string;
  message: string;
};

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useMemo, useState } from "react";
import type { BranchComparison, ChangedFile, CommitFileDiff } from "../types/git";
import type { RepositoryError } from "../types/repository";

function toRepositoryError(error: unknown): RepositoryError {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return {
      code:
        "code" in error && typeof error.code === "string"
          ? error.code
          : "UNKNOWN",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN",
    message: "Could not load commit details.",
  };
}

function cacheKey(commitHash: string, filePath: string) {
  return `${commitHash}:${filePath}`;
}

export function useCommitDetailsStore() {
  const [changedFilesCommitHash, setChangedFilesCommitHash] = useState<string | null>(null);
  const [changedFiles, setChangedFiles] = useState<ChangedFile[]>([]);
  const [changedFilesError, setChangedFilesError] = useState<RepositoryError | null>(null);
  const [isChangedFilesLoading, setIsChangedFilesLoading] = useState(false);

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [diffByFile, setDiffByFile] = useState<Record<string, CommitFileDiff>>({});
  const [diffError, setDiffError] = useState<RepositoryError | null>(null);
  const [isDiffLoading, setIsDiffLoading] = useState(false);

  const [branchComparison, setBranchComparison] = useState<BranchComparison | null>(null);
  const [branchComparisonError, setBranchComparisonError] = useState<RepositoryError | null>(null);
  const [isBranchComparisonLoading, setIsBranchComparisonLoading] = useState(false);

  const clear = useCallback(() => {
    setChangedFilesCommitHash(null);
    setChangedFiles([]);
    setChangedFilesError(null);
    setIsChangedFilesLoading(false);
    setSelectedFilePath(null);
    setDiffByFile({});
    setDiffError(null);
    setIsDiffLoading(false);
    setBranchComparison(null);
    setBranchComparisonError(null);
    setIsBranchComparisonLoading(false);
  }, []);

  const loadChangedFiles = useCallback(async (path: string, commitHash: string) => {
    if (changedFilesCommitHash === commitHash) {
      return changedFiles;
    }

    setIsChangedFilesLoading(true);
    setChangedFilesError(null);
    setSelectedFilePath(null);
    setDiffError(null);

    try {
      const files = await invoke<ChangedFile[]>("load_commit_changed_files", {
        path,
        commitHash,
      });

      setChangedFilesCommitHash(commitHash);
      setChangedFiles(files);
      return files;
    } catch (error) {
      const repositoryError = toRepositoryError(error);
      setChangedFilesCommitHash(commitHash);
      setChangedFiles([]);
      setChangedFilesError(repositoryError);
      throw repositoryError;
    } finally {
      setIsChangedFilesLoading(false);
    }
  }, [changedFiles, changedFilesCommitHash]);

  const loadFileDiff = useCallback(
    async (path: string, commitHash: string, filePath: string) => {
      const key = cacheKey(commitHash, filePath);

      setSelectedFilePath(filePath);
      setDiffError(null);

      if (diffByFile[key]) {
        return diffByFile[key];
      }

      setIsDiffLoading(true);
      try {
        const diff = await invoke<CommitFileDiff>("load_commit_file_diff", {
          path,
          commitHash,
          filePath,
        });
        setDiffByFile((current) => ({
          ...current,
          [key]: diff,
        }));
        return diff;
      } catch (error) {
        const repositoryError = toRepositoryError(error);
        setDiffError(repositoryError);
        throw repositoryError;
      } finally {
        setIsDiffLoading(false);
      }
    },
    [diffByFile],
  );

  const loadBranchComparison = useCallback(
    async (path: string, baseBranch: string, targetBranch: string) => {
      setIsBranchComparisonLoading(true);
      setBranchComparisonError(null);

      try {
        const comparison = await invoke<BranchComparison>("compare_branches", {
          path,
          baseBranch,
          targetBranch,
        });
        setBranchComparison(comparison);
        return comparison;
      } catch (error) {
        const repositoryError = toRepositoryError(error);
        setBranchComparison(null);
        setBranchComparisonError(repositoryError);
        throw repositoryError;
      } finally {
        setIsBranchComparisonLoading(false);
      }
    },
    [],
  );

  const selectedDiff = useMemo(() => {
    if (!changedFilesCommitHash || !selectedFilePath) {
      return null;
    }

    return diffByFile[cacheKey(changedFilesCommitHash, selectedFilePath)] ?? null;
  }, [changedFilesCommitHash, diffByFile, selectedFilePath]);

  return useMemo(
    () => ({
      branchComparison,
      branchComparisonError,
      changedFiles,
      changedFilesCommitHash,
      changedFilesError,
      diffError,
      isBranchComparisonLoading,
      isChangedFilesLoading,
      isDiffLoading,
      selectedDiff,
      selectedFilePath,
      clear,
      loadBranchComparison,
      loadChangedFiles,
      loadFileDiff,
    }),
    [
      branchComparison,
      branchComparisonError,
      changedFiles,
      changedFilesCommitHash,
      changedFilesError,
      clear,
      diffError,
      isBranchComparisonLoading,
      isChangedFilesLoading,
      isDiffLoading,
      loadBranchComparison,
      loadChangedFiles,
      loadFileDiff,
      selectedDiff,
      selectedFilePath,
    ],
  );
}

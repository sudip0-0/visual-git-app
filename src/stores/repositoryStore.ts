import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useMemo, useState } from "react";
import type { BranchInfo, CommitInfo, RepositoryData, TagInfo } from "../types/git";
import type {
  RecentRepository,
  RepositoryError,
  RepositorySummary,
} from "../types/repository";

const recentRepositoriesKey = "visual-git-app:recent-repositories";
const maxRecentRepositories = 6;

function readRecentRepositories(): RecentRepository[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(recentRepositoriesKey);
    return value ? (JSON.parse(value) as RecentRepository[]) : [];
  } catch {
    return [];
  }
}

function writeRecentRepositories(recentRepositories: RecentRepository[]) {
  try {
    window.localStorage.setItem(
      recentRepositoriesKey,
      JSON.stringify(recentRepositories),
    );
  } catch {
    // Recent repositories are a convenience cache; failing to persist them is non-fatal.
  }
}

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
    message: "Could not open this repository.",
  };
}

function updateRecentRepositories(
  recentRepositories: RecentRepository[],
  repository: RepositorySummary,
): RecentRepository[] {
  const nextRepository: RecentRepository = {
    path: repository.path,
    name: repository.name,
    lastOpened: new Date().toISOString(),
  };

  return [
    nextRepository,
    ...recentRepositories.filter((item) => item.path !== repository.path),
  ].slice(0, maxRecentRepositories);
}

export function useRepositoryStore() {
  const [repository, setRepository] = useState<RepositorySummary | null>(null);
  const [repositoryData, setRepositoryData] = useState<RepositoryData | null>(
    null,
  );
  const [recentRepositories, setRecentRepositories] = useState<
    RecentRepository[]
  >(() => readRecentRepositories());
  const [error, setError] = useState<RepositoryError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadRepositoryData = useCallback(
    async (summary: RepositorySummary) => {
      const [branches, tags, commits] = await Promise.all([
        invoke<BranchInfo[]>("list_branches", { path: summary.path }),
        invoke<TagInfo[]>("list_tags", { path: summary.path }),
        invoke<CommitInfo[]>("load_recent_commits", {
          path: summary.path,
          limit: 500,
        }),
      ]);

      setRepository(summary);
      setRepositoryData({ branches, tags, commits });

      const nextRecentRepositories = updateRecentRepositories(
        recentRepositories,
        summary,
      );
      setRecentRepositories(nextRecentRepositories);
      writeRecentRepositories(nextRecentRepositories);
    },
    [recentRepositories],
  );

  const validateRepositoryPath = useCallback(
    async (path: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const summary = await invoke<RepositorySummary>("validate_repository", {
          path,
        });
        await loadRepositoryData(summary);
      } catch (validationError) {
        setRepository(null);
        setRepositoryData(null);
        setError(toRepositoryError(validationError));
      } finally {
        setIsLoading(false);
      }
    },
    [loadRepositoryData],
  );

  const cloneRepositoryFromUrl = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const summary = await invoke<RepositorySummary>(
          "clone_repository_from_url",
          { url },
        );
        await loadRepositoryData(summary);
      } catch (cloneError) {
        setRepository(null);
        setRepositoryData(null);
        setError(toRepositoryError(cloneError));
      } finally {
        setIsLoading(false);
      }
    },
    [loadRepositoryData],
  );

  const openRepositoryPicker = useCallback(async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Open Git Repository",
      });

      if (typeof selectedPath === "string" && selectedPath.length > 0) {
        await validateRepositoryPath(selectedPath);
      }
    } catch {
      setError({
        code: "DIALOG_FAILED",
        message: "Could not open the folder picker.",
      });
    }
  }, [validateRepositoryPath]);

  const removeRecentRepository = useCallback(
    (path: string) => {
      const nextRecentRepositories = recentRepositories.filter(
        (repository) => repository.path !== path,
      );
      setRecentRepositories(nextRecentRepositories);
      writeRecentRepositories(nextRecentRepositories);
    },
    [recentRepositories],
  );

  return useMemo(
    () => ({
      repository,
      repositoryData,
      recentRepositories,
      error,
      isLoading,
      openRepositoryPicker,
      cloneRepositoryFromUrl,
      validateRepositoryPath,
      removeRecentRepository,
    }),
    [
      repository,
      repositoryData,
      recentRepositories,
      error,
      isLoading,
      openRepositoryPicker,
      cloneRepositoryFromUrl,
      validateRepositoryPath,
      removeRecentRepository,
    ],
  );
}

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useMemo, useState } from "react";
import type { CommitGraphResponse } from "../types/graph";
import type { RepositoryError } from "../types/repository";

function toGraphError(error: unknown): RepositoryError {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    const appError = error as RepositoryError;

    return {
      code: appError.code,
      message: appError.message,
    };
  }

  return {
    code: "READ_FAILURE",
    message: "Could not load this commit graph.",
  };
}

export function useGraphStore() {
  const [graph, setGraph] = useState<CommitGraphResponse | null>(null);
  const [error, setError] = useState<RepositoryError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCommitGraph = useCallback(async (path: string, limit?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextGraph = await invoke<CommitGraphResponse>("load_commit_graph", {
        path,
        limit,
      });

      setGraph(nextGraph);
      return nextGraph;
    } catch (graphError) {
      const nextError = toGraphError(graphError);

      setGraph(null);
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      graph,
      error,
      isLoading,
      loadCommitGraph,
    }),
    [error, graph, isLoading, loadCommitGraph],
  );
}

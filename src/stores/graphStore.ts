import { invoke } from "@tauri-apps/api/core";
import { useCallback, useMemo, useState } from "react";
import type { CommitGraphResponse, GraphCommitNode } from "../types/graph";
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
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
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
      setSelectedCommitId(nextGraph.commits[0]?.id ?? null);
      return nextGraph;
    } catch (graphError) {
      const nextError = toGraphError(graphError);

      setGraph(null);
      setSelectedCommitId(null);
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectCommit = useCallback((commitId: string) => {
    setSelectedCommitId(commitId);
  }, []);

  const clearGraph = useCallback(() => {
    setGraph(null);
    setSelectedCommitId(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const selectedCommit = useMemo<GraphCommitNode | null>(
    () =>
      graph?.commits.find((commit) => commit.id === selectedCommitId) ?? null,
    [graph, selectedCommitId],
  );

  return useMemo(
    () => ({
      graph,
      selectedCommit,
      selectedCommitId,
      error,
      isLoading,
      clearGraph,
      loadCommitGraph,
      selectCommit,
    }),
    [
      clearGraph,
      error,
      graph,
      isLoading,
      loadCommitGraph,
      selectCommit,
      selectedCommit,
      selectedCommitId,
    ],
  );
}

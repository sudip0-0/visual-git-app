import { invoke } from "@tauri-apps/api/core";
import { useCallback, useMemo, useState } from "react";
import type { CommitGraphResponse, GraphCommitNode } from "../types/graph";
import type { RepositoryError } from "../types/repository";
import { searchCommits } from "../utils/graphSearch";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(
    null,
  );
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
      setSearchQuery("");
      setSelectedBranchName(null);
      return nextGraph;
    } catch (graphError) {
      const nextError = toGraphError(graphError);

      setGraph(null);
      setSelectedCommitId(null);
      setSearchQuery("");
      setSelectedBranchName(null);
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
    setSearchQuery("");
    setSelectedBranchName(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const setBranchFilter = useCallback((branchName: string | null) => {
    setSelectedBranchName(branchName);
  }, []);

  const selectedCommit = useMemo<GraphCommitNode | null>(
    () =>
      graph?.commits.find((commit) => commit.id === selectedCommitId) ?? null,
    [graph, selectedCommitId],
  );

  const matchingCommits = useMemo(
    () => searchCommits(graph?.commits ?? [], searchQuery),
    [graph, searchQuery],
  );

  const visibleCommits = useMemo(() => {
    if (!graph) {
      return [];
    }

    if (!selectedBranchName) {
      return graph.commits;
    }

    const selectedBranch = graph.branches.find(
      (branch) => branch.name === selectedBranchName,
    );

    if (!selectedBranch?.target) {
      return [];
    }

    const commitsById = new Map(
      graph.commits.map((commit) => [commit.id, commit]),
    );
    const reachableIds = new Set<string>();
    const pending = [selectedBranch.target];

    while (pending.length > 0) {
      const commitId = pending.pop();

      if (!commitId || reachableIds.has(commitId)) {
        continue;
      }

      const commit = commitsById.get(commitId);

      if (!commit) {
        continue;
      }

      reachableIds.add(commitId);
      pending.push(...commit.parents);
    }

    return graph.commits.filter((commit) => reachableIds.has(commit.id));
  }, [graph, selectedBranchName]);

  const visibleCommitIds = useMemo(
    () => new Set(visibleCommits.map((commit) => commit.id)),
    [visibleCommits],
  );

  const matchingCommitIds = useMemo(
    () => new Set(matchingCommits.map((commit) => commit.id)),
    [matchingCommits],
  );

  return useMemo(
    () => ({
      graph,
      selectedCommit,
      selectedCommitId,
      searchQuery,
      matchingCommits,
      matchingCommitIds,
      selectedBranchName,
      visibleCommits,
      visibleCommitIds,
      error,
      isLoading,
      clearGraph,
      clearSearch,
      loadCommitGraph,
      setBranchFilter,
      setSearch,
      selectCommit,
    }),
    [
      clearGraph,
      clearSearch,
      error,
      graph,
      isLoading,
      matchingCommits,
      matchingCommitIds,
      loadCommitGraph,
      searchQuery,
      selectCommit,
      selectedCommit,
      selectedCommitId,
      selectedBranchName,
      setBranchFilter,
      setSearch,
      visibleCommitIds,
      visibleCommits,
    ],
  );
}

import { OpenRepositoryButton } from "../repository/OpenRepositoryButton";
import type { RepositoryData } from "../../types/git";
import type {
  RepositoryError,
  RepositorySummary,
} from "../../types/repository";

type GraphAreaProps = {
  repository: RepositorySummary | null;
  repositoryData: RepositoryData | null;
  error: RepositoryError | null;
  isLoading: boolean;
  onOpenRepository: () => void;
};

export function GraphArea({
  repository,
  repositoryData,
  error,
  isLoading,
  onOpenRepository,
}: GraphAreaProps) {
  return (
    <main className="relative overflow-hidden bg-[#0c1018]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative flex h-full min-h-[calc(100vh-3.5rem)] items-center justify-center p-8">
        <section className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-950/90 p-8 text-center shadow-2xl shadow-black/30">
          <div className="mx-auto mb-5 h-12 w-12 rounded-full border border-cyan-400/40 bg-cyan-400/10" />
          {repository ? (
            <>
              <h2 className="text-xl font-semibold text-slate-100">
                {repository.name}
              </h2>
              <p className="mt-3 break-all text-sm leading-6 text-slate-400">
                {repository.path}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Loaded {repositoryData?.commits.length ?? 0} recent commits,
                {repositoryData?.branches.length ?? 0} branches, and{" "}
                {repositoryData?.tags.length ?? 0} tags.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-100">
                Open a repository to begin
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Select a local Git repository. The app validates the folder
                without running repository files or changing Git state.
              </p>
              <div className="mt-6">
                <OpenRepositoryButton
                  isLoading={isLoading}
                  onOpenRepository={onOpenRepository}
                />
              </div>
            </>
          )}

          {error ? (
            <div className="mt-6 rounded-md border border-red-400/30 bg-red-950/40 p-3 text-left text-sm text-red-200">
              {error.message}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

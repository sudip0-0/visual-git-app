import { useState } from "react";
import {
  canSubmitGithubUrl,
  normalizeGithubUrlInput,
} from "../../utils/githubUrl";

type GithubRepositoryFormProps = {
  isLoading: boolean;
  onCloneRepository: (url: string) => Promise<void>;
};

export function GithubRepositoryForm({
  isLoading,
  onCloneRepository,
}: GithubRepositoryFormProps) {
  const [url, setUrl] = useState("");
  const canSubmit = canSubmitGithubUrl(url, isLoading);

  return (
    <form
      className="flex min-w-[360px] items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        if (!canSubmit) {
          return;
        }

        void onCloneRepository(normalizeGithubUrlInput(url));
      }}
    >
      <label className="sr-only" htmlFor="github-repository-url">
        Open from GitHub URL
      </label>
      <input
        className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 shadow-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
        id="github-repository-url"
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://github.com/owner/repo"
        type="url"
        value={url}
      />
      <button
        className="rounded-md border border-cyan-700/70 bg-cyan-950/70 px-3 py-1.5 text-sm font-medium text-cyan-100 shadow-sm transition hover:border-cyan-500 hover:bg-cyan-900/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canSubmit}
        type="submit"
      >
        {isLoading ? "Opening..." : "Open URL"}
      </button>
    </form>
  );
}

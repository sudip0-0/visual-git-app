export function normalizeGithubUrlInput(url: string): string {
  return url.trim();
}

export function canSubmitGithubUrl(url: string, isLoading: boolean): boolean {
  return normalizeGithubUrlInput(url).length > 0 && !isLoading;
}

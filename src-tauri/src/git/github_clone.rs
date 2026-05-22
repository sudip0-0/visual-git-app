use std::fs;
use std::path::{Path, PathBuf};

use git2::Repository;

use crate::errors::AppError;
use crate::git::git2_provider::Git2Provider;
use crate::git::provider::GitProvider;
use crate::models::repository::RepositorySummary;

#[derive(Debug, Clone, PartialEq, Eq)]
struct GithubRepositoryUrl {
    owner: String,
    repo: String,
    normalized_url: String,
}

pub fn clone_repository_from_url(
    url: &str,
    app_data_dir: &Path,
) -> Result<RepositorySummary, AppError> {
    let github_url = parse_github_url(url)?;
    let target_path = cached_repository_path(app_data_dir, &github_url);

    if target_path.exists() {
        if !target_path.is_dir() {
            return Err(AppError::invalid_repository(
                "A cached GitHub repository path exists but is not a folder.",
            ));
        }

        return Git2Provider::open(&target_path.to_string_lossy())?.repository_summary();
    }

    let parent = target_path
        .parent()
        .ok_or_else(|| AppError::invalid_path("Could not resolve clone cache folder."))?;
    fs::create_dir_all(parent)
        .map_err(|_| AppError::read_failure("Could not create clone cache folder."))?;

    match Repository::clone(&github_url.normalized_url, &target_path) {
        Ok(_) => Git2Provider::open(&target_path.to_string_lossy())?.repository_summary(),
        Err(error) => {
            let _ = fs::remove_dir_all(&target_path);
            Err(map_clone_error(error))
        }
    }
}

fn cached_repository_path(app_data_dir: &Path, url: &GithubRepositoryUrl) -> PathBuf {
    app_data_dir
        .join("clones")
        .join("github")
        .join(&url.owner)
        .join(&url.repo)
}

fn parse_github_url(url: &str) -> Result<GithubRepositoryUrl, AppError> {
    let trimmed = url.trim();
    let Some(path) = trimmed.strip_prefix("https://github.com/") else {
        return Err(invalid_github_url());
    };

    if path.contains('?') || path.contains('#') || path.contains('@') {
        return Err(invalid_github_url());
    }

    let path = path.strip_suffix('/').unwrap_or(path);
    let mut parts = path.split('/');
    let owner = parts.next().ok_or_else(invalid_github_url)?;
    let repo = parts.next().ok_or_else(invalid_github_url)?;

    if parts.next().is_some() {
        return Err(invalid_github_url());
    }

    let repo = repo.strip_suffix(".git").unwrap_or(repo);
    validate_safe_segment(owner)?;
    validate_safe_segment(repo)?;

    Ok(GithubRepositoryUrl {
        owner: owner.to_owned(),
        repo: repo.to_owned(),
        normalized_url: format!("https://github.com/{owner}/{repo}.git"),
    })
}

fn validate_safe_segment(segment: &str) -> Result<(), AppError> {
    if segment.is_empty()
        || segment == "."
        || segment == ".."
        || segment.chars().any(
            |character| !matches!(character, 'a'..='z' | 'A'..='Z' | '0'..='9' | '-' | '_' | '.'),
        )
    {
        return Err(invalid_github_url());
    }

    Ok(())
}

fn invalid_github_url() -> AppError {
    AppError::invalid_path(
        "Enter a public GitHub repository URL like https://github.com/owner/repo.",
    )
}

fn map_clone_error(error: git2::Error) -> AppError {
    if error.code() == git2::ErrorCode::Auth {
        return AppError::read_failure(
            "Could not clone this repository. Only public GitHub repositories are supported.",
        );
    }

    AppError::read_failure("Could not clone this public GitHub repository.")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    struct TestDir {
        path: PathBuf,
    }

    impl TestDir {
        fn new(name: &str) -> Self {
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system clock should be after Unix epoch")
                .as_nanos();
            let path = std::env::temp_dir().join(format!(
                "visual_git_app_github_clone_{name}_{}_{}",
                std::process::id(),
                timestamp
            ));

            fs::create_dir_all(&path).expect("test directory should be created");

            Self { path }
        }
    }

    impl Drop for TestDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    #[test]
    fn normalizes_public_github_url() {
        let url = parse_github_url(" https://github.com/openai/codex ").expect("url should parse");

        assert_eq!(url.owner, "openai");
        assert_eq!(url.repo, "codex");
        assert_eq!(url.normalized_url, "https://github.com/openai/codex.git");
    }

    #[test]
    fn handles_git_suffix() {
        let url =
            parse_github_url("https://github.com/openai/codex.git").expect("url should parse");

        assert_eq!(url.repo, "codex");
        assert_eq!(url.normalized_url, "https://github.com/openai/codex.git");
    }

    #[test]
    fn rejects_non_github_url() {
        let error = parse_github_url("https://gitlab.com/openai/codex")
            .expect_err("non GitHub URL should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
    }

    #[test]
    fn rejects_credentials_query_and_fragment() {
        for url in [
            "https://github.com/user:token@openai/codex",
            "https://github.com/openai/codex?tab=readme",
            "https://github.com/openai/codex#readme",
        ] {
            parse_github_url(url).expect_err("unsafe URL should fail");
        }
    }

    #[test]
    fn rejects_unsafe_path_segments() {
        for url in [
            "https://github.com/openai/../codex",
            "https://github.com/openai/",
            "https://github.com/openai/codex/extra",
            "https://github.com/open ai/codex",
        ] {
            parse_github_url(url).expect_err("unsafe path should fail");
        }
    }

    #[test]
    fn reuses_existing_cached_repository_without_cloning() {
        let test_dir = TestDir::new("cache_reuse");
        let cached_repo_path = test_dir
            .path
            .join("clones")
            .join("github")
            .join("openai")
            .join("codex");
        fs::create_dir_all(&cached_repo_path).expect("cache path should be created");
        Repository::init(&cached_repo_path).expect("cached test repository should initialize");

        let summary = clone_repository_from_url("https://github.com/openai/codex", &test_dir.path)
            .expect("cached repository should open");

        assert_eq!(summary.path, cached_repo_path.to_string_lossy());
        assert_eq!(summary.name, "codex");
    }
}

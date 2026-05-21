use std::path::PathBuf;

use crate::errors::AppError;
use crate::git::git2_provider::Git2Provider;
use crate::git::provider::GitProvider;
use crate::git::repository_validator;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

const DEFAULT_COMMIT_LIMIT: usize = 500;
const MAX_COMMIT_LIMIT: usize = 500;

pub fn validate_repository(path: String) -> Result<RepositorySummary, AppError> {
    let trimmed_path = validate_path(&path)?;

    repository_validator::validate_repository_path(PathBuf::from(trimmed_path))
}

pub fn list_branches(path: String) -> Result<Vec<BranchInfo>, AppError> {
    open_provider(path)?.branches()
}

pub fn list_tags(path: String) -> Result<Vec<TagInfo>, AppError> {
    open_provider(path)?.tags()
}

pub fn load_recent_commits(
    path: String,
    limit: Option<usize>,
) -> Result<Vec<CommitInfo>, AppError> {
    let limit = limit
        .unwrap_or(DEFAULT_COMMIT_LIMIT)
        .clamp(1, MAX_COMMIT_LIMIT);

    open_provider(path)?.recent_commits(limit)
}

fn open_provider(path: String) -> Result<Git2Provider, AppError> {
    let trimmed_path = validate_path(&path)?;

    Git2Provider::open(trimmed_path)
}

fn validate_path(path: &str) -> Result<&str, AppError> {
    let trimmed_path = path.trim();

    if trimmed_path.is_empty() {
        return Err(AppError::invalid_path("Select a repository folder first."));
    }

    Ok(trimmed_path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_empty_path() {
        let error = validate_repository("   ".to_owned()).expect_err("empty path should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
        assert_eq!(error.message, "Select a repository folder first.");
    }

    #[test]
    fn clamps_recent_commit_limit() {
        let error =
            load_recent_commits("   ".to_owned(), Some(usize::MAX)).expect_err("path should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
    }
}

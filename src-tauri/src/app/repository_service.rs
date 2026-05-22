use std::path::PathBuf;

use crate::errors::AppError;
use crate::git::git2_provider::Git2Provider;
use crate::git::github_clone;
use crate::git::loose_object_parser::LooseObjectParser;
use crate::git::provider::GitProvider;
use crate::git::repository_validator;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::compare::BranchComparison;
use crate::models::diff::{ChangedFile, CommitFileDiff};
use crate::models::internals::GitInternals;
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

const DEFAULT_COMMIT_LIMIT: usize = 500;
const MAX_COMMIT_LIMIT: usize = 500;

pub fn validate_repository(path: String) -> Result<RepositorySummary, AppError> {
    let trimmed_path = validate_path(&path)?;

    repository_validator::validate_repository_path(PathBuf::from(trimmed_path))
}

pub fn clone_repository_from_url(
    url: String,
    app_data_dir: PathBuf,
) -> Result<RepositorySummary, AppError> {
    github_clone::clone_repository_from_url(&url, &app_data_dir)
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

pub fn load_changed_files(path: String, commit_hash: String) -> Result<Vec<ChangedFile>, AppError> {
    let commit_hash = validate_non_empty(&commit_hash, "Select a commit first.")?;

    open_provider(path)?.changed_files(commit_hash)
}

pub fn load_file_diff(
    path: String,
    commit_hash: String,
    file_path: String,
) -> Result<CommitFileDiff, AppError> {
    let commit_hash = validate_non_empty(&commit_hash, "Select a commit first.")?;
    let file_path = validate_non_empty(&file_path, "Select a changed file first.")?;

    open_provider(path)?.file_diff(commit_hash, file_path)
}

pub fn compare_branches(
    path: String,
    base_branch: String,
    target_branch: String,
) -> Result<BranchComparison, AppError> {
    let base_branch = validate_non_empty(&base_branch, "Select a base branch first.")?;
    let target_branch = validate_non_empty(&target_branch, "Select a target branch first.")?;

    open_provider(path)?.compare_branches(base_branch, target_branch)
}

pub fn load_git_internals(
    path: String,
    commit_hash: Option<String>,
) -> Result<GitInternals, AppError> {
    let commit_hash = commit_hash
        .as_deref()
        .map(|hash| validate_non_empty(hash, "Select a commit first."))
        .transpose()?;
    let provider = open_provider(path)?;
    let mut internals = provider.internals(commit_hash)?;

    if let Some(hash) = commit_hash {
        internals.loose_object =
            Some(LooseObjectParser::new(provider.git_dir()).parse_commit(hash)?);
    }

    Ok(internals)
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

fn validate_non_empty<'a>(value: &'a str, message: &str) -> Result<&'a str, AppError> {
    let trimmed = value.trim();

    if trimmed.is_empty() {
        return Err(AppError::invalid_path(message));
    }

    Ok(trimmed)
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

    #[test]
    fn rejects_empty_commit_hash_for_changed_files() {
        let error = load_changed_files("repo".to_owned(), "   ".to_owned())
            .expect_err("empty commit hash should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
        assert_eq!(error.message, "Select a commit first.");
    }

    #[test]
    fn rejects_empty_file_path_for_diff() {
        let error = load_file_diff("repo".to_owned(), "abc".to_owned(), "   ".to_owned())
            .expect_err("empty file path should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
        assert_eq!(error.message, "Select a changed file first.");
    }

    #[test]
    fn rejects_empty_branches_for_compare() {
        let error = compare_branches("repo".to_owned(), "main".to_owned(), "   ".to_owned())
            .expect_err("empty branch should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
        assert_eq!(error.message, "Select a target branch first.");
    }

    #[test]
    fn rejects_empty_commit_hash_for_internals() {
        let error = load_git_internals("repo".to_owned(), Some("   ".to_owned()))
            .expect_err("empty commit hash should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
        assert_eq!(error.message, "Select a commit first.");
    }
}

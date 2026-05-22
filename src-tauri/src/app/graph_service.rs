use std::path::PathBuf;

use crate::errors::AppError;
use crate::git::git2_provider::Git2Provider;
use crate::git::provider::GitProvider;
use crate::git::repository_validator;
use crate::graph::graph_builder;
use crate::models::graph::CommitGraphResponse;

const DEFAULT_COMMIT_LIMIT: usize = 500;
const MAX_COMMIT_LIMIT: usize = 2_000;

pub fn load_commit_graph(
    path: String,
    limit: Option<usize>,
) -> Result<CommitGraphResponse, AppError> {
    let trimmed_path = validate_path(&path)?;
    repository_validator::validate_repository_path(PathBuf::from(trimmed_path))?;

    let limit = limit
        .unwrap_or(DEFAULT_COMMIT_LIMIT)
        .clamp(1, MAX_COMMIT_LIMIT);
    let provider = Git2Provider::open(trimmed_path)?;
    let repository = provider.repository_summary()?;
    let branches = provider.branches()?;
    let tags = provider.tags()?;
    let commits = provider.recent_commits(limit)?;

    Ok(graph_builder::build_commit_graph(
        repository, commits, branches, tags,
    ))
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
        let error =
            load_commit_graph("   ".to_owned(), Some(10)).expect_err("empty path should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::InvalidPath);
        assert_eq!(error.message, "Select a repository folder first.");
    }
}

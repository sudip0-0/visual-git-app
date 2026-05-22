use crate::errors::AppError;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::compare::BranchComparison;
use crate::models::diff::{ChangedFile, CommitFileDiff};
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

pub trait GitProvider: Sized {
    fn open(path: &str) -> Result<Self, AppError>;
    fn repository_summary(&self) -> Result<RepositorySummary, AppError>;
    fn branches(&self) -> Result<Vec<BranchInfo>, AppError>;
    fn tags(&self) -> Result<Vec<TagInfo>, AppError>;
    fn recent_commits(&self, limit: usize) -> Result<Vec<CommitInfo>, AppError>;
    fn changed_files(&self, commit_hash: &str) -> Result<Vec<ChangedFile>, AppError>;
    fn file_diff(&self, commit_hash: &str, file_path: &str) -> Result<CommitFileDiff, AppError>;
    fn compare_branches(
        &self,
        base_branch: &str,
        target_branch: &str,
    ) -> Result<BranchComparison, AppError>;
}

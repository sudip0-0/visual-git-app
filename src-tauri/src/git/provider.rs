use crate::errors::AppError;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

pub trait GitProvider: Sized {
    fn open(path: &str) -> Result<Self, AppError>;
    fn repository_summary(&self) -> Result<RepositorySummary, AppError>;
    fn branches(&self) -> Result<Vec<BranchInfo>, AppError>;
    fn tags(&self) -> Result<Vec<TagInfo>, AppError>;
    fn recent_commits(&self, limit: usize) -> Result<Vec<CommitInfo>, AppError>;
}

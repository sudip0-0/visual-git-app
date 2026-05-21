use crate::app::repository_service;
use crate::errors::AppError;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

#[tauri::command]
pub fn validate_repository(path: String) -> Result<RepositorySummary, AppError> {
    repository_service::validate_repository(path)
}

#[tauri::command]
pub fn list_branches(path: String) -> Result<Vec<BranchInfo>, AppError> {
    repository_service::list_branches(path)
}

#[tauri::command]
pub fn list_tags(path: String) -> Result<Vec<TagInfo>, AppError> {
    repository_service::list_tags(path)
}

#[tauri::command]
pub fn load_recent_commits(
    path: String,
    limit: Option<usize>,
) -> Result<Vec<CommitInfo>, AppError> {
    repository_service::load_recent_commits(path, limit)
}

use crate::app::repository_service;
use crate::errors::AppError;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::compare::BranchComparison;
use crate::models::diff::{ChangedFile, CommitFileDiff};
use crate::models::internals::GitInternals;
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;
use tauri::Manager;

#[tauri::command]
pub fn validate_repository(path: String) -> Result<RepositorySummary, AppError> {
    repository_service::validate_repository(path)
}

#[tauri::command]
pub fn clone_repository_from_url(
    app_handle: tauri::AppHandle,
    url: String,
) -> Result<RepositorySummary, AppError> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|_| AppError::read_failure("Could not resolve the app data folder."))?;

    repository_service::clone_repository_from_url(url, app_data_dir)
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

#[tauri::command]
pub fn load_commit_changed_files(
    path: String,
    commit_hash: String,
) -> Result<Vec<ChangedFile>, AppError> {
    repository_service::load_changed_files(path, commit_hash)
}

#[tauri::command]
pub fn load_commit_file_diff(
    path: String,
    commit_hash: String,
    file_path: String,
) -> Result<CommitFileDiff, AppError> {
    repository_service::load_file_diff(path, commit_hash, file_path)
}

#[tauri::command]
pub fn compare_branches(
    path: String,
    base_branch: String,
    target_branch: String,
) -> Result<BranchComparison, AppError> {
    repository_service::compare_branches(path, base_branch, target_branch)
}

#[tauri::command]
pub fn load_git_internals(
    path: String,
    commit_hash: Option<String>,
) -> Result<GitInternals, AppError> {
    repository_service::load_git_internals(path, commit_hash)
}

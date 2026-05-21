use crate::app::repository_service;
use crate::errors::AppError;
use crate::models::repository::RepositorySummary;

#[tauri::command]
pub fn validate_repository(path: String) -> Result<RepositorySummary, AppError> {
    repository_service::validate_repository(path)
}

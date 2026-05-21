use crate::app::graph_service;
use crate::errors::AppError;
use crate::models::graph::CommitGraphResponse;

#[tauri::command]
pub fn load_commit_graph(
    path: String,
    limit: Option<usize>,
) -> Result<CommitGraphResponse, AppError> {
    graph_service::load_commit_graph(path, limit)
}

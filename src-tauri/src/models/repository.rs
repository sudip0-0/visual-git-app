use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RepositorySummary {
    pub path: String,
    pub name: String,
    pub current_branch: Option<String>,
    pub head_hash: Option<String>,
    pub is_bare: bool,
    pub is_empty: bool,
    pub is_detached: bool,
}

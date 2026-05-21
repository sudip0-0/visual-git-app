use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BranchInfo {
    pub name: String,
    pub full_name: String,
    pub target: Option<String>,
    pub is_current: bool,
    pub is_remote: bool,
}

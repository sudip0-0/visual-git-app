use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BranchComparison {
    pub base_branch: String,
    pub target_branch: String,
    pub ahead: usize,
    pub behind: usize,
    pub merge_base: Option<String>,
}

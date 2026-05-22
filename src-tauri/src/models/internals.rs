use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitInternals {
    pub head: HeadInternals,
    pub selected_commit: Option<CommitInternals>,
    pub loose_object: Option<LooseCommitObject>,
    pub explanations: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HeadInternals {
    pub raw_value: Option<String>,
    pub is_detached: bool,
    pub current_ref_path: Option<String>,
    pub current_branch: Option<String>,
    pub resolved_commit: Option<String>,
    pub ref_target_commit: Option<String>,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitInternals {
    pub object_type: String,
    pub commit_hash: String,
    pub tree_hash: String,
    pub parent_hashes: Vec<String>,
    pub author: Option<String>,
    pub committer: Option<String>,
    pub message: String,
    pub object_path: String,
    pub object_path_explanation: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LooseCommitObject {
    pub object_path: String,
    pub is_available: bool,
    pub object_type: Option<String>,
    pub declared_size: Option<usize>,
    pub tree_hash: Option<String>,
    pub parent_hashes: Vec<String>,
    pub author: Option<String>,
    pub committer: Option<String>,
    pub message: Option<String>,
    pub explanation: String,
}

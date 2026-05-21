use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitInfo {
    pub id: String,
    pub short_id: String,
    pub message: String,
    pub summary: String,
    pub author_name: Option<String>,
    pub author_email: Option<String>,
    pub author_time: i64,
    pub committer_name: Option<String>,
    pub committer_email: Option<String>,
    pub committer_time: i64,
    pub parents: Vec<String>,
    pub is_merge: bool,
}

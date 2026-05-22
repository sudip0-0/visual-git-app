use serde::Serialize;

use crate::models::branch::BranchInfo;
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitGraphResponse {
    pub repository: RepositorySummary,
    pub commits: Vec<GraphCommitNode>,
    pub edges: Vec<GraphEdge>,
    pub branches: Vec<BranchInfo>,
    pub tags: Vec<TagInfo>,
    pub head: Option<String>,
    pub current_branch: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphCommitNode {
    pub id: String,
    pub short_id: String,
    pub message: String,
    pub summary: String,
    pub author_name: Option<String>,
    pub author_time: i64,
    pub parents: Vec<String>,
    pub branch_names: Vec<String>,
    pub tag_names: Vec<String>,
    pub x: i32,
    pub y: i32,
    pub lane: i32,
    pub is_merge: bool,
    pub is_head: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphEdge {
    pub from: String,
    pub to: String,
    pub lane_from: i32,
    pub lane_to: i32,
    pub edge_type: GraphEdgeType,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum GraphEdgeType {
    Parent,
    Merge,
}

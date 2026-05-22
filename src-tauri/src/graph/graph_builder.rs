use std::collections::{HashMap, HashSet};

use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::graph::{CommitGraphResponse, GraphCommitNode, GraphEdge, GraphEdgeType};
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

const LANE_WIDTH: i32 = 32;
const ROW_HEIGHT: i32 = 56;
const X_OFFSET: i32 = 24;
const Y_OFFSET: i32 = 24;

pub fn build_commit_graph(
    repository: RepositorySummary,
    commits: Vec<CommitInfo>,
    branches: Vec<BranchInfo>,
    tags: Vec<TagInfo>,
) -> CommitGraphResponse {
    let commit_ids = commits
        .iter()
        .map(|commit| commit.id.clone())
        .collect::<HashSet<_>>();
    let branch_names_by_commit = names_by_target(&branches, &commit_ids, |branch| {
        branch
            .target
            .as_deref()
            .map(|target| (target, branch.name.as_str()))
    });
    let tag_names_by_commit = names_by_target(&tags, &commit_ids, |tag| {
        tag.target
            .as_deref()
            .map(|target| (target, tag.name.as_str()))
    });
    let lanes_by_commit = assign_lanes(&repository, &commits, &branches);

    let nodes = commits
        .iter()
        .enumerate()
        .map(|(row, commit)| {
            let lane = *lanes_by_commit.get(&commit.id).unwrap_or(&0);

            GraphCommitNode {
                id: commit.id.clone(),
                short_id: commit.short_id.clone(),
                message: commit.message.clone(),
                summary: commit.summary.clone(),
                author_name: commit.author_name.clone(),
                author_time: commit.author_time,
                parents: commit.parents.clone(),
                branch_names: branch_names_by_commit
                    .get(&commit.id)
                    .cloned()
                    .unwrap_or_default(),
                tag_names: tag_names_by_commit
                    .get(&commit.id)
                    .cloned()
                    .unwrap_or_default(),
                x: X_OFFSET + (lane * LANE_WIDTH),
                y: Y_OFFSET + ((row as i32) * ROW_HEIGHT),
                lane,
                is_merge: commit.is_merge,
                is_head: repository.head_hash.as_deref() == Some(commit.id.as_str()),
            }
        })
        .collect::<Vec<_>>();

    let mut edges = Vec::new();

    for commit in &commits {
        let lane_from = *lanes_by_commit.get(&commit.id).unwrap_or(&0);

        for (parent_index, parent) in commit.parents.iter().enumerate() {
            if !commit_ids.contains(parent.as_str()) {
                continue;
            }

            edges.push(GraphEdge {
                from: commit.id.clone(),
                to: parent.clone(),
                lane_from,
                lane_to: *lanes_by_commit.get(parent).unwrap_or(&lane_from),
                edge_type: if commit.is_merge && parent_index > 0 {
                    GraphEdgeType::Merge
                } else {
                    GraphEdgeType::Parent
                },
            });
        }
    }

    CommitGraphResponse {
        head: repository.head_hash.clone(),
        current_branch: repository.current_branch.clone(),
        repository,
        commits: nodes,
        edges,
        branches,
        tags,
    }
}

fn names_by_target<T>(
    items: &[T],
    commit_ids: &HashSet<String>,
    target_and_name: impl Fn(&T) -> Option<(&str, &str)>,
) -> HashMap<String, Vec<String>> {
    let mut names_by_commit: HashMap<String, Vec<String>> = HashMap::new();

    for item in items {
        if let Some((target, name)) = target_and_name(item) {
            if commit_ids.contains(target) {
                names_by_commit
                    .entry(target.to_owned())
                    .or_default()
                    .push(name.to_owned());
            }
        }
    }

    for names in names_by_commit.values_mut() {
        names.sort();
    }

    names_by_commit
}

fn assign_lanes(
    repository: &RepositorySummary,
    commits: &[CommitInfo],
    branches: &[BranchInfo],
) -> HashMap<String, i32> {
    let commit_ids = commits
        .iter()
        .map(|commit| commit.id.clone())
        .collect::<HashSet<_>>();
    let mut lanes_by_commit = HashMap::new();
    let mut next_lane = 0;

    if let Some(head_hash) = repository.head_hash.as_deref() {
        if commit_ids.contains(head_hash) {
            lanes_by_commit.insert(head_hash.to_owned(), next_lane);
            next_lane += 1;
        }
    }

    let mut branch_targets = branches
        .iter()
        .filter_map(|branch| {
            branch
                .target
                .as_ref()
                .filter(|target| commit_ids.contains(target.as_str()))
                .map(|target| (branch.is_current, branch.name.as_str(), target.as_str()))
        })
        .collect::<Vec<_>>();

    branch_targets.sort_by(|left, right| {
        right
            .0
            .cmp(&left.0)
            .then_with(|| left.1.cmp(right.1))
            .then_with(|| left.2.cmp(right.2))
    });

    for (_, _, target) in branch_targets {
        if !lanes_by_commit.contains_key(target) {
            lanes_by_commit.insert(target.to_owned(), next_lane);
            next_lane += 1;
        }
    }

    for commit in commits {
        let lane = if let Some(lane) = lanes_by_commit.get(&commit.id) {
            *lane
        } else {
            let lane = next_lane;
            lanes_by_commit.insert(commit.id.clone(), lane);
            next_lane += 1;
            lane
        };

        for (parent_index, parent) in commit.parents.iter().enumerate() {
            if !commit_ids.contains(parent.as_str()) || lanes_by_commit.contains_key(parent) {
                continue;
            }

            if parent_index == 0 {
                lanes_by_commit.insert(parent.clone(), lane);
            } else {
                lanes_by_commit.insert(parent.clone(), next_lane);
                next_lane += 1;
            }
        }
    }

    lanes_by_commit
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_linear_history_in_one_lane() {
        let parent = commit("a", &[]);
        let child = commit("b", &[&parent.id]);

        let graph = build_commit_graph(
            repository(Some(&child.id), Some("main")),
            vec![child.clone(), parent.clone()],
            vec![branch("main", &child.id, true)],
            vec![],
        );

        assert_eq!(graph.commits.len(), 2);
        assert_eq!(graph.edges.len(), 1);
        assert!(graph.commits.iter().all(|node| node.lane == 0));
        assert_eq!(graph.commits[0].y, 24);
        assert_eq!(graph.commits[1].y, 80);
        assert_eq!(graph.edges[0].from, child.id);
        assert_eq!(graph.edges[0].to, parent.id);
        assert_eq!(graph.edges[0].edge_type, GraphEdgeType::Parent);
    }

    #[test]
    fn assigns_branch_history_to_separate_lane() {
        let base = commit("a", &[]);
        let main = commit("b", &[&base.id]);
        let feature = commit("c", &[&base.id]);

        let graph = build_commit_graph(
            repository(Some(&main.id), Some("main")),
            vec![main.clone(), feature.clone(), base.clone()],
            vec![
                branch("feature/demo", &feature.id, false),
                branch("main", &main.id, true),
            ],
            vec![],
        );

        let main_node = node(&graph, &main.id);
        let feature_node = node(&graph, &feature.id);
        let base_node = node(&graph, &base.id);

        assert_eq!(main_node.lane, 0);
        assert_ne!(feature_node.lane, main_node.lane);
        assert_eq!(base_node.lane, main_node.lane);
        assert_eq!(main_node.branch_names, vec!["main"]);
        assert_eq!(feature_node.branch_names, vec!["feature/demo"]);
        assert!(base_node.branch_names.is_empty());
        assert_eq!(feature_node.x, 24 + (feature_node.lane * 32));
    }

    #[test]
    fn marks_merge_edges() {
        let base = commit("a", &[]);
        let main = commit("b", &[&base.id]);
        let feature = commit("c", &[&base.id]);
        let merge = commit("d", &[&main.id, &feature.id]);

        let graph = build_commit_graph(
            repository(Some(&merge.id), Some("main")),
            vec![merge.clone(), main.clone(), feature.clone(), base.clone()],
            vec![branch("main", &merge.id, true)],
            vec![],
        );

        let merge_edges = graph
            .edges
            .iter()
            .filter(|edge| edge.from == merge.id)
            .collect::<Vec<_>>();

        assert_eq!(merge_edges.len(), 2);
        assert!(merge_edges
            .iter()
            .any(|edge| edge.to == main.id && edge.edge_type == GraphEdgeType::Parent));
        assert!(merge_edges
            .iter()
            .any(|edge| edge.to == feature.id && edge.edge_type == GraphEdgeType::Merge));
        assert_ne!(node(&graph, &feature.id).lane, node(&graph, &main.id).lane);
    }

    #[test]
    fn maps_tags_to_matching_commit() {
        let first = commit("a", &[]);
        let second = commit("b", &[&first.id]);

        let graph = build_commit_graph(
            repository(Some(&second.id), Some("main")),
            vec![second.clone(), first.clone()],
            vec![branch("main", &second.id, true)],
            vec![tag("v1.0.0", &first.id)],
        );

        assert_eq!(node(&graph, &first.id).tag_names, vec!["v1.0.0"]);
        assert!(node(&graph, &second.id).tag_names.is_empty());
    }

    #[test]
    fn marks_head_commit() {
        let first = commit("a", &[]);
        let second = commit("b", &[&first.id]);

        let graph = build_commit_graph(
            repository(Some(&second.id), Some("main")),
            vec![second.clone(), first.clone()],
            vec![branch("main", &second.id, true)],
            vec![],
        );

        assert!(node(&graph, &second.id).is_head);
        assert!(!node(&graph, &first.id).is_head);
        assert_eq!(node(&graph, &second.id).branch_names, vec!["main"]);
    }

    #[test]
    fn keeps_layout_deterministic() {
        let base = commit("a", &[]);
        let main = commit("b", &[&base.id]);
        let feature = commit("c", &[&base.id]);
        let merge = commit("d", &[&main.id, &feature.id]);
        let commits = vec![merge.clone(), main.clone(), feature.clone(), base.clone()];
        let branches = vec![
            branch("feature/demo", &feature.id, false),
            branch("main", &merge.id, true),
        ];

        let first_graph = build_commit_graph(
            repository(Some(&merge.id), Some("main")),
            commits.clone(),
            branches.clone(),
            vec![tag("v1.0.0", &base.id)],
        );
        let second_graph = build_commit_graph(
            repository(Some(&merge.id), Some("main")),
            commits,
            branches,
            vec![tag("v1.0.0", &base.id)],
        );

        let first_nodes = first_graph
            .commits
            .iter()
            .map(|node| {
                (
                    node.id.as_str(),
                    node.message.clone(),
                    node.x,
                    node.y,
                    node.lane,
                    node.branch_names.clone(),
                    node.tag_names.clone(),
                )
            })
            .collect::<Vec<_>>();
        let second_nodes = second_graph
            .commits
            .iter()
            .map(|node| {
                (
                    node.id.as_str(),
                    node.message.clone(),
                    node.x,
                    node.y,
                    node.lane,
                    node.branch_names.clone(),
                    node.tag_names.clone(),
                )
            })
            .collect::<Vec<_>>();

        assert_eq!(first_nodes, second_nodes);
        assert_eq!(first_graph.edges, second_graph.edges);
    }

    fn node<'a>(graph: &'a CommitGraphResponse, id: &str) -> &'a GraphCommitNode {
        graph
            .commits
            .iter()
            .find(|node| node.id == id)
            .expect("node should exist")
    }

    fn commit(id: &str, parents: &[&str]) -> CommitInfo {
        CommitInfo {
            id: id.to_owned(),
            short_id: id.to_owned(),
            message: format!("Commit {id}"),
            summary: format!("Commit {id}"),
            author_name: Some("Author".to_owned()),
            author_email: Some("author@example.invalid".to_owned()),
            author_time: 1,
            committer_name: Some("Committer".to_owned()),
            committer_email: Some("committer@example.invalid".to_owned()),
            committer_time: 1,
            parents: parents.iter().map(|parent| (*parent).to_owned()).collect(),
            is_merge: parents.len() > 1,
        }
    }

    fn branch(name: &str, target: &str, is_current: bool) -> BranchInfo {
        BranchInfo {
            name: name.to_owned(),
            full_name: format!("refs/heads/{name}"),
            target: Some(target.to_owned()),
            is_current,
            is_remote: false,
        }
    }

    fn tag(name: &str, target: &str) -> TagInfo {
        TagInfo {
            name: name.to_owned(),
            target: Some(target.to_owned()),
        }
    }

    fn repository(head_hash: Option<&str>, current_branch: Option<&str>) -> RepositorySummary {
        RepositorySummary {
            path: "C:\\test-repo".to_owned(),
            name: "test-repo".to_owned(),
            current_branch: current_branch.map(str::to_owned),
            head_hash: head_hash.map(str::to_owned),
            is_bare: false,
            is_empty: false,
            is_detached: current_branch.is_none(),
        }
    }
}

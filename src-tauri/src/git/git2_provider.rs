use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use git2::{BranchType, Delta, DiffFindOptions, DiffOptions, Oid, Patch, Repository, Sort};

use crate::errors::AppError;
use crate::git::provider::GitProvider;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::compare::BranchComparison;
use crate::models::diff::{ChangedFile, ChangedFileStatus, CommitFileDiff};
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

pub struct Git2Provider {
    repo: Repository,
    path: PathBuf,
}

const MAX_RENDERED_DIFF_BYTES: usize = 200_000;
const MAX_DIFF_BLOB_BYTES: i64 = 1_000_000;

impl GitProvider for Git2Provider {
    fn open(path: &str) -> Result<Self, AppError> {
        let path = PathBuf::from(path);
        let metadata = fs::metadata(&path).map_err(map_metadata_error)?;

        if !metadata.is_dir() {
            return Err(AppError::invalid_path("Select a folder, not a file."));
        }

        let repo = Repository::open_ext(
            &path,
            git2::RepositoryOpenFlags::NO_SEARCH,
            Vec::<PathBuf>::new(),
        )
        .map_err(map_git_open_error)?;

        Ok(Self { repo, path })
    }

    fn repository_summary(&self) -> Result<RepositorySummary, AppError> {
        Ok(RepositorySummary {
            path: self.path.to_string_lossy().into_owned(),
            name: repository_name(&self.path),
            current_branch: current_branch(&self.repo),
            head_hash: head_hash(&self.repo),
            is_bare: self.repo.is_bare(),
            is_empty: self.repo.is_empty().unwrap_or(false),
            is_detached: self.repo.head_detached().unwrap_or(false),
        })
    }

    fn branches(&self) -> Result<Vec<BranchInfo>, AppError> {
        let mut branches = Vec::new();

        for branch_result in self.repo.branches(None).map_err(map_git_read_error)? {
            let (branch, branch_type) = branch_result.map_err(map_git_read_error)?;
            let name = branch
                .name()
                .map_err(map_git_read_error)?
                .unwrap_or("Unnamed branch")
                .to_owned();
            let reference = branch.get();
            let full_name = reference.name().unwrap_or(&name).to_owned();
            let target = reference.target().map(|target| target.to_string());

            branches.push(BranchInfo {
                name,
                full_name,
                target,
                is_current: branch.is_head(),
                is_remote: branch_type == BranchType::Remote,
            });
        }

        branches.sort_by(|left, right| {
            left.is_remote
                .cmp(&right.is_remote)
                .then_with(|| left.name.cmp(&right.name))
        });

        Ok(branches)
    }

    fn tags(&self) -> Result<Vec<TagInfo>, AppError> {
        let tag_names = self.repo.tag_names(None).map_err(map_git_read_error)?;
        let mut tags = Vec::new();

        for name in tag_names.iter().flatten() {
            tags.push(TagInfo {
                name: name.to_owned(),
                target: tag_target(&self.repo, name),
            });
        }

        tags.sort_by(|left, right| left.name.cmp(&right.name));

        Ok(tags)
    }

    fn recent_commits(&self, limit: usize) -> Result<Vec<CommitInfo>, AppError> {
        if self.repo.is_empty().unwrap_or(false) {
            return Ok(Vec::new());
        }

        let mut revwalk = self.repo.revwalk().map_err(map_git_read_error)?;
        match revwalk.push_head() {
            Ok(()) => {}
            Err(error) if error.code() == git2::ErrorCode::UnbornBranch => return Ok(Vec::new()),
            Err(error) if error.code() == git2::ErrorCode::NotFound => return Ok(Vec::new()),
            Err(error) => return Err(map_git_read_error(error)),
        }

        revwalk
            .set_sorting(Sort::TIME | Sort::TOPOLOGICAL)
            .map_err(map_git_read_error)?;

        let mut commits = Vec::new();
        for oid_result in revwalk.take(limit) {
            let oid = oid_result.map_err(map_git_read_error)?;
            let commit = self.repo.find_commit(oid).map_err(map_git_read_error)?;
            let parents = commit
                .parent_ids()
                .map(|parent_id| parent_id.to_string())
                .collect::<Vec<_>>();
            let id = commit.id().to_string();
            let short_id = id.chars().take(12).collect::<String>();
            let author = commit.author();
            let committer = commit.committer();

            commits.push(CommitInfo {
                id,
                short_id,
                message: commit.message().unwrap_or("").to_owned(),
                summary: commit.summary().unwrap_or("").to_owned(),
                author_name: author.name().map(str::to_owned),
                author_email: author.email().map(str::to_owned),
                author_time: author.when().seconds(),
                committer_name: committer.name().map(str::to_owned),
                committer_email: committer.email().map(str::to_owned),
                committer_time: committer.when().seconds(),
                is_merge: parents.len() > 1,
                parents,
            });
        }

        Ok(commits)
    }

    fn changed_files(&self, commit_hash: &str) -> Result<Vec<ChangedFile>, AppError> {
        let commit = self.find_commit(commit_hash)?;
        let (base_tree, target_tree) = self.commit_trees(&commit)?;
        let mut diff_options = DiffOptions::new();
        let mut diff = self
            .repo
            .diff_tree_to_tree(
                base_tree.as_ref(),
                Some(&target_tree),
                Some(&mut diff_options),
            )
            .map_err(map_git_read_error)?;

        let mut find_options = DiffFindOptions::new();
        find_options.renames(true);
        let _ = diff.find_similar(Some(&mut find_options));

        let mut changed_files = Vec::new();
        for delta in diff.deltas() {
            let status = map_delta_status(delta.status());
            if status.is_none() {
                continue;
            }

            let old_path = delta.old_file().path().map(path_to_string);
            let new_path = delta.new_file().path().map(path_to_string);
            let path = preferred_path(delta.status(), old_path.as_deref(), new_path.as_deref());

            changed_files.push(ChangedFile {
                path,
                previous_path: if delta.status() == Delta::Renamed {
                    old_path
                } else {
                    None
                },
                status: status.expect("status checked above"),
            });
        }

        Ok(changed_files)
    }

    fn file_diff(&self, commit_hash: &str, file_path: &str) -> Result<CommitFileDiff, AppError> {
        let normalized_path = normalize_pathspec(file_path)?;
        let commit = self.find_commit(commit_hash)?;
        let (base_tree, target_tree) = self.commit_trees(&commit)?;

        let mut diff_options = DiffOptions::new();
        diff_options
            .context_lines(3)
            .max_size(MAX_DIFF_BLOB_BYTES)
            .pathspec(&normalized_path);
        let mut diff = self
            .repo
            .diff_tree_to_tree(
                base_tree.as_ref(),
                Some(&target_tree),
                Some(&mut diff_options),
            )
            .map_err(map_git_read_error)?;

        let mut find_options = DiffFindOptions::new();
        find_options.renames(true);
        let _ = diff.find_similar(Some(&mut find_options));

        let mut matching_delta_index: Option<usize> = None;
        let mut normalized_status = ChangedFileStatus::Modified;
        let mut is_binary = false;

        for (index, delta) in diff.deltas().enumerate() {
            let old_path = delta.old_file().path().map(path_to_string);
            let new_path = delta.new_file().path().map(path_to_string);
            let old_matches = old_path.as_deref() == Some(normalized_path.as_str());
            let new_matches = new_path.as_deref() == Some(normalized_path.as_str());

            if !(old_matches || new_matches) {
                continue;
            }

            matching_delta_index = Some(index);
            normalized_status =
                map_delta_status(delta.status()).unwrap_or(ChangedFileStatus::Modified);
            is_binary = delta.flags().is_binary()
                || delta.old_file().is_binary()
                || delta.new_file().is_binary()
                || self.diff_file_blob_is_binary(delta.old_file())?
                || self.diff_file_blob_is_binary(delta.new_file())?;
            break;
        }

        let Some(delta_index) = matching_delta_index else {
            return Err(AppError::read_failure("Could not load diff for this file."));
        };

        if is_binary {
            return Ok(CommitFileDiff {
                commit_hash: commit.id().to_string(),
                path: normalized_path,
                status: normalized_status,
                is_binary: true,
                is_truncated: false,
                diff_text: "Binary file diff is not shown.".to_owned(),
            });
        }

        let Some(mut patch) = Patch::from_diff(&diff, delta_index).map_err(map_git_read_error)?
        else {
            return Ok(CommitFileDiff {
                commit_hash: commit.id().to_string(),
                path: normalized_path,
                status: normalized_status,
                is_binary: false,
                is_truncated: false,
                diff_text: "No textual diff available.".to_owned(),
            });
        };

        let diff_buf = patch.to_buf().map_err(map_git_read_error)?;
        let mut diff_text = String::from_utf8_lossy(&diff_buf).into_owned();
        let original_len = diff_text.len();
        let is_truncated = original_len > MAX_RENDERED_DIFF_BYTES;

        if is_truncated {
            truncate_diff_text(&mut diff_text, MAX_RENDERED_DIFF_BYTES);
        }

        Ok(CommitFileDiff {
            commit_hash: commit.id().to_string(),
            path: normalized_path,
            status: normalized_status,
            is_binary: false,
            is_truncated,
            diff_text,
        })
    }

    fn compare_branches(
        &self,
        base_branch: &str,
        target_branch: &str,
    ) -> Result<BranchComparison, AppError> {
        let base_name = normalize_branch_name(base_branch)?;
        let target_name = normalize_branch_name(target_branch)?;

        let base_oid = self.resolve_branch_to_oid(base_name)?;
        let target_oid = self.resolve_branch_to_oid(target_name)?;
        let (ahead, behind) = self
            .repo
            .graph_ahead_behind(target_oid, base_oid)
            .map_err(map_git_read_error)?;
        let merge_base = self
            .repo
            .merge_base(base_oid, target_oid)
            .ok()
            .map(|oid| oid.to_string());

        Ok(BranchComparison {
            base_branch: base_name.to_owned(),
            target_branch: target_name.to_owned(),
            ahead,
            behind,
            merge_base,
        })
    }
}

impl Git2Provider {
    fn find_commit(&self, commit_hash: &str) -> Result<git2::Commit<'_>, AppError> {
        let oid = Oid::from_str(commit_hash.trim())
            .map_err(|_| AppError::invalid_path("Invalid commit hash."))?;
        self.repo.find_commit(oid).map_err(map_git_read_error)
    }

    fn commit_trees<'a>(
        &'a self,
        commit: &git2::Commit<'a>,
    ) -> Result<(Option<git2::Tree<'a>>, git2::Tree<'a>), AppError> {
        let target_tree = commit.tree().map_err(map_git_read_error)?;
        let base_tree = if commit.parent_count() == 0 {
            None
        } else {
            Some(
                commit
                    .parent(0)
                    .map_err(map_git_read_error)?
                    .tree()
                    .map_err(map_git_read_error)?,
            )
        };

        Ok((base_tree, target_tree))
    }

    fn resolve_branch_to_oid(&self, branch_name: &str) -> Result<Oid, AppError> {
        let shorthand_reference = format!("refs/heads/{branch_name}");
        let remote_reference = format!("refs/remotes/{branch_name}");
        let reference = self
            .repo
            .find_reference(&shorthand_reference)
            .or_else(|_| self.repo.find_reference(&remote_reference))
            .or_else(|_| self.repo.find_reference(branch_name))
            .map_err(map_git_read_error)?;

        reference
            .peel_to_commit()
            .map(|commit| commit.id())
            .map_err(map_git_read_error)
    }

    fn diff_file_blob_is_binary(&self, file: git2::DiffFile<'_>) -> Result<bool, AppError> {
        if file.id().is_zero() || file.size() > MAX_DIFF_BLOB_BYTES as u64 {
            return Ok(false);
        }

        match self.repo.find_blob(file.id()) {
            Ok(blob) => Ok(blob.is_binary()),
            Err(error) if error.code() == git2::ErrorCode::NotFound => Ok(false),
            Err(error) => Err(map_git_read_error(error)),
        }
    }
}

fn repository_name(path: &Path) -> String {
    path.file_name()
        .and_then(|name| name.to_str())
        .filter(|name| !name.is_empty())
        .unwrap_or("Repository")
        .to_owned()
}

fn current_branch(repo: &Repository) -> Option<String> {
    repo.head()
        .ok()
        .filter(|head| head.is_branch())
        .and_then(|head| head.shorthand().map(str::to_owned))
}

fn head_hash(repo: &Repository) -> Option<String> {
    repo.head().ok().and_then(|head| {
        head.target().map(|target| target.to_string()).or_else(|| {
            head.peel_to_commit()
                .ok()
                .map(|commit| commit.id().to_string())
        })
    })
}

fn tag_target(repo: &Repository, name: &str) -> Option<String> {
    let reference_name = format!("refs/tags/{name}");
    let reference = repo.find_reference(&reference_name).ok()?;

    reference
        .peel_to_commit()
        .ok()
        .map(|commit| commit.id().to_string())
        .or_else(|| reference.target().map(|target| target.to_string()))
}

fn normalize_pathspec(path: &str) -> Result<String, AppError> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err(AppError::invalid_path("Select a changed file first."));
    }

    Ok(trimmed.replace('\\', "/"))
}

fn normalize_branch_name(name: &str) -> Result<&str, AppError> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err(AppError::invalid_path("Select both branches first."));
    }

    Ok(trimmed)
}

fn path_to_string(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn preferred_path(status: Delta, old_path: Option<&str>, new_path: Option<&str>) -> String {
    match status {
        Delta::Deleted => old_path.or(new_path).unwrap_or("Unknown path").to_owned(),
        _ => new_path.or(old_path).unwrap_or("Unknown path").to_owned(),
    }
}

fn map_delta_status(status: Delta) -> Option<ChangedFileStatus> {
    match status {
        Delta::Added => Some(ChangedFileStatus::Added),
        Delta::Modified => Some(ChangedFileStatus::Modified),
        Delta::Deleted => Some(ChangedFileStatus::Deleted),
        Delta::Renamed => Some(ChangedFileStatus::Renamed),
        _ => None,
    }
}

fn truncate_diff_text(diff_text: &mut String, max_bytes: usize) {
    let mut truncate_at = max_bytes.min(diff_text.len());
    while !diff_text.is_char_boundary(truncate_at) {
        truncate_at -= 1;
    }

    diff_text.truncate(truncate_at);
    diff_text.push_str("\n\n[diff truncated for safety]");
}

fn map_metadata_error(error: io::Error) -> AppError {
    match error.kind() {
        io::ErrorKind::NotFound => AppError::invalid_path("The selected folder does not exist."),
        io::ErrorKind::PermissionDenied => {
            AppError::permission_denied("Permission denied while reading the selected folder.")
        }
        _ => AppError::read_failure("Could not read the selected folder."),
    }
}

fn map_git_open_error(error: git2::Error) -> AppError {
    match error.code() {
        git2::ErrorCode::NotFound => {
            AppError::invalid_repository("This folder is not a Git repository.")
        }
        git2::ErrorCode::BareRepo => {
            AppError::invalid_repository("Bare repositories are not supported yet.")
        }
        _ if error.message().to_ascii_lowercase().contains("permission") => {
            AppError::permission_denied("Permission denied while reading this repository.")
        }
        _ => AppError::read_failure("Could not read this Git repository."),
    }
}

fn map_git_read_error(error: git2::Error) -> AppError {
    if error.message().to_ascii_lowercase().contains("permission") {
        AppError::permission_denied("Permission denied while reading this repository.")
    } else {
        AppError::read_failure("Could not read this Git repository.")
    }
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    use git2::{Oid, Repository, Signature};

    use crate::models::diff::ChangedFileStatus;

    use super::{Git2Provider, GitProvider};

    struct TestDir {
        path: PathBuf,
    }

    impl TestDir {
        fn new(name: &str) -> Self {
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system clock should be after Unix epoch")
                .as_nanos();
            let path = std::env::temp_dir().join(format!(
                "visual_git_app_provider_{name}_{}_{}",
                std::process::id(),
                timestamp
            ));

            fs::create_dir_all(&path).expect("test directory should be created");

            Self { path }
        }
    }

    impl Drop for TestDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    #[test]
    fn reads_empty_repository_summary() {
        let test_dir = TestDir::new("empty_summary");
        Repository::init(&test_dir.path).expect("test repository should initialize");

        let provider = open_provider(&test_dir.path);
        let summary = provider
            .repository_summary()
            .expect("summary should be readable");

        assert!(summary.is_empty);
        assert!(summary.head_hash.is_none());
        assert!(summary.current_branch.is_none());
        assert!(!summary.is_detached);
    }

    #[test]
    fn reads_detached_head_summary() {
        let test_dir = TestDir::new("detached_summary");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let commit_id = create_commit(&repo, "Initial commit", &[]);
        repo.set_head_detached(commit_id)
            .expect("test repository should detach HEAD");
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let summary = provider
            .repository_summary()
            .expect("summary should be readable");

        assert!(summary.is_detached);
        assert!(summary.current_branch.is_none());
        assert_eq!(
            summary.head_hash.as_deref(),
            Some(commit_id.to_string().as_str())
        );
    }

    #[test]
    fn lists_local_and_remote_branches() {
        let test_dir = TestDir::new("branches");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let commit_id = create_commit(&repo, "Initial commit", &[]);
        let commit = repo
            .find_commit(commit_id)
            .expect("test commit should be readable");
        repo.branch("feature/test", &commit, false)
            .expect("local test branch should be created");
        repo.reference(
            "refs/remotes/origin/main",
            commit_id,
            false,
            "test remote branch",
        )
        .expect("remote test branch should be created");
        drop(commit);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let branches = provider.branches().expect("branches should be readable");

        assert!(branches
            .iter()
            .any(|branch| branch.name == "feature/test" && !branch.is_remote));
        assert!(branches
            .iter()
            .any(|branch| branch.name == "origin/main" && branch.is_remote));
        assert!(branches.iter().any(|branch| branch.is_current));
        assert!(branches
            .iter()
            .any(|branch| branch.target.as_deref() == Some(&commit_id.to_string())));
    }

    #[test]
    fn lists_lightweight_and_annotated_tags() {
        let test_dir = TestDir::new("tags");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let commit_id = create_commit(&repo, "Initial commit", &[]);
        let commit = repo
            .find_commit(commit_id)
            .expect("test commit should be readable");
        let signature = signature();
        repo.tag_lightweight("v1.0.0", commit.as_object(), false)
            .expect("lightweight tag should be created");
        repo.tag(
            "v1.0.1",
            commit.as_object(),
            &signature,
            "Annotated release",
            false,
        )
        .expect("annotated tag should be created");
        drop(commit);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let tags = provider.tags().expect("tags should be readable");

        assert!(tags.iter().any(
            |tag| tag.name == "v1.0.0" && tag.target.as_deref() == Some(&commit_id.to_string())
        ));
        assert!(tags.iter().any(
            |tag| tag.name == "v1.0.1" && tag.target.as_deref() == Some(&commit_id.to_string())
        ));
    }

    #[test]
    fn loads_recent_commits_with_parent_hashes() {
        let test_dir = TestDir::new("linear_commits");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let first_id = create_commit(&repo, "First commit", &[]);
        let first = repo
            .find_commit(first_id)
            .expect("first commit should be readable");
        let second_id = create_commit(&repo, "Second commit", &[&first]);
        drop(first);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let commits = provider
            .recent_commits(10)
            .expect("recent commits should be readable");

        let second = commits
            .iter()
            .find(|commit| commit.id == second_id.to_string())
            .expect("second commit should be returned");

        assert_eq!(commits.len(), 2);
        assert_eq!(second.parents, vec![first_id.to_string()]);
        assert!(!second.is_merge);
    }

    #[test]
    fn marks_merge_commits() {
        let test_dir = TestDir::new("merge_commits");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let first_id = create_commit(&repo, "First commit", &[]);
        let first = repo
            .find_commit(first_id)
            .expect("first commit should be readable");
        let second_id = create_commit(&repo, "Second commit", &[&first]);
        let second = repo
            .find_commit(second_id)
            .expect("second commit should be readable");
        repo.set_head_detached(first_id)
            .expect("test repository should move to first commit");
        let third_id = create_commit(&repo, "Third commit", &[&first]);
        let third = repo
            .find_commit(third_id)
            .expect("third commit should be readable");
        repo.set_head_detached(second_id)
            .expect("test repository should move to second commit");
        let merge_id = create_commit(&repo, "Merge commit", &[&second, &third]);
        drop(first);
        drop(second);
        drop(third);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let commits = provider
            .recent_commits(10)
            .expect("recent commits should be readable");
        let merge = commits
            .iter()
            .find(|commit| commit.id == merge_id.to_string())
            .expect("merge commit should be returned");

        assert!(merge.is_merge);
        assert_eq!(merge.parents.len(), 2);
    }

    #[test]
    fn returns_no_commits_for_empty_repository() {
        let test_dir = TestDir::new("empty_commits");
        Repository::init(&test_dir.path).expect("test repository should initialize");

        let provider = open_provider(&test_dir.path);
        let commits = provider
            .recent_commits(10)
            .expect("empty repository should be readable");

        assert!(commits.is_empty());
    }

    #[test]
    fn reads_changed_files_with_statuses() {
        let test_dir = TestDir::new("changed_files");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let first_id = create_commit(&repo, "First commit", &[]);
        let first = repo
            .find_commit(first_id)
            .expect("first commit should be readable");

        fs::write(repo.workdir().unwrap().join("notes.txt"), "v2")
            .expect("updated file should be written");
        let second_id =
            create_commit_with_changes(&repo, "Second commit", &[&first], &["notes.txt"], &[], &[]);
        drop(first);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let changed_files = provider
            .changed_files(&second_id.to_string())
            .expect("changed files should be readable");

        assert!(changed_files.iter().any(
            |file| file.path == "notes.txt" && matches!(file.status, ChangedFileStatus::Added)
        ));
    }

    #[test]
    fn loads_text_diff_for_selected_file() {
        let test_dir = TestDir::new("file_diff");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let first_id = create_commit(&repo, "First commit", &[]);
        let first = repo
            .find_commit(first_id)
            .expect("first commit should be readable");

        fs::write(repo.workdir().unwrap().join("notes.txt"), "hello\nworld\n")
            .expect("initial file should be written");
        let second_id =
            create_commit_with_changes(&repo, "Second commit", &[&first], &["notes.txt"], &[], &[]);
        drop(first);

        let second = repo
            .find_commit(second_id)
            .expect("second commit should be readable");
        fs::write(repo.workdir().unwrap().join("notes.txt"), "hello\nworld!\n")
            .expect("updated file should be written");
        let third_id =
            create_commit_with_changes(&repo, "Third commit", &[&second], &["notes.txt"], &[], &[]);
        drop(second);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let diff = provider
            .file_diff(&third_id.to_string(), "notes.txt")
            .expect("file diff should load");

        assert!(!diff.is_binary);
        assert!(!diff.diff_text.is_empty());
        assert!(diff.diff_text.contains("notes.txt"));
    }

    #[test]
    fn handles_binary_file_diff_safely() {
        let test_dir = TestDir::new("binary_diff");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let first_id = create_commit(&repo, "First commit", &[]);
        let first = repo
            .find_commit(first_id)
            .expect("first commit should be readable");

        fs::write(
            repo.workdir().unwrap().join("asset.bin"),
            [0_u8, 1, 2, 3, 0, 4, 5, 6],
        )
        .expect("binary file should be written");
        let second_id =
            create_commit_with_changes(&repo, "Second commit", &[&first], &["asset.bin"], &[], &[]);
        drop(first);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let diff = provider
            .file_diff(&second_id.to_string(), "asset.bin")
            .expect("binary diff should load");

        assert!(diff.is_binary);
        assert_eq!(diff.diff_text, "Binary file diff is not shown.");
    }

    #[test]
    fn truncates_large_diff_text_on_char_boundary() {
        let mut diff_text = format!("a{}", "é".repeat(100_000));

        assert!(!diff_text.is_char_boundary(super::MAX_RENDERED_DIFF_BYTES));

        super::truncate_diff_text(&mut diff_text, super::MAX_RENDERED_DIFF_BYTES);

        assert!(diff_text.ends_with("[diff truncated for safety]"));
        assert!(diff_text.starts_with(&format!("a{}", "é".repeat(99_999))));
    }

    #[test]
    fn compares_branches_with_ahead_behind_counts() {
        let test_dir = TestDir::new("compare_branches");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let first_id = create_commit(&repo, "First commit", &[]);
        let first = repo
            .find_commit(first_id)
            .expect("first commit should be readable");
        repo.branch("feature/test", &first, false)
            .expect("feature branch should be created");

        fs::write(repo.workdir().unwrap().join("main.txt"), "main branch")
            .expect("main file should be written");
        let second_id =
            create_commit_with_changes(&repo, "Second commit", &[&first], &["main.txt"], &[], &[]);
        let base_branch = repo
            .head()
            .expect("base branch head should exist")
            .shorthand()
            .expect("base branch should have shorthand")
            .to_owned();

        repo.set_head_detached(first_id)
            .expect("should move to first commit");
        fs::write(
            repo.workdir().unwrap().join("feature.txt"),
            "feature branch",
        )
        .expect("feature file should be written");
        let second_feature_id = create_commit_with_changes(
            &repo,
            "Feature commit",
            &[&first],
            &["feature.txt"],
            &[],
            &[],
        );
        repo.reference(
            "refs/heads/feature/test",
            second_feature_id,
            true,
            "move feature branch",
        )
        .expect("feature reference should move");

        repo.set_head_detached(second_id)
            .expect("should move back to main commit");
        drop(first);
        drop(repo);

        let provider = open_provider(&test_dir.path);
        let comparison = provider
            .compare_branches(&base_branch, "feature/test")
            .expect("branch comparison should work");

        assert_eq!(comparison.ahead, 1);
        assert_eq!(comparison.behind, 1);
        assert!(comparison.merge_base.is_some());
    }

    fn open_provider(path: &std::path::Path) -> Git2Provider {
        Git2Provider::open(&path.to_string_lossy()).expect("provider should open")
    }

    fn create_commit(repo: &Repository, message: &str, parents: &[&git2::Commit<'_>]) -> Oid {
        let file_name = format!("{}.txt", message.replace(' ', "_"));
        fs::write(repo.workdir().unwrap().join(&file_name), message)
            .expect("test file should be written");

        let mut index = repo.index().expect("repository index should open");
        index
            .add_path(std::path::Path::new(&file_name))
            .expect("test file should be added to index");
        index.write().expect("index should be written");
        let tree_id = index.write_tree().expect("tree should be written");
        let tree = repo.find_tree(tree_id).expect("tree should be readable");
        let signature = signature();

        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            parents,
        )
        .expect("test commit should be created")
    }

    fn create_commit_with_changes(
        repo: &Repository,
        message: &str,
        parents: &[&git2::Commit<'_>],
        added_or_modified: &[&str],
        removed: &[&str],
        renamed: &[(&str, &str)],
    ) -> Oid {
        let mut index = repo.index().expect("repository index should open");

        for path in added_or_modified {
            index
                .add_path(std::path::Path::new(path))
                .expect("file should be added to index");
        }

        for path in removed {
            index
                .remove_path(std::path::Path::new(path))
                .expect("file should be removed from index");
        }

        for (old_path, new_path) in renamed {
            index
                .remove_path(std::path::Path::new(old_path))
                .expect("old file should be removed from index");
            index
                .add_path(std::path::Path::new(new_path))
                .expect("new file should be added to index");
        }

        index.write().expect("index should be written");
        let tree_id = index.write_tree().expect("tree should be written");
        let tree = repo.find_tree(tree_id).expect("tree should be readable");
        let signature = signature();

        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            parents,
        )
        .expect("test commit should be created")
    }

    fn signature() -> Signature<'static> {
        Signature::now("Visual Git Test", "visual-git@example.invalid")
            .expect("test signature should be created")
    }
}

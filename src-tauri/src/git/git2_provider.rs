use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use git2::{BranchType, Repository, Sort};

use crate::errors::AppError;
use crate::git::provider::GitProvider;
use crate::models::branch::BranchInfo;
use crate::models::commit::CommitInfo;
use crate::models::repository::RepositorySummary;
use crate::models::tag::TagInfo;

pub struct Git2Provider {
    repo: Repository,
    path: PathBuf,
}

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

    fn signature() -> Signature<'static> {
        Signature::now("Visual Git Test", "visual-git@example.invalid")
            .expect("test signature should be created")
    }
}

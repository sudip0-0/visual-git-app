use std::path::PathBuf;

use crate::errors::AppError;
use crate::git::git2_provider::Git2Provider;
use crate::git::provider::GitProvider;
use crate::models::repository::RepositorySummary;

pub fn validate_repository_path(path: PathBuf) -> Result<RepositorySummary, AppError> {
    Git2Provider::open(&path.to_string_lossy())?.repository_summary()
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    use git2::Repository;

    use crate::errors::AppErrorCode;

    use super::validate_repository_path;

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
                "visual_git_app_{name}_{}_{}",
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
    fn accepts_empty_git_repository() {
        let test_dir = TestDir::new("valid_repo");
        Repository::init(&test_dir.path).expect("test repository should initialize");

        let summary = validate_repository_path(test_dir.path.clone())
            .expect("initialized Git repository should be valid");

        assert_eq!(
            summary.name,
            test_dir.path.file_name().unwrap().to_string_lossy()
        );
        assert!(summary.is_empty);
        assert!(summary.head_hash.is_none());
        assert!(!summary.is_detached);
    }

    #[test]
    fn accepts_git_repository_with_head() {
        let test_dir = TestDir::new("repo_with_head");
        let repo = Repository::init(&test_dir.path).expect("test repository should initialize");
        let head_before_validation = create_commit(&repo, "Initial commit", &[]);

        let summary = validate_repository_path(test_dir.path.clone())
            .expect("committed Git repository should be valid");
        let repo_after_validation =
            Repository::open(&test_dir.path).expect("test repository should still open");
        let head_after_validation = repo_after_validation
            .head()
            .expect("HEAD should exist after validation")
            .target()
            .expect("HEAD should still point to a commit");

        assert!(!summary.is_empty);
        assert!(summary.head_hash.is_some());
        assert!(!summary.is_detached);
        assert_eq!(head_before_validation, head_after_validation);
    }

    #[test]
    fn rejects_non_git_directory() {
        let test_dir = TestDir::new("invalid_repo");

        let error = validate_repository_path(test_dir.path.clone())
            .expect_err("plain directory should not validate as a Git repository");

        assert_eq!(error.code, AppErrorCode::InvalidRepository);
        assert_eq!(error.message, "This folder is not a Git repository.");
    }

    #[test]
    fn rejects_file_path() {
        let test_dir = TestDir::new("file_path");
        let file_path = test_dir.path.join("not-a-directory.txt");
        fs::write(&file_path, "not a repository").expect("test file should be written");

        let error = validate_repository_path(file_path).expect_err("file path should not validate");

        assert_eq!(error.code, AppErrorCode::InvalidPath);
        assert_eq!(error.message, "Select a folder, not a file.");
    }

    #[test]
    fn rejects_missing_path() {
        let test_dir = TestDir::new("missing_path_parent");
        let missing_path = test_dir.path.join("missing");

        let error =
            validate_repository_path(missing_path).expect_err("missing path should not validate");

        assert_eq!(error.code, AppErrorCode::InvalidPath);
        assert_eq!(error.message, "The selected folder does not exist.");
    }

    fn create_commit(repo: &Repository, message: &str, parents: &[git2::Commit<'_>]) -> git2::Oid {
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
        let signature = git2::Signature::now("Visual Git Test", "visual-git@example.invalid")
            .expect("test signature should be created");
        let parent_refs = parents.iter().collect::<Vec<_>>();

        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &parent_refs,
        )
        .expect("test commit should be created")
    }
}

use std::fs;
use std::io;
use std::path::PathBuf;

use git2::Repository;

use crate::errors::AppError;
use crate::models::repository::RepositorySummary;

pub fn validate_repository_path(path: PathBuf) -> Result<RepositorySummary, AppError> {
    let metadata = fs::metadata(&path).map_err(|error| map_metadata_error(error, &path))?;

    if !metadata.is_dir() {
        return Err(AppError::invalid_path("Select a folder, not a file."));
    }

    let repo = Repository::open_ext(
        &path,
        git2::RepositoryOpenFlags::NO_SEARCH,
        Vec::<PathBuf>::new(),
    )
    .map_err(|error| map_git_error(error, &path))?;

    Ok(RepositorySummary {
        path: path.to_string_lossy().into_owned(),
        name: repository_name(&path),
        current_branch: current_branch(&repo),
        head_hash: head_hash(&repo),
        is_bare: repo.is_bare(),
        is_empty: repo.is_empty().unwrap_or(false),
    })
}

fn repository_name(path: &std::path::Path) -> String {
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

fn map_metadata_error(error: io::Error, _path: &std::path::Path) -> AppError {
    match error.kind() {
        io::ErrorKind::NotFound => AppError::invalid_path("The selected folder does not exist."),
        io::ErrorKind::PermissionDenied => {
            AppError::permission_denied("Permission denied while reading the selected folder.")
        }
        _ => AppError::read_failure("Could not read the selected folder."),
    }
}

fn map_git_error(error: git2::Error, _path: &std::path::Path) -> AppError {
    match error.code() {
        git2::ErrorCode::NotFound => {
            AppError::invalid_repository("This folder is not a Git repository.")
        }
        git2::ErrorCode::BareRepo => {
            AppError::invalid_repository("Bare repositories are not supported yet.")
        }
        git2::ErrorCode::UnbornBranch => {
            AppError::invalid_repository("This repository has no commits yet.")
        }
        _ if error.message().to_ascii_lowercase().contains("permission") => {
            AppError::permission_denied("Permission denied while reading this repository.")
        }
        _ => AppError::read_failure("Could not read this Git repository."),
    }
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    use git2::Repository;

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
    }

    #[test]
    fn rejects_non_git_directory() {
        let test_dir = TestDir::new("invalid_repo");

        let error = validate_repository_path(test_dir.path.clone())
            .expect_err("plain directory should not validate as a Git repository");

        assert_eq!(error.message, "This folder is not a Git repository.");
    }

    #[test]
    fn rejects_file_path() {
        let test_dir = TestDir::new("file_path");
        let file_path = test_dir.path.join("not-a-directory.txt");
        fs::write(&file_path, "not a repository").expect("test file should be written");

        let error = validate_repository_path(file_path).expect_err("file path should not validate");

        assert_eq!(error.message, "Select a folder, not a file.");
    }
}

use std::path::PathBuf;

use crate::errors::AppError;
use crate::git::repository_validator;
use crate::models::repository::RepositorySummary;

pub fn validate_repository(path: String) -> Result<RepositorySummary, AppError> {
    let trimmed_path = path.trim();

    if trimmed_path.is_empty() {
        return Err(AppError::invalid_path("Select a repository folder first."));
    }

    repository_validator::validate_repository_path(PathBuf::from(trimmed_path))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_empty_path() {
        let error = validate_repository("   ".to_owned()).expect_err("empty path should fail");

        assert_eq!(error.message, "Select a repository folder first.");
    }
}

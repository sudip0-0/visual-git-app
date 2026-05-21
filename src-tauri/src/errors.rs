use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppError {
    pub code: AppErrorCode,
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AppErrorCode {
    InvalidPath,
    InvalidRepository,
    PermissionDenied,
    ReadFailure,
}

impl AppError {
    pub fn invalid_path(message: impl Into<String>) -> Self {
        Self {
            code: AppErrorCode::InvalidPath,
            message: message.into(),
        }
    }

    pub fn invalid_repository(message: impl Into<String>) -> Self {
        Self {
            code: AppErrorCode::InvalidRepository,
            message: message.into(),
        }
    }

    pub fn permission_denied(message: impl Into<String>) -> Self {
        Self {
            code: AppErrorCode::PermissionDenied,
            message: message.into(),
        }
    }

    pub fn read_failure(message: impl Into<String>) -> Self {
        Self {
            code: AppErrorCode::ReadFailure,
            message: message.into(),
        }
    }
}

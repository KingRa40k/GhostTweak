use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Registry operation failed: {0}")]
    Registry(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Windows API error ({code}): {message}")]
    Win32 { code: u32, message: String },

    #[error("Privilege escalation failed: {0}")]
    Privilege(String),

    #[error("Security or DRM validation failed: {0}")]
    Security(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Execution error: {0}")]
    Execution(String),
}

impl From<AppError> for String {
    fn from(err: AppError) -> Self {
        err.to_string()
    }
}

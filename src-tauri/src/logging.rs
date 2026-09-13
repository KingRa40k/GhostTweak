use std::fs::{create_dir_all, OpenOptions};
use std::path::PathBuf;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub fn init_logging() {
    let log_dir = dirs::config_dir()
        .or_else(|| dirs::data_dir())
        .unwrap_or_else(|| PathBuf::from("."))
        .join("GhostTweak")
        .join("logs");

    let _ = create_dir_all(&log_dir);
    let log_file_path = log_dir.join("ghosttweak.log");

    if let Ok(file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file_path)
    {
        let file_layer = fmt::layer()
            .with_ansi(false)
            .with_target(true)
            .with_thread_ids(true)
            .with_writer(std::sync::Mutex::new(file));

        let stdout_layer = fmt::layer()
            .with_ansi(true)
            .with_target(false);

        let filter = EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| EnvFilter::new("info,ghosttweak=debug"));

        let _ = tracing_subscriber::registry()
            .with(filter)
            .with(stdout_layer)
            .with(file_layer)
            .try_init();
    }
}

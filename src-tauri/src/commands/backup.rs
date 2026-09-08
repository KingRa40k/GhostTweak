use serde::Serialize;
use chrono::Local;
use std::process::Command;
use std::path::PathBuf;

#[derive(Serialize, Clone)]
pub struct BackupInfo {
    pub id: String,
    pub description: String,
    pub created_at: String,
    pub size_bytes: u64,
    pub file_path: String,
}

fn get_backup_dir() -> PathBuf {
    let appdata = std::env::var("APPDATA").unwrap_or_else(|_| "C:\\".to_string());
    let path = PathBuf::from(appdata).join("GhostTweak").join("backups");
    if !path.exists() {
        let _ = std::fs::create_dir_all(&path);
    }
    path
}

pub(crate) fn backup_registry_key(key_path: &str, description: &str) -> Result<String, String> {
    let dir = get_backup_dir();
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("backup_{}_{}.reg", timestamp, description);
    let file_path = dir.join(&filename);
    
    let output = Command::new("reg")
        .args(&["export", key_path, file_path.to_str().unwrap(), "/y"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(file_path.to_string_lossy().into_owned())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

#[tauri::command]
pub fn list_backups() -> Result<Vec<BackupInfo>, String> {
    let dir = get_backup_dir();
    let mut backups = Vec::new();
    
    if dir.exists() {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("reg") {
                    let filename = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                    let metadata = entry.metadata().map_err(|e| e.to_string())?;
                    let parts: Vec<&str> = filename.split('_').collect();
                    let desc = if parts.len() >= 4 {
                        let d = parts[3..].join("_");
                        d.strip_suffix(".reg").unwrap_or(&d).to_string()
                    } else {
                        "unknown".to_string()
                    };
                    
                    backups.push(BackupInfo {
                        id: filename.clone(),
                        description: desc,
                        created_at: format!("{}_{}", parts.get(1).unwrap_or(&""), parts.get(2).unwrap_or(&"")),
                        size_bytes: metadata.len(),
                        file_path: path.to_string_lossy().into_owned(),
                    });
                }
            }
        }
    }
    Ok(backups)
}

#[tauri::command]
pub fn restore_backup(backup_id: String) -> Result<(), String> {
    let dir = get_backup_dir();
    let file_path = dir.join(&backup_id);
    if !file_path.exists() {
        return Err("Backup not found".into());
    }
    
    let output = Command::new("reg")
        .args(&["import", file_path.to_str().unwrap()])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

#[tauri::command]
pub fn delete_backup(backup_id: String) -> Result<(), String> {
    let dir = get_backup_dir();
    let file_path = dir.join(&backup_id);
    if file_path.exists() {
        std::fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

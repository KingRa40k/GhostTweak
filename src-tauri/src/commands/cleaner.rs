use serde::Serialize;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Serialize, Clone)]
pub struct JunkCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub size_bytes: u64,
    pub file_count: u64,
    pub path: String,
}

#[derive(Serialize)]
pub struct ScanResult {
    pub categories: Vec<JunkCategory>,
    pub total_size_bytes: u64,
}

#[derive(Serialize)]
pub struct CleanResult {
    pub cleaned_bytes: u64,
    pub cleaned_files: u64,
    pub errors: Vec<String>,
}

fn get_env(var: &str) -> String {
    std::env::var(var).unwrap_or_default()
}

fn get_localappdata() -> String {
    get_env("LOCALAPPDATA")
}

fn get_temp() -> String {
    get_env("TEMP")
}

fn scan_dir(id: &str, name: &str, description: &str, paths: Vec<String>) -> Option<JunkCategory> {
    let mut total_size = 0;
    let mut total_files = 0;
    let mut exists = false;
    let mut first_path = String::new();

    for path_str in paths {
        let path = Path::new(&path_str);
        if path.exists() && path.is_dir() {
            exists = true;
            if first_path.is_empty() {
                first_path = path_str.clone();
            }
            for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
                if entry.file_type().is_file() {
                    if let Ok(metadata) = entry.metadata() {
                        total_size += metadata.len();
                        total_files += 1;
                    }
                }
            }
        }
    }

    if exists && total_files > 0 {
        Some(JunkCategory {
            id: id.to_string(),
            name: name.to_string(),
            description: description.to_string(),
            size_bytes: total_size,
            file_count: total_files,
            path: first_path,
        })
    } else {
        None
    }
}

#[tauri::command]
pub fn scan_junk() -> Result<ScanResult, String> {
    let mut categories = Vec::new();

    let localappdata = get_localappdata();

    if let Some(c) = scan_dir("temp_user", "User Temp", "Temporary files for the current user", vec![get_temp()]) { categories.push(c); }
    if let Some(c) = scan_dir("temp_system", "System Temp", "Temporary files for Windows", vec![r#"C:\Windows\Temp"#.to_string()]) { categories.push(c); }
    if let Some(c) = scan_dir("nvidia_shader", "NVIDIA Shader Cache", "Shader cache for NVIDIA GPUs", vec![format!(r"{}\NVIDIA\GLCache", localappdata), format!(r"{}\D3DSCache", localappdata)]) { categories.push(c); }
    if let Some(c) = scan_dir("amd_shader", "AMD Shader Cache", "Shader cache for AMD GPUs", vec![format!(r"{}\AMD\DxcCache", localappdata), format!(r"{}\AMD\DxCache", localappdata), format!(r"{}\AMD\GLCache", localappdata)]) { categories.push(c); }
    if let Some(c) = scan_dir("dx_shader", "DirectX Shader Cache", "DirectX Shader Cache", vec![format!(r"{}\D3DSCache", localappdata)]) { categories.push(c); }
    if let Some(c) = scan_dir("windows_update", "Windows Update Cache", "Windows Update downloaded files", vec![r#"C:\Windows\SoftwareDistribution\Download"#.to_string()]) { categories.push(c); }
    if let Some(c) = scan_dir("thumbnails", "Thumbnail Cache", "Thumbnail cache files", vec![format!(r"{}\Microsoft\Windows\Explorer", localappdata)]) { categories.push(c); }

    let total_size_bytes = categories.iter().map(|c| c.size_bytes).sum();

    Ok(ScanResult { categories, total_size_bytes })
}

#[tauri::command]
pub fn clean_junk(category_ids: Vec<String>) -> Result<CleanResult, String> {
    let mut cleaned_bytes = 0;
    let mut cleaned_files = 0;
    let mut errors = Vec::new();

    let localappdata = get_localappdata();
    
    let all_paths = vec![
        ("temp_user", vec![get_temp()]),
        ("temp_system", vec![r#"C:\Windows\Temp"#.to_string()]),
        ("nvidia_shader", vec![format!(r"{}\NVIDIA\GLCache", localappdata), format!(r"{}\D3DSCache", localappdata)]),
        ("amd_shader", vec![format!(r"{}\AMD\DxcCache", localappdata), format!(r"{}\AMD\DxCache", localappdata), format!(r"{}\AMD\GLCache", localappdata)]),
        ("dx_shader", vec![format!(r"{}\D3DSCache", localappdata)]),
        ("windows_update", vec![r#"C:\Windows\SoftwareDistribution\Download"#.to_string()]),
        ("thumbnails", vec![format!(r"{}\Microsoft\Windows\Explorer", localappdata)]),
    ];

    for id in category_ids {
        if let Some((_, paths)) = all_paths.iter().find(|(cat_id, _)| *cat_id == id.as_str()) {
            for path_str in paths {
                let path = Path::new(&path_str);
                if path.exists() && path.is_dir() {
                    for entry in WalkDir::new(path).min_depth(1).into_iter().filter_map(|e| e.ok()) {
                        let e_path = entry.path();
                        if id == "thumbnails" && e_path.is_file() {
                            if let Some(fname) = e_path.file_name().and_then(|n| n.to_str()) {
                                if !fname.starts_with("thumbcache_") { continue; }
                            }
                        }

                        if e_path.is_file() {
                            let size = e_path.metadata().map(|m| m.len()).unwrap_or(0);
                            match std::fs::remove_file(e_path) {
                                Ok(_) => {
                                    cleaned_bytes += size;
                                    cleaned_files += 1;
                                }
                                Err(e) => errors.push(format!("Failed to delete {:?}: {}", e_path, e)),
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(CleanResult { cleaned_bytes, cleaned_files, errors })
}

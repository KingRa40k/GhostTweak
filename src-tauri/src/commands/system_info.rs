use serde::Serialize;
use std::process::Command;

#[derive(Serialize, Clone)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub cpu: String,
    pub ram_gb: f64,
    pub gpu: String,
    pub display_res: String,
    pub refresh_rate: u32,
    pub available_refresh_rates: Vec<u32>,
}

#[cfg(windows)]
fn get_supported_refresh_rates(target_w: u32, target_h: u32, current_rr: u32) -> Vec<u32> {
    use std::collections::BTreeSet;
    let mut rates = BTreeSet::new();

    #[repr(C)]
    #[allow(non_snake_case)]
    struct DEVMODEW {
        dmDeviceName: [u16; 32],
        dmSpecVersion: u16,
        dmDriverVersion: u16,
        dmSize: u16,
        dmDriverExtra: u16,
        dmFields: u32,
        dmUnion1: [u8; 16],
        dmColor: i16,
        dmDuplex: i16,
        dmYResolution: i16,
        dmTTOption: i16,
        dmCollate: i16,
        dmFormName: [u16; 32],
        dmLogPixels: u16,
        dmBitsPerPel: u32,
        dmPelsWidth: u32,
        dmPelsHeight: u32,
        dmDisplayFlags: u32,
        dmDisplayFrequency: u32,
        dmICMMethod: u32,
        dmICMIntent: u32,
        dmMediaType: u32,
        dmDitherType: u32,
        dmReserved1: u32,
        dmReserved2: u32,
        dmPanningWidth: u32,
        dmPanningHeight: u32,
    }

    extern "system" {
        fn EnumDisplaySettingsW(
            lpszDeviceName: *const u16,
            iModeNum: u32,
            lpDevMode: *mut DEVMODEW,
        ) -> i32;
    }

    unsafe {
        let mut dev_mode: DEVMODEW = std::mem::zeroed();
        dev_mode.dmSize = std::mem::size_of::<DEVMODEW>() as u16;

        let mut mode_index = 0;
        while EnumDisplaySettingsW(std::ptr::null(), mode_index, &mut dev_mode) != 0 {
            if target_w > 0 && target_h > 0 {
                if dev_mode.dmPelsWidth == target_w && dev_mode.dmPelsHeight == target_h {
                    if dev_mode.dmDisplayFrequency > 0 {
                        rates.insert(dev_mode.dmDisplayFrequency);
                    }
                }
            } else if dev_mode.dmDisplayFrequency > 0 {
                rates.insert(dev_mode.dmDisplayFrequency);
            }
            mode_index += 1;
        }
    }

    if current_rr > 0 {
        rates.insert(current_rr);
    }

    let mut result: Vec<u32> = rates.into_iter().collect();
    if result.is_empty() {
        let common = [60, 75, 100, 120, 144, 165, 180, 240];
        result = common.iter().cloned().filter(|&r| r <= current_rr.max(60)).collect();
        if !result.contains(&current_rr) && current_rr > 0 {
            result.push(current_rr);
            result.sort();
        }
    }
    result
}

#[cfg(not(windows))]
fn get_supported_refresh_rates(_target_w: u32, _target_h: u32, current_rr: u32) -> Vec<u32> {
    vec![60, current_rr.max(60)]
}

fn run_wmic(args: &[&str]) -> Result<String, String> {
    let output = Command::new("wmic")
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute wmic: {}", e))?;
    
    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn parse_wmic_output(output: &str) -> String {
    let mut lines = output.lines();
    lines.next(); // Skip header
    let value = lines.next().unwrap_or("").trim().to_string();
    value
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    let cpu = parse_wmic_output(&run_wmic(&["cpu", "get", "name"])?);
    
    let mem_out = run_wmic(&["memorychip", "get", "capacity"])?;
    let mut ram_bytes: u64 = 0;
    for line in mem_out.lines().skip(1) {
        let line = line.trim();
        if !line.is_empty() {
            if let Ok(bytes) = line.parse::<u64>() {
                ram_bytes += bytes;
            }
        }
    }
    let ram_gb = (ram_bytes as f64) / (1024.0 * 1024.0 * 1024.0);
    
    // Query video controller for GPU, Resolution and Refresh Rate
    let mut gpu = String::from("NVIDIA / AMD Graphics");
    let mut display_res = String::from("1920 x 1080");
    let mut refresh_rate: u32 = 60;
    let mut target_w: u32 = 0;
    let mut target_h: u32 = 0;

    if let Ok(video_out) = run_wmic(&["path", "win32_videocontroller", "get", "CurrentHorizontalResolution,CurrentRefreshRate,CurrentVerticalResolution,Name"]) {
        for line in video_out.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            // Typical line with resolution: "3440 180 1440 NVIDIA GeForce RTX 4070 SUPER"
            if parts.len() >= 4 {
                if let (Ok(h), Ok(rr), Ok(v)) = (parts[0].parse::<u32>(), parts[1].parse::<u32>(), parts[2].parse::<u32>()) {
                    if h > 0 && v > 0 && rr > 0 {
                        display_res = format!("{} x {}", h, v);
                        refresh_rate = rr;
                        target_w = h;
                        target_h = v;
                        let gpu_name = parts[3..].join(" ");
                        if !gpu_name.is_empty() {
                            gpu = gpu_name;
                        }
                        break;
                    }
                }
            }
        }
    }
    
    let available_refresh_rates = get_supported_refresh_rates(target_w, target_h, refresh_rate);

    let os_caption = parse_wmic_output(&run_wmic(&["os", "get", "caption"])?);
    let os_version = parse_wmic_output(&run_wmic(&["os", "get", "version"])?);
    
    Ok(SystemInfo {
        os_name: os_caption,
        os_version,
        cpu,
        ram_gb,
        gpu,
        display_res,
        refresh_rate,
        available_refresh_rates,
    })
}

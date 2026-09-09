use serde::Serialize;

#[cfg(windows)]
use winreg::enums::*;
#[cfg(windows)]
use winreg::RegKey;

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
#[repr(C)]
#[allow(non_snake_case)]
struct MEMORYSTATUSEX {
    dwLength: u32,
    dwMemoryLoad: u32,
    ullTotalPhys: u64,
    ullAvailPhys: u64,
    ullTotalPageFile: u64,
    ullAvailPageFile: u64,
    ullTotalVirtual: u64,
    ullAvailVirtual: u64,
    ullAvailExtendedVirtual: u64,
}

#[cfg(windows)]
fn get_win32_ram_gb() -> f64 {
    extern "system" {
        fn GlobalMemoryStatusEx(lpBuffer: *mut MEMORYSTATUSEX) -> i32;
    }
    unsafe {
        let mut status: MEMORYSTATUSEX = std::mem::zeroed();
        status.dwLength = std::mem::size_of::<MEMORYSTATUSEX>() as u32;
        if GlobalMemoryStatusEx(&mut status) != 0 {
            return (status.ullTotalPhys as f64) / (1024.0 * 1024.0 * 1024.0);
        }
    }
    16.0
}

#[cfg(windows)]
fn get_win32_cpu_name() -> String {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(key) = hklm.open_subkey(r"HARDWARE\DESCRIPTION\System\CentralProcessor\0") {
        if let Ok(name) = key.get_value::<String, _>("ProcessorNameString") {
            let trimmed = name.trim().to_string();
            if !trimmed.is_empty() {
                return trimmed;
            }
        }
    }
    "Intel / AMD Processor".to_string()
}

#[cfg(windows)]
fn get_win32_os_info() -> (String, String) {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let mut os_name = "Windows 10/11".to_string();
    let mut os_version = "64-bit".to_string();

    if let Ok(key) = hklm.open_subkey(r"SOFTWARE\Microsoft\Windows NT\CurrentVersion") {
        if let Ok(prod) = key.get_value::<String, _>("ProductName") {
            let p = prod.trim();
            if !p.is_empty() {
                os_name = p.to_string();
            }
        }
        if let Ok(disp) = key.get_value::<String, _>("DisplayVersion") {
            let d = disp.trim();
            if !d.is_empty() {
                os_version = d.to_string();
            }
        } else if let Ok(build) = key.get_value::<String, _>("CurrentBuild") {
            os_version = format!("Build {}", build.trim());
        }
    }

    (os_name, os_version)
}

#[cfg(windows)]
fn get_win32_gpu_name() -> String {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let class_path = r"SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}";
    
    let mut discrete_gpu: Option<String> = None;
    let mut integrated_gpu: Option<String> = None;

    if let Ok(class_key) = hklm.open_subkey(class_path) {
        for idx in 0..16 {
            let subkey_name = format!("{:04}", idx);
            if let Ok(gpu_key) = class_key.open_subkey(&subkey_name) {
                if let Ok(desc) = gpu_key.get_value::<String, _>("DriverDesc") {
                    let desc_clean = desc.trim().to_string();
                    if !desc_clean.is_empty() 
                        && !desc_clean.contains("Virtual") 
                        && !desc_clean.contains("Basic Display") 
                        && !desc_clean.contains("MrIdd") 
                    {
                        if desc_clean.contains("NVIDIA") || desc_clean.contains("GeForce") || desc_clean.contains("Radeon") || desc_clean.contains("RTX") || desc_clean.contains("GTX") {
                            discrete_gpu = Some(desc_clean);
                            break;
                        } else if integrated_gpu.is_none() {
                            integrated_gpu = Some(desc_clean);
                        }
                    }
                }
            }
        }
    }

    discrete_gpu
        .or(integrated_gpu)
        .unwrap_or_else(|| "NVIDIA / AMD Graphics".to_string())
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

#[cfg(windows)]
fn get_win32_display_info() -> (String, u32, u32, u32) {
    extern "system" {
        fn GetSystemMetrics(nIndex: i32) -> i32;
    }

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

    const ENUM_CURRENT_SETTINGS: u32 = 0xFFFFFFFF;

    unsafe {
        let mut dev_mode: DEVMODEW = std::mem::zeroed();
        dev_mode.dmSize = std::mem::size_of::<DEVMODEW>() as u16;

        if EnumDisplaySettingsW(std::ptr::null(), ENUM_CURRENT_SETTINGS, &mut dev_mode) != 0 {
            let w = dev_mode.dmPelsWidth;
            let h = dev_mode.dmPelsHeight;
            let rr = dev_mode.dmDisplayFrequency;
            if w > 0 && h > 0 {
                return (format!("{} x {}", w, h), rr, w, h);
            }
        }

        let w = GetSystemMetrics(0) as u32; // SM_CXSCREEN
        let h = GetSystemMetrics(1) as u32; // SM_CYSCREEN
        if w > 0 && h > 0 {
            return (format!("{} x {}", w, h), 60, w, h);
        }
    }

    ("1920 x 1080".to_string(), 60, 1920, 1080)
}

#[cfg(not(windows))]
fn get_supported_refresh_rates(_target_w: u32, _target_h: u32, current_rr: u32) -> Vec<u32> {
    vec![60, current_rr.max(60)]
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    #[cfg(windows)]
    {
        let cpu = get_win32_cpu_name();
        let ram_gb = get_win32_ram_gb();
        let gpu = get_win32_gpu_name();
        let (os_name, os_version) = get_win32_os_info();
        let (display_res, refresh_rate, target_w, target_h) = get_win32_display_info();
        let available_refresh_rates = get_supported_refresh_rates(target_w, target_h, refresh_rate);

        Ok(SystemInfo {
            os_name,
            os_version,
            cpu,
            ram_gb,
            gpu,
            display_res,
            refresh_rate,
            available_refresh_rates,
        })
    }

    #[cfg(not(windows))]
    {
        Ok(SystemInfo {
            os_name: "Linux / Unix".to_string(),
            os_version: "Generic".to_string(),
            cpu: "Multi-core Processor".to_string(),
            ram_gb: 16.0,
            gpu: "Dedicated Graphics".to_string(),
            display_res: "1920 x 1080".to_string(),
            refresh_rate: 60,
            available_refresh_rates: vec![60, 144],
        })
    }
}

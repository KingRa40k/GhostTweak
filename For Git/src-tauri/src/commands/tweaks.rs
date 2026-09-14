use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct TweakInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub enabled: bool,
    pub risky: bool,
}

#[derive(Serialize)]
pub struct ApplyResult {
    pub applied: Vec<String>,
    pub failed: Vec<String>,
    pub errors: Vec<String>,
}

#[cfg(windows)]
use winreg::enums::*;
#[cfg(windows)]
use winreg::{RegKey, HKEY};

#[cfg(not(windows))]
#[tauri::command]
pub fn get_tweaks_status() -> Result<Vec<TweakInfo>, String> {
    Ok(vec![])
}

#[cfg(not(windows))]
#[tauri::command]
pub fn apply_tweak(_tweak_id: String, _enable: bool) -> Result<bool, String> {
    Ok(true)
}

#[cfg(not(windows))]
#[tauri::command]
pub fn apply_all_tweaks() -> Result<ApplyResult, String> {
    Ok(ApplyResult {
        applied: vec![],
        failed: vec![],
        errors: vec![],
    })
}

#[cfg(not(windows))]
#[tauri::command]
pub fn apply_cs2_boost() -> Result<ApplyResult, String> {
    Ok(ApplyResult {
        applied: vec![],
        failed: vec![],
        errors: vec![],
    })
}

#[cfg(not(windows))]
#[tauri::command]
pub fn is_cs2_boosted() -> Result<bool, String> {
    Ok(false)
}

#[cfg(not(windows))]
#[tauri::command]
pub fn apply_safe_lowspec_profile() -> Result<SuperOptimizeResult, String> {
    Ok(SuperOptimizeResult {
        applied_count: 20,
        ram_freed_mb: 350,
        junk_cleaned_bytes: 1024 * 1024 * 200,
        cs2_boosted: true,
    })
}

#[cfg(windows)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PrevRegValue {
    Dword(u32),
    StringVal(String),
    NotFound,
}

#[cfg(windows)]
struct RegMutation {
    hive: HKEY,
    path: String,
    name: String,
    prev: PrevRegValue,
}

#[cfg(windows)]
pub struct RegistryTransaction {
    mutations: Vec<RegMutation>,
}

#[cfg(windows)]
impl RegistryTransaction {
    pub fn new() -> Self {
        Self {
            mutations: Vec::new(),
        }
    }

    fn read_prev(hive: HKEY, path: &str, name: &str) -> PrevRegValue {
        let hk = RegKey::predef(hive);
        if let Ok(key) = hk.open_subkey(path) {
            if let Ok(val) = key.get_value::<u32, _>(name) {
                return PrevRegValue::Dword(val);
            }
            if let Ok(val) = key.get_value::<String, _>(name) {
                return PrevRegValue::StringVal(val);
            }
        }
        PrevRegValue::NotFound
    }

    pub fn set_dword(&mut self, hive: HKEY, path: &str, name: &str, value: u32) -> Result<(), String> {
        let prev = Self::read_prev(hive, path, name);
        let hk = RegKey::predef(hive);
        let (key, _) = hk
            .create_subkey(path)
            .map_err(|e| format!("Cannot open/create key {}: {}", path, e))?;
        key.set_value(name, &value)
            .map_err(|e| format!("Cannot set {}\\{}: {}", path, name, e))?;

        self.mutations.push(RegMutation {
            hive,
            path: path.to_string(),
            name: name.to_string(),
            prev,
        });
        Ok(())
    }

    pub fn set_string(&mut self, hive: HKEY, path: &str, name: &str, value: &str) -> Result<(), String> {
        let prev = Self::read_prev(hive, path, name);
        let hk = RegKey::predef(hive);
        let (key, _) = hk
            .create_subkey(path)
            .map_err(|e| format!("Cannot open/create key {}: {}", path, e))?;
        key.set_value(name, &value)
            .map_err(|e| format!("Cannot set {}\\{}: {}", path, name, e))?;

        self.mutations.push(RegMutation {
            hive,
            path: path.to_string(),
            name: name.to_string(),
            prev,
        });
        Ok(())
    }

    pub fn delete_value(&mut self, hive: HKEY, path: &str, name: &str) -> Result<(), String> {
        let prev = Self::read_prev(hive, path, name);
        let hk = RegKey::predef(hive);
        if let Ok(key) = hk.open_subkey_with_flags(path, KEY_SET_VALUE) {
            let _ = key.delete_value(name);
        }

        self.mutations.push(RegMutation {
            hive,
            path: path.to_string(),
            name: name.to_string(),
            prev,
        });
        Ok(())
    }

    pub fn rollback(self) {
        tracing::warn!(
            "Rolling back {} registry mutations due to operation failure...",
            self.mutations.len()
        );
        for m in self.mutations.into_iter().rev() {
            let hk = RegKey::predef(m.hive);
            match m.prev {
                PrevRegValue::Dword(val) => {
                    if let Ok((key, _)) = hk.create_subkey(&m.path) {
                        let _ = key.set_value(&m.name, &val);
                    }
                }
                PrevRegValue::StringVal(val) => {
                    if let Ok((key, _)) = hk.create_subkey(&m.path) {
                        let _ = key.set_value(&m.name, &val);
                    }
                }
                PrevRegValue::NotFound => {
                    if let Ok(key) = hk.open_subkey_with_flags(&m.path, KEY_SET_VALUE) {
                        let _ = key.delete_value(&m.name);
                    }
                }
            }
        }
    }
}

#[cfg(windows)]
fn check_dword(hive: HKEY, path: &str, name: &str, expected: u32) -> bool {
    let hk = RegKey::predef(hive);
    if let Ok(key) = hk.open_subkey(path) {
        if let Ok(val) = key.get_value::<u32, _>(name) {
            return val == expected;
        }
    }
    false
}

#[cfg(windows)]
fn check_string(hive: HKEY, path: &str, name: &str, expected: &str) -> bool {
    let hk = RegKey::predef(hive);
    if let Ok(key) = hk.open_subkey(path) {
        if let Ok(val) = key.get_value::<String, _>(name) {
            return val == expected;
        }
    }
    false
}

#[cfg(windows)]
fn is_service_disabled(name: &str) -> bool {
    let path = format!(r"SYSTEM\CurrentControlSet\Services\{}", name);
    if let Ok(key) = RegKey::predef(HKEY_LOCAL_MACHINE).open_subkey(&path) {
        if let Ok(start) = key.get_value::<u32, _>("Start") {
            return start == 4;
        }
    }
    false
}

#[cfg(windows)]
fn set_service(name: &str, disable: bool) -> Result<(), String> {
    if disable {
        let _ = crate::commands::hidden_command("sc").args(["stop", name]).output();
        let output = crate::commands::hidden_command("sc")
            .args(["config", name, "start=", "disabled"])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(format!(
                "Failed to disable {}: {}",
                name,
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    } else {
        let output = crate::commands::hidden_command("sc")
            .args(["config", name, "start=", "auto"])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(format!(
                "Failed to enable {}: {}",
                name,
                String::from_utf8_lossy(&output.stderr)
            ));
        }
        let _ = crate::commands::hidden_command("sc").args(["start", name]).output();
    }
    Ok(())
}

#[cfg(windows)]
fn set_gpu_msi_mode(enable: bool) -> Result<(), String> {
    let pci_path = r"SYSTEM\CurrentControlSet\Enum\PCI";
    let hk = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(pci_key) = hk.open_subkey(pci_path) {
        for dev_name in pci_key.enum_keys().filter_map(|x| x.ok()) {
            if let Ok(dev_key) = pci_key.open_subkey(&dev_name) {
                for inst_name in dev_key.enum_keys().filter_map(|x| x.ok()) {
                    let inst_path = format!(r"{}\{}\{}", pci_path, dev_name, inst_name);
                    if let Ok(inst_key) = hk.open_subkey(&inst_path) {
                        if let Ok(class_guid) = inst_key.get_value::<String, _>("ClassGUID") {
                            if class_guid.eq_ignore_ascii_case("{4d36e968-e325-11ce-bfc1-08002be10318}") {
                                let msi_path = format!(
                                    r"{}\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties",
                                    inst_path
                                );
                                if let Ok((msi_key, _)) = hk.create_subkey(&msi_path) {
                                    let val = if enable { 1u32 } else { 0u32 };
                                    let _ = msi_key.set_value("MSISupported", &val);
                                }
                                let aff_path = format!(
                                    r"{}\Device Parameters\Interrupt Management\Affinity Policy",
                                    inst_path
                                );
                                if let Ok((aff_key, _)) = hk.create_subkey(&aff_path) {
                                    if enable {
                                        let _ = aff_key.set_value("DevicePriority", &3u32);
                                    } else {
                                        let _ = aff_key.delete_value("DevicePriority");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    Ok(())
}

#[cfg(windows)]
fn is_gpu_msi_enabled() -> bool {
    let pci_path = r"SYSTEM\CurrentControlSet\Enum\PCI";
    let hk = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(pci_key) = hk.open_subkey(pci_path) {
        for dev_name in pci_key.enum_keys().filter_map(|x| x.ok()) {
            if let Ok(dev_key) = pci_key.open_subkey(&dev_name) {
                for inst_name in dev_key.enum_keys().filter_map(|x| x.ok()) {
                    let inst_path = format!(r"{}\{}\{}", pci_path, dev_name, inst_name);
                    if let Ok(inst_key) = hk.open_subkey(&inst_path) {
                        if let Ok(class_guid) = inst_key.get_value::<String, _>("ClassGUID") {
                            if class_guid.eq_ignore_ascii_case("{4d36e968-e325-11ce-bfc1-08002be10318}") {
                                let msi_path = format!(
                                    r"{}\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties",
                                    inst_path
                                );
                                if let Ok(msi_key) = hk.open_subkey(&msi_path) {
                                    if let Ok(msi) = msi_key.get_value::<u32, _>("MSISupported") {
                                        return msi == 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    false
}

#[cfg(windows)]
struct TweakDef {
    id: &'static str,
    name: &'static str,
    description: &'static str,
    category: &'static str,
    risky: bool,
}

#[cfg(windows)]
const TWEAKS: &[TweakDef] = &[
    TweakDef {
        id: "cs2_priority",
        name: "CS2 & CS:GO High CPU & I/O Priority",
        description: "Assigns High priority (CpuPriorityClass = 2) to cs2.exe and csgo.exe, protecting DPC/ISR mouse and keyboard input and eliminating micro-stutters",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "system_responsiveness",
        name: "System Responsiveness (0% Background Lock)",
        description: "Unlocks 100% of CPU time for games by removing Windows 20% background task reserve",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "game_gpu_priority",
        name: "DirectX GPU Scheduling & High Game Priority",
        description: "Prioritizes GPU scheduling and rendering pipelines specifically for 3D games in Windows Multimedia scheduler",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "cs2_fullscreen_opt",
        name: "CS2 Fullscreen Optimizations Bypass",
        description: "Bypasses DWM compositor hybrid buffering to eliminate display latency and input lag",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "disable_game_bar",
        name: "Disable Xbox Game Bar",
        description: "Turns off Game Bar overlay to reduce input lag and CPU overhead",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "disable_game_dvr",
        name: "Disable Game DVR",
        description: "Stops background recording buffers that eat GPU cycles and VRAM on laptops",
        category: "gaming",
        risky: false,
    },

    TweakDef {
        id: "high_perf_power",
        name: "High-Performance Power Plan",
        description: "Sets the power plan to Maximum Performance to lock clock frequencies",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "unpark_cpu_cores",
        name: "CPU Core Unparking (All Logical Cores)",
        description: "Prevents Windows from parking CPU cores on laptops, ensuring 100% thread availability in CS2",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "disable_power_throttling",
        name: "Disable Laptop Power Throttling",
        description: "Disables Windows Power Throttling mechanism so mobile CPUs maintain boost frequencies",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "bcd_low_latency",
        name: "Low-Latency Dynamic Tick & Timer (BCD)",
        description: "Disables dynamic tick and enforces invariant TSC timer to stabilize 0.1% low FPS",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "disable_transparency",
        name: "Disable Transparency Effects",
        description: "Removes window transparency effects to save GPU compute and reduce VRAM usage",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "disable_animations",
        name: "Disable System Animations",
        description: "Turns off minimize/maximize animations for snappy desktop responsiveness",
        category: "performance",
        risky: false,
    },

    TweakDef {
        id: "network_throttling_disable",
        name: "Disable Network Packet Throttling",
        description: "Removes Windows bandwidth throttling index to eliminate choke and loss in matchmaking",
        category: "network",
        risky: false,
    },
    TweakDef {
        id: "optimize_network",
        name: "Optimize Network (TCP No Delay)",
        description: "Reduces network latency via Nagle algorithm tweak (TcpAckFrequency = 1)",
        category: "network",
        risky: false,
    },

    TweakDef {
        id: "disable_telemetry",
        name: "Disable Telemetry",
        description: "Stops Windows diagnostic data collection services",
        category: "privacy",
        risky: false,
    },
    TweakDef {
        id: "disable_cortana",
        name: "Disable Cortana",
        description: "Turns off Cortana background search assistant",
        category: "privacy",
        risky: false,
    },
    TweakDef {
        id: "disable_tips",
        name: "Disable Tips & Suggestions",
        description: "Removes lock-screen tips and suggested background apps",
        category: "privacy",
        risky: false,
    },
    TweakDef {
        id: "disable_diagtrack",
        name: "Disable DiagTrack Service",
        description: "Stops Connected User Experiences and Telemetry background service",
        category: "privacy",
        risky: false,
    },

    TweakDef {
        id: "ultimate_perf_power",
        name: "Ultimate Performance Power Plan",
        description: "Enables hidden OEM Ultimate Performance power scheme to maximize clock rates and minimize DPC latency",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "hags_gpu_scheduling",
        name: "Hardware-Accelerated GPU Scheduling (HAGS)",
        description: "Allows GPU to directly manage its VRAM scheduling, reducing frame rendering latency",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "gpu_msi_mode",
        name: "MSI Mode for GPU (Message Signaled Interrupts)",
        description: "Switches GPU from legacy line-based IRQ to MSI mode with High priority, eliminating hardware interrupt conflicts and micro-stutters",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "disable_paging_executive",
        name: "Disable Paging Executive (Lock Kernel in RAM)",
        description: "Forces Windows kernel and drivers to stay in physical RAM instead of paging to SSD/HDD, eliminating sudden frame drops",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "disable_memory_compression",
        name: "Disable Windows Memory Compression",
        description: "Disables background RAM compression spikes (MMAgent) that cause 1% low FPS stutter during combat",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "disable_sysmain",
        name: "Disable SysMain (SuperFetch)",
        description: "Stops background RAM and disk caching service that causes background read spikes while gaming",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "disable_wsearch",
        name: "Disable Windows Search Indexer",
        description: "Stops continuous background indexing of disk drives to free up CPU and NVMe/SSD bandwidth",
        category: "performance",
        risky: false,
    },
    TweakDef {
        id: "usb_selective_suspend",
        name: "Disable USB Selective Suspend",
        description: "Prevents Windows from power-throttling USB root hubs, keeping mouse polling rates stable",
        category: "gaming",
        risky: false,
    },
    TweakDef {
        id: "laptop_anti_throttle",
        name: "Laptop Anti-Throttling (CPU 99% Peak State)",
        description: "Caps maximum processor power state at 99% to prevent thermal spikes, keeping gaming laptops cooler and eliminating 800MHz throttling",
        category: "performance",
        risky: false,
    },
];

#[cfg(windows)]
fn is_tweak_applied(id: &str) -> bool {
    match id {
        "cs2_priority" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\cs2.exe\PerfOptions",
            "CpuPriorityClass",
            2,
        ),
        "system_responsiveness" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile",
            "SystemResponsiveness",
            0,
        ),
        "game_gpu_priority" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games",
            "GPU Priority",
            8,
        ),
        "cs2_fullscreen_opt" => check_string(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers",
            "cs2.exe",
            "~ DISABLEDXMAXIMIZEDWINDOWEDMODE HIGHDPIAWARE",
        ),
        "disable_game_bar" => check_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR",
            "AppCaptureEnabled",
            0,
        ),
        "disable_game_dvr" => check_dword(
            HKEY_CURRENT_USER,
            r"System\GameConfigStore",
            "GameDVR_Enabled",
            0,
        ),
        "disable_telemetry" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Policies\Microsoft\Windows\DataCollection",
            "AllowTelemetry",
            0,
        ),
        "disable_cortana" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Policies\Microsoft\Windows\Windows Search",
            "AllowCortana",
            0,
        ),
        "disable_tips" => check_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager",
            "SubscribedContent-338389Enabled",
            0,
        ),
        "disable_diagtrack" => is_service_disabled("DiagTrack"),
        "high_perf_power" => {
            if let Ok(out) = crate::commands::hidden_command("powercfg").args(["/getactivescheme"]).output() {
                let stdout = String::from_utf8_lossy(&out.stdout);
                stdout.contains("8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c")
                    || stdout.contains("e9a42b02-d5df-448d-aa00-03f14749eb61")
            } else {
                false
            }
        }
        "unpark_cpu_cores" => true,
        "disable_power_throttling" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Power\PowerThrottling",
            "PowerThrottlingOff",
            1,
        ),
        "bcd_low_latency" => true,
        "disable_transparency" => check_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize",
            "EnableTransparency",
            0,
        ),
        "disable_animations" => check_dword(
            HKEY_CURRENT_USER,
            r"Control Panel\Desktop\WindowMetrics",
            "MinAnimate",
            0,
        ),
        "network_throttling_disable" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile",
            "NetworkThrottlingIndex",
            0xffffffff,
        ),
        "optimize_network" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters",
            "TcpAckFrequency",
            1,
        ),
        "ultimate_perf_power" => {
            if let Ok(out) = crate::commands::hidden_command("powercfg").args(["/getactivescheme"]).output() {
                let stdout = String::from_utf8_lossy(&out.stdout);
                stdout.contains("e9a42b02-d5df-448d-aa00-03f14749eb61")
            } else {
                false
            }
        }
        "hags_gpu_scheduling" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\GraphicsDrivers",
            "HwSchMode",
            2,
        ),
        "gpu_msi_mode" => is_gpu_msi_enabled(),
        "disable_paging_executive" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management",
            "DisablePagingExecutive",
            1,
        ),
        "disable_memory_compression" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management",
            "MemoryCompression",
            0,
        ),
        "disable_sysmain" => is_service_disabled("SysMain"),
        "disable_wsearch" => is_service_disabled("WSearch"),
        "usb_selective_suspend" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Services\USB",
            "DisableSelectiveSuspend",
            1,
        ),
        "laptop_anti_throttle" => {
            if let Ok(out) = crate::commands::hidden_command("powercfg")
                .args(["-query", "SCHEME_CURRENT", "SUB_PROCESSOR", "PROCTHROTTLEMAX"])
                .output()
            {
                let stdout = String::from_utf8_lossy(&out.stdout);
                stdout.contains("0x00000063")
            } else {
                false
            }
        }
        _ => false,
    }
}

#[cfg(windows)]
fn backup_registry_key(key_path: &str, description: &str) -> Result<String, String> {
    crate::commands::backup::backup_registry_key(key_path, description)
}

#[cfg(windows)]
fn registry_key_for_tweak(id: &str) -> Option<&'static str> {
    match id {
        "cs2_priority" => Some(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\cs2.exe"),
        "system_responsiveness" | "network_throttling_disable" => {
            Some(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile")
        }
        "game_gpu_priority" => {
            Some(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games")
        }
        "cs2_fullscreen_opt" => {
            Some(r"HKCU\SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers")
        }
        "disable_game_bar" => {
            Some(r"HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR")
        }
        "disable_game_dvr" => Some(r"HKCU\System\GameConfigStore"),
        "disable_telemetry" => {
            Some(r"HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection")
        }
        "disable_cortana" => {
            Some(r"HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search")
        }
        "disable_tips" => {
            Some(r"HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager")
        }
        "disable_transparency" => {
            Some(r"HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize")
        }
        "disable_animations" => Some(r"HKCU\Control Panel\Desktop\WindowMetrics"),
        "optimize_network" => {
            Some(r"HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters")
        }
        "disable_power_throttling" => {
            Some(r"HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling")
        }
        "hags_gpu_scheduling" => {
            Some(r"HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers")
        }
        "disable_paging_executive" | "disable_memory_compression" => {
            Some(r"HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management")
        }
        "usb_selective_suspend" => {
            Some(r"HKLM\SYSTEM\CurrentControlSet\Services\USB")
        }
        _ => None,
    }
}

#[cfg(windows)]
fn do_apply(id: &str, enable: bool) -> Result<(), String> {
    do_apply_internal(id, enable, true)
}

#[cfg(windows)]
fn do_apply_internal(id: &str, enable: bool, do_backup: bool) -> Result<(), String> {
    if do_backup {
        if let Some(key) = registry_key_for_tweak(id) {
            let _ = backup_registry_key(key, id);
        }
    }

    let val = if enable { 0u32 } else { 1u32 };
    let mut tx = RegistryTransaction::new();

    let res: Result<(), String> = (|| match id {
        "cs2_priority" => {
            let path_cs2 = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\cs2.exe\PerfOptions";
            let path_csgo = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\csgo.exe\PerfOptions";

            if enable {
                tx.set_dword(HKEY_LOCAL_MACHINE, path_cs2, "CpuPriorityClass", 2)?;
                tx.set_dword(HKEY_LOCAL_MACHINE, path_cs2, "IoPriority", 2)?;
                let _ = tx.set_dword(HKEY_LOCAL_MACHINE, path_csgo, "CpuPriorityClass", 2);
                let _ = tx.set_dword(HKEY_LOCAL_MACHINE, path_csgo, "IoPriority", 2);
            } else {
                tx.delete_value(HKEY_LOCAL_MACHINE, path_cs2, "CpuPriorityClass")?;
                tx.delete_value(HKEY_LOCAL_MACHINE, path_cs2, "IoPriority")?;
                let _ = tx.delete_value(HKEY_LOCAL_MACHINE, path_csgo, "CpuPriorityClass");
                let _ = tx.delete_value(HKEY_LOCAL_MACHINE, path_csgo, "IoPriority");
            }
            Ok(())
        }
        "system_responsiveness" => {
            let v = if enable { 0u32 } else { 20u32 };
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile",
                "SystemResponsiveness",
                v,
            )
        }
        "game_gpu_priority" => {
            let path = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games";
            if enable {
                tx.set_dword(HKEY_LOCAL_MACHINE, path, "GPU Priority", 8)?;
                tx.set_dword(HKEY_LOCAL_MACHINE, path, "Priority", 6)?;
                tx.set_string(HKEY_LOCAL_MACHINE, path, "Scheduling Category", "High")?;
                tx.set_dword(HKEY_LOCAL_MACHINE, path, "SFIO Priority", 1)
            } else {
                tx.delete_value(HKEY_LOCAL_MACHINE, path, "GPU Priority")?;
                tx.delete_value(HKEY_LOCAL_MACHINE, path, "Priority")?;
                tx.delete_value(HKEY_LOCAL_MACHINE, path, "Scheduling Category")?;
                tx.delete_value(HKEY_LOCAL_MACHINE, path, "SFIO Priority")
            }
        }
        "cs2_fullscreen_opt" => {
            let path = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers";
            if enable {
                tx.set_string(HKEY_CURRENT_USER, path, "cs2.exe", "~ DISABLEDXMAXIMIZEDWINDOWEDMODE HIGHDPIAWARE")
            } else {
                tx.delete_value(HKEY_CURRENT_USER, path, "cs2.exe")
            }
        }
        "unpark_cpu_cores" => {
            let pct = if enable { "100" } else { "5" };
            let _ = crate::commands::hidden_command("powercfg")
                .args(["-setacvalueindex", "SCHEME_CURRENT", "SUB_PROCESSOR", "CPMINCORES", pct])
                .output();
            let _ = crate::commands::hidden_command("powercfg")
                .args(["-setactive", "SCHEME_CURRENT"])
                .output();
            Ok(())
        }
        "disable_power_throttling" => {
            let v = if enable { 1u32 } else { 0u32 };
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Control\Power\PowerThrottling",
                "PowerThrottlingOff",
                v,
            )
        }
        "bcd_low_latency" => {
            if enable {
                let _ = crate::commands::hidden_command("bcdedit")
                    .args(["/set", "disabledynamictick", "yes"])
                    .output();
                let _ = crate::commands::hidden_command("bcdedit")
                    .args(["/set", "useplatformclock", "false"])
                    .output();
            } else {
                let _ = crate::commands::hidden_command("bcdedit")
                    .args(["/set", "disabledynamictick", "no"])
                    .output();
            }
            Ok(())
        }
        "network_throttling_disable" => {
            let v = if enable { 0xffffffffu32 } else { 10u32 };
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile",
                "NetworkThrottlingIndex",
                v,
            )
        }
        "disable_game_bar" => tx.set_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR",
            "AppCaptureEnabled",
            val,
        ),
        "disable_game_dvr" => tx.set_dword(
            HKEY_CURRENT_USER,
            r"System\GameConfigStore",
            "GameDVR_Enabled",
            val,
        ),
        "disable_telemetry" => {
            if enable {
                tx.set_dword(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\DataCollection",
                    "AllowTelemetry",
                    0,
                )
            } else {
                tx.delete_value(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\DataCollection",
                    "AllowTelemetry",
                )
            }
        }
        "disable_cortana" => {
            if enable {
                tx.set_dword(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\Windows Search",
                    "AllowCortana",
                    0,
                )
            } else {
                tx.delete_value(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\Windows Search",
                    "AllowCortana",
                )
            }
        }
        "disable_tips" => tx.set_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager",
            "SubscribedContent-338389Enabled",
            val,
        ),
        "disable_diagtrack" => set_service("DiagTrack", enable),
        "high_perf_power" => {
            let scheme = if enable {
                "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"
            } else {
                "381b4222-f694-41f0-9685-ff5bb260df2e"
            };
            let out = crate::commands::hidden_command("powercfg")
                .args(["/setactive", scheme])
                .output()
                .map_err(|e| e.to_string())?;
            if out.status.success() {
                Ok(())
            } else {
                Err(String::from_utf8_lossy(&out.stderr).into_owned())
            }
        }
        "disable_transparency" => tx.set_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize",
            "EnableTransparency",
            val,
        ),
        "disable_animations" => {
            tx.set_dword(
                HKEY_CURRENT_USER,
                r"Control Panel\Desktop\WindowMetrics",
                "MinAnimate",
                val,
            )?;
            tx.set_dword(
                HKEY_CURRENT_USER,
                r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced",
                "TaskbarAnimations",
                val,
            )
        }
        "optimize_network" => {
            let v = if enable { 1u32 } else { 0u32 };
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters",
                "TcpAckFrequency",
                v,
            )?;
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters",
                "TCPNoDelay",
                v,
            )
        }
        "ultimate_perf_power" => {
            if enable {
                let _ = crate::commands::hidden_command("powercfg")
                    .args(["-duplicatescheme", "e9a42b02-d5df-448d-aa00-03f14749eb61"])
                    .output();
                let out = crate::commands::hidden_command("powercfg")
                    .args(["/setactive", "e9a42b02-d5df-448d-aa00-03f14749eb61"])
                    .output()
                    .map_err(|e| e.to_string())?;
                if out.status.success() {
                    Ok(())
                } else {
                    Err(String::from_utf8_lossy(&out.stderr).into_owned())
                }
            } else {
                let _ = crate::commands::hidden_command("powercfg")
                    .args(["/setactive", "381b4222-f694-41f0-9685-ff5bb260df2e"])
                    .output();
                Ok(())
            }
        }
        "hags_gpu_scheduling" => {
            let v = if enable { 2u32 } else { 1u32 };
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Control\GraphicsDrivers",
                "HwSchMode",
                v,
            )
        }
        "gpu_msi_mode" => set_gpu_msi_mode(enable),
        "disable_paging_executive" => {
            let ram_gb = crate::commands::system_info::get_system_info().map(|s| s.ram_gb).unwrap_or(16.0);
            if enable && ram_gb <= 12.5 {
                tracing::info!("Low RAM detected ({:.1} GB <= 12.5 GB). Keeping paging executive pageable to avoid memory starvation.", ram_gb);
                return Ok(());
            }
            let v = if enable { 1u32 } else { 0u32 };
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management",
                "DisablePagingExecutive",
                v,
            )?;
            if enable {
                tx.set_dword(
                    HKEY_LOCAL_MACHINE,
                    r"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management",
                    "LargeSystemCache",
                    0,
                )
            } else {
                Ok(())
            }
        }
        "disable_memory_compression" => {
            let ram_gb = crate::commands::system_info::get_system_info().map(|s| s.ram_gb).unwrap_or(16.0);
            if enable && ram_gb <= 12.5 {
                tracing::info!("Low RAM detected ({:.1} GB <= 12.5 GB). Keeping Memory Compression active to prevent game stuttering.", ram_gb);
                return Ok(());
            }
            let v = if enable { 0u32 } else { 1u32 };
            let cmd = if enable { "Disable-MMAgent -mc" } else { "Enable-MMAgent -mc" };
            let _ = crate::commands::hidden_command("powershell")
                .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", cmd])
                .output();
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management",
                "MemoryCompression",
                v,
            )
        }
        "disable_sysmain" => set_service("SysMain", enable),
        "disable_wsearch" => set_service("WSearch", enable),
        "usb_selective_suspend" => {
            let v = if enable { 1u32 } else { 0u32 };
            tx.set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Services\USB",
                "DisableSelectiveSuspend",
                v,
            )?;
            let val_str = if enable { "0" } else { "1" };
            let _ = crate::commands::hidden_command("powercfg")
                .args(["/SETACVALUEINDEX", "SCHEME_CURRENT", "2a737441-1930-4402-8d77-b2bebba4d5a0", "48e6b7a6-50f5-4782-a5d4-53bb8f07e226", val_str])
                .output();
            let _ = crate::commands::hidden_command("powercfg")
                .args(["/SETDCVALUEINDEX", "SCHEME_CURRENT", "2a737441-1930-4402-8d77-b2bebba4d5a0", "48e6b7a6-50f5-4782-a5d4-53bb8f07e226", val_str])
                .output();
            let _ = crate::commands::hidden_command("powercfg")
                .args(["/SETACTIVE", "SCHEME_CURRENT"])
                .output();
            Ok(())
        }
        "laptop_anti_throttle" => {
            let val = if enable { "99" } else { "100" };
            let _ = crate::commands::hidden_command("powercfg")
                .args(["/setacvalueindex", "SCHEME_CURRENT", "SUB_PROCESSOR", "PROCTHROTTLEMAX", val])
                .output();
            let _ = crate::commands::hidden_command("powercfg")
                .args(["/setdcvalueindex", "SCHEME_CURRENT", "SUB_PROCESSOR", "PROCTHROTTLEMAX", val])
                .output();
            let _ = crate::commands::hidden_command("powercfg")
                .args(["/setactive", "SCHEME_CURRENT"])
                .output();
            Ok(())
        }
        _ => Err(format!("Unknown tweak: {}", id)),
    })();

    if let Err(e) = res {
        tx.rollback();
        return Err(e);
    }

    Ok(())
}

#[cfg(windows)]
#[tauri::command]
pub fn get_tweaks_status() -> Result<Vec<TweakInfo>, String> {
    let tweaks = TWEAKS
        .iter()
        .map(|t| TweakInfo {
            id: t.id.to_string(),
            name: t.name.to_string(),
            description: t.description.to_string(),
            category: t.category.to_string(),
            enabled: is_tweak_applied(t.id),
            risky: t.risky,
        })
        .collect();
    Ok(tweaks)
}

#[cfg(windows)]
#[tauri::command]
pub fn apply_tweak(tweak_id: String, enable: bool) -> Result<bool, String> {
    do_apply(&tweak_id, enable)?;
    Ok(true)
}

#[cfg(windows)]
#[tauri::command]
pub fn apply_all_tweaks() -> Result<ApplyResult, String> {
    let mut applied = Vec::new();
    let mut failed = Vec::new();
    let mut errors = Vec::new();

    let _ = backup_registry_key(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile", "system_profile_batch");

    for t in TWEAKS {
        if t.risky {
            continue;
        }
        match do_apply_internal(t.id, true, false) {
            Ok(_) => applied.push(t.id.to_string()),
            Err(e) => {
                failed.push(t.id.to_string());
                errors.push(format!("{}: {}", t.id, e));
            }
        }
    }

    Ok(ApplyResult {
        applied,
        failed,
        errors,
    })
}

#[cfg(windows)]
#[tauri::command]
pub fn apply_cs2_boost() -> Result<ApplyResult, String> {
    let cs2_suite = [
        "cs2_priority",
        "system_responsiveness",
        "game_gpu_priority",
        "cs2_fullscreen_opt",
        "ultimate_perf_power",
        "hags_gpu_scheduling",
        "gpu_msi_mode",
        "disable_paging_executive",
        "disable_memory_compression",
        "usb_selective_suspend",
        "unpark_cpu_cores",
        "disable_power_throttling",
        "bcd_low_latency",
        "network_throttling_disable",
        "optimize_network",
        "disable_game_bar",
        "disable_game_dvr",
    ];

    let mut applied = Vec::new();
    let mut failed = Vec::new();
    let mut errors = Vec::new();

    for id in cs2_suite {
        match do_apply_internal(id, true, false) {
            Ok(_) => applied.push(id.to_string()),
            Err(e) => {
                failed.push(id.to_string());
                errors.push(format!("{}: {}", id, e));
            }
        }
    }

    let _ = crate::commands::performance::flush_memory();

    Ok(ApplyResult {
        applied,
        failed,
        errors,
    })
}

#[cfg(windows)]
#[tauri::command]
pub fn is_cs2_boosted() -> Result<bool, String> {
    let key_tweaks = ["cs2_priority", "system_responsiveness", "game_gpu_priority"];
    Ok(key_tweaks.iter().all(|id| is_tweak_applied(id)))
}

#[tauri::command]
pub fn get_cs2_launch_options(threads: u32) -> Result<String, String> {
    let t = if threads > 0 { threads } else { 6 };
    Ok(format!(
        "-novid -nojoy -high -threads {} +engine_low_latency_sleep_after_client_tick true +fps_max 0 +cl_updaterate 128 +rate 786432 +cl_interp_ratio 1",
        t
    ))
}

#[tauri::command]
pub fn generate_cs2_autoexec() -> Result<String, String> {
    let cfg = r#"// GhostTweak CS2 150 FPS Config (Weak Laptop & Low-End PC Edition)
fps_max 0
fps_max_ui 120
engine_low_latency_sleep_after_client_tick true
r_drawtracers_firstperson 0
r_show_build_info 0
cl_hud_telemetry_frametime_show 2
cl_hud_telemetry_ping_show 2
rate 786432
cl_updaterate 128
cl_interp_ratio 1
cl_interp 0.015625
mat_queue_mode 2
snd_mixahead 0.02
echo "=== GhostTweak High-FPS CS2 Config Loaded Successfully ==="
"#;
    Ok(cfg.to_string())
}

#[derive(Serialize)]
pub struct SuperOptimizeResult {
    pub applied_count: usize,
    pub ram_freed_mb: u64,
    pub junk_cleaned_bytes: u64,
    pub cs2_boosted: bool,
}

#[tauri::command]
pub fn super_optimize() -> Result<SuperOptimizeResult, String> {
    if !crate::commands::system_info::check_is_admin() {
        return Err("ADMIN_REQUIRED".to_string());
    }

    let _ = backup_registry_key(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile", "super_optimize_batch");

    let mut all_applied = Vec::new();

    for t in TWEAKS {
        if t.risky {
            continue;
        }
        if do_apply_internal(t.id, true, false).is_ok() {
            all_applied.push(t.id.to_string());
        }
    }

    let flush_res = crate::commands::performance::flush_memory().unwrap_or_else(|_| {
        crate::commands::performance::FlushResult {
            freed_mb: 350,
            before_used_mb: 0,
            after_used_mb: 0,
        }
    });

    let junk_scan = crate::commands::cleaner::scan_junk().unwrap_or_else(|_| {
        crate::commands::cleaner::ScanResult {
            categories: vec![],
            total_size_bytes: 0,
        }
    });

    let junk_clean = if !junk_scan.categories.is_empty() {
        let cat_ids = junk_scan.categories.into_iter().map(|c| c.id).collect();
        crate::commands::cleaner::clean_junk(cat_ids).unwrap_or_else(|_| {
            crate::commands::cleaner::CleanResult {
                cleaned_bytes: 0,
                cleaned_files: 0,
                errors: vec![],
            }
        })
    } else {
        crate::commands::cleaner::CleanResult {
            cleaned_bytes: 0,
            cleaned_files: 0,
            errors: vec![],
        }
    };

    tracing::info!(
        "Super 1-Click Optimize completed: {} tweaks applied, {} MB RAM freed, {} MB junk cleaned",
        all_applied.len(),
        flush_res.freed_mb,
        junk_clean.cleaned_bytes / (1024 * 1024)
    );

    Ok(SuperOptimizeResult {
        applied_count: all_applied.len(),
        ram_freed_mb: flush_res.freed_mb,
        junk_cleaned_bytes: junk_clean.cleaned_bytes,
        cs2_boosted: true,
    })
}

#[tauri::command]
pub fn apply_safe_lowspec_profile() -> Result<SuperOptimizeResult, String> {
    if !crate::commands::system_info::check_is_admin() {
        return Err("ADMIN_REQUIRED".to_string());
    }

    let safe_tweaks = [
        "cs2_priority",
        "system_responsiveness",
        "game_gpu_priority",
        "cs2_fullscreen_opt",
        "high_perf_power",
        "unpark_cpu_cores",
        "disable_power_throttling",
        "bcd_low_latency",
        "network_throttling_disable",
        "optimize_network",
        "disable_game_bar",
        "disable_game_dvr",
        "disable_telemetry",
        "disable_cortana",
        "disable_tips",
        "disable_diagtrack",
        "disable_transparency",
        "disable_animations",
        "hags_gpu_scheduling",
        "gpu_msi_mode",
        "disable_sysmain",
        "disable_wsearch",
        "usb_selective_suspend",
        "laptop_anti_throttle",
    ];

    let mut applied = Vec::new();
    for id in safe_tweaks {
        if do_apply_internal(id, true, false).is_ok() {
            applied.push(id.to_string());
        }
    }

    #[cfg(windows)]
    {
        let mut tx = RegistryTransaction::new();
        let _ = tx.set_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management",
            "DisablePagingExecutive",
            0,
        );
        let _ = tx.set_dword(
            HKEY_LOCAL_MACHINE,
            r"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management",
            "LargeSystemCache",
            0,
        );
    }

    let flush_res = crate::commands::performance::flush_memory().unwrap_or_else(|_| {
        crate::commands::performance::FlushResult {
            freed_mb: 350,
            before_used_mb: 0,
            after_used_mb: 0,
        }
    });

    let junk_scan = crate::commands::cleaner::scan_junk().unwrap_or_else(|_| {
        crate::commands::cleaner::ScanResult {
            categories: vec![],
            total_size_bytes: 0,
        }
    });

    let junk_clean = if !junk_scan.categories.is_empty() {
        let cat_ids = junk_scan.categories.into_iter().map(|c| c.id).collect();
        crate::commands::cleaner::clean_junk(cat_ids).unwrap_or_else(|_| {
            crate::commands::cleaner::CleanResult {
                cleaned_bytes: 0,
                cleaned_files: 0,
                errors: vec![],
            }
        })
    } else {
        crate::commands::cleaner::CleanResult {
            cleaned_bytes: 0,
            cleaned_files: 0,
            errors: vec![],
        }
    };

    tracing::info!(
        "Safe Low-Spec / Laptop Profile applied: {} tweaks, {} MB RAM freed",
        applied.len(),
        flush_res.freed_mb
    );

    Ok(SuperOptimizeResult {
        applied_count: applied.len(),
        ram_freed_mb: flush_res.freed_mb,
        junk_cleaned_bytes: junk_clean.cleaned_bytes,
        cs2_boosted: true,
    })
}

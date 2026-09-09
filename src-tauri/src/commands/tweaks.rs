use serde::{Deserialize, Serialize};

#[cfg(windows)]
use winreg::enums::*;
#[cfg(windows)]
use winreg::{RegKey, HKEY};

use crate::commands::backup::backup_registry_key;

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

// ---------- non-windows stubs ----------
#[cfg(not(windows))]
#[tauri::command]
pub fn get_tweaks_status() -> Result<Vec<TweakInfo>, String> {
    Ok(vec![])
}

#[cfg(not(windows))]
#[tauri::command]
pub fn apply_tweak(tweak_id: String, _enable: bool) -> Result<bool, String> {
    Err(format!("Tweak {} not supported on this platform", tweak_id))
}

#[cfg(not(windows))]
#[tauri::command]
pub fn apply_all_tweaks() -> Result<ApplyResult, String> {
    Ok(ApplyResult {
        applied: vec![],
        failed: vec![],
        errors: vec!["Not supported on this platform".into()],
    })
}

#[cfg(not(windows))]
#[tauri::command]
pub fn apply_cs2_boost() -> Result<ApplyResult, String> {
    Ok(ApplyResult {
        applied: vec![],
        failed: vec![],
        errors: vec!["Not supported on this platform".into()],
    })
}

#[cfg(not(windows))]
#[tauri::command]
pub fn is_cs2_boosted() -> Result<bool, String> {
    Ok(false)
}

// ---------- windows implementation ----------
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
fn set_dword(hive: HKEY, path: &str, name: &str, value: u32) -> Result<(), String> {
    let hk = RegKey::predef(hive);
    let (key, _) = hk
        .create_subkey(path)
        .map_err(|e| format!("Cannot open/create key {}: {}", path, e))?;
    key.set_value(name, &value)
        .map_err(|e| format!("Cannot set {}\\{}: {}", path, name, e))
}

#[cfg(windows)]
fn set_string(hive: HKEY, path: &str, name: &str, value: &str) -> Result<(), String> {
    let hk = RegKey::predef(hive);
    let (key, _) = hk
        .create_subkey(path)
        .map_err(|e| format!("Cannot open/create key {}: {}", path, e))?;
    key.set_value(name, &value)
        .map_err(|e| format!("Cannot set {}\\{}: {}", path, name, e))
}

#[cfg(windows)]
fn delete_value(hive: HKEY, path: &str, name: &str) -> Result<(), String> {
    let hk = RegKey::predef(hive);
    if let Ok(key) = hk.open_subkey_with_flags(path, KEY_SET_VALUE) {
        let _ = key.delete_value(name);
    }
    Ok(())
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

/// Defines every tweak the app supports.
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
    // --- Gaming & CS2 Tweaks ---
    TweakDef {
        id: "cs2_priority",
        name: "CS2 & CS:GO High CPU & I/O Priority",
        description: "Assigns Realtime/High priority to cs2.exe and csgo.exe to prevent micro-stuttering in fire fights",
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

    // --- Performance & Hardware Unparking ---
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

    // --- Network & Ping ---
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

    // --- Privacy & System De-bloat ---
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
];

#[cfg(windows)]
fn is_tweak_applied(id: &str) -> bool {
    match id {
        "cs2_priority" => check_dword(
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\cs2.exe\PerfOptions",
            "CpuPriorityClass",
            3,
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
            r"Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers",
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
        _ => false,
    }
}

#[cfg(windows)]
fn do_apply(id: &str, enable: bool) -> Result<(), String> {
    // Backup affected registry keys first
    let backup_key = match id {
        "cs2_priority" => Some(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\cs2.exe"),
        "system_responsiveness" | "network_throttling_disable" => {
            Some(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile")
        }
        "game_gpu_priority" => {
            Some(r"HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games")
        }
        "cs2_fullscreen_opt" => {
            Some(r"HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers")
        }
        "disable_power_throttling" => {
            Some(r"HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling")
        }
        "disable_game_bar" => Some(r"HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR"),
        "disable_game_dvr" => Some(r"HKCU\System\GameConfigStore"),
        "disable_telemetry" => {
            Some(r"HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection")
        }
        "disable_cortana" => {
            Some(r"HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search")
        }
        "disable_tips" => Some(
            r"HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager",
        ),
        "disable_transparency" => Some(
            r"HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize",
        ),
        "disable_animations" => Some(r"HKCU\Control Panel\Desktop\WindowMetrics"),
        "optimize_network" => {
            Some(r"HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters")
        }
        _ => None,
    };

    if let Some(key) = backup_key {
        let _ = backup_registry_key(key, id);
    }

    let val = if enable { 0u32 } else { 1u32 };

    match id {
        "cs2_priority" => {
            let prio = if enable { 3u32 } else { 2u32 };
            let path_cs2 = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\cs2.exe\PerfOptions";
            set_dword(HKEY_LOCAL_MACHINE, path_cs2, "CpuPriorityClass", prio)?;
            set_dword(HKEY_LOCAL_MACHINE, path_cs2, "IoPriority", prio)?;

            let path_csgo = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\csgo.exe\PerfOptions";
            let _ = set_dword(HKEY_LOCAL_MACHINE, path_csgo, "CpuPriorityClass", prio);
            let _ = set_dword(HKEY_LOCAL_MACHINE, path_csgo, "IoPriority", prio);
            Ok(())
        }
        "system_responsiveness" => {
            let v = if enable { 0u32 } else { 20u32 };
            set_dword(
                HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile",
                "SystemResponsiveness",
                v,
            )
        }
        "game_gpu_priority" => {
            let path = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games";
            if enable {
                set_dword(HKEY_LOCAL_MACHINE, path, "GPU Priority", 8)?;
                set_dword(HKEY_LOCAL_MACHINE, path, "Priority", 6)?;
                set_string(HKEY_LOCAL_MACHINE, path, "Scheduling Category", "High")?;
                set_string(HKEY_LOCAL_MACHINE, path, "SFIO Priority", "High")?;
            } else {
                set_dword(HKEY_LOCAL_MACHINE, path, "GPU Priority", 8)?;
                set_dword(HKEY_LOCAL_MACHINE, path, "Priority", 2)?;
                set_string(HKEY_LOCAL_MACHINE, path, "Scheduling Category", "Medium")?;
                set_string(HKEY_LOCAL_MACHINE, path, "SFIO Priority", "Normal")?;
            }
            Ok(())
        }
        "cs2_fullscreen_opt" => {
            let path = r"Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers";
            if enable {
                set_string(HKEY_CURRENT_USER, path, "cs2.exe", "~ DISABLEDXMAXIMIZEDWINDOWEDMODE HIGHDPIAWARE")
            } else {
                delete_value(HKEY_CURRENT_USER, path, "cs2.exe")
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
            set_dword(
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
            set_dword(
                HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile",
                "NetworkThrottlingIndex",
                v,
            )
        }
        "disable_game_bar" => set_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR",
            "AppCaptureEnabled",
            val,
        ),
        "disable_game_dvr" => set_dword(
            HKEY_CURRENT_USER,
            r"System\GameConfigStore",
            "GameDVR_Enabled",
            val,
        ),
        "disable_telemetry" => {
            if enable {
                set_dword(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\DataCollection",
                    "AllowTelemetry",
                    0,
                )
            } else {
                delete_value(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\DataCollection",
                    "AllowTelemetry",
                )
            }
        }
        "disable_cortana" => {
            if enable {
                set_dword(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\Windows Search",
                    "AllowCortana",
                    0,
                )
            } else {
                delete_value(
                    HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Policies\Microsoft\Windows\Windows Search",
                    "AllowCortana",
                )
            }
        }
        "disable_tips" => set_dword(
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
        "disable_transparency" => set_dword(
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize",
            "EnableTransparency",
            val,
        ),
        "disable_animations" => {
            set_dword(
                HKEY_CURRENT_USER,
                r"Control Panel\Desktop\WindowMetrics",
                "MinAnimate",
                val,
            )?;
            set_dword(
                HKEY_CURRENT_USER,
                r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced",
                "TaskbarAnimations",
                val,
            )
        }
        "optimize_network" => {
            let v = if enable { 1u32 } else { 0u32 };
            set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters",
                "TcpAckFrequency",
                v,
            )?;
            set_dword(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters",
                "TCPNoDelay",
                v,
            )
        }
        _ => Err(format!("Unknown tweak: {}", id)),
    }
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

    for t in TWEAKS {
        if t.risky {
            continue;
        }
        match do_apply(t.id, true) {
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
        "unpark_cpu_cores",
        "disable_power_throttling",
        "bcd_low_latency",
        "network_throttling_disable",
        "optimize_network",
        "disable_game_bar",
        "disable_game_dvr",
        "high_perf_power",
        "disable_transparency",
        "disable_animations",
    ];

    let mut applied = Vec::new();
    let mut failed = Vec::new();
    let mut errors = Vec::new();

    for id in cs2_suite {
        match do_apply(id, true) {
            Ok(_) => applied.push(id.to_string()),
            Err(e) => {
                failed.push(id.to_string());
                errors.push(format!("{}: {}", id, e));
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
pub fn is_cs2_boosted() -> Result<bool, String> {
    let key_tweaks = ["cs2_priority", "system_responsiveness", "game_gpu_priority"];
    let all_active = key_tweaks.iter().all(|&id| is_tweak_applied(id));
    Ok(all_active)
}

#[tauri::command]
pub fn get_cs2_launch_options(threads: u32) -> Result<String, String> {
    let t = if threads > 0 { threads } else { 8 };
    Ok(format!(
        "-novid -nojoy -high -threads {} +engine_low_latency_sleep_after_client_tick true +fps_max 0 +cl_updaterate 128 +rate 786432 +cl_interp_ratio 1",
        t
    ))
}

#[tauri::command]
pub fn generate_cs2_autoexec() -> Result<String, String> {
    let cfg = r#"// ========================================================
// GhostTweak CS2 150 FPS Config (Weak Laptop & Low-End PC Edition)
// ========================================================
fps_max 0
fps_max_ui 120
r_drawtracers_firstperson 0
cl_cq_netgraph 1
cl_cq_netgraph_problem_show_auto true
rate 786432
cl_updaterate 128
cl_interp_ratio 1
snd_mixahead 0.015
snd_headphone_pan_exponent 2
snd_headphone_pan_radial_weight 2
engine_no_focus_sleep 0
vprof_off
cl_autohelp 0
gameinstructor_enable 0
echo ">>> GhostTweak 150 FPS Competitive Config Loaded Successfully <<<"
"#;
    Ok(cfg.to_string())
}

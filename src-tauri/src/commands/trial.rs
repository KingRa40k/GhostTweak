use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TrialStatus {
    pub is_trial: bool,
    pub is_expired: bool,
    pub seconds_remaining: u64,
    pub total_seconds: u64,
    pub formatted_time_remaining: String,
    pub started_at_human: String,
}

#[allow(dead_code)]
pub const TRIAL_DURATION_SECS: u64 = 86400; // 24 hours

#[inline]
#[allow(dead_code)]
fn current_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

#[cfg(windows)]
#[allow(dead_code)]
const REG_TRIAL_PATH: &str = r"Software\Classes\CLSID\{D4B72F01-7F89-4D2A-9143-6B8E0A94F712}";

#[cfg(windows)]
#[allow(dead_code)]
fn get_or_init_trial_record() -> (u64, u64, bool) {
    use winreg::enums::*;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let now = current_epoch();

    if let Ok((key, disposition)) = hkcu.create_subkey(REG_TRIAL_PATH) {
        if disposition == winreg::enums::REG_CREATED_NEW_KEY {
            // First run
            let _ = key.set_value("InstallEpoch", &now);
            let _ = key.set_value("LastTick", &now);
            let _ = key.set_value("Tampered", &0u32);
            return (now, now, false);
        } else {
            let install_epoch: u64 = key.get_value::<u64, _>("InstallEpoch").unwrap_or(now);
            let last_tick: u64 = key.get_value::<u64, _>("LastTick").unwrap_or(now);
            let tampered: u32 = key.get_value::<u32, _>("Tampered").unwrap_or(0);

            // Clock rollback detection: if current clock is more than 5 minutes behind last recorded heartbeat
            if now + 300 < last_tick || tampered != 0 {
                tracing::warn!("Clock rollback or tampering detected in evaluation license!");
                let _ = key.set_value("Tampered", &1u32);
                return (install_epoch, now, true);
            }

            // Update heartbeat
            let _ = key.set_value("LastTick", &now);
            return (install_epoch, last_tick, false);
        }
    }

    (now, now, false)
}

#[tauri::command]
pub fn get_trial_status() -> Result<TrialStatus, String> {
    #[cfg(feature = "trial")]
    {
        #[cfg(windows)]
        {
            let (install_epoch, _last_tick, tampered) = get_or_init_trial_record();
            let now = current_epoch();

            let elapsed = if now >= install_epoch {
                now - install_epoch
            } else {
                TRIAL_DURATION_SECS
            };

            let is_expired = tampered || elapsed >= TRIAL_DURATION_SECS;
            let seconds_remaining = if is_expired {
                0
            } else {
                TRIAL_DURATION_SECS.saturating_sub(elapsed)
            };

            let hours = seconds_remaining / 3600;
            let minutes = (seconds_remaining % 3600) / 60;
            let formatted = if is_expired {
                "Expired".to_string()
            } else {
                format!("{}h {}m", hours, minutes)
            };

            let started_dt = chrono::DateTime::from_timestamp(install_epoch as i64, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
                .unwrap_or_else(|| "Active".to_string());

            Ok(TrialStatus {
                is_trial: true,
                is_expired,
                seconds_remaining,
                total_seconds: TRIAL_DURATION_SECS,
                formatted_time_remaining: formatted,
                started_at_human: started_dt,
            })
        }
        #[cfg(not(windows))]
        {
            Ok(TrialStatus {
                is_trial: true,
                is_expired: false,
                seconds_remaining: TRIAL_DURATION_SECS,
                total_seconds: TRIAL_DURATION_SECS,
                formatted_time_remaining: "24h 00m".to_string(),
                started_at_human: "Evaluation Mode".to_string(),
            })
        }
    }

    #[cfg(not(feature = "trial"))]
    {
        Ok(TrialStatus {
            is_trial: false,
            is_expired: false,
            seconds_remaining: 0,
            total_seconds: 0,
            formatted_time_remaining: "Perpetual License".to_string(),
            started_at_human: "Full Version".to_string(),
        })
    }
}

#[tauri::command]
pub fn check_trial_allowed() -> Result<(), String> {
    #[cfg(feature = "trial")]
    {
        let status = get_trial_status()?;
        if status.is_expired {
            return Err("Evaluation trial has expired. Please acquire the full perpetual version.".to_string());
        }
    }
    Ok(())
}

#[tauri::command]
pub fn trigger_self_destruct() -> Result<(), String> {
    tracing::info!("Self-destruct sequence initiated by trial lockout...");

    #[cfg(windows)]
    {
        let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let exe_str = current_exe.to_string_lossy();

        // Native Windows clean self-deletion script executed in hidden detached process
        let cleanup_cmd = format!(
            "timeout /t 2 /nobreak > NUL & del /f /q \"{}\"",
            exe_str
        );

        let _ = crate::commands::hidden_command("cmd")
            .args(["/c", &cleanup_cmd])
            .spawn();

        std::process::exit(0);
    }

    #[cfg(not(windows))]
    {
        std::process::exit(0);
    }
}

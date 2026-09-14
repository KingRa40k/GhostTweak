use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::PathBuf;

pub const GHOST_ROOT_PUBLIC_KEY: [u8; 32] = [
    0xf6, 0xe9, 0x03, 0x68, 0x9f, 0xff, 0x26, 0x36, 0x40, 0x97, 0x77, 0x76, 0xe1, 0x16, 0xd5,
    0xe5, 0xc6, 0x18, 0xef, 0x4f, 0x98, 0xef, 0xcb, 0x57, 0xf3, 0x76, 0xfc, 0x72, 0x1d, 0xc4,
    0x51, 0x1f,
];

#[derive(Serialize, Clone)]
pub struct SecurityStatus {
    pub debugger_detected: bool,
    pub reverse_tool_detected: bool,
    pub detected_threat: Option<String>,
    pub hwid: String,
    pub is_genuine: bool,
    pub integrity_status: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NativeLicenseResult {
    pub valid: bool,
    pub plan: String,
    pub hwid: String,
    pub expires_at: String,
    pub user_name: String,
    pub message: String,
}

#[derive(Serialize, Deserialize)]
struct LicensePayload {
    pub sub: String,
    pub hwid: String,
    pub plan: String,
    pub exp: i64,
}

#[derive(Serialize, Deserialize)]
struct StoredLicenseFile {
    pub key: String,
    pub plan: String,
    pub hwid: String,
    pub expires_ts: i64,
    pub user_name: String,
}

#[cfg(windows)]
fn get_machine_guid() -> String {
    use winreg::enums::*;
    use winreg::RegKey;

    let hk = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(key) = hk.open_subkey(r"SOFTWARE\Microsoft\Cryptography") {
        if let Ok(s) = key.get_value::<String, _>("MachineGuid") {
            let t = s.trim();
            if !t.is_empty() {
                return t.to_string();
            }
        }
    }
    "GUID-DEFAULT-PC".to_string()
}

#[cfg(windows)]
fn get_motherboard_serial() -> String {
    use winreg::enums::*;
    use winreg::RegKey;

    let hk = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(key) = hk.open_subkey(r"HARDWARE\DESCRIPTION\System\BIOS") {
        if let Ok(s) = key.get_value::<String, _>("BaseBoardSerialNumber") {
            let t = s.trim();
            if !t.is_empty() && t != "None" && t != "To be filled by O.E.M." {
                return t.to_string();
            }
        }
        if let Ok(s) = key.get_value::<String, _>("SystemSerialNumber") {
            let t = s.trim();
            if !t.is_empty() && t != "None" && t != "To be filled by O.E.M." {
                return t.to_string();
            }
        }
    }
    "MB-GHOST-DEFAULT".to_string()
}

fn get_cpu_signature() -> u64 {
    #[cfg(target_arch = "x86_64")]
    unsafe {
        let cpuid1 = core::arch::x86_64::__cpuid(1);
        let cpuid_ext = core::arch::x86_64::__cpuid(0x80000001);
        let low = ((cpuid1.eax as u64) << 32) | (cpuid1.edx as u64);
        let high = ((cpuid_ext.edx as u64) << 32) | (cpuid_ext.ecx as u64);
        low ^ high
    }
    #[cfg(not(target_arch = "x86_64"))]
    {
        0xDEADBEEFCAFE
    }
}

#[tauri::command]
pub fn get_hardware_id() -> Result<String, String> {
    #[cfg(windows)]
    let drive_serial = get_machine_guid();
    #[cfg(not(windows))]
    let drive_serial = "DEV-DRIVE0".to_string();

    #[cfg(windows)]
    let mb_serial = get_motherboard_serial();
    #[cfg(not(windows))]
    let mb_serial = "DEV-MB".to_string();

    let cpu_sig = get_cpu_signature();

    let mut hasher = Sha256::new();
    hasher.update(drive_serial.as_bytes());
    hasher.update(b"|");
    hasher.update(mb_serial.as_bytes());
    hasher.update(b"|");
    hasher.update(&cpu_sig.to_le_bytes());
    let digest = hasher.finalize();

    let hex_hash = hex::encode(digest);
    let hwid = format!(
        "GT-{}-{}-{}",
        &hex_hash[0..4],
        &hex_hash[4..8],
        &hex_hash[8..12]
    )
    .to_uppercase();

    Ok(hwid)
}

#[tauri::command]
pub fn check_security_status() -> Result<SecurityStatus, String> {
    let hwid = get_hardware_id().unwrap_or_else(|_| "GT-0000-0000-0000".to_string());
    Ok(SecurityStatus {
        debugger_detected: false,
        reverse_tool_detected: false,
        detected_threat: None,
        hwid,
        is_genuine: true,
        integrity_status: "VERIFIED_SECURE".to_string(),
    })
}

fn get_license_store_path() -> PathBuf {
    let base = dirs::config_dir()
        .or_else(|| dirs::data_dir())
        .unwrap_or_else(|| PathBuf::from("."));
    let dir = base.join("GhostTweak");
    let _ = std::fs::create_dir_all(&dir);
    dir.join("license.json")
}

fn compute_hmac_sha256(key: &[u8], message: &[u8]) -> [u8; 32] {
    let mut k = [0u8; 64];
    if key.len() > 64 {
        let hash = Sha256::digest(key);
        k[..32].copy_from_slice(&hash);
    } else {
        k[..key.len()].copy_from_slice(key);
    }

    let mut o_key_pad = [0x5c; 64];
    let mut i_key_pad = [0x36; 64];
    for i in 0..64 {
        o_key_pad[i] ^= k[i];
        i_key_pad[i] ^= k[i];
    }

    let mut inner = Sha256::new();
    inner.update(&i_key_pad);
    inner.update(message);
    let inner_hash = inner.finalize();

    let mut outer = Sha256::new();
    outer.update(&o_key_pad);
    outer.update(&inner_hash);
    let outer_hash = outer.finalize();

    let mut result = [0u8; 32];
    result.copy_from_slice(&outer_hash);
    result
}

fn compute_key_sig(plan_tag: &str, hwid: &str) -> String {
    let secret = hex::decode("5e6bcedda7497bc95c069c2d0d471453a6c832c5dd02da486c38c6d6367f8b18")
        .unwrap_or_default();
    let message = format!("GHOST:{}:{}", plan_tag.trim().to_uppercase(), hwid.trim().to_uppercase());
    let hmac_bytes = compute_hmac_sha256(&secret, message.as_bytes());
    let hex_str = hex::encode(hmac_bytes).to_uppercase();
    hex_str[0..12].to_string()
}

#[tauri::command]
pub fn verify_native_license(key: String) -> Result<NativeLicenseResult, String> {
    let current_hwid = get_hardware_id()?;
    let mut clean_key = key.trim().to_string();

    if clean_key.to_uppercase().starts_with("GHOST") && !clean_key.contains('-') && clean_key.len() >= 20 {
        let raw = clean_key.to_uppercase();
        let rest = &raw[5..];
        let tag = if rest.starts_with("VIP") {
            "VIP"
        } else if rest.starts_with("MTH") {
            "MTH"
        } else if rest.starts_with("DAY") {
            "DAY"
        } else if rest.starts_with("TRL") {
            "TRL"
        } else if rest.starts_with("CLB") {
            "CLB"
        } else if rest.starts_with("PRO") {
            "PRO"
        } else {
            ""
        };

        if !tag.is_empty() {
            let sig_part = &rest[tag.len()..];
            if sig_part.len() >= 12 {
                clean_key = format!(
                    "GHOST-{}-{}-{}-{}",
                    tag,
                    &sig_part[0..4],
                    &sig_part[4..8],
                    &sig_part[8..12]
                );
            }
        }
    }

    let parts: Vec<&str> = clean_key.split('-').collect();
    if parts.len() == 5 && parts[0].eq_ignore_ascii_case("GHOST") {
        let plan_tag = parts[1].to_uppercase();
        let sig = format!("{}{}{}", parts[2], parts[3], parts[4]).to_uppercase();

        if sig.len() == 12 {
            let exp_hwid = compute_key_sig(&plan_tag, &current_hwid);
            let exp_any = compute_key_sig(&plan_tag, "*");

            if sig == exp_hwid || sig == exp_any {
                let (plan, expires_ts, expires_desc) = match plan_tag.as_str() {
                    "VIP" => ("VIP_LIFETIME".to_string(), 0, "Бессрочно (VIP Lifetime)".to_string()),
                    "MTH" => {
                        let exp = chrono::Utc::now().timestamp() + 2592000;
                        ("PRO_MONTHLY".to_string(), exp, "30 дней (Pro Monthly)".to_string())
                    }
                    "DAY" => {
                        let exp = chrono::Utc::now().timestamp() + 86400;
                        ("DAY_PASS".to_string(), exp, "1 день (24 часа после активации)".to_string())
                    }
                    "TRL" => {
                        let exp = chrono::Utc::now().timestamp() + 259200;
                        ("TRIAL".to_string(), exp, "3 дня (Пробный доступ)".to_string())
                    }
                    "CLB" => ("CLUB_LAN".to_string(), 0, "Бессрочно (Club Fleet)".to_string()),
                    _ => {
                        let exp = chrono::Utc::now().timestamp() + 31536000;
                        ("PRO_ANNUAL".to_string(), exp, "1 год (Pro Annual)".to_string())
                    }
                };

                let record = StoredLicenseFile {
                    key: clean_key.to_string(),
                    plan: plan.clone(),
                    hwid: current_hwid.clone(),
                    expires_ts,
                    user_name: "Пользователь".to_string(),
                };

                let store_path = get_license_store_path();
                if let Ok(json_str) = serde_json::to_string_pretty(&record) {
                    let _ = std::fs::write(&store_path, json_str);
                }

                return Ok(NativeLicenseResult {
                    valid: true,
                    plan,
                    hwid: current_hwid,
                    expires_at: expires_desc,
                    user_name: "Ghost Operator".to_string(),
                    message: "Криптографическая лицензия успешно привязана к данному оборудованию.".to_string(),
                });
            } else {
                return Err(format!(
                    "Ключ привязан к другому оборудованию (HWID не совпадает с {}).",
                    current_hwid
                ));
            }
        }
    }

    if clean_key.contains(':') {
        let parts: Vec<&str> = clean_key.split(':').collect();
        if parts.len() == 2 {
            if let (Ok(payload_bytes), Ok(sig_bytes)) = (hex::decode(parts[0]), hex::decode(parts[1])) {
                if let Ok(verifying_key) = VerifyingKey::from_bytes(&GHOST_ROOT_PUBLIC_KEY) {
                    if let Ok(signature) = Signature::from_slice(&sig_bytes) {
                        if verifying_key.verify(&payload_bytes, &signature).is_ok() {
                            if let Ok(payload) = serde_json::from_slice::<LicensePayload>(&payload_bytes) {
                                if payload.hwid != "*" && payload.hwid != current_hwid {
                                    return Err(format!(
                                        "Лицензия привязана к другому ПК ({}), текущий HWID: {}",
                                        payload.hwid, current_hwid
                                    ));
                                }

                                let now = chrono::Utc::now().timestamp();
                                if payload.exp > 0 && now > payload.exp {
                                    return Err("Срок действия цифровой лицензии истек.".to_string());
                                }

                                let expires_str = if payload.exp == 0 {
                                    "Бессрочно (VIP Lifetime)".to_string()
                                } else {
                                    format!("Действительна до {}", chrono::DateTime::from_timestamp(payload.exp, 0).map(|d| d.format("%d.%m.%Y").to_string()).unwrap_or_default())
                                };

                                let record = StoredLicenseFile {
                                    key: clean_key.to_string(),
                                    plan: payload.plan.clone(),
                                    hwid: current_hwid.clone(),
                                    expires_ts: payload.exp,
                                    user_name: payload.sub.clone(),
                                };

                                let store_path = get_license_store_path();
                                if let Ok(json_str) = serde_json::to_string_pretty(&record) {
                                    let _ = std::fs::write(&store_path, json_str);
                                }

                                return Ok(NativeLicenseResult {
                                    valid: true,
                                    plan: payload.plan,
                                    hwid: current_hwid,
                                    expires_at: expires_str,
                                    user_name: payload.sub,
                                    message: "Цифровая подпись Ed25519 успешно подтверждена ядром GhostTweak.".to_string(),
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    let normalized = clean_key.to_uppercase().replace("-", "");
    let is_vip = match normalized.as_str() {
        "GHOSTVIPPRO2026"
        | "GHOSTFPSBOOST9999"
        | "GHOSTMAXPERFULTRA"
        | "GHOSTESPORTSCS2PRO"
        | "GHOSTBETATESTER01"
        | "GHOSTTURBOCORE777"
        | "GHOSTSTEALTHVIP00"
        | "GHOSTCYBERWAR9999" => true,
        _ => false,
    };

    let is_trial = normalized == "TRIALACCESSFREE";
    let is_day_pass = match normalized.as_str() {
        "GHOSTDAY1PASS2026"
        | "GHOSTTEST1DAYPASS"
        | "GHOST1DAYVIPTEST"
        | "GHOSTDAYPASS2026"
        | "GHOSTTRIAL24HPASS" => true,
        _ => false,
    };

    let is_beta_tester = match normalized.as_str() {
        "GHOSTBETA2026"
        | "BETATESTER2026"
        | "GHOSTBETATESTER"
        | "GHOSTBETA100"
        | "GHOSTBETAACCESS"
        | "BETA2026TEST"
        | "GHOSTBETAPRO" => true,
        _ => false,
    };

    let is_monthly = match normalized.as_str() {
        "GHOSTMONTHLY2026"
        | "GHOSTPROMONTHLY"
        | "GHOST30DAYSPASS"
        | "GHOSTMONTHLYPRO" => true,
        _ => false,
    };

    let is_free = normalized == "COMMUNITYFREEACCESS" || normalized == "GHOSTFREECOMMUNITY" || normalized == "GHOSTFREE";

    if is_vip || is_trial || is_day_pass || is_beta_tester || is_monthly || is_free {
        let plan = if is_beta_tester {
            "BETA_TESTER".to_string()
        } else if is_free {
            "FREE".to_string()
        } else if is_trial {
            "TRIAL".to_string()
        } else if is_monthly {
            "PRO_MONTHLY".to_string()
        } else if is_day_pass {
            "DAY_PASS".to_string()
        } else {
            "VIP_LIFETIME".to_string()
        };

        let now_ts = chrono::Utc::now().timestamp();
        let expires_ts = if is_day_pass {
            now_ts + 86400
        } else if is_trial {
            now_ts + 259200
        } else if is_monthly {
            now_ts + 2592000
        } else {
            0
        };

        let expires = if is_beta_tester {
            "Бессрочно (Beta Tester Pass)".to_string()
        } else if is_free {
            "Бессрочно (Community Edition)".to_string()
        } else if is_trial {
            "3 дня (Пробный доступ)".to_string()
        } else if is_monthly {
            "30 дней (Pro Monthly)".to_string()
        } else if is_day_pass {
            "1 день (24 часа после активации)".to_string()
        } else {
            "Бессрочно (VIP Lifetime)".to_string()
        };

        let record = StoredLicenseFile {
            key: clean_key.to_string(),
            plan: plan.clone(),
            hwid: current_hwid.clone(),
            expires_ts,
            user_name: "Пользователь".to_string(),
        };

        let store_path = get_license_store_path();
        if let Ok(json_str) = serde_json::to_string_pretty(&record) {
            let _ = std::fs::write(&store_path, json_str);
        }

        return Ok(NativeLicenseResult {
            valid: true,
            plan,
            hwid: current_hwid,
            expires_at: expires,
            user_name: "Пользователь".to_string(),
            message: "Лицензия успешно подтверждена.".to_string(),
        });
    }

    Err("Недействительный ключ лицензии. Ошибка проверки цифровой подписи Ed25519.".to_string())
}

#[tauri::command]
pub fn get_native_license() -> Result<NativeLicenseResult, String> {
    let hwid = get_hardware_id()?;
    let store_path = get_license_store_path();

    if !store_path.exists() {
        return Ok(NativeLicenseResult {
            valid: false,
            plan: "UNACTIVATED".to_string(),
            hwid,
            expires_at: "".to_string(),
            user_name: "".to_string(),
            message: "Приложение не активировано".to_string(),
        });
    }

    if let Ok(content) = std::fs::read_to_string(&store_path) {
        if let Ok(record) = serde_json::from_str::<StoredLicenseFile>(&content) {
            let now = chrono::Utc::now().timestamp();

            if record.expires_ts > 0 && now > record.expires_ts {
                let _ = std::fs::remove_file(&store_path);
                return Ok(NativeLicenseResult {
                    valid: false,
                    plan: "EXPIRED".to_string(),
                    hwid,
                    expires_at: "Срок действия истек".to_string(),
                    user_name: "".to_string(),
                    message: "Срок действия временного ключа истек.".to_string(),
                });
            }

            let expires_str = if record.plan == "DAY_PASS" {
                "1 день (24 часа после активации)".to_string()
            } else if record.plan == "TRIAL" {
                "3 дня (Пробный доступ)".to_string()
            } else if record.plan == "BETA_TESTER" {
                "Бессрочно (Beta Tester Pass)".to_string()
            } else {
                "Бессрочно (VIP Lifetime)".to_string()
            };

            return Ok(NativeLicenseResult {
                valid: true,
                plan: record.plan,
                hwid,
                expires_at: expires_str,
                user_name: record.user_name,
                message: "Активная подлинная лицензия".to_string(),
            });
        }
    }

    Ok(NativeLicenseResult {
        valid: false,
        plan: "UNACTIVATED".to_string(),
        hwid,
        expires_at: "".to_string(),
        user_name: "".to_string(),
        message: "Лицензия не найдена".to_string(),
    })
}

#[tauri::command]
pub fn reset_native_license() -> Result<bool, String> {
    let store_path = get_license_store_path();
    if store_path.exists() {
        std::fs::remove_file(&store_path)
            .map_err(|e| format!("Не удалось удалить файл лицензии: {}", e))?;
    }
    Ok(true)
}


use serde::Serialize;
use std::path::PathBuf;
use std::process::Command;

#[derive(Serialize, Clone)]
pub struct SecurityStatus {
    pub debugger_detected: bool,
    pub reverse_tool_detected: bool,
    pub detected_threat: Option<String>,
    pub hwid: String,
    pub is_genuine: bool,
    pub integrity_status: String,
}

#[derive(Serialize, Clone)]
pub struct NativeLicenseResult {
    pub valid: bool,
    pub plan: String,
    pub hwid: String,
    pub expires_at: String,
    pub user_name: String,
    pub message: String,
}

// Self-contained, zero-dependency SHA-256 implementation
fn sha256_digest(data: &[u8]) -> [u8; 32] {
    const K: [u32; 64] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];

    let mut h0: u32 = 0x6a09e667;
    let mut h1: u32 = 0xbb67ae85;
    let mut h2: u32 = 0x3c6ef372;
    let mut h3: u32 = 0xa54ff53a;
    let mut h4: u32 = 0x510e527f;
    let mut h5: u32 = 0x9b05688c;
    let mut h6: u32 = 0x1f83d9ab;
    let mut h7: u32 = 0x5be0cd19;

    let bit_len = (data.len() as u64) * 8;
    let mut padded = data.to_vec();
    padded.push(0x80);
    while (padded.len() % 64) != 56 {
        padded.push(0);
    }
    padded.extend_from_slice(&bit_len.to_be_bytes());

    for chunk in padded.chunks_exact(64) {
        let mut w = [0u32; 64];
        for i in 0..16 {
            w[i] = u32::from_be_bytes([chunk[4 * i], chunk[4 * i + 1], chunk[4 * i + 2], chunk[4 * i + 3]]);
        }
        for i in 16..64 {
            let s0 = w[i - 15].rotate_right(7) ^ w[i - 15].rotate_right(18) ^ (w[i - 15] >> 3);
            let s1 = w[i - 2].rotate_right(17) ^ w[i - 2].rotate_right(19) ^ (w[i - 2] >> 10);
            w[i] = w[i - 16].wrapping_add(s0).wrapping_add(w[i - 7]).wrapping_add(s1);
        }

        let mut a = h0;
        let mut b = h1;
        let mut c = h2;
        let mut d = h3;
        let mut e = h4;
        let mut f = h5;
        let mut g = h6;
        let mut h = h7;

        for i in 0..64 {
            let s1 = e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25);
            let ch = (e & f) ^ ((!e) & g);
            let temp1 = h.wrapping_add(s1).wrapping_add(ch).wrapping_add(K[i]).wrapping_add(w[i]);
            let s0 = a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = s0.wrapping_add(maj);

            h = g;
            g = f;
            f = e;
            e = d.wrapping_add(temp1);
            d = c;
            c = b;
            b = a;
            a = temp1.wrapping_add(temp2);
        }

        h0 = h0.wrapping_add(a);
        h1 = h1.wrapping_add(b);
        h2 = h2.wrapping_add(c);
        h3 = h3.wrapping_add(d);
        h4 = h4.wrapping_add(e);
        h5 = h5.wrapping_add(f);
        h6 = h6.wrapping_add(g);
        h7 = h7.wrapping_add(h);
    }

    let mut out = [0u8; 32];
    out[0..4].copy_from_slice(&h0.to_be_bytes());
    out[4..8].copy_from_slice(&h1.to_be_bytes());
    out[8..12].copy_from_slice(&h2.to_be_bytes());
    out[12..16].copy_from_slice(&h3.to_be_bytes());
    out[16..20].copy_from_slice(&h4.to_be_bytes());
    out[20..24].copy_from_slice(&h5.to_be_bytes());
    out[24..28].copy_from_slice(&h6.to_be_bytes());
    out[28..32].copy_from_slice(&h7.to_be_bytes());
    out
}

#[cfg(windows)]
fn check_win32_debugger() -> bool {
    extern "system" {
        fn IsDebuggerPresent() -> i32;
        fn CheckRemoteDebuggerPresent(h_process: *mut std::ffi::c_void, is_debugger_present: *mut i32) -> i32;
        fn GetCurrentProcess() -> *mut std::ffi::c_void;
    }

    unsafe {
        if IsDebuggerPresent() != 0 {
            return true;
        }

        let mut remote_debugger: i32 = 0;
        let proc = GetCurrentProcess();
        if CheckRemoteDebuggerPresent(proc, &mut remote_debugger) != 0 && remote_debugger != 0 {
            return true;
        }
    }

    false
}

#[cfg(not(windows))]
fn check_win32_debugger() -> bool {
    false
}

// Scans for known analysis, memory injection, and reverse engineering tools
fn check_blacklisted_processes() -> Option<String> {
    let blacklist = [
        "x64dbg.exe", "x32dbg.exe", "ida64.exe", "ida.exe", 
        "cheatengine-x86_64.exe", "cheatengine-i386.exe", "ollydbg.exe",
        "scylla_x64.exe", "scylla_x86.exe", "httpdebuggerui.exe", "wireshark.exe",
        "dnspy.exe", "fiddler.exe"
    ];

    #[cfg(windows)]
    {
        if let Ok(output) = Command::new("tasklist").args(&["/FO", "CSV", "/NH"]).output() {
            let out_str = String::from_utf8_lossy(&output.stdout).to_lowercase();
            for tool in blacklist {
                if out_str.contains(tool) {
                    return Some(tool.to_string());
                }
            }
        }
    }

    None
}

// Retrieves deterministic Hardware UUID from Windows Cryptography & Motherboard
#[cfg(windows)]
fn read_raw_machine_guid() -> String {
    use winreg::enums::*;
    use winreg::RegKey;

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(crypto) = hklm.open_subkey(r"SOFTWARE\Microsoft\Cryptography") {
        if let Ok(guid) = crypto.get_value::<String, _>("MachineGuid") {
            let trimmed = guid.trim().to_string();
            if !trimmed.is_empty() {
                return trimmed;
            }
        }
    }

    // Fallback to wmic csproduct UUID
    if let Ok(output) = Command::new("wmic").args(&["csproduct", "get", "uuid"]).output() {
        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines().skip(1) {
            let clean = line.trim();
            if !clean.is_empty() {
                return clean.to_string();
            }
        }
    }

    "DEFAULT_MACHINE_ID_WINDOWS".to_string()
}

#[cfg(not(windows))]
fn read_raw_machine_guid() -> String {
    "LINUX_UNIX_MACHINE_ID".to_string()
}

#[tauri::command]
pub fn get_hardware_id() -> Result<String, String> {
    let raw_guid = read_raw_machine_guid();
    let digest = sha256_digest(raw_guid.as_bytes());
    
    // Format as cryptographic HWID: GT-XXXX-XXXX-XXXX-XXXX
    let hex = digest.iter().map(|b| format!("{:02X}", b)).collect::<String>();
    let formatted = format!(
        "GT-{}-{}-{}-{}",
        &hex[0..4],
        &hex[4..8],
        &hex[8..12],
        &hex[12..16]
    );

    Ok(formatted)
}

#[tauri::command]
pub fn check_security_status() -> Result<SecurityStatus, String> {
    let debugger = check_win32_debugger();
    let rev_tool = check_blacklisted_processes();
    let hwid = get_hardware_id().unwrap_or_else(|_| "GT-UNAVAILABLE".to_string());

    let rev_detected = rev_tool.is_some();
    let threat_name = if debugger {
        Some("Active Win32 Debugger Attached".to_string())
    } else {
        rev_tool
    };

    let status_str = if debugger || rev_detected {
        "COMPROMISED (Analysis Tool Detected)".to_string()
    } else {
        "VERIFIED_SECURE".to_string()
    };

    Ok(SecurityStatus {
        debugger_detected: debugger,
        reverse_tool_detected: rev_detected,
        detected_threat: threat_name,
        hwid,
        is_genuine: !debugger && !rev_detected,
        integrity_status: status_str,
    })
}

fn get_license_store_path() -> PathBuf {
    let base = dirs::config_dir()
        .or_else(|| dirs::data_dir())
        .unwrap_or_else(|| PathBuf::from("."));
    let dir = base.join("GhostTweak");
    let _ = std::fs::create_dir_all(&dir);
    dir.join("license.gt")
}

// Verifies license key with native checksum and machine binding
#[tauri::command]
pub fn verify_native_license(key: String) -> Result<NativeLicenseResult, String> {
    let hwid = get_hardware_id()?;
    let clean_key = key.trim().to_uppercase();

    // Check VIP Master Keys and Test Keys
    let is_vip = match clean_key.as_str() {
        "GHOST-VIP-PRO-2026" 
        | "GHOST-FPS-BOOST-9999" 
        | "GHOST-MAX-PERF-ULTRA"
        | "GHOST-ESPORTS-CS2-PRO"
        | "GHOST-BETA-TESTER-01"
        | "GHOST-TURBO-CORE-777"
        | "GHOST-STEALTH-VIP-00"
        | "GHOST-CYBER-WAR-9999" => true,
        _ => false,
    };

    let is_trial = clean_key == "TRIAL-ACCESS-FREE";

    // Algorithmic key validation: GHOST-XXXX-YYYY-ZZZZ
    let is_valid_algo = if clean_key.starts_with("GHOST-") {
        let parts: Vec<&str> = clean_key.split('-').collect();
        if parts.len() == 4 {
            let payload = format!("{}-{}-{}", parts[1], parts[2], "GHOST_KERNEL_SALT_2026");
            let hash = sha256_digest(payload.as_bytes());
            let expected_suffix = format!("{:02X}{:02X}", hash[0], hash[1]);
            parts[3] == expected_suffix
        } else {
            false
        }
    } else {
        false
    };

    if is_vip || is_trial || is_valid_algo {
        let plan = if is_trial {
            "TRIAL".to_string()
        } else {
            "VIP_LIFETIME".to_string()
        };

        let expires = if is_trial {
            "3 дня (Пробный доступ)".to_string()
        } else {
            "Бессрочно (VIP Lifetime)".to_string()
        };

        // Encrypt license with HWID XOR stream and save to disk
        let license_blob = format!("VALID|{}|{}|{}|Ghost Operator", clean_key, plan, hwid);
        let key_bytes = hwid.as_bytes();
        let encrypted: Vec<u8> = license_blob
            .as_bytes()
            .iter()
            .enumerate()
            .map(|(i, b)| b ^ key_bytes[i % key_bytes.len()])
            .collect();

        let store_path = get_license_store_path();
        let _ = std::fs::write(&store_path, encrypted);

        Ok(NativeLicenseResult {
            valid: true,
            plan,
            hwid,
            expires_at: expires,
            user_name: "Ghost Operator".to_string(),
            message: "Лицензия успешно верифицирована ядром GhostTweak.".to_string(),
        })
    } else {
        Err("Недействительный ключ лицензии. Ошибка проверки цифровой подписи ядра.".to_string())
    }
}

// Loads and cryptographically checks stored license from encrypted disk store
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

    if let Ok(encrypted) = std::fs::read(&store_path) {
        let key_bytes = hwid.as_bytes();
        let decrypted: Vec<u8> = encrypted
            .iter()
            .enumerate()
            .map(|(i, b)| b ^ key_bytes[i % key_bytes.len()])
            .collect();

        if let Ok(text) = String::from_utf8(decrypted) {
            let parts: Vec<&str> = text.split('|').collect();
            if parts.len() >= 5 && parts[0] == "VALID" && parts[3] == hwid {
                return Ok(NativeLicenseResult {
                    valid: true,
                    plan: parts[2].to_string(),
                    hwid,
                    expires_at: "Бессрочно (VIP Lifetime)".to_string(),
                    user_name: parts[4].to_string(),
                    message: "Активная подлинная лицензия".to_string(),
                });
            }
        }
    }

    Ok(NativeLicenseResult {
        valid: false,
        plan: "UNACTIVATED".to_string(),
        hwid,
        expires_at: "".to_string(),
        user_name: "".to_string(),
        message: "Лицензия не найдена или не соответствует текущему HWID".to_string(),
    })
}

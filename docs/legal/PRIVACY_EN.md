[ Русский ](PRIVACY.md) | [ English ](PRIVACY_EN.md)

# GhostTweak Privacy Policy

**Effective Date:** September 8, 2026  
**Document Version:** 1.0.0

This Privacy Policy defines the principles of processing and protecting user data when interacting with the **GhostTweak** desktop software application (hereinafter referred to as the "Application") and its associated web properties (hereinafter referred to as the "Website").

---

## 1. Core Principle: Zero Telemetry & Local-First Processing

The Application is built upon the **Local-First / Zero Telemetry** security standard:
1. The Application **does not collect, store, or transmit** any personal data to remote servers.
2. The Application functions entirely offline and autonomously on the user's local workstation.
3. No third-party analytical trackers, advertising SDKs, behavioral telemetry loggers, or tracking pixels are included or compiled into the Application.

---

## 2. Data Categories and Local Processing Scope

The Application reads and processes only the bare minimum technical parameters strictly necessary for tuning the operating system:

### 2.1. Hardware Identifier (HWID)
* **Data Structure:** A cryptographic hash (SHA-256) calculated from the Windows registry key `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid` or motherboard hardware UUID.
* **Purpose:** Local cryptographic authentication of software license keys and offline validation of the encrypted configuration file (`license.gt`).
* **Storage:** The hash is stored solely inside the local machine's encrypted directory `%APPDATA%\GhostTweak\` and is never transmitted over network interfaces.

### 2.2. Hardware Specifications & Operating System
* **Data Structure:** Central processing unit (CPU) model, graphics processing unit (GPU) model, installed physical memory (RAM), Windows build and edition, monitor refresh rate and native resolution.
* **Purpose:** Real-time telemetry display on the diagnostic dashboard and calculation of optimal launch argument threads and cache sizes.
* **Storage:** Polled dynamically via Win32 API calls (`GetSystemInfo`, `EnumDisplaySettingsW`, `GlobalMemoryStatusEx`) and never written to persistent disk log files.

### 2.3. Temporary Files & System Caches
* **Data Structure:** File paths in designated temporary directories (`%TEMP%`, `C:\Windows\Temp`), DirectX shader cache, NVIDIA caches (`GLCache`, `NV_Cache`), AMD caches (`DxcCache`), and Windows Update download archives.
* **Purpose:** Calculation of reclaimable storage capacity and scheduled deletion initiated exclusively by user confirmation.
* **Safety Principle:** Scanning and deletion occur exclusively within predetermined operating system directories. The Application never reads, analyzes, or touches personal documents, browser history, emails, or multimedia libraries.

### 2.4. Windows Registry Backups
* **Data Structure:** Exported registry keys affected by enabled performance tweaks.
* **Purpose:** Providing one-click rollbacks to restore original Windows defaults at any time.
* **Storage:** Saved as standard `.reg` files in the user's local directory `%APPDATA%\GhostTweak\backups\`.

---

## 3. Network Activity

1. **Desktop Application:**
   - Performs zero automated background telemetry or analytics requests.
   - Contains no persistent outbound connections.
   - The DNS switcher modifies network adapter addresses locally via standard Windows `netsh` utilities only when the user explicitly triggers an address change (Cloudflare, Google, Quad9, or DHCP reset).
2. **Official Website:**
   - Delivers static assets over industry-standard encrypted connections (HTTPS/TLS).
   - Contains no third-party tracking or advertising cookies.

---

## 4. Security & Isolation

1. Configuration files and licenses are protected with local machine-bound salting to prevent unauthorized cloning.
2. The Application requests Windows Administrator privileges (UAC Elevation) solely to execute low-level system commands: managing background Windows services, switching power plans, and cleaning system-wide temp folders.
3. The Application never executes code injection into third-party processes and does not monitor keystrokes or user input.

---

## 5. User Rights

Under global privacy standards (including GDPR compliance principles):
* **Right of Access & Portability:** The user has immediate, unrestricted access to all files created by the Application in `%APPDATA%\GhostTweak\`.
* **Right of Erasure:** Uninstalling the Application completely removes all binary files. Deleting `%APPDATA%\GhostTweak\` eliminates all local configurations, keys, and backups.
* **Right of Restoration:** The user may restore previous system states at any time via the Backups dashboard or by executing the created `.reg` files.

---

## 6. Policy Amendments

The developers reserve the right to revise this Privacy Policy as new features are added. The current version will always remain accessible in the official GitHub repository and website documentation.

---

## 7. Contact Information

For inquiries regarding this Privacy Policy or technical system safety, reach out via the official project channels on GitHub or Discord.

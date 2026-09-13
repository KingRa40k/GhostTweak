[ Русский ](README.md) | [ English ](README_EN.md)

# GhostTweak

A Windows desktop utility designed for operating system optimization, targeted at competitive gaming and performance-constrained PCs.

> **Documentation & Owner Manuals:**
> * [Owner Handover Guide](HANDOVER_GUIDE.md) | [English Owner Manual](docs/01_BUYER_GUIDE_EN.md)
> * [01. Architecture](docs/01_ARCHITECTURE.md) • [02. Build & Release](docs/02_BUILD_AND_RELEASE.md) • [03. Licensing](docs/03_LICENSING_AND_MONETIZATION.md) • [04. Branding](docs/04_CUSTOMIZATION_AND_CONTACTS.md) • [05. Vercel Deploy](docs/05_DEPLOYMENT_VERCEL.md) • [06. FAQ](docs/06_FAQ_AND_TROUBLESHOOTING.md)

Tech Stack: **Tauri v2, Rust, React 19, TypeScript, Tailwind CSS**.  
Executable Size: **~12 MB** (15x lighter than Electron). Operates without background web servers and without Electron.

---

## About the Project

GhostTweak eliminates micro-stuttering, smooths out frame-time pacing (0.1% and 1% Low FPS), flushes unmanaged RAM standby lists, and reduces overall system input latency.

Unlike conventional PowerShell or batch scripts, GhostTweak relies on a native Rust core with direct Win32 API calls and safe Windows registry interactions (`winreg`). Before any modification is applied, a full `.reg` backup of the affected registry keys is generated to allow 1-click rollbacks.

This repository also contains the complete source code for the official landing website built on **Next.js 15 (App Router)** under the `website/` directory.

---

## Features

### 1. Game Optimization (CS2, Valorant, Apex Legends, Dota 2)

Targeted tuning presets engineered to eliminate frame drops on laptops and CPUs with aggressive frequency throttling:
- **Process Priority (IFEO CPU Priority)**: Direct registry binding to force gaming executables into high-priority execution (`CpuPriorityClass = 3`).
- **Remove CPU Multimedia Reserve (`SystemResponsiveness = 0`)**: Eliminates the default 20% CPU resource reservation Windows reserves for background multimedia tasks.
- **Disable Core Parking**: Forces all CPU cores to remain permanently unparked (`CPMINCORES = 100`) via Windows Powercfg, preventing micro-latency when sleeping cores wake up.
- **Disable Power Throttling**: Removes OS-level power capping on gaming processes.
- **Standby List RAM Purge**: Flushes unused standby cached memory using the Win32 `EmptyWorkingSet` call, freeing memory prior to matches and avoiding page fault disk accesses.
- **Launch Parameters Generator**: Automatically calculates ideal command-line arguments matching your physical and logical thread topology (`-threads`, `-high`, `-nojoy`).
- **Counter-Strike 2 autoexec.cfg**: Pre-configured rendering, audio sub-system, and packet delivery config.

### 2. Control Center (Dashboard)

- **Quick Profile Switching**: Rapidly toggle between `[ESPORTS]`, `[AAA GAMING]`, `[STREAMER]`, and `[BALANCED]` presets from the header.
- **Live Memory Flush**: Real-time visualization of used and free RAM with instant working-set cleanup.
- **Hardware Telemetry**: Direct detection of CPU model, GPU model, total installed RAM, and Windows edition.
- **1-Click Optimization**: Apply the entire verified tweak suite and clean system caches in a single action.

### 3. Tuning Profiles

- **Esports Competitive** (CS2, Valorant, Apex): Forces 0.5 ms high-resolution hardware timers, disables Nagle's algorithm (`TCPNoDelay = 1`), and assigns maximum priority to DPC network interrupts.
- **AAA Cinematic** (Cyberpunk 2077, GTA): Prioritizes GPU scheduling, stabilizes frame delivery pacing, and optimizes VRAM page allocation.
- **Streamer & Creator** (OBS, Discord, Twitch): Audio thread isolation, hardware encoder prioritization (NVENC/AV1), and network QoS buffering.
- **Quiet / Work**: Balanced profile restoring default Windows power management plans and interface animations.

### 4. Junk & Cache Cleaner

Safely purges temporary files and stale cache entries:
- **GPU Shader Caches**:
  - NVIDIA: `%LOCALAPPDATA%\NVIDIA\GLCache`, `NV_Cache`, `%LOCALAPPDATA%\D3DSCache`
  - AMD: `%LOCALAPPDATA%\AMD\DxcCache`, `DxCache`, `GLCache`
  - DirectX Shader Cache
- **System Folders**: User temporary folder `%TEMP%`, `C:\Windows\Temp`, Windows Update download cache `C:\Windows\SoftwareDistribution\Download`, and Windows Explorer thumbnail caches.
- **Pre-Clean Sizing**: Accurate recursive byte-level estimation before initiating any file deletion.

### 5. Registry & Service Tweaks

- **Gaming Stack**: Disables background Xbox Game Bar overlays, Game DVR broadcast capture services, and optimizes DWM full-screen presentation.
- **Privacy & Telemetry**: Stops and disables `DiagTrack` (Connected User Experiences and Telemetry), sets `AllowTelemetry = 0`, and disables Cortana search background integrations.
- **Power & Visuals**: Activates the Ultimate Performance power plan (`SCHEME_MIN`), turns off GPU-taxing transparency effects, and disables window minimize/maximize animations.
- **Network Pipeline**: Removes TCP acknowledgment delays (`TcpAckFrequency = 1`, `TCPNoDelay = 1`) and disables network throttling limits (`NetworkThrottlingIndex = 0xFFFFFFFF`).

### 6. Backups & Rollbacks

- Prior to applying tweaks, affected registry branches are automatically exported using `reg export`.
- Backups are stored locally in `%APPDATA%\GhostTweak\backups\`.
- Windows original configurations can be restored instantly via the in-app backup manager or manually by double-clicking the generated `.reg` files.

### 7. Window Management & System Tray

- **Frameless Window (`decorations: false`)**: Smooth window dragging via custom title bar with strict click event isolation for window controls.
- **Window Controls**: Minimize, maximize, and minimize-to-tray.
- **Windows System Tray**:
  - Native icon in notification area.
  - Left-click toggles window visibility.
  - Right-click context menu: "Open GhostTweak", "Quick Optimization", "Exit Application".
  - Closing the window minimizes to tray for background timer and memory management.

### 8. Security & Licensing

- Hardware identifier (HWID) calculation based on Windows `MachineGuid` and SHA-256 cryptographic hashing.
- Encrypted local license storage (`license.gt`) bound to the hardware machine signature.
- Execution environment verification using Win32 API `IsDebuggerPresent`, `CheckRemoteDebuggerPresent`, and active debugger process detection.

---

## Tech Stack

| Component | Technology |
|---|---|
| Core / Backend | Rust 1.92, Tauri v2 (`tray-icon`, `winreg`, `psapi`, `kernel32`) |
| Client Interface | React 19, TypeScript, Vite, Tailwind CSS, `lucide-react` |
| Official Website | Next.js 15 (App Router), Tailwind CSS, Multilingual (RU / EN) |
| Distribution | Portable `.exe` (4.8 MB), NSIS installer (1.58 MB), MSI package (2.39 MB) |

---

## Security & Anti-Cheat Compliance

- All registry modifications are fully reversible and backed up prior to execution.
- GhostTweak does not inject code into process memory or modify game binaries.
- 100% compatible with major anti-cheat engines: Valve Anti-Cheat (VAC), Riot Vanguard, Easy Anti-Cheat (EAC), and BattlEye.

---

## Building and Running

### Prerequisites:
- OS: Windows 10 / 11 (x64)
- Node.js: v18+ or v20+
- Rust toolchain: Rust 1.80+ (MSVC toolchain)

### 1. Run Desktop App in Development Mode:
```powershell
# Install frontend dependencies
npm install

# Launch Vite + Tauri Dev
npm run tauri dev
```

### 2. Build Production Desktop Executables:
```powershell
# Build .exe and NSIS/MSI installers
npm run tauri build
```
Binaries will be output to:
- Portable executable: `src-tauri/target/release/ghosttweak.exe`
- NSIS installer: `src-tauri/target/release/bundle/nsis/GhostTweak_1.0.0_x64-setup.exe`
- MSI installer: `src-tauri/target/release/bundle/msi/GhostTweak_1.0.0_x64_en-US.msi`

### 3. Run Landing Website:
```powershell
cd website
npm install
npm run dev
```
Website production build:
```powershell
npm run build
npm run start
```

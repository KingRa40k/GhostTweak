# GhostTweak — Project Owner & Operations Manual

This manual provides instructions for running, evaluating, rebuilding, and administering the GhostTweak project.

---

## 1. Running Precompiled Binaries

The `releases/` directory contains ready-to-run Windows 10/11 binaries:

* `GhostTweak_Portable.exe` — Standalone portable executable. Requires no installation.
* `GhostTweak_Setup_v1.0.0.exe` — Standard Windows NSIS installer.
* `GhostTweak_v1.0.0.msi` — Windows Installer (MSI) package for automated deployment.

No additional runtime installation is needed; modern Windows 10 and 11 include Microsoft Edge WebView2. Run the application as Administrator to permit registry and system-level optimizations.

### Master VIP Key for Testing:
```text
GHOST-VIP-PRO-2026
```
This key unlocks all PRO features, unlimited registry restore points, and competitive gaming profiles.

---

## 2. Development & Source Builds

Environment requirements: Node.js 18+, Rust (stable-x86_64-pc-windows-msvc), Visual Studio Build Tools (C++ Desktop).

```bash
# Launch desktop application in development mode:
npm install
npm run tauri dev

# Compile production release binaries:
build.bat
```

The `build.bat` script compiles the React 19 frontend, builds the Rust native binary via the Tauri CLI, and mirrors the output to `releases/` and `website/public/downloads/`.

---

## 3. Important: Local Environment vs. Production & Git Deployment

### Key Differences

* **Local Environment (Your PC):**
  * Website runs on `http://localhost:3000` (`npm run dev` in `website/`).
  * Desktop application runs via `npm run tauri dev`.
  * Changes to files (such as `paymentConfig.ts`, prices, contact emails) are visible **only to you on your machine**.
* **Production (Live Public Internet):**
  * Marketing site is served by Vercel under your custom domain.
  * Real gamers and buyers download installers and submit purchase requests.
  * Changes only take effect once compiled and deployed to the cloud.

### The Golden Rule: Deploy to Git After Every Important Change
To ensure changes you make locally (e.g., updating payment credentials, adjusting pricing, releasing new `.exe` binaries) reach live customers:
```bash
# 1. Stage modified files
git add .

# 2. Commit changes
git commit -m "Update payment config and release notes"

# 3. Push to GitHub (triggers automated Vercel rebuild within 60s)
git push origin main
```
> **Note:** Without running `git push`, changes stay on your local disk and your live website will continue serving the previous version.

---

## 4. Documentation Index

| Section | Overview | Link |
| :--- | :--- | :--- |
| 01. Architecture & Codebase | Tech stack, directory breakdown, WinAPI bridge, and core modules | [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) |
| 02. Building & Packaging | Compilation, Authenticode code signing, installer generation | [02_BUILD_AND_RELEASE.md](./02_BUILD_AND_RELEASE.md) |
| 03. Licensing & Monetization | HWID binding, cryptographic key generation, payment webhooks | [03_LICENSING_AND_MONETIZATION.md](./03_LICENSING_AND_MONETIZATION.md) |
| 04. Branding & Contacts | Changing support contacts, pricing tiers, URLs, and themes | [04_CUSTOMIZATION_AND_CONTACTS.md](./04_CUSTOMIZATION_AND_CONTACTS.md) |
| 05. Vercel Deployment | Deploying the Next.js marketing site with a custom domain | [05_DEPLOYMENT_VERCEL.md](./05_DEPLOYMENT_VERCEL.md) |
| 06. FAQ & Troubleshooting | UAC privileges, SmartScreen handling, registry recovery | [06_FAQ_AND_TROUBLESHOOTING.md](./06_FAQ_AND_TROUBLESHOOTING.md) |
| 07. Beta Testing | Conducting closed beta testing and diagnostic collection | [07_BETA_TESTING.md](./07_BETA_TESTING.md) |

---

## 4. Repository Contents

1. `src-tauri/` — Native Rust core: Win32 API calls, 0.5 ms kernel multimedia timer, CS2 process priority control, shader cache cleanup (DirectX, NVIDIA, AMD), Windows service configuration.
2. `src/` — Desktop UI source: React 19, TypeScript, Tailwind CSS, theme switching, bilingual support (RU/EN).
3. `website/` — Next.js 15 (App Router) marketing website and download portal.
4. `releases/` — Compiled distribution binaries (`.exe`, installer, `.msi`).
5. `tools/` — Standalone cryptographic licensing CLI (`license_generator.py`) and REST API server (`license_server.py`).
6. `docs/` — Technical documentation and legal terms (`docs/legal/`).

---

## 5. Master Testing Keys

* `GHOST-VIP-PRO-2026` — VIP Lifetime Edition
* `GHOST-FPS-BOOST-9999` — Pro Streamer Edition
* `GHOST-MAX-PERF-ULTRA` — Overclock Edition
* `GHOST-ESPORTS-CS2-PRO` — CS2 Esports Edition
* `GHOST-CYBER-WAR-9999` — Cyber Warfare Edition

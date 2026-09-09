# GhostTweak — Project Buyer & Owner Manual

Congratulations on acquiring **GhostTweak**! This document provides a complete technical guide for setting up, building, customizing, and managing license keys for the project.

---

## 1. Project Architecture

The repository is organized into two primary applications:
1. **Desktop Optimizer Application (Tauri v2 + Rust + React 19):**
   * `src-tauri/` — High-performance Rust backend communicating directly with Windows Win32 API, multimedia timer (0.5 ms), shader cache purge, registry optimizations, .reg backups, and SHA-256 machine HWID license binding.
   * `src/` — Modern frontend built with React 19, TypeScript, and Tailwind CSS. Features dark theme personalization, real-time telemetry, and bilingual support (EN/RU).
2. **Promotional Landing & Marketing Site (Next.js 15):**
   * `website/` — Responsive Next.js 15 App Router landing page with internationalization, interactive app mockup, side-by-side comparison matrix, and downloadable release binaries.

---

## 2. Quickstart & Local Development

### Prerequisites:
* **Node.js**: v18.0.0+ (v20 LTS recommended)
* **Rust**: `rustup` with `stable-x86_64-pc-windows-msvc` toolchain
* **Visual Studio Build Tools**: C++ build tools installed for native Windows compilation

### Running the Desktop App in Development Mode:
```bash
# Install root dependencies
npm install

# Run with hot reload
npm run tauri dev
```

### Running the Landing Page:
```bash
cd website
npm install
npm run dev
# Accessible at http://localhost:3000
```

---

## 3. Building Production Binaries (.exe, .msi, Portable)

Compile releases in a single command:
```bash
# Option 1 (using the root batch script):
build.bat

# Option 2 (via npm):
npm run tauri build
```

Compiled distributions will be placed under:
* **NSIS Setup (.exe)**: `src-tauri/target/release/bundle/nsis/`
* **Windows Installer (.msi)**: `src-tauri/target/release/bundle/msi/`
* **Portable Binary (.exe)**: `src-tauri/target/release/ghosttweak.exe`

---

## 4. License Key Verification & Generation

GhostTweak incorporates an offline cryptographic checksum verification bound to motherboard UUIDs.

### Modifying and Generating Keys:
File: [`src-tauri/src/commands/security.rs`](src-tauri/src/commands/security.rs)
* The `verify_native_license()` function validates pre-configured master keys and algorithmic keys following the format `GHOST-XXXX-YYYY-ZZZZ`.
* To integrate an external payment processor or cloud database (Stripe, Robokassa, LemonSqueezy): add an HTTP fetch hook inside `verify_native_license` or [`src/lib/license.ts`](src/lib/license.ts).

### Ready-to-Use Master Keys:
* `GHOST-VIP-PRO-2026` — VIP Lifetime License
* `GHOST-FPS-BOOST-9999` — Pro Streamer License
* `GHOST-MAX-PERF-ULTRA` — Overclock Edition
* `GHOST-ESPORTS-CS2-PRO` — Esports Edition
* `GHOST-CYBER-WAR-9999` — Cyber Warfare Edition

---

## 5. Updating Support Contacts & Brand Links

To replace links with your own Telegram channel, email, or community:
* **Website**: [`website/src/components/FAQ.tsx`](website/src/components/FAQ.tsx), [`website/src/components/Pricing.tsx`](website/src/components/Pricing.tsx), and [`website/src/components/Footer.tsx`](website/src/components/Footer.tsx).
* **Desktop App**: [`src/pages/Settings.tsx`](src/pages/Settings.tsx).

---

## 6. Zero-Cost Deployment to Vercel

The landing page is pre-configured for 1-click Vercel deployment:
1. Log into [Vercel](https://vercel.com) using your GitHub account.
2. Select **Add New Project** and import `GhostTweak`.
3. Set **Root Directory** to `website`.
4. Click **Deploy**. Vercel will build and assign a global CDN URL with automated SSL.

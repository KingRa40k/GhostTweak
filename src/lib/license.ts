import { invoke } from './tauri';
import { NativeLicenseResult } from './types';

export interface LicenseData {
  key: string;
  plan: 'VIP_LIFETIME' | 'PRO_ANNUAL' | 'TRIAL';
  hwid: string;
  activatedAt: string;
  expiresAt: string;
  userName: string;
}

const STORAGE_KEY = 'ghosttweak_license_v1';

// Asynchronously fetches real hardware ID from native Rust kernel
export async function getSystemHwidAsync(): Promise<string> {
  try {
    const hwid = await invoke<string>('get_hardware_id');
    if (hwid) {
      localStorage.setItem('ghosttweak_hwid', hwid);
      return hwid;
    }
  } catch {
    // ignore
  }
  return getSystemHwid();
}

// Cached or fallback HWID
export function getSystemHwid(): string {
  let hwid = localStorage.getItem('ghosttweak_hwid');
  if (!hwid) {
    hwid = 'GT-HWID-PROBING';
  }
  return hwid;
}

export function getStoredLicense(): LicenseData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LicenseData;
  } catch {
    return null;
  }
}

// Asynchronously syncs with native encrypted license store on disk
export async function syncStoredLicenseWithNative(): Promise<LicenseData | null> {
  try {
    const nativeRes = await invoke<NativeLicenseResult>('get_native_license');
    if (nativeRes && nativeRes.valid) {
      const license: LicenseData = {
        key: 'GHOST-ACTIVATED',
        plan: nativeRes.plan as LicenseData['plan'],
        hwid: nativeRes.hwid,
        activatedAt: new Date().toLocaleDateString('ru-RU'),
        expiresAt: nativeRes.expires_at,
        userName: nativeRes.user_name || 'Ghost Operator',
      };
      saveLicense(license);
      return license;
    }
  } catch {
    // ignore
  }
  return getStoredLicense();
}

export function saveLicense(license: LicenseData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
}

export function removeLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Valid keys for testing and activation:
export const DEMO_KEYS = [
  { key: 'GHOST-VIP-PRO-2026', label: 'VIP Lifetime Key' },
  { key: 'GHOST-FPS-BOOST-9999', label: 'Pro Streamer Key' },
  { key: 'GHOST-MAX-PERF-ULTRA', label: 'Overclock Edition' },
  { key: 'GHOST-ESPORTS-CS2-PRO', label: 'CS2 Esports Edition' },
  { key: 'GHOST-BETA-TESTER-01', label: 'Beta Tester Key' },
  { key: 'GHOST-TURBO-CORE-777', label: 'Turbo Core Edition' },
  { key: 'GHOST-STEALTH-VIP-00', label: 'Stealth VIP Edition' },
  { key: 'GHOST-CYBER-WAR-9999', label: 'Cyber Warfare Edition' },
];

export async function verifyLicenseKey(inputKey: string): Promise<{ success: boolean; data?: LicenseData; error?: string }> {
  const cleanKey = inputKey.trim().toUpperCase();

  try {
    // 1. Native kernel cryptographic verification & machine-binding
    const nativeRes = await invoke<NativeLicenseResult>('verify_native_license', { key: cleanKey });

    if (nativeRes.valid) {
      const license: LicenseData = {
        key: cleanKey,
        plan: nativeRes.plan as LicenseData['plan'],
        hwid: nativeRes.hwid,
        activatedAt: new Date().toLocaleDateString('ru-RU'),
        expiresAt: nativeRes.expires_at,
        userName: nativeRes.user_name || 'Ghost Operator',
      };
      saveLicense(license);
      return { success: true, data: license };
    }
  } catch (err: any) {
    const errMsg = typeof err === 'string' ? err : err?.message || 'Недействительный ключ лицензии';
    return {
      success: false,
      error: errMsg,
    };
  }

  return { 
    success: false, 
    error: 'Неверный лицензионный ключ. Проверьте формат или используйте проверочный ключ.' 
  };
}

export async function activateTrial(): Promise<LicenseData> {
  try {
    const nativeRes = await invoke<NativeLicenseResult>('verify_native_license', { key: 'TRIAL-ACCESS-FREE' });
    const trial: LicenseData = {
      key: 'TRIAL-ACCESS-FREE',
      plan: 'TRIAL',
      hwid: nativeRes.hwid,
      activatedAt: new Date().toLocaleDateString('ru-RU'),
      expiresAt: nativeRes.expires_at || '3 дня (Пробный доступ)',
      userName: 'Guest Pilot',
    };
    saveLicense(trial);
    return trial;
  } catch {
    const hwid = getSystemHwid();
    const trial: LicenseData = {
      key: 'TRIAL-ACCESS-FREE',
      plan: 'TRIAL',
      hwid,
      activatedAt: new Date().toLocaleDateString('ru-RU'),
      expiresAt: '3 дня (Пробный доступ)',
      userName: 'Guest Pilot',
    };
    saveLicense(trial);
    return trial;
  }
}

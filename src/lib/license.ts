import { invoke } from './tauri';
import { NativeLicenseResult } from './types';

export type LicensePlan = 
  | 'VIP_LIFETIME' 
  | 'PRO_MONTHLY' 
  | 'PRO_ANNUAL' 
  | 'DAY_PASS' 
  | 'TRIAL' 
  | 'BETA_TESTER' 
  | 'CLUB_LAN' 
  | 'FREE';

export interface LicenseData {
  key: string;
  plan: LicensePlan;
  hwid: string;
  activatedAt: string;
  expiresAt: string;
  expiresAtTimestamp?: number;
  userName: string;
}

const STORAGE_KEY = 'ghosttweak_license_v1';

export function isProLicense(license: LicenseData | null): boolean {
  if (!license) return false;
  if (license.plan === 'FREE') return false;
  if (license.expiresAtTimestamp && Date.now() > license.expiresAtTimestamp) {
    return false;
  }
  return true;
}

export type ProFeature = 
  | 'shaders' 
  | 'kernel_timer' 
  | 'game_boost' 
  | 'profiles' 
  | 'pro_tweaks';

export function isFeatureUnlocked(feature: ProFeature, license: LicenseData | null): boolean {
  return isProLicense(license);
}

export async function getSystemHwidAsync(): Promise<string> {
  try {
    const hwid = await invoke<string>('get_hardware_id');
    if (hwid) {
      localStorage.setItem('ghosttweak_hwid', hwid);
      return hwid;
    }
  } catch {
  }
  return getSystemHwid();
}

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
    const data = JSON.parse(raw) as LicenseData;
    if (data.expiresAtTimestamp && Date.now() > data.expiresAtTimestamp) {
      removeLicense();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function syncStoredLicenseWithNative(): Promise<LicenseData | null> {
  try {
    const nativeRes = await invoke<NativeLicenseResult>('get_native_license');
    if (nativeRes && nativeRes.valid) {
      const existing = getStoredLicense();
      const isDayPass = nativeRes.plan === 'DAY_PASS';
      const isMonthly = nativeRes.plan === 'PRO_MONTHLY';
      const expiresAtTimestamp = existing?.expiresAtTimestamp || (
        isDayPass ? Date.now() + 86400000 : 
        isMonthly ? Date.now() + (30 * 86400000) : 
        undefined
      );

      const license: LicenseData = {
        key: existing?.key || 'GHOST-ACTIVATED',
        plan: nativeRes.plan as LicensePlan,
        hwid: nativeRes.hwid,
        activatedAt: existing?.activatedAt || new Date().toLocaleDateString('ru-RU'),
        expiresAt: nativeRes.expires_at,
        expiresAtTimestamp,
        userName: nativeRes.user_name || 'Ghost Operator',
      };
      saveLicense(license);
      return license;
    } else if (nativeRes && !nativeRes.valid && nativeRes.plan === 'EXPIRED') {
      removeLicense();
      return null;
    }
  } catch {
  }
  return getStoredLicense();
}

export function saveLicense(license: LicenseData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
}

export function removeLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function resetLicense(): Promise<void> {
  removeLicense();
  try {
    await invoke('reset_native_license');
  } catch {
  }
}

export async function verifyLicenseKey(inputKey: string): Promise<{ success: boolean; data?: LicenseData; error?: string }> {
  const cleanKey = inputKey.trim().toUpperCase();

  try {
    const nativeRes = await invoke<NativeLicenseResult>('verify_native_license', { key: cleanKey });

    if (nativeRes.valid) {
      const isDayPass = nativeRes.plan === 'DAY_PASS';
      const isMonthly = nativeRes.plan === 'PRO_MONTHLY';
      const expiresAtTimestamp = isDayPass 
        ? (Date.now() + 86400000) 
        : isMonthly 
        ? (Date.now() + 30 * 86400000) 
        : undefined;

      const expiresFormatted = isDayPass
        ? `${new Date(expiresAtTimestamp!).toLocaleDateString('ru-RU')} ${new Date(expiresAtTimestamp!).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} (24 часа)`
        : isMonthly
        ? `${new Date(expiresAtTimestamp!).toLocaleDateString('ru-RU')} (30 дней)`
        : nativeRes.expires_at;

      const license: LicenseData = {
        key: cleanKey,
        plan: nativeRes.plan as LicensePlan,
        hwid: nativeRes.hwid,
        activatedAt: `${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
        expiresAt: expiresFormatted,
        expiresAtTimestamp,
        userName: nativeRes.user_name || 'Пользователь',
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
    error: 'Неверный лицензионный ключ. Проверьте правильность ввода.' 
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
      userName: 'Пользователь',
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
      userName: 'Пользователь',
    };
    saveLicense(trial);
    return trial;
  }
}

export async function activateFreeMode(): Promise<LicenseData> {
  try {
    const nativeRes = await invoke<NativeLicenseResult>('verify_native_license', { key: 'COMMUNITYFREEACCESS' });
    const free: LicenseData = {
      key: 'COMMUNITY-FREE-EDITION',
      plan: 'FREE',
      hwid: nativeRes.hwid,
      activatedAt: new Date().toLocaleDateString('ru-RU'),
      expiresAt: 'Бессрочно (Community Edition)',
      userName: 'Community User',
    };
    saveLicense(free);
    return free;
  } catch {
    const hwid = getSystemHwid();
    const free: LicenseData = {
      key: 'COMMUNITY-FREE-EDITION',
      plan: 'FREE',
      hwid,
      activatedAt: new Date().toLocaleDateString('ru-RU'),
      expiresAt: 'Бессрочно (Community Edition)',
      userName: 'Community User',
    };
    saveLicense(free);
    return free;
  }
}


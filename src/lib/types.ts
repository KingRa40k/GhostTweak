export interface SystemInfo {
  os_name: string;
  os_version: string;
  cpu: string;
  ram_gb: number;
  gpu: string;
  display_res: string;
  refresh_rate: number;
  available_refresh_rates?: number[];
}

export interface JunkCategory {
  id: string;
  name: string;
  description: string;
  size_bytes: number;
  file_count: number;
  path: string;
}

export interface ScanResult {
  categories: JunkCategory[];
  total_size_bytes: number;
}

export interface CleanResult {
  cleaned_bytes: number;
  cleaned_files: number;
  errors: string[];
}

export interface TweakInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  risky: boolean;
}

export interface ApplyResult {
  applied: string[];
  failed: string[];
  errors: string[];
}

export interface BackupInfo {
  id: string;
  description: string;
  created_at: string;
  size_bytes: number;
  file_path: string;
}

export interface MemoryStatus {
  total_mb: number;
  used_mb: number;
  free_mb: number;
  percent_used: number;
}

export interface FlushResult {
  freed_mb: number;
  before_used_mb: number;
  after_used_mb: number;
}

export interface GameProfile {
  id: 'esports' | 'cinematic' | 'streamer' | 'quiet';
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  targetGames: string[];
  latencyScore: string;
  fpsScore: string;
  features: string[];
  recommendedDns: string;
}

export interface SecurityStatus {
  debugger_detected: boolean;
  reverse_tool_detected: boolean;
  detected_threat: string | null;
  hwid: string;
  is_genuine: boolean;
  integrity_status: string;
}

export interface NativeLicenseResult {
  valid: boolean;
  plan: string;
  hwid: string;
  expires_at: string;
  user_name: string;
  message: string;
}

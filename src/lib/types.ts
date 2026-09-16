export interface SystemInfo {
  os_name: string;
  os_version: string;
  cpu: string;
  ram_gb: number;
  ram_type?: string;
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

export interface SuperOptimizeResult {
  applied_count: number;
  ram_freed_mb: number;
  junk_cleaned_bytes: number;
  cs2_boosted: boolean;
}

export interface MatchTurboResult {
  ram_freed_mb: number;
  boosted_games: string[];
  background_trimmed: number;
  timer_resolution_active: boolean;
}

export interface ProcessThrottleResult {
  trimmed_count: number;
  throttled_count: number;
  target_processes: string[];
  ram_freed_mb: number;
}

export interface HardwareTierInfo {
  tier_code: 'budget' | 'balanced' | 'high_end';
  tier_label: string;
  is_weak_pc: boolean;
  is_laptop: boolean;
  ram_constrained: boolean;
  ram_gb: number;
  gpu_name: string;
  cpu_name: string;
  safe_recommendations: string[];
  restricted_tweaks: string[];
  recommended_tweaks: string[];
}

export interface UpdateCheckResult {
  has_update: boolean;
  current_version: string;
  latest_version: string;
  release_notes: string;
  download_url: string;
}

export interface PingServerResult {
  id: string;
  name: string;
  host: string;
  category: 'valve' | 'dns';
  ping_ms: number | null;
  status: 'optimal' | 'good' | 'fair' | 'offline';
}

export interface SystemHealthResult {
  healthy: boolean;
  status_text: string;
  details: string[];
  scanned_at: string;
}

export interface AutostartInfo {
  enabled: boolean;
  tray_only: boolean;
}

export interface TrialStatus {
  is_trial: boolean;
  is_expired: boolean;
  seconds_remaining: number;
  total_seconds: number;
  formatted_time_remaining: string;
  started_at_human: string;
}



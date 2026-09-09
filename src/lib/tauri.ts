declare global {
  interface Window {
    __TAURI__: {
      core: { invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T> };
      window: { 
        getCurrentWindow: () => { 
          minimize: () => Promise<void>; 
          close: () => Promise<void>;
          toggleMaximize: () => Promise<void>;
          maximize: () => Promise<void>;
          unmaximize: () => Promise<void>;
          isMaximized: () => Promise<boolean>;
          startDragging: () => Promise<void>;
        } 
      };
    };
  }
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  return window.__TAURI__.core.invoke<T>(cmd, args);
}

export function getCurrentWindow() {
  return window.__TAURI__?.window?.getCurrentWindow?.() || {
    minimize: () => minimizeWindow(),
    close: () => closeWindow(),
    toggleMaximize: () => toggleMaximizeWindow(),
    maximize: () => toggleMaximizeWindow(),
    unmaximize: () => toggleMaximizeWindow(),
    isMaximized: () => isWindowMaximized(),
    startDragging: () => startDraggingWindow(),
  };
}

export async function minimizeWindow(): Promise<void> {
  try {
    await invoke('window_minimize');
  } catch {
    try { window.__TAURI__?.window?.getCurrentWindow?.()?.minimize(); } catch {}
  }
}

export async function toggleMaximizeWindow(): Promise<boolean> {
  try {
    return await invoke<boolean>('window_toggle_maximize');
  } catch {
    try {
      const win = window.__TAURI__?.window?.getCurrentWindow?.();
      await win?.toggleMaximize();
      return (await win?.isMaximized()) || false;
    } catch {
      return false;
    }
  }
}

export async function closeWindow(): Promise<void> {
  try {
    // Minimize / Hide to system tray
    await invoke('window_close');
  } catch {
    try { window.__TAURI__?.window?.getCurrentWindow?.()?.close(); } catch {}
  }
}

export async function exitApp(): Promise<void> {
  try {
    await invoke('window_exit');
  } catch {}
}

export async function startDraggingWindow(): Promise<void> {
  try {
    await invoke('window_start_dragging');
  } catch {
    try { window.__TAURI__?.window?.getCurrentWindow?.()?.startDragging(); } catch {}
  }
}

export async function isWindowMaximized(): Promise<boolean> {
  try {
    return await invoke<boolean>('window_is_maximized');
  } catch {
    try { return (await window.__TAURI__?.window?.getCurrentWindow?.()?.isMaximized()) || false; } catch { return false; }
  }
}

export async function openUrl(url: string): Promise<void> {
  try {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(url);
  } catch (err) {
    console.warn('Failed to open URL via Tauri shell plugin, falling back to window.open:', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}


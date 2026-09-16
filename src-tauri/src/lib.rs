mod commands;
pub mod error;
pub mod logging;

use commands::{backup, cleaner, performance, security, system_info, trial, tweaks, window_controls};
use tauri::{
    menu::MenuBuilder,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

#[cfg(windows)]
fn setup_global_hotkey(app_handle: tauri::AppHandle) {
    std::thread::spawn(move || {
        #[repr(C)]
        struct POINT {
            x: i32,
            y: i32,
        }
        #[repr(C)]
        struct MSG {
            hwnd: *mut std::ffi::c_void,
            message: u32,
            wparam: usize,
            lparam: isize,
            time: u32,
            pt: POINT,
            l_private: u32,
        }

        extern "system" {
            fn RegisterHotKey(hWnd: *mut std::ffi::c_void, id: i32, fsModifiers: u32, vk: u32) -> i32;
            fn GetMessageW(lpMsg: *mut MSG, hWnd: *mut std::ffi::c_void, wMsgFilterMin: u32, wMsgFilterMax: u32) -> i32;
        }

        const MOD_ALT: u32 = 0x0001;
        const MOD_CONTROL: u32 = 0x0002;
        const MOD_NOREPEAT: u32 = 0x4000;
        const VK_F12: u32 = 0x7B;
        const WM_HOTKEY: u32 = 0x0312;
        const HOTKEY_ID: i32 = 0x4754; // "GT"

        unsafe {
            if RegisterHotKey(std::ptr::null_mut(), HOTKEY_ID, MOD_CONTROL | MOD_ALT | MOD_NOREPEAT, VK_F12) != 0 {
                tracing::info!("Global Hotkey registered: Ctrl + Alt + F12 (Match Turbo)");
                let mut msg: MSG = std::mem::zeroed();
                while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
                    if msg.message == WM_HOTKEY && msg.wparam == HOTKEY_ID as usize {
                        tracing::info!("Global Hotkey Ctrl + Alt + F12 triggered in-game!");
                        let _ = performance::run_match_turbo();
                        let _ = app_handle.emit("ghosttweak:hotkey-turbo", ());
                    }
                }
            } else {
                tracing::warn!("Failed to register global hotkey Ctrl+Alt+F12 (might be in use)");
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    logging::init_logging();
    tracing::info!("Starting GhostTweak v1.0.0");
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .text("show", "Открыть GhostTweak")
                .text("optimize", "Быстрая оптимизация")
                .separator()
                .text("quit", "Выход из приложения")
                .build()?;

            let tray_icon = app.default_window_icon().cloned().expect("App window icon is missing");

            let tray = TrayIconBuilder::with_id("main-tray")
                .icon(tray_icon)
                .tooltip("GhostTweak — Fast Tweak & Cleaner")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.unminimize();
                            }
                        }
                        "optimize" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.unminimize();
                                let _ = window.emit("ghosttweak:quick-optimize", ());
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if let Ok(visible) = window.is_visible() {
                                if visible {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                    let _ = window.unminimize();
                                }
                            }
                        }
                    }
                })
                .build(app)?;

            app.manage(tray);

            #[cfg(windows)]
            setup_global_hotkey(app.handle().clone());

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            system_info::get_system_info,
            system_info::is_admin_elevated,
            system_info::restart_as_admin,
            system_info::detect_hardware_tier,
            system_info::check_for_updates,
            system_info::get_autostart_status,
            system_info::set_autostart,
            system_info::run_system_health_check,
            cleaner::scan_junk,
            cleaner::clean_junk,
            cleaner::scan_shader_cache,
            cleaner::clean_shader_cache,
            performance::get_memory_status,
            performance::flush_memory,
            performance::set_dns,
            performance::run_match_turbo,
            performance::throttle_background_apps,
            performance::restore_background_apps,
            performance::test_network_pings,
            tweaks::get_tweaks_status,
            tweaks::apply_tweak,
            tweaks::apply_all_tweaks,
            tweaks::super_optimize,
            tweaks::apply_safe_lowspec_profile,
            tweaks::apply_cs2_boost,
            tweaks::is_cs2_boosted,
            tweaks::get_cs2_launch_options,
            tweaks::generate_cs2_autoexec,
            backup::list_backups,
            backup::restore_backup,
            backup::delete_backup,
            security::get_hardware_id,
            security::check_security_status,
            security::verify_native_license,
            security::get_native_license,
            security::reset_native_license,
            window_controls::window_minimize,
            window_controls::window_toggle_maximize,
            window_controls::window_close,
            window_controls::window_show,
            window_controls::window_hide,
            window_controls::window_exit,
            window_controls::window_start_dragging,
            window_controls::window_is_maximized,
            trial::get_trial_status,
            trial::check_trial_allowed,
            trial::trigger_self_destruct,
        ])
        .run(tauri::generate_context!())
        .expect("error while running GhostTweak");
}

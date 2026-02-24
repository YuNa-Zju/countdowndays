use std::sync::Mutex;
use tauri::{App, Manager};

#[allow(unused_variables)]
// 🌟 1. 终极必杀：macOS 原生 NSWindow 透明化
pub fn fix_mac_transparent_window(app: &App) {
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSColor, NSWindow};
        use cocoa::base::{id, nil};

        // 将需要去掉白底的透明窗口列出来
        let window_labels = ["fab", "tray", "main"];

        for label in window_labels {
            if let Some(window) = app.get_webview_window(label) {
                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    // 彻底清除背景色，并禁止系统垫白板
                    let clear_color = NSColor::clearColor(nil);
                    ns_window.setBackgroundColor_(clear_color);
                    ns_window.setOpaque_(cocoa::base::NO);
                }
            }
        }
    }
}

// 🌟 2. 拦截双击启动第二个实例
pub fn handle_single_instance(app: &tauri::AppHandle, _args: Vec<String>, _cwd: String) {
    if let Some(main_win) = app.get_webview_window("main") {
        let _ = main_win.unminimize();
        let _ = main_win.show();
        let _ = main_win.set_focus();

        if let Some(fab) = app.get_webview_window("fab") {
            let _ = fab.hide();
        }
    }
}

// 🌟 3. 拦截主窗口的“关闭”事件
pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();

        if window.label() == "main" {
            let state = window.app_handle().state::<Mutex<bool>>();
            if *state.lock().unwrap() {
                if let Some(fab) = window.app_handle().get_webview_window("fab") {
                    let _ = fab.show();
                }
            }
        }
    }
}
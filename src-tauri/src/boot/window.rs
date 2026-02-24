use std::sync::Mutex;
use tauri::{App, Manager};

#[allow(unused_variables)] // 仅保留这个，因为在 Windows 编译时 app 确实没被用到
pub fn fix_mac_transparent_window(app: &App) {
    #[cfg(target_os = "macos")]
    {
        // 引入全新的 objc2 库宏和运行时类型
        use objc2::{class, msg_send};
        use objc2::runtime::AnyObject;

        let window_labels = ["fab", "tray", "main"];

        for label in window_labels {
            if let Some(window) = app.get_webview_window(label) {
                // Tauri 吐出的是 c_void 裸指针，我们把它转换为 objc2 认识的 AnyObject 指针
                let ns_window = window.ns_window().unwrap() as *mut AnyObject;

                unsafe {
                    // 等价于 OC 代码: NSColor *clearColor = [NSColor clearColor];
                    let ns_color_class = class!(NSColor);
                    let clear_color: *mut AnyObject = msg_send![ns_color_class, clearColor];

                    // 等价于 OC 代码: [nsWindow setBackgroundColor:clearColor];
                    let _: () = msg_send![ns_window, setBackgroundColor: clear_color];

                    // 等价于 OC 代码: [nsWindow setOpaque:NO];
                    let _: () = msg_send![ns_window, setOpaque: false];
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
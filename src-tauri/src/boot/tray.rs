use std::sync::Mutex;
use tauri::{
    image::Image,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager, PhysicalPosition,
};

pub fn create_tray(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    // 🌟 注意这里路径变成了 ../../../ 因为它现在在 src/boot/ 目录下
    let tray_icon = Image::from_bytes(include_bytes!("../../../tray.png"))
        .expect("解析托盘图标失败！请检查图片路径和名字对不对");

    let _tray = TrayIconBuilder::new()
        .icon(tray_icon)
        .tooltip("Momentary 倒数日")
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button,
                button_state: MouseButtonState::Up,
                position: cursor_pos,
                ..
            } = event
            {
                let app_handle = tray.app_handle();

                match button {
                    // 左键逻辑
                    MouseButton::Left => {
                        if let Some(main_win) = app_handle.get_webview_window("main") {
                            if main_win.is_visible().unwrap_or(false) {
                                let _ = main_win.hide();
                                let state = app_handle.state::<Mutex<bool>>();
                                if *state.lock().unwrap() {
                                    if let Some(fab) = app_handle.get_webview_window("fab") {
                                        let _ = fab.show();
                                    }
                                }
                            } else {
                                let _ = main_win.unminimize();
                                let _ = main_win.show();
                                let _ = main_win.set_focus();
                                if let Some(fab) = app_handle.get_webview_window("fab") {
                                    let _ = fab.hide();
                                }
                            }
                        }
                    }
                    // 右键逻辑
                    MouseButton::Right => {
                        if let Some(tray_win) = app_handle.get_webview_window("tray") {
                            if tray_win.is_visible().unwrap_or(false) {
                                let _ = tray_win.hide();
                            } else {
                                let win_size = tray_win.outer_size().unwrap();
                                let cursor_x = cursor_pos.x;
                                let cursor_y = cursor_pos.y;

                                if let Ok(Some(monitor)) = tray_win.current_monitor() {
                                    let monitor_size = monitor.size();
                                    let monitor_pos = monitor.position();

                                    let mut y = if cursor_y < (monitor_size.height as f64 / 2.0) {
                                        cursor_y + 16.0
                                    } else {
                                        cursor_y - win_size.height as f64 - 16.0
                                    };

                                    let mut x = cursor_x - (win_size.width as f64 / 2.0);

                                    let min_x = monitor_pos.x as f64 + 12.0;
                                    let max_x = (monitor_pos.x + monitor_size.width as i32) as f64
                                        - win_size.width as f64
                                        - 12.0;
                                    let min_y = monitor_pos.y as f64 + 12.0;
                                    let max_y = (monitor_pos.y + monitor_size.height as i32) as f64
                                        - win_size.height as f64
                                        - 12.0;

                                    x = x.clamp(min_x, max_x);
                                    y = y.clamp(min_y, max_y);

                                    let _ = tray_win.set_position(PhysicalPosition::new(x, y));
                                    let _ = tray_win.show();
                                    let _ = tray_win.set_focus();
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        })
        .build(app)?;

    Ok(())
}
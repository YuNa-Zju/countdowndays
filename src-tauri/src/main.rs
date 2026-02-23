#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod errors;
mod models;
mod notification;
mod repositories;

use notification::schedule_daily_notification;
use std::sync::Mutex;
use tauri::{
    image::Image,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, PhysicalPosition,
};

fn main() {
    tauri::Builder::default()
        // 🌟 1. 插件注册（只保留一份，且加上日志文件支持）
        .plugin(tauri_plugin_log::Builder::default()
            .targets([
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                // tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir),
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
            ])
            .build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())

        // 🌟 2. 状态管理
        .manage(Mutex::new(true))

        .setup(|app| {

            let handle = app.handle().clone();

            // ==========================================
            // 🌟 3. 初始化数据库（核心修复：直接使用 app.manage）
            // ==========================================
            tauri::async_runtime::block_on(async move {
                // 如果这里失败，程序会直接带错误信息闪退，而不是报 State not managed
                let pool = db::init_db(&handle).await.expect("数据库初始化致命错误");

                // 必须使用 app (或者这里拿到的 handle) 挂载状态
                handle.manage(pool);

                // 后台任务
                let bg_handle = handle.clone();
                tauri::async_runtime::spawn(async move {
                    schedule_daily_notification(bg_handle).await;
                });
            });

            // ==========================================
            // 4. 系统托盘配置 (逻辑保持不变)
            // ==========================================
            let tray_icon = Image::from_bytes(include_bytes!("../../tray.png"))
                .expect("解析托盘图标失败");

            let _tray = TrayIconBuilder::new()
                .icon(tray_icon)
                .tooltip("Momentary 倒数日")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button, button_state, position, .. } = event {
                        if button_state == MouseButtonState::Up {
                            let app = tray.app_handle();
                            match button {
                                MouseButton::Left => {
                                    if let Some(win) = app.get_webview_window("main") {
                                        if win.is_visible().unwrap_or(false) {
                                            let _ = win.hide();
                                            // 自动恢复 Fab
                                            let state = app.state::<Mutex<bool>>();
                                            if *state.lock().unwrap() {
                                                if let Some(f) = app.get_webview_window("fab") { let _ = f.show(); }
                                            }
                                        } else {
                                            let _ = win.unminimize();
                                            let _ = win.show();
                                            let _ = win.set_focus();
                                            if let Some(f) = app.get_webview_window("fab") { let _ = f.hide(); }
                                        }
                                    }
                                }
                                MouseButton::Right => {
                                    if let Some(tray_win) = app.get_webview_window("tray") {
                                        if tray_win.is_visible().unwrap_or(false) {
                                            let _ = tray_win.hide();
                                        } else {
                                            let win_size = tray_win.outer_size().unwrap();
                                            let scale = tray_win.scale_factor().unwrap_or(1.0);
                                            let monitor = tray_win.current_monitor().unwrap().unwrap();
                                            let m_size = monitor.size();
                                            let m_pos = monitor.position();

                                            let mut y = if position.y < (m_size.height as f64 / 2.0) {
                                                position.y + 16.0
                                            } else {
                                                position.y - win_size.height as f64 - 16.0
                                            };
                                            let mut x = position.x - (win_size.width as f64 / 2.0);

                                            // 碰撞检测
                                            x = x.clamp(m_pos.x as f64 + 10.0, (m_pos.x + m_size.width as i32) as f64 - win_size.width as f64 - 10.0);
                                            y = y.clamp(m_pos.y as f64 + 10.0, (m_pos.y + m_size.height as i32) as f64 - win_size.height as f64 - 10.0);

                                            let _ = tray_win.set_position(PhysicalPosition::new(x, y));
                                            let _ = tray_win.show();
                                            let _ = tray_win.set_focus();
                                        }
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
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
        })
        // 🌟 5. 确保这里包含所有指令
        .invoke_handler(tauri::generate_handler![
            commands::get_all_events,
            commands::create_event,
            commands::update_event,
            commands::delete_event,
            commands::get_all_categories,
            commands::create_category,
            commands::delete_category,
            commands::wake_main_window,
            commands::get_fab_state,
            commands::toggle_fab,
            // commands::init_fab_position // 🌟 补上了！
        ])
        .run(tauri::generate_context!())
        .expect("运行失败");
}
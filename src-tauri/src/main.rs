#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod errors;
mod models;
mod repositories;
mod notification;

use tauri::Manager;
// 🌟 引入 Tauri v2 托盘所需的组件
use tauri::{
    image::Image,
    menu::{Menu, MenuItem, CheckMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use notification::schedule_daily_notification;
use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(Mutex::new(true))
        .setup(|app| {
            let app_handle = app.handle().clone();
            // ==========================================
            // 🌟 1. 注册系统托盘 (System Tray)
            // ==========================================
            // 定义托盘的右键菜单
            let show_i = MenuItem::with_id(app, "show", "显示主界面", true, None::<&str>)?;
            let fab_i = CheckMenuItem::with_id(app, "toggle_fab", "启用悬浮窗", true, true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &fab_i, &quit_i])?;
            let tray_icon = Image::from_bytes(include_bytes!("../../tray.png"))
                .expect("解析托盘图标失败！请检查图片路径和名字对不对");
            // 构建托盘图标
            let _tray = TrayIconBuilder::new()
                .icon(tray_icon)
                .menu(&menu)
                .show_menu_on_left_click(false)
                // 监听右键菜单的点击事件
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => std::process::exit(0),
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "toggle_fab" => {
                        // 切换悬浮窗启用状态
                        let state = app.state::<Mutex<bool>>();
                        let mut is_enabled = state.lock().unwrap();
                        *is_enabled = !*is_enabled;

                        if let Some(fab) = app.get_webview_window("fab") {
                            let main_visible = app.get_webview_window("main").unwrap().is_visible().unwrap_or(true);
                            if *is_enabled && !main_visible {
                                let _ = fab.show();
                            } else {
                                let _ = fab.hide();
                            }
                        }
                    }
                    _ => {}
                })
                // 监听托盘图标本身的点击事件（比如左键单击唤醒）
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        // 找到主窗口并强制唤醒
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // ==========================================
            // 2. 初始化数据库
            // ==========================================
            tauri::async_runtime::block_on(async move {
                let pool = db::init_db(&app_handle).await.expect("数据库初始化失败");
                app_handle.manage(pool);
                let bg_app_handle = app_handle.clone();
                tauri::async_runtime::spawn(async move {
                    schedule_daily_notification(bg_app_handle).await;
                });
            });

            Ok(())
        })
        // 拦截主窗口的“关闭”事件，让它变成“最小化到托盘”而不是直接退出
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // 阻止真实的关闭
                api.prevent_close();
                // 隐藏窗口
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
        .invoke_handler(tauri::generate_handler![
            commands::get_all_events,
            commands::create_event,
            commands::update_event,
            commands::delete_event,
            commands::get_all_categories,
            commands::create_category,
            commands::delete_category,
            commands::wake_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

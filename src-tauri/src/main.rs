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
};
// 🌟 核心修复 1：引入 Emitter 使得后端可以向前端发送事件
use tauri::{Emitter, Manager, PhysicalPosition};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        // 🌟 修复：去掉了重复的 plugin 注册
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // 当系统检测到用户试图双击图标启动第二个实例时，会拦截启动，并触发这个闭包！
            // 此时我们直接把已经运行的第一个实例的主窗口“拽”到用户眼前
            if let Some(main_win) = app.get_webview_window("main") {
                let _ = main_win.unminimize();
                let _ = main_win.show();
                let _ = main_win.set_focus();

                // 🌟 联动保护：主窗口出来了，悬浮窗立刻识趣地退下
                if let Some(fab) = app.get_webview_window("fab") {
                    let _ = fab.hide();
                }
            }
        }))
        .manage(Mutex::new(true)) // 管理 fab (悬浮窗) 的全局开启状态
        .setup(|app| {
            let app_handle = app.handle().clone();

            // ==========================================
            // 🌟 1. 注册无边框自定义系统托盘 (Webview Tray)
            // ==========================================
            let tray_icon = Image::from_bytes(include_bytes!("../../tray.png"))
                .expect("解析托盘图标失败！请检查图片路径和名字对不对");

            let _tray = TrayIconBuilder::new()
                .icon(tray_icon)
                .tooltip("Momentary 倒数日") // 鼠标悬停时的提示
                // 🌟 彻底抛弃 .menu(&menu)，完全由我们自己的 React 窗口接管
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button,
                        button_state: MouseButtonState::Up,
                        position: cursor_pos, // 🌟 核心破局点：直接抓取真实的鼠标物理坐标！不再依赖被魔改的图标 rect
                        ..
                    } = event
                    {
                        let app_handle = tray.app_handle();

                        match button {
                            // ==========================================
                            // 🌟 坐标一：左键点击 -> 控制主界面显示/隐藏，并联动 Fab
                            // ==========================================
                            MouseButton::Left => {
                                if let Some(main_win) = app_handle.get_webview_window("main") {
                                    if main_win.is_visible().unwrap_or(false) {
                                        // 主窗口可见，隐藏主窗口
                                        let _ = main_win.hide();
                                        // 🌟 联动：恢复悬浮窗
                                        let state = app_handle.state::<Mutex<bool>>();
                                        if *state.lock().unwrap() {
                                            if let Some(fab) = app_handle.get_webview_window("fab")
                                            {
                                                let _ = fab.show();
                                            }
                                        }
                                    } else {
                                        // 主窗口隐藏，显示主窗口
                                        let _ = main_win.unminimize();
                                        let _ = main_win.show();
                                        let _ = main_win.set_focus();
                                        // 🌟 联动：隐藏悬浮窗
                                        if let Some(fab) = app_handle.get_webview_window("fab") {
                                            let _ = fab.hide();
                                        }
                                    }
                                }
                            }

                            // ==========================================
                            // 🌟 坐标二：右键点击 -> 呼出 React 高级托盘面板 (跟随鼠标)
                            // ==========================================
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

                                            // 基于鼠标当前位置计算窗口该往上弹还是往下弹
                                            let mut y =
                                                if cursor_y < (monitor_size.height as f64 / 2.0) {
                                                    cursor_y + 16.0 // 屏幕上半区，往鼠标下方弹一点
                                                } else {
                                                    cursor_y - win_size.height as f64 - 16.0
                                                    // 屏幕下半区，往上方弹
                                                };

                                            // X 轴默认以鼠标为中心居中
                                            let mut x = cursor_x - (win_size.width as f64 / 2.0);

                                            // 🌟 终极护盾：碰撞边缘限制，绝不超出屏幕
                                            let min_x = monitor_pos.x as f64 + 12.0;
                                            let max_x = (monitor_pos.x + monitor_size.width as i32)
                                                as f64
                                                - win_size.width as f64
                                                - 12.0;
                                            let min_y = monitor_pos.y as f64 + 12.0;
                                            let max_y = (monitor_pos.y + monitor_size.height as i32)
                                                as f64
                                                - win_size.height as f64
                                                - 12.0;

                                            x = x.clamp(min_x, max_x);
                                            y = y.clamp(min_y, max_y);

                                            let _ =
                                                tray_win.set_position(PhysicalPosition::new(x, y));
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

            // ==========================================
            // 🌟 2. 初始化数据库及后台任务 (核心修复区)
            // ==========================================
            // 不要使用 block_on 阻塞主线程，改用 spawn 后台执行
            let setup_app_handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                // 1. 异步等待数据库连接和迁移完成
                let pool = db::init_db(&setup_app_handle)
                    .await
                    .expect("数据库初始化失败");

                // 2. 将连接池挂载到全局状态中
                setup_app_handle.manage(pool);

                // 3. 🌟 关键：通知前端数据库已经挂载完毕，可以安全发起请求了！
                let _ = setup_app_handle.emit("db-ready", ());

                // 4. 继续运行原有的后台定时任务
                let bg_app_handle = setup_app_handle.clone();
                tauri::async_runtime::spawn(async move {
                    schedule_daily_notification(bg_app_handle).await;
                });
            });

            Ok(())
        })
        // 拦截主窗口的“关闭”事件，让它变成“最小化到后台”
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // 阻止真实的关闭
                api.prevent_close();
                // 隐藏窗口
                let _ = window.hide();

                // 🌟 如果关闭的是主窗口，并且 fab 开关是打开的，则唤醒悬浮窗
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
            commands::get_fab_state,
            commands::toggle_fab,
            commands::is_db_initialized
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod boot; // 🌟 引入刚建的 boot 文件夹
mod commands;
mod db;
mod errors;
mod models;
mod notification;
mod repositories;

use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        // 🌟 单例拦截交给 window 模块
        .plugin(tauri_plugin_single_instance::init(boot::window::handle_single_instance))
        .manage(Mutex::new(true)) // 管理 fab (悬浮窗) 的全局开启状态
        // 🌟 初始化核心逻辑交给 setup 模块
        .setup(boot::setup::init)
        // 🌟 窗口关闭拦截交给 window 模块
        .on_window_event(boot::window::handle_window_event)
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
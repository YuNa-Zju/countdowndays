// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod errors;
mod modals;
mod repositories;

use tauri::Manager;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            // 初始化数据库并注入状态
            tauri::async_runtime::block_on(async move {
                let pool = db::init_db(&app_handle).await.expect("数据库初始化失败");
                app_handle.manage(pool);
            });

            Ok(())
        })
        // 注册所有供前端调用的 API
        .invoke_handler(tauri::generate_handler![
            commands::create_event,
            commands::get_all_events,
            commands::get_event_by_id,
            commands::update_event,
            commands::delete_event,
            commands::search_events,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

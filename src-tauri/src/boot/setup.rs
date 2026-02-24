use crate::boot::{tray, window};
use crate::db;
use crate::notification::schedule_daily_notification;
use tauri::{App, Manager, Emitter};

pub fn init(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();

    // 1. 修复 macOS 透明白边问题
    window::fix_mac_transparent_window(app);

    // 2. 注册系统托盘
    tray::create_tray(app)?;

    // 3. 异步初始化数据库及后台任务
    tauri::async_runtime::spawn(async move {
        // 挂载数据库
        let pool = db::init_db(&app_handle).await.expect("数据库初始化失败");
        app_handle.manage(pool);

        // 广播就绪信号
        let _ = app_handle.emit("db-ready", ());

        // 启动定时任务
        let bg_app_handle = app_handle.clone();
        tauri::async_runtime::spawn(async move {
            schedule_daily_notification(bg_app_handle).await;
        });
    });

    Ok(())
}
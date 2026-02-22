use chrono::{Datelike, Local, Timelike};
use sqlx::SqlitePool;
use std::time::Duration;
use tauri::Manager;
use tauri_plugin_notification::NotificationExt;

// 引入你的仓储模块（如果在同一个文件可以忽略）
use crate::repositories::EventRepository;

// 核心：定时任务处理函数
pub async fn schedule_daily_notification(app_handle: tauri::AppHandle) {
    tokio::spawn(async move {
        // 用于记录上次触发的日期，防止同一天内多次发送
        let mut last_triggered_date = None;

        // 创建一个每 60 秒触发一次的定时器
        let mut interval = tokio::time::interval(Duration::from_secs(60));

        loop {
            interval.tick().await;

            let now = Local::now();
            let current_date = now.date_naive();

            // 如果当前时间是早上 8 点 (你可以改回你测试用的 2 点)，并且今天还没触发过
            if now.hour() == 10 && last_triggered_date != Some(current_date) {

                // 1. 满足时间条件时，才会去查询数据库，绝对不会频繁读写 DB！
                check_and_notify_events(&app_handle).await;

                // 2. 标记今天已经触发过
                last_triggered_date = Some(current_date);
            }
        }
    });
}

// 查询与发送通知逻辑 (已接入真实数据库)
pub async fn check_and_notify_events(app: &tauri::AppHandle) {
    // 1. 从 app state 中提取数据库连接池
    let pool = app.state::<SqlitePool>();

    // 2. 获取当天的日期
    let current_date = Local::now().date_naive();

    // 3. 复用现有的 get_all 方法获取所有事件
    if let Ok(events) = EventRepository::get_all(&pool).await {
        for event in events {
            // 将 UTC 时间转为本地时间
            let target_local = event.target_date.with_timezone(&Local).date_naive();
            let mut notify_msg = None;

            // 4. 区分类型判断是否需要通知
            if event.event_type == "anniversary" {
                // 纪念日：仅比对月份和日子
                if target_local.month() == current_date.month() && target_local.day() == current_date.day() {
                    let years = current_date.year() - target_local.year();
                    if years > 0 {
                        notify_msg = Some(format!("今天是【{}】的 {} 周年纪念日！", event.title, years));
                    } else if years == 0 {
                        notify_msg = Some(format!("【{}】就在今天开启啦！", event.title));
                    }
                }
            } else {
                // 任务/倒数日：比对具体的年月日
                if target_local == current_date {
                    notify_msg = Some(format!("任务【{}】今天到期！", event.title));
                }
            }

            // 5. 调用通知插件发送系统通知
            if let Some(msg) = notify_msg {
                let _ = app.notification()
                    .builder()
                    .title("📅 倒数日提醒")
                    .body(&msg)
                    .icon("app-icon") // 加上这行，打包后就会显示正确的应用图标
                    .show();
            }
        }
    }
}
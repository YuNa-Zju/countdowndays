use crate::errors::AppResult;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::fs;
use tauri::{AppHandle, Manager};

pub async fn init_db(app: &AppHandle) -> AppResult<SqlitePool> {
    // 1. 获取跨平台的 App 数据存储目录 (Windows是AppData, Linux是~/.config/...)
    let app_dir = app.path().app_data_dir().expect("无法获取 App 数据目录");

    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }

    // 2. 动态构建实际的 .db 文件路径
    let db_path = app_dir.join("countdown.db");

    // 3. 🌟 核心修复：使用 SqliteConnectOptions 传入原始路径
    // 彻底避开 Windows 下盘符 (C:\) 和反斜杠导致的 URL 解析崩溃 Bug
    // 并自带 create_if_missing，不需要我们手动 fs::File::create 零字节空文件
    let options = SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true);

    // 4. 创建连接池
    let pool = SqlitePoolOptions::new()
        .max_connections(10)
        .connect_with(options)
        .await?;

    // 5. 将 migrations 目录下的 SQL 打包进程序，并在每次启动时自动执行建表/升级
    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}

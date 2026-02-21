use crate::errors::AppResult;
use sqlx::sqlite::SqlitePoolOptions;
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
    // 构造 sqlx 需要的连接字符串格式
    let db_url = format!("sqlite://{}", db_path.to_str().unwrap());

    // 3. 如果文件不存在，先创建一个空文件
    if !db_path.exists() {
        fs::File::create(&db_path)?;
    }

    // 4. 创建连接池
    let pool = SqlitePoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await?;

    // 5. 将 migrations 目录下的 SQL 打包进程序，并在每次启动时自动执行建表/升级
    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}

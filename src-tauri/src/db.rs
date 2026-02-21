use crate::errors::{AppError, AppResult};
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::SqlitePool;
use std::{env, fs};
use tauri::{AppHandle, Manager};

fn get_database_url() -> AppResult<String> {
    dotenv::dotenv().ok();
    env::var("DATABASE_URL").map_err(|_| AppError::Database("Can't find database"))?
}

pub async fn init_db(app: &AppHandle) -> AppResult<SqlitePool> {
    // 1. 获取跨平台的 App 数据存储目录
    let app_dir = app.path().app_data_dir().expect("无法获取 App 数据目录");

    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }

    let db_path = get_database_url()?;

    // 2. 如果文件不存在，先创建一个空文件
    if !db_path.exists() {
        fs::File::create(&db_path)?;
    }

    // 3. 创建连接池，配置最大连接数为 10（完美契合你的需求）
    let pool = SqlitePoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await?;

    // 4. 魔法在此：在编译时将 migrations 目录下的 SQL 打包进程序
    // 并在程序启动时自动执行尚未运行的迁移，确保表结构永远是最新的！
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|_| AppError::Database("Can't migrate database"))?;

    Ok(pool)
}

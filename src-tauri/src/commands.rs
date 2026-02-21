use tauri::State;
use sqlx::SqlitePool;

use crate::models::{CreateEventDto, Event, SearchEventDto, UpdateEventDto};
use crate::repositories::EventRepository;
use crate::errors::AppResult;

/// 1. 创建日程
#[tauri::command]
pub async fn create_event(
    payload: CreateEventDto,
    pool: State<'_, SqlitePool>, // Tauri 会自动从全局状态中注入数据库连接池
) -> AppResult<i64> {
    // 这里使用 &*pool 解引用 State，获取内部的 SqlitePool 引用
    EventRepository::create(&*pool, payload).await
}

/// 2. 获取所有日程
#[tauri::command]
pub async fn get_all_events(
    pool: State<'_, SqlitePool>,
) -> AppResult<Vec<Event>> {
    EventRepository::get_all(&*pool).await
}

/// 3. 获取单个日程详情
#[tauri::command]
pub async fn get_event_by_id(
    id: i64,
    pool: State<'_, SqlitePool>,
) -> AppResult<Event> {
    EventRepository::get_by_id(&*pool, id).await
}

/// 4. 局部更新日程
#[tauri::command]
pub async fn update_event(
    payload: UpdateEventDto,
    pool: State<'_, SqlitePool>,
) -> AppResult<u64> {
    EventRepository::update(&*pool, payload).await
}

/// 5. 删除日程
#[tauri::command]
pub async fn delete_event(
    id: i64,
    pool: State<'_, SqlitePool>,
) -> AppResult<u64> {
    EventRepository::delete(&*pool, id).await
}

/// 6. 高级多条件搜索
#[tauri::command]
pub async fn search_events(
    payload: SearchEventDto,
    pool: State<'_, SqlitePool>,
) -> AppResult<Vec<Event>> {
    EventRepository::search(&*pool, payload).await
}


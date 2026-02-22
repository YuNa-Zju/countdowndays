use crate::errors::{AppError, AppResult};
use crate::models::{Category, CreateEventDto, Event, UpdateEventDto};
use crate::repositories::EventRepository;
use sqlx::SqlitePool;
use tauri::State;

#[tauri::command]
pub async fn get_all_events(pool: State<'_, SqlitePool>) -> AppResult<Vec<Event>> {
    EventRepository::get_all(&*pool).await
}

#[tauri::command]
pub async fn create_event(payload_str: String, pool: State<'_, SqlitePool>) -> AppResult<i64> {
    println!("API: create_event with payload: {}", payload_str);
    let payload: CreateEventDto = serde_json::from_str(&payload_str)
        .map_err(|e| AppError::Business(format!("创建参数解析失败: {}", e)))?;
    EventRepository::create(&*pool, payload).await
}

#[tauri::command]
pub async fn update_event(payload_str: String, pool: State<'_, SqlitePool>) -> AppResult<u64> {
    let payload: UpdateEventDto = serde_json::from_str(&payload_str)
        .map_err(|e| AppError::Business(format!("更新参数解析失败: {}", e)))?;
    EventRepository::update(&*pool, payload).await
}

#[tauri::command]
pub async fn delete_event(id: i64, pool: State<'_, SqlitePool>) -> AppResult<u64> {
    EventRepository::delete(&*pool, id).await
}

#[tauri::command]
pub async fn get_all_categories(pool: State<'_, SqlitePool>) -> AppResult<Vec<Category>> {
    EventRepository::get_all_categories(&*pool).await
}

#[tauri::command]
pub async fn create_category(name: String, pool: State<'_, SqlitePool>) -> AppResult<i64> {
    EventRepository::create_category(&*pool, name).await
}

#[tauri::command]
pub async fn delete_category(id: i64, pool: State<'_, SqlitePool>) -> AppResult<u64> {
    EventRepository::delete_category(&*pool, id).await
}

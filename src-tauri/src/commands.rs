use tauri::State;
use sqlx::SqlitePool;
use crate::errors::AppResult;
use crate::models::{Event, Category, CreateEventDto, UpdateEventDto};
use crate::repositories::EventRepository;

#[tauri::command]
pub async fn get_all_events(pool: State<'_, SqlitePool>) -> AppResult<Vec<Event>> {
    EventRepository::get_all(&*pool).await
}

#[tauri::command]
pub async fn create_event(payload: CreateEventDto, pool: State<'_, SqlitePool>) -> AppResult<i64> {
    EventRepository::create(&*pool, payload).await
}

#[tauri::command]
pub async fn update_event(payload: UpdateEventDto, pool: State<'_, SqlitePool>) -> AppResult<u64> {
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
use crate::errors::AppResult;
use crate::models::{Category, CreateEventDto, Event, UpdateEventDto};
use crate::repositories::EventRepository;
use sqlx::SqlitePool;
use std::sync::Mutex;
use tauri::{Emitter, Manager, State};

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

#[tauri::command]
pub fn wake_main_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.emit("wake-main-and-create", ());
    }
    // 可选：唤醒主界面的同时，把悬浮窗藏起来，体验更好
    if let Some(fab) = app.get_webview_window("fab") {
        let _ = fab.hide();
    }
}

#[tauri::command]
pub fn get_fab_state(state: State<'_, Mutex<bool>>) -> bool {
    *state.lock().unwrap()
}

// 切换悬浮窗的开关状态
#[tauri::command]
pub fn toggle_fab(app: tauri::AppHandle, state: State<'_, Mutex<bool>>) -> bool {
    let mut is_enabled = state.lock().unwrap();
    *is_enabled = !*is_enabled;
    let new_state = *is_enabled;

    if let Some(fab) = app.get_webview_window("fab") {
        let main_visible = app
            .get_webview_window("main")
            .unwrap()
            .is_visible()
            .unwrap_or(true);

        // 只有开关打开，且主窗口隐藏时，才显示悬浮窗
        if new_state && !main_visible {
            let _ = fab.show();
        } else {
            let _ = fab.hide();
        }
    }
    new_state
}

#[tauri::command]
pub async fn is_db_initialized(handle: tauri::AppHandle) -> bool {
    // 检查 Tauri 是否已经接管了 SqlitePool
    handle.try_state::<sqlx::SqlitePool>().is_some()
}
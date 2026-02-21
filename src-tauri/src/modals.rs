use chrono::{DateTime, NaiveDateTime};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// 1. 核心实体 & 返回给前端的完整 DTO
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Event {
    pub id: i64,
    pub user_id: Option<String>, // 预留给未来的 Web 版
    pub title: String,
    pub description: String,
    pub target_date: NaiveDateTime, // Unix 时间戳
    pub importance: f64,            // 浮点数，用于支持优雅的拖拽排序
    pub category: String,
    pub meta: String, // JSON 字符串，扩展字段
}

// 2. 前端请求：创建新日程
#[derive(Debug, Deserialize)]
pub struct CreateEventDto {
    pub title: String,
    pub description: String,
    pub target_date: NaiveDateTime,
    pub importance: f64,
    pub category: String,
    pub meta: String,
}

// 3. 前端请求：更新现有日程 (支持部分字段更新)
#[derive(Debug, Deserialize)]
pub struct UpdateEventDto {
    pub id: i64, // 必须包含 ID
    pub title: Option<String>,
    pub description: Option<String>,
    pub target_date: Option<NaiveDateTime>,
    pub importance: Option<f64>,
    pub category: Option<String>,
    pub meta: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SearchEventDto {
    pub start_date: Option<NaiveDateTime>,
    pub end_date: Option<NaiveDateTime>,
    pub keyword: Option<String>, // 用于模糊搜索 title 和 description
    pub regex_pattern: Option<String>, // 用于 Rust 内存正则匹配
}

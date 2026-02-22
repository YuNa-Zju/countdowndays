use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// 分类实体
#[derive(Debug, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
}

// 包含分类列表的完整日程实体 (发给前端)
#[derive(Debug, Serialize, Deserialize)]
pub struct Event {
    pub id: i64,
    pub user_id: Option<String>,
    pub title: String,
    pub description: String,
    pub target_date: DateTime<Utc>,
    pub importance: i64,
    pub meta: String,
    pub categories: Vec<Category>, // 多对多：返回分类数组
    pub event_type: String,
}

// 创建日程的请求
#[derive(Debug, Deserialize)]
pub struct CreateEventDto {
    pub title: String,
    pub description: String,
    pub target_date: DateTime<Utc>,
    pub importance: i64,
    pub meta: String,
    pub category_ids: Vec<i64>, // 前端传过来的分类 ID 列表
    pub event_type: String,
}

// 更新日程的请求
#[derive(Debug, Deserialize)]
pub struct UpdateEventDto {
    pub id: i64,
    pub title: Option<String>,
    pub description: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub importance: Option<i64>,
    pub meta: Option<String>,
    pub category_ids: Option<Vec<i64>>, // 如果传了，就全量覆盖该日程的分类
    pub event_type: Option<String>,
}

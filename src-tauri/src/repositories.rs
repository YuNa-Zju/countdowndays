use crate::errors::{AppError, AppResult};
use crate::models::{Category, CreateEventDto, Event, UpdateEventDto};
use serde_json;
use sqlx::{Row, SqlitePool};

pub struct EventRepository;

impl EventRepository {
    // 获取所有分类
    pub async fn get_all_categories(pool: &SqlitePool) -> AppResult<Vec<Category>> {
        let rows = sqlx::query!("SELECT id, name FROM categories ORDER BY id ASC")
            .fetch_all(pool)
            .await?;
        Ok(rows
            .into_iter()
            .map(|r| Category {
                id: r.id,
                name: r.name,
            })
            .collect())
    }

    // 创建分类
    pub async fn create_category(pool: &SqlitePool, name: String) -> AppResult<i64> {
        let rec = sqlx::query!(
            "INSERT INTO categories (name) VALUES (?1) RETURNING id",
            name
        )
        .fetch_one(pool)
        .await?;
        Ok(rec.id)
    }

    // 创建日程 (带有事务)
    pub async fn create(pool: &SqlitePool, payload: CreateEventDto) -> AppResult<i64> {
        let mut tx = pool.begin().await?;
        let event_id = sqlx::query!(
            "INSERT INTO events (title, description, target_date, importance, meta) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING id",
            payload.title, payload.description, payload.target_date, payload.importance, payload.meta
        ).fetch_one(&mut *tx).await?.id;

        // 插入多对多关系
        for cat_id in payload.category_ids {
            sqlx::query!(
                "INSERT INTO event_categories (event_id, category_id) VALUES (?1, ?2)",
                event_id,
                cat_id
            )
            .execute(&mut *tx)
            .await?;
        }
        tx.commit().await?;
        Ok(event_id)
    }

    // 获取所有日程 (完美映射 M2M)
    pub async fn get_all(pool: &SqlitePool) -> AppResult<Vec<Event>> {
        // 利用 SQLite 的 json_group_array 聚合分类
        let rows = sqlx::query(
            r#"
            SELECT e.*, 
                   COALESCE((
                       SELECT json_group_array(json_object('id', c.id, 'name', c.name))
                       FROM categories c
                       JOIN event_categories ec ON c.id = ec.category_id
                       WHERE ec.event_id = e.id
                   ), '[]') as categories_json
            FROM events e
            ORDER BY e.target_date ASC
            "#,
        )
        .fetch_all(pool)
        .await?;

        let mut events = Vec::new();
        for row in rows {
            let cat_json: String = row.try_get("categories_json")?;
            events.push(Event {
                id: row.try_get("id")?,
                user_id: row.try_get("user_id").ok(),
                title: row.try_get("title")?,
                description: row.try_get("description")?,
                target_date: row.try_get("target_date")?,
                importance: row.try_get("importance")?,
                meta: row.try_get("meta")?,
                categories: serde_json::from_str(&cat_json).unwrap_or_default(),
            });
        }
        Ok(events)
    }

    // 删除日程 (一并清理多对多关系)
    pub async fn delete(pool: &SqlitePool, id: i64) -> AppResult<u64> {
        let mut tx = pool.begin().await?;
        sqlx::query!("DELETE FROM event_categories WHERE event_id = ?1", id)
            .execute(&mut *tx)
            .await?;
        let rows = sqlx::query!("DELETE FROM events WHERE id = ?1", id)
            .execute(&mut *tx)
            .await?
            .rows_affected();
        tx.commit().await?;
        Ok(rows)
    }
    // 在 impl EventRepository 中添加
    pub async fn delete_category(pool: &SqlitePool, id: i64) -> AppResult<u64> {
        let mut tx = pool.begin().await?;
        // 1. 首先删除所有日程与该分类的关联关系（维护引用完整性）
        sqlx::query!("DELETE FROM event_categories WHERE category_id = ?1", id)
            .execute(&mut *tx)
            .await?;

        // 2. 删除分类本身
        let rows = sqlx::query!("DELETE FROM categories WHERE id = ?1", id)
            .execute(&mut *tx)
            .await?
            .rows_affected();

        tx.commit().await?;
        Ok(rows)
    }
}

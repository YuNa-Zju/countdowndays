use crate::errors::AppResult;
use crate::models::{Category, CreateEventDto, Event, UpdateEventDto};
use chrono::Utc; // 🌟 新增：引入 Utc 以获取当前时间
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

    // 🌟 创建日程 (修复：补上 event_type 和 created_at)
    pub async fn create(pool: &SqlitePool, payload: CreateEventDto) -> AppResult<i64> {
        let mut tx = pool.begin().await?;
        let now = Utc::now(); // 🌟 生成当前准确的 UTC 时间

        let event_id = sqlx::query!(
            // 🌟 将 created_at 显式加入 INSERT 语句
            "INSERT INTO events (title, description, target_date, importance, event_type, meta, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING id",
            payload.title,
            payload.description,
            payload.target_date,
            payload.importance,
            payload.event_type,
            payload.meta,
            now // 🌟 注入生成的时间
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

    // 🌟 获取所有日程 (完美映射 M2M，修复：补上 event_type 和 created_at 读取)
    pub async fn get_all(pool: &SqlitePool) -> AppResult<Vec<Event>> {
        // 利用 SQLite 的 json_group_array 聚合分类
        // 注意 SELECT e.* 会自动把 created_at 也抓取出来
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
                created_at: row.try_get("created_at")?, // 🌟 读取创建时间并映射
                importance: row.try_get("importance")?,
                event_type: row.try_get("event_type")?,
                meta: row.try_get("meta")?,
                created_at: row.try_get("created_at")?, // 🌟 补上这行：读取数据库中的创建时间
                categories: serde_json::from_str(&cat_json).unwrap_or_default(),
            });
        }
        Ok(events)
    }

    // 🌟 更新日程
    pub async fn update(pool: &SqlitePool, dto: UpdateEventDto) -> AppResult<u64> {
        let mut tx = pool.begin().await?;

        // 先查出旧数据，方便做增量更新
        let old = sqlx::query!(
            "SELECT title, description, target_date, importance, event_type, meta FROM events WHERE id = ?1",
            dto.id
        ).fetch_one(&mut *tx).await?;
        let title = dto.title.unwrap_or(old.title);
        let desc = dto.description.unwrap_or(old.description);

        // 💡 提示：如果你的 sqlx 推导 target_date 已经是 DateTime<Utc>，这里的 .and_utc() 可能会报错
        // 如果报错了，请直接把 .and_utc() 删掉，写成 `unwrap_or(old.target_date)` 即可
        let t_date = dto.target_date.unwrap_or(old.target_date.and_utc());

        let imp = dto.importance.unwrap_or(old.importance);
        let e_type = dto.event_type.unwrap_or(old.event_type);
        let meta = dto.meta.unwrap_or(old.meta);

        // 更新主表（不更新 created_at，保持原样）
        sqlx::query!(
            "UPDATE events SET title=?1, description=?2, target_date=?3, importance=?4, event_type=?5, meta=?6 WHERE id=?7",
            title, desc, t_date, imp, e_type, meta, dto.id
        ).execute(&mut *tx).await?;

        // 重新绑定多对多标签关系
        if let Some(cat_ids) = dto.category_ids {
            sqlx::query!("DELETE FROM event_categories WHERE event_id = ?1", dto.id)
                .execute(&mut *tx)
                .await?;

            for cid in cat_ids {
                sqlx::query!(
                    "INSERT INTO event_categories (event_id, category_id) VALUES (?1, ?2)",
                    dto.id,
                    cid
                )
                .execute(&mut *tx)
                .await?;
            }
        }

        tx.commit().await?;
        Ok(1)
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

    // 删除分类 (并维护引用完整性)
    pub async fn delete_category(pool: &SqlitePool, id: i64) -> AppResult<u64> {
        let mut tx = pool.begin().await?;

        sqlx::query!("DELETE FROM event_categories WHERE category_id = ?1", id)
            .execute(&mut *tx)
            .await?;

        let rows = sqlx::query!("DELETE FROM categories WHERE id = ?1", id)
            .execute(&mut *tx)
            .await?
            .rows_affected();

        tx.commit().await?;
        Ok(rows)
    }
}
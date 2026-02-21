use crate::errors::{AppError, AppResult};
use crate::modals::{CreateEventDto, Event, SearchEventDto, UpdateEventDto};
use regex::Regex;
use sqlx::{QueryBuilder, Sqlite, SqlitePool};

pub struct EventRepository;

impl EventRepository {
    /// 1. 创建日程 (Create)
    pub async fn create(pool: &SqlitePool, payload: CreateEventDto) -> AppResult<i64> {
        // query! 宏会在编译期检查 SQL 语法和类型
        let rec = sqlx::query!(
            r#"
            INSERT INTO events (user_id, title, description, target_date, importance, category, meta)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            RETURNING id
            "#,
            None::<String>, // 目前单机版 user_id 传 NULL
            payload.title,
            payload.description,
            payload.target_date,
            payload.importance,
            payload.category,
            payload.meta
        )
        .fetch_one(pool)
        .await?;
        Ok(rec.id)
    }

    /// 2. 获取所有日程 (Read)
    pub async fn get_all(pool: &SqlitePool) -> AppResult<Vec<Event>> {
        let events = sqlx::query_as!(
            Event,
            r#"
            SELECT id, user_id, title, description, target_date, importance, category, meta 
            FROM events 
            ORDER BY target_date ASC
            "#
        )
        .fetch_all(pool)
        .await?;

        Ok(events)
    }

    /// 3. 获取单个日程详情 (Read One)
    pub async fn get_by_id(pool: &SqlitePool, id: i64) -> AppResult<Event> {
        let event = sqlx::query_as!(
            Event,
            r#"
            SELECT id, user_id, title, description, target_date, importance, category, meta 
            FROM events 
            WHERE id = ?1
            "#,
            id
        )
        .fetch_one(pool)
        .await?;

        Ok(event)
    }

    /// 4. 局部更新日程 (Update)
    pub async fn update(pool: &SqlitePool, payload: UpdateEventDto) -> AppResult<u64> {
        // 魔法就在 COALESCE: 如果传入的参数是 NULL (Rust 中的 None)，则保持数据库里原有的值！
        let rows_affected = sqlx::query!(
            r#"
            UPDATE events
            SET 
                title = COALESCE(?2, title),
                description = COALESCE(?3, description),
                target_date = COALESCE(?4, target_date),
                importance = COALESCE(?5, importance),
                category = COALESCE(?6, category),
                meta = COALESCE(?7, meta)
            WHERE id = ?1
            "#,
            payload.id,
            payload.title,
            payload.description,
            payload.target_date,
            payload.importance,
            payload.category,
            payload.meta
        )
        .execute(pool)
        .await?
        .rows_affected();

        Ok(rows_affected)
    }

    /// 5. 删除日程 (Delete)
    pub async fn delete(pool: &SqlitePool, id: i64) -> AppResult<u64> {
        let rows_affected = sqlx::query!(r#"DELETE FROM events WHERE id = ?1"#, id)
            .execute(pool)
            .await?
            .rows_affected();

        Ok(rows_affected)
    }
}

impl EventRepository {
    /// 高级多条件组合查询
    pub async fn search(pool: &SqlitePool, dto: SearchEventDto) -> AppResult<Vec<Event>> {
        // 1. 构建动态 SQL
        let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
            "SELECT id, user_id, title, description, target_date, importance, category, meta FROM events WHERE 1=1"
        );

        // 如果有起始时间
        if let Some(start) = dto.start_date {
            builder.push(" AND target_date >= ");
            builder.push_bind(start);
        }

        // 如果有结束时间
        if let Some(end) = dto.end_date {
            builder.push(" AND target_date <= ");
            builder.push_bind(end);
        }

        // 如果有关键词，同时模糊匹配标题和简介
        if let Some(kw) = dto.keyword {
            let like_term = format!("%{}%", kw);
            builder.push(" AND (title LIKE ");
            builder.push_bind(like_term.clone());
            builder.push(" OR description LIKE ");
            builder.push_bind(like_term);
            builder.push(")");
        }

        builder.push(" ORDER BY target_date ASC");

        // 2. 执行数据库查询
        let query = builder.build_query_as::<Event>();
        let mut events = query.fetch_all(pool).await?;

        // 3. 如果传了正则模式，在 Rust 内存中进行正则过滤
        if let Some(pattern) = dto.regex_pattern {
            // 解析正则表达式，如果格式错误则返回业务错误
            let re = Regex::new(&pattern)
                .map_err(|e| AppError::Business(format!("正则表达式语法错误: {}", e)))?;

            // 保留标题或描述匹配正则的日程 (用 retain 实现原地过滤，性能极高)
            events.retain(|e| re.is_match(&e.title) || re.is_match(&e.description));
        }

        Ok(events)
    }
}

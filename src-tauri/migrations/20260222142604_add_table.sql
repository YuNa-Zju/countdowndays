-- Add migration script here

-- 1. 日程主表
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,               -- 🌟 修正：匹配 Rust 的 Option<i64>
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_date DATETIME NOT NULL,
    importance INTEGER NOT NULL,   -- 🌟 修正：匹配 Rust 的 i64
    meta TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'task'
);

-- 2. 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 3. 日程与分类的多对多关联表 (增加了外键约束)
CREATE TABLE IF NOT EXISTS event_categories (
    event_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (event_id, category_id),
    -- 🌟 商业级最佳实践：外键约束级联删除
    -- 这样即使 Rust 层面的删除逻辑漏了，数据库底层也会自动把关联表清空，绝对不会产生脏数据！
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);
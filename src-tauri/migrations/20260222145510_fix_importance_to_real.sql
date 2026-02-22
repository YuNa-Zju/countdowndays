-- Add migration script here
-- 开启外键约束支持
PRAGMA foreign_keys = ON;

-- 1. 日程主表
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_date DATETIME NOT NULL,
    importance INTEGER NOT NULL,      -- 🌟 浮点数，完美对应 f64 和前端的 Number
    meta TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'task'
);

-- 2. 分类标签表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 3. 多对多关联表
CREATE TABLE IF NOT EXISTS event_categories (
    event_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (event_id, category_id),

    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

-- 4. 插入默认分类
INSERT OR IGNORE INTO categories (name) VALUES ('工作'), ('生活'), ('重要');

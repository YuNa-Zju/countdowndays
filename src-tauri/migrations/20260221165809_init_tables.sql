-- Add migration script here

-- 1. 日程主表
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_date DATETIME NOT NULL,
    importance REAL NOT NULL,
    meta TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'task'
);

-- 2. 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 3. 日程与分类的多对多关联表
CREATE TABLE IF NOT EXISTS event_categories (
    event_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (event_id, category_id)
);


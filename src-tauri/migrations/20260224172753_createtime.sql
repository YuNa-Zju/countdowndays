-- Add migration script here
-- 给已有的 events 表追加 created_at 字段
-- DEFAULT CURRENT_TIMESTAMP 能够让 SQLite 自动为以前没有该字段的旧数据填充当前时间
-- 1. 先用一个固定的常量时间“骗过” SQLite 的语法限制，把列强行加进去
ALTER TABLE events ADD COLUMN created_at DATETIME DEFAULT '2026-01-01 00:00:00Z' NOT NULL;

-- 2. 列加上之后，立刻执行全量覆盖，把所有旧数据的创建时间刷新成此时此刻的真实时间
UPDATE events SET created_at = CURRENT_TIMESTAMP;
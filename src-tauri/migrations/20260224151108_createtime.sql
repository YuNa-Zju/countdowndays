-- Add migration script here
-- 1. 为 events 表添加 created_at 字段
-- 默认值设为当前时间，这样旧数据的创建时间会默认为迁移运行的时间
-- 使用固定的常量字符串作为旧数据的默认创建时间
ALTER TABLE events ADD COLUMN created_at DATETIME NOT NULL DEFAULT '2026-02-24T00:00:00Z';
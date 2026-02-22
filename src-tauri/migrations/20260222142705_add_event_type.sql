-- Add migration script here
-- 在现有的 events 表中追加 event_type 字段，默认值为 'task'
ALTER TABLE events ADD COLUMN event_type TEXT NOT NULL DEFAULT 'task';
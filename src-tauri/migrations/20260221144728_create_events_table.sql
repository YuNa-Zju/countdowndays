-- Add migration script here
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    -- 虽然 SQLite 底层没有 DATETIME，但这么写配合 sqlx 和 chrono 是最完美的
    target_date DATETIME NOT NULL, 
    importance REAL NOT NULL,
    category TEXT NOT NULL,
    meta TEXT NOT NULL
);


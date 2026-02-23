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
    importance INTEGER NOT NULL,
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

-- ============================================================================
-- 🌟 初始化新手引导数据 (Onboarding Data)
-- ============================================================================

-- 插入默认分类标签
INSERT INTO categories (id, name) VALUES (1, '💡 新手指南');

-- 插入教程任务 (倒数日)
INSERT INTO events (id, user_id, title, description, target_date, importance, meta, event_type)
VALUES (
    1,
    NULL,
    '欢迎使用 Momentary！🎉',
    '这是一个【任务/倒数日】卡片，用来记录未来的重要规划。

💡 核心功能指南：
1. 【后台运行】：哪怕你点击右上角关闭了主窗口，我也会安静地待在右下角的【系统托盘】里陪你哦！
2. 【悬浮窗】：桌面上的悬浮小组件非常方便，左键点击它能快速添加新瞬间，右键点击则可以关闭它。
3. 【标签管理】：试着在编辑界面选中这个「💡 新手指南」标签，你会发现它旁边出现了一个小叉叉（×），点击就可以将标签永久删除啦！',
    '2026-12-31T23:59:59.000Z',
    10,
    '{}',
    'task'
);

-- 插入教程纪念日 (正数日)
INSERT INTO events (id, user_id, title, description, target_date, importance, meta, event_type)
VALUES (
    2,
    NULL,
    '我们相遇的瞬间 ✨',
    '这是一个【纪念日】卡片。

它和倒数日不同，有着双重魔法：
1. 【正数陪伴】：它会帮你默默记录这个日子已经过去了多少个日日夜夜（比如相恋、宝宝出生）。
2. 【倒数期盼】：它还会自动帮你倒数【下一次周年】的到来！

快去点击右下角小按钮或使用 Cmd/Ctrl+K，把你的第一个重要瞬间定格下来吧~',
    '2026-01-01T00:00:00.000Z',
    8,
    '{}',
    'anniversary'
);

-- 将这两个事件与“新手指南”标签建立关联
INSERT INTO event_categories (event_id, category_id) VALUES (1, 1);
INSERT INTO event_categories (event_id, category_id) VALUES (2, 1);

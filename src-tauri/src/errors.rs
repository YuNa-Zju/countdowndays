use serde::{Serialize, Serializer};
use thiserror::Error;

/// 全局应用错误枚举
#[derive(Error, Debug)]
pub enum AppError {
    // 使用 #[from] 宏，Rust 会自动帮我们把 sqlx::Error 转换成 AppError::Database
    #[error("数据库操作失败: {0}")]
    Database(#[from] sqlx::Error),

    // 自动转换标准库的 IO 错误
    #[error("系统 IO 错误: {0}")]
    Io(#[from] std::io::Error),

    // 预留给未来的业务逻辑报错，比如“日程不存在”、“参数校验失败”
    #[error("业务逻辑异常: {0}")]
    Business(String),
}

/// 为了让 Tauri 的 #[tauri::command] 能把错误抛给 React 前端，
/// 我们必须手动为 AppError 实现 Serialize。
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // 将错误枚举直接格式化为字符串，前端 catch 到的 error 就是这个字符串
        serializer.serialize_str(self.to_string().as_ref())
    }
}

/// 定义一个便捷的全局 Result 别名，少敲很多键盘！
pub type AppResult<T> = Result<T, AppError>;

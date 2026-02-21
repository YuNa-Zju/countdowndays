// 核心日程实体 (完全映射 Rust 返回的 Event)
export interface AppEvent {
  id: number;
  user_id: string | null;
  title: string;
  description: string;
  target_date: string; // 后端 chrono 传过来的 ISO 字符串
  importance: number;
  category: string;
  meta: string;
}

// 创建时的 DTO
export interface CreateEventDto {
  title: string;
  description: string;
  target_date: string;
  importance: number;
  category: string;
  meta: string;
}

// 更新时的 DTO (利用 TypeScript 的 Partial 实现属性可选)
export interface UpdateEventDto extends Partial<CreateEventDto> {
  id: number; // 只有 ID 是必填的
}

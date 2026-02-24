export interface Category {
  id: number;
  name: string;
}

export interface AppEvent {
  id: number;
  user_id: string | null;
  title: string;
  description: string;
  target_date: string;
  importance: number;
  created_at: string;
  meta: string;
  categories: Category[];
  event_type: "task" | "anniversary"; // 🌟 新增类型区分
}

export interface CreateEventDto {
  title: string;
  description: string;
  target_date: string;
  importance: number;
  meta: string;
  category_ids: number[];
  event_type: "task" | "anniversary"; // 🌟 新增
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  id: number;
}

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  isCompleted: boolean;
}

export interface CreateTodo {
  title: string;
  description?: string | null;
}

export interface EditTodo {
  title: string;
  description?: string | null;
}

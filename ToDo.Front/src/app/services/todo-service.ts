import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTodo, EditTodo, Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly baseUrl = '/api/todos';

  constructor(private http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.baseUrl);
  }

  getTodoById(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`);
  }

  createTodo(todo: CreateTodo): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, todo);
  }

  updateTodo(id: string, todo: EditTodo): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, todo);
  }

  toggleTodo(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggle`, {});
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TodoCreate } from '../todo-create/todo-create';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo-service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TodoCreate],
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.css'],
})
export class TodoList implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  todos: Todo[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private readonly todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todos = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Nie udało się pobrać listy zadań.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onTodoCreated(todo: Todo): void {
    this.todos = [...this.todos, todo];
    if (this.error) {
      this.error = null;
    }
    this.cdr.markForCheck();
  }

  onDelete(id: string): void {
    const confirmed = confirm('Na pewno chcesz usunąć to zadanie?');
    if (!confirmed) {
      return;
    }
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter((t) => t.id !== id);
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Nie udało się usunąć zadania.';
        this.cdr.markForCheck();
      },
    });
  }
}

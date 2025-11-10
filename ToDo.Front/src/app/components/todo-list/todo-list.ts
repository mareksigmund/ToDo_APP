import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TodoCreate } from '../todo-create/todo-create';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo-service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDragDrop, DragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TodoCreate,
    DragDropModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.css'],
})
export class TodoList implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  todos: Todo[] = [];
  isLoading = false;
  error: string | null = null;
  isShowingCreateTodo = false;

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
    this.isShowingCreateTodo = false;
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

  onToggleStatus(todo: Todo): void {
    this.todoService.toggleTodo(todo.id).subscribe({
      next: () => {
        this.todos = this.todos.map((t) =>
          t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t
        );
        this.todos = [...this.todos].sort((a, b) => {
          return Number(a.isCompleted) - Number(b.isCompleted);
        });
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Nie udało się zmienić statusu zadania.';
        this.cdr.markForCheck();
      },
    });
  }

  onDrop(event: CdkDragDrop<Todo[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const updated = [...this.todos];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);
    this.todos = updated;

    this.cdr.markForCheck();
  }
}

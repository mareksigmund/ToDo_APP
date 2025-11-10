import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo-service';
import { CreateTodo, Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-create',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './todo-create.html',
  styleUrls: ['./todo-create.css'],
})
export class TodoCreate {
  formData: CreateTodo = {
    title: '',
    description: '',
  };

  error: string | null = null;

  @Output() created = new EventEmitter<Todo>();

  constructor(private readonly todoService: TodoService) {}

  isSubmitting = false;

  onSubmit(): void {
    this.error = null;

    const titleTrimmed = this.formData.title.trim();
    if (!titleTrimmed) {
      this.error = 'Tytuł jest wymagany.';
      return;
    }

    const payload: CreateTodo = {
      title: titleTrimmed,
      description: this.formData.description?.trim() || null,
    };

    this.isSubmitting = true;

    this.todoService.createTodo(payload).subscribe({
      next: (createdTodo) => {
        this.formData = { title: '', description: '' };
        this.created.emit(createdTodo);
        this.isSubmitting = false;
      },
      error: () => {
        this.error = 'Nie udało się utworzyć zadania.';
        this.isSubmitting = false;
      },
    });
  }
}

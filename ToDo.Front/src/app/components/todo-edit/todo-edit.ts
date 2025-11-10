import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TodoService } from '../../services/todo-service';
import { EditTodo, Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './todo-edit.html',
  styleUrls: ['./todo-edit.css'],
})
export class TodoEdit implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  todoId = '';
  formData: EditTodo = { title: '', description: '' };

  isLoading = false;
  isSaving = false;
  error: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly todoService: TodoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.error = 'Brak identyfikatora zadania.';
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }

      this.todoId = id;
      this.loadTodo();
    });
  }

  private loadTodo(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.todoService.getTodoById(this.todoId).subscribe({
      next: (todo: Todo) => {
        this.formData = {
          title: todo.title,
          description: todo.description ?? '',
        };
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Nie udało się pobrać danych zadania.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (!this.todoId) return;

    const titleTrimmed = this.formData.title.trim();
    if (!titleTrimmed) {
      this.error = 'Tytuł jest wymagany.';
      this.cdr.markForCheck();
      return;
    }

    const payload: EditTodo = {
      title: titleTrimmed,
      description: this.formData.description?.trim() || null,
    };

    this.isSaving = true;
    this.error = null;
    this.cdr.markForCheck();

    this.todoService.updateTodo(this.todoId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.error = 'Nie udało się zaktualizować zadania.';
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  onCancel(): void {
    this.router.navigateByUrl('/');
  }
}

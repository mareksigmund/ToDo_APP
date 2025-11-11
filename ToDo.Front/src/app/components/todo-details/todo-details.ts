import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TodoService } from '../../services/todo-service';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './todo-details.html',
  styleUrls: ['./todo-details.css'],
})
export class TodoDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly todoService = inject(TodoService);
  private readonly cdr = inject(ChangeDetectorRef);

  todo: Todo | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    // reagujemy na zmianę parametru id
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.error = 'Brak identyfikatora zadania.';
        this.isLoading = false;
        this.todo = null;
        this.cdr.markForCheck();
        return;
      }

      this.loadTodo(id);
    });
  }

  private loadTodo(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.todo = null;
    this.cdr.markForCheck();

    this.todoService.getTodoById(id).subscribe({
      next: (data) => {
        this.todo = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Nie udało się pobrać danych zadania.';
        this.isLoading = false;
        this.todo = null;
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/');
  }

  goEdit(): void {
    if (!this.todo) return;
    this.router.navigate(['/todos', this.todo.id, 'edit']);
  }
}

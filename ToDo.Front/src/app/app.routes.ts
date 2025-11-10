import { Routes } from '@angular/router';
import { TodoList } from './components/todo-list/todo-list';
import { TodoEdit } from './components/todo-edit/todo-edit';

export const routes: Routes = [
  { path: '', component: TodoList },
  { path: 'todos/:id/edit', component: TodoEdit },
  { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';
import { TodoList } from './components/todo-list/todo-list';
import { TodoEdit } from './components/todo-edit/todo-edit';
import { TodoDetails } from './components/todo-details/todo-details';

export const routes: Routes = [
  { path: '', component: TodoList },
  { path: 'todos/:id/details', component: TodoDetails },
  { path: 'todos/:id/edit', component: TodoEdit },
  { path: '**', redirectTo: '' },
];

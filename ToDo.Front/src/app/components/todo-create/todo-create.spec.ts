import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoCreate } from './todo-create';
import { TodoService } from '../../services/todo-service';
import { CreateTodo, Todo } from '../../models/todo.model';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('TodoCreate', () => {
  let fixture: ComponentFixture<TodoCreate>;
  let component: TodoCreate;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;

  beforeEach(async () => {
    todoServiceSpy = jasmine.createSpyObj('TodoService', ['createTodo']);

    await TestBed.configureTestingModule({
      imports: [TodoCreate], // standalone komponent
      providers: [
        { provide: TodoService, useValue: todoServiceSpy },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call service and set error when title is empty', () => {
    component.formData = { title: '   ', description: 'Opis' };

    component.onSubmit();

    expect(todoServiceSpy.createTodo).not.toHaveBeenCalled();
    expect(component.error).toBe('Tytuł jest wymagany.');
    expect(component.isSubmitting).toBeFalse();
  });

  it('should call service with trimmed values and emit created on success', () => {
    const payload: CreateTodo = {
      title: '  Nowe zadanie  ',
      description: '  Opis zadania  ',
    };

    const createdTodo: Todo = {
      id: '1',
      title: 'Nowe zadanie',
      description: 'Opis zadania',
      isCompleted: false,
      createdAt: '2025-01-01T10:00:00.000Z',
    };

    component.formData = { ...payload };

    todoServiceSpy.createTodo.and.returnValue(of(createdTodo));
    const emitSpy = spyOn(component.created, 'emit');

    component.onSubmit();

    expect(todoServiceSpy.createTodo).toHaveBeenCalledWith({
      title: 'Nowe zadanie',
      description: 'Opis zadania',
    });

    expect(emitSpy).toHaveBeenCalledWith(createdTodo);
    expect(component.formData).toEqual({ title: '', description: '' });
    expect(component.error).toBeNull();
    expect(component.isSubmitting).toBeFalse();
  });

  it('should allow null description when empty or whitespace', () => {
    component.formData = {
      title: 'Zadanie',
      description: '   ',
    };

    const createdTodo: Todo = {
      id: '2',
      title: 'Zadanie',
      description: null,
      isCompleted: false,
      createdAt: '2025-01-01T10:00:00.000Z',
    };

    todoServiceSpy.createTodo.and.returnValue(of(createdTodo));
    const emitSpy = spyOn(component.created, 'emit');

    component.onSubmit();

    expect(todoServiceSpy.createTodo).toHaveBeenCalledWith({
      title: 'Zadanie',
      description: null,
    });
    expect(emitSpy).toHaveBeenCalledWith(createdTodo);
  });

  it('should set error when service returns error', () => {
    component.formData = { title: 'Zadanie', description: 'Opis' };

    todoServiceSpy.createTodo.and.returnValue(throwError(() => new Error('fail')));

    component.onSubmit();

    expect(component.error).toBe('Nie udało się utworzyć zadania.');
    expect(component.isSubmitting).toBeFalse();
  });
});

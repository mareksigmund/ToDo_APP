import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoList } from './todo-list';
import { TodoService } from '../../services/todo-service';
import { Todo } from '../../models/todo.model';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { provideZonelessChangeDetection } from '@angular/core';

describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let component: TodoList;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;
  let router: Router;

  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Old incomplete',
      description: '',
      isCompleted: false,
      createdAt: '2025-01-01T10:00:00.000Z',
    },
    {
      id: '2',
      title: 'New incomplete',
      description: '',
      isCompleted: false,
      createdAt: '2025-01-02T10:00:00.000Z',
    },
    {
      id: '3',
      title: 'Completed',
      description: '',
      isCompleted: true,
      createdAt: '2025-01-03T10:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    todoServiceSpy = jasmine.createSpyObj('TodoService', ['getTodos', 'toggleTodo', 'deleteTodo']);

    await TestBed.configureTestingModule({
      imports: [TodoList],
      providers: [
        { provide: TodoService, useValue: todoServiceSpy },
        provideRouter([]),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  function createComponentWithTodos(todos: Todo[] = mockTodos) {
    todoServiceSpy.getTodos.and.returnValue(of(todos));

    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponentWithTodos();
    expect(component).toBeTruthy();
  });

  it('should load and sort todos on init', () => {
    const unsorted: Todo[] = [
      mockTodos[0], // old incomplete
      mockTodos[2], // completed
      mockTodos[1], // new incomplete
    ];

    createComponentWithTodos(unsorted);

    expect(todoServiceSpy.getTodos).toHaveBeenCalled();
    expect(component.todos.map((t) => t.id)).toEqual(['2', '1', '3']);
  });

  it('should set error message when loadTodos fails', () => {
    todoServiceSpy.getTodos.and.returnValue(throwError(() => new Error('Network error')));

    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe('Nie udało się pobrać listy zadań.');
    expect(component.todos.length).toBe(0);
  });

  it('should handle onTodoCreated correctly', () => {
    createComponentWithTodos([mockTodos[0]]);

    const newTodo: Todo = {
      id: '99',
      title: 'New one',
      description: '',
      isCompleted: false,
      createdAt: '2025-02-01T10:00:00.000Z',
    };

    component.onTodoCreated(newTodo);

    expect(component.todos.some((t) => t.id === '99')).toBeTrue();
    expect(component.isShowingCreateTodo).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should toggle todo status on success', () => {
    const todo: Todo = {
      id: '1',
      title: 'Test',
      description: '',
      isCompleted: false,
      createdAt: '2025-01-01T10:00:00.000Z',
    };

    createComponentWithTodos([todo]);
    todoServiceSpy.toggleTodo.and.returnValue(of(void 0));

    component.onToggleStatus(todo);

    const updated = component.todos.find((t) => t.id === todo.id);
    expect(todoServiceSpy.toggleTodo).toHaveBeenCalledWith(todo.id);
    expect(updated?.isCompleted).toBeTrue();
  });

  it('should set error when toggle status fails', () => {
    const todo = mockTodos[0];
    createComponentWithTodos([todo]);

    todoServiceSpy.toggleTodo.and.returnValue(throwError(() => new Error('fail')));

    component.onToggleStatus(todo);

    expect(component.error).toBe('Nie udało się zmienić statusu zadania.');
  });

  it('should not delete todo when confirm is cancelled', () => {
    const todo = mockTodos[0];
    createComponentWithTodos([todo]);

    spyOn(window, 'confirm').and.returnValue(false);

    component.onDelete(todo.id);

    expect(todoServiceSpy.deleteTodo).not.toHaveBeenCalled();
    expect(component.todos.length).toBe(1);
  });

  it('should delete todo when confirm is accepted', () => {
    const todo = mockTodos[0];
    createComponentWithTodos([todo]);

    spyOn(window, 'confirm').and.returnValue(true);
    todoServiceSpy.deleteTodo.and.returnValue(of(void 0));

    component.onDelete(todo.id);

    expect(todoServiceSpy.deleteTodo).toHaveBeenCalledWith(todo.id);
    expect(component.todos.length).toBe(0);
  });

  it('should change order on drop', () => {
    createComponentWithTodos(mockTodos);

    const initialOrder = component.todos.map((t) => t.id);

    const event: CdkDragDrop<Todo[]> = {
      previousIndex: 0,
      currentIndex: 2,
      item: {} as any,
      container: {} as any,
      previousContainer: {} as any,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 },
      dropPoint: { x: 0, y: 0 },
      event: {} as any,
    };

    component.onDrop(event);

    const newOrder = component.todos.map((t) => t.id);

    expect(newOrder).toEqual([initialOrder[1], initialOrder[2], initialOrder[0]]);
  });

  it('should navigate to details', () => {
    createComponentWithTodos();

    const navigateSpy = spyOn(router, 'navigate');

    component.goToDetails('123');

    expect(navigateSpy).toHaveBeenCalledWith(['/todos', '123', 'details']);
  });
});

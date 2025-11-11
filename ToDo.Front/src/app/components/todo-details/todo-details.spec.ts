import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';

import { TodoDetails } from './todo-details';
import { TodoService } from '../../services/todo-service';
import { Todo } from '../../models/todo.model';

describe('TodoDetails', () => {
  let fixture: ComponentFixture<TodoDetails>;
  let component: TodoDetails;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<ParamMap>;

  const mockTodo: Todo = {
    id: '123',
    title: 'Test todo',
    description: 'Opis testowy',
    isCompleted: false,
    createdAt: '2025-01-01T10:00:00.000Z',
  };

  beforeEach(async () => {
    todoServiceSpy = jasmine.createSpyObj('TodoService', ['getTodoById']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    const activatedRouteStub = {
      paramMap: paramMapSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [TodoDetails],
      providers: [
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(TodoDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should set error when id param is missing', () => {
    // Brak id w paramMap (ustawione w beforeEach)
    createComponent();

    expect(component.todo).toBeNull();
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe('Brak identyfikatora zadania.');
  });

  it('should load todo when id is provided', () => {
    todoServiceSpy.getTodoById.and.returnValue(of(mockTodo));

    // Emitujemy id zanim odpalimy ngOnInit/detectChanges
    paramMapSubject.next(convertToParamMap({ id: mockTodo.id }));

    createComponent();

    expect(todoServiceSpy.getTodoById).toHaveBeenCalledWith('123');
    expect(component.error).toBeNull();
    expect(component.isLoading).toBeFalse();
    expect(component.todo).toEqual(mockTodo);
  });

  it('should set error when loading todo fails', () => {
    todoServiceSpy.getTodoById.and.returnValue(throwError(() => new Error('fail')));

    paramMapSubject.next(convertToParamMap({ id: '999' }));

    createComponent();

    expect(todoServiceSpy.getTodoById).toHaveBeenCalledWith('999');
    expect(component.todo).toBeNull();
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe('Nie udało się pobrać danych zadania.');
  });

  it('should navigate back on goBack', () => {
    createComponent();

    component.goBack();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should navigate to edit when todo is present', () => {
    // Ustawiamy poprawne id i poprawną odpowiedź serwisu
    todoServiceSpy.getTodoById.and.returnValue(of(mockTodo));
    paramMapSubject.next(convertToParamMap({ id: mockTodo.id }));

    createComponent();

    component.goEdit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/todos', mockTodo.id, 'edit']);
  });

  it('should not navigate to edit when todo is null', () => {
    createComponent();

    component.todo = null;
    component.goEdit();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});

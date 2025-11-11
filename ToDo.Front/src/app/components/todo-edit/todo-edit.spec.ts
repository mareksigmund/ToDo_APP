import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';

import { TodoEdit } from './todo-edit';
import { TodoService } from '../../services/todo-service';
import { EditTodo, Todo } from '../../models/todo.model';

describe('TodoEdit', () => {
  let fixture: ComponentFixture<TodoEdit>;
  let component: TodoEdit;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<ParamMap>;

  const mockTodo: Todo = {
    id: '123',
    title: 'Stare zadanie',
    description: 'Opis zadania',
    isCompleted: false,
    createdAt: '2025-01-01T10:00:00.000Z',
  };

  beforeEach(async () => {
    todoServiceSpy = jasmine.createSpyObj('TodoService', ['getTodoById', 'updateTodo']);

    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    const activatedRouteStub = {
      paramMap: paramMapSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [TodoEdit],
      providers: [
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(TodoEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should set error when id param is missing', () => {
    // brak id w paramMap (domyślne)
    createComponent();

    expect(component.todoId).toBe('');
    expect(component.error).toBe('Brak identyfikatora zadania.');
    expect(component.isLoading).toBeFalse();
  });

  it('should load todo when id is provided', () => {
    todoServiceSpy.getTodoById.and.returnValue(of(mockTodo));

    paramMapSubject.next(convertToParamMap({ id: mockTodo.id }));

    createComponent();

    expect(todoServiceSpy.getTodoById).toHaveBeenCalledWith('123');
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
    expect(component.todoId).toBe('123');
    expect(component.formData).toEqual({
      title: mockTodo.title,
      description: mockTodo.description ?? '',
    });
  });

  it('should set error when loading todo fails', () => {
    todoServiceSpy.getTodoById.and.returnValue(throwError(() => new Error('fail')));

    paramMapSubject.next(convertToParamMap({ id: '999' }));

    createComponent();

    expect(todoServiceSpy.getTodoById).toHaveBeenCalledWith('999');
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe('Nie udało się pobrać danych zadania.');
  });

  it('should not submit when todoId is missing', () => {
    createComponent();

    component.todoId = '';
    component.formData = { title: 'Nowy', description: 'X' };

    component.onSubmit();

    expect(todoServiceSpy.updateTodo).not.toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should set error when title is empty', () => {
    todoServiceSpy.getTodoById.and.returnValue(of(mockTodo));
    paramMapSubject.next(convertToParamMap({ id: mockTodo.id }));
    createComponent();

    component.formData.title = '   ';

    component.onSubmit();

    expect(todoServiceSpy.updateTodo).not.toHaveBeenCalled();
    expect(component.error).toBe('Tytuł jest wymagany.');
  });

  it('should call updateTodo with trimmed values and navigate on success', () => {
    todoServiceSpy.getTodoById.and.returnValue(of(mockTodo));
    paramMapSubject.next(convertToParamMap({ id: mockTodo.id }));
    createComponent();

    component.formData = {
      title: '  Zaktualizowany tytuł  ',
      description: '  Nowy opis  ',
    };

    todoServiceSpy.updateTodo.and.returnValue(of(void 0));

    component.onSubmit();

    const expectedPayload: EditTodo = {
      title: 'Zaktualizowany tytuł',
      description: 'Nowy opis',
    };

    expect(todoServiceSpy.updateTodo).toHaveBeenCalledWith('123', expectedPayload);
    expect(component.isSaving).toBeFalse();
    expect(component.error).toBeNull();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should allow null description when empty or whitespace', () => {
    todoServiceSpy.getTodoById.and.returnValue(of(mockTodo));
    paramMapSubject.next(convertToParamMap({ id: mockTodo.id }));
    createComponent();

    component.formData = {
      title: 'Tytuł',
      description: '   ',
    };

    todoServiceSpy.updateTodo.and.returnValue(of(void 0));

    component.onSubmit();

    expect(todoServiceSpy.updateTodo).toHaveBeenCalledWith('123', {
      title: 'Tytuł',
      description: null,
    });
  });

  it('should set error when updateTodo fails', () => {
    todoServiceSpy.getTodoById.and.returnValue(of(mockTodo));
    paramMapSubject.next(convertToParamMap({ id: mockTodo.id }));
    createComponent();

    component.formData = {
      title: 'Nowy tytuł',
      description: 'Opis',
    };

    todoServiceSpy.updateTodo.and.returnValue(throwError(() => new Error('fail')));

    component.onSubmit();

    expect(component.error).toBe('Nie udało się zaktualizować zadania.');
    expect(component.isSaving).toBeFalse();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should navigate back on cancel', () => {
    createComponent();

    component.onCancel();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });
});

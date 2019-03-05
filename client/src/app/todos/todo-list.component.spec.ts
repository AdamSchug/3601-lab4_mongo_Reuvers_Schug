import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Observable} from 'rxjs/Observable';
import {FormsModule} from '@angular/forms';
import {CustomModule} from '../custom.module';
import {MATERIAL_COMPATIBILITY_MODE} from '@angular/material';
import {MatDialog} from '@angular/material';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import {TodoListComponent} from "./todo-list.component";
import {Todointerface} from "./todointerface";
import {TodoListService} from "./todo-list.service";

describe('Todo list', () => {

  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoListServiceStub: {
    getTodos: () => Observable<Todointerface[]>
  };

  beforeEach(() => {
    todoListServiceStub = {
      getTodos: () => Observable.of([
        {
          _id: 'steve_id',
          owner: 'Steve',
          status: true,
          body: 'Do the thing with the thing',
          category: 'one'
        },
        {
          _id: 'bilbo_id',
          owner: 'Bilbo',
          status: false,
          body: 'Do the thing with the other thing over there',
          category: 'two'
        },
        {
          _id: 'patricia_id',
          owner: 'Patricia',
          status: true,
          body: 'Do the one thing with that other thing right here',
          category: 'three'
        }
      ])
    };

    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [TodoListComponent],
      providers: [{provide: TodoListService, useValue: todoListServiceStub},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the todos', () => {
    expect(todoList.todos.length).toBe(3);
  });

  it('contains a todo owned by \'Steve\'', () => {
    expect(todoList.todos.some((todo: Todointerface) => todo.owner === 'Steve')).toBe(true);
  });

  it('contain a todo owned by \'Patricia\'', () => {
    expect(todoList.todos.some((todo: Todointerface) => todo.owner === 'Patricia')).toBe(true);
  });

  it('doesn\'t contain a todo owned by \'Santa\'', () => {
    expect(todoList.todos.some((todo: Todointerface) => todo.owner === 'Santa')).toBe(false);
  });

  it('has two todos with status true', () => {
    expect(todoList.todos.filter((todo: Todointerface) => todo.status === true).length).toBe(2);
  });

  it('todo list filters by owner', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoOwner = 'i';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(2);
    });
  });

  it('todo list filters by status true', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoStatus = 'true';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(2);
    });
  });

  it('todo list filters by status false', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoStatus = 'false';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(1);
    });
  });

  it('todo list filters by body', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoBody = 'other';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(2);
    });
  });

  it('todo list filters by category', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoCategory = 't';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(2);
    });
  });

  it('todo list filters by owner and status', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoOwner = 'i';
    todoList.todoStatus = 'true';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(1);
    });
  });

  it('todo list filters by owner, status and body', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoOwner = 'i';
    todoList.todoStatus = 'true';
    todoList.todoBody = 'other';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(1);
    });
  });

  it('todo list filters by owner, status, body, and category', () => {
    expect(todoList.filteredTodos.length).toBe(3);
    todoList.todoOwner = 'i';
    todoList.todoStatus = 'true';
    todoList.todoBody = 'other';
    todoList.todoCategory = 't';
    todoList.refreshTodos().subscribe(() => {
      expect(todoList.filteredTodos.length).toBe(1);
    });
  });

});

describe('Misbehaving Todo List', () => {
  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoListServiceStub: {
    getTodos: () => Observable<Todointerface[]>
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoListServiceStub = {
      getTodos: () => Observable.create(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, CustomModule],
      declarations: [TodoListComponent],
      providers: [{provide: TodoListService, useValue: todoListServiceStub},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a TodoListService', () => {
    expect(todoList.todos).toBeUndefined();
  });
});


describe('Adding a todo', () => {
  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  const newTodo: Todointerface = {
    _id: '',
    owner: 'Terry',
    status: false,
    body: 'Terry\'s TODO body',
    category: 'four'
  };
  const newId = 'Terry_id';

  let calledTodo: Todointerface;

  let todoListServiceStub: {
    getTodos: () => Observable<Todointerface[]>,
    addNewTodo: (newTodo: Todointerface) => Observable<{ '$oid': string }>
  };
  let mockMatDialog: {
    open: (AddTodoComponent, any) => {
      afterClosed: () => Observable<Todointerface>
    };
  };

  beforeEach(() => {
    calledTodo = null;
    todoListServiceStub = {
      getTodos: () => Observable.of([]),
      addNewTodo: (newTodo: Todointerface) => {
        calledTodo = newTodo;
        return Observable.of({
          '$oid': newId
        });
      }
    };
    mockMatDialog = {
      open: () => {
        return {
          afterClosed: () => {
            return Observable.of(newTodo);
          }
        };
      }
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, CustomModule],
      declarations: [TodoListComponent],
      providers: [
        {provide: TodoListService, useValue: todoListServiceStub},
        {provide: MatDialog, useValue: mockMatDialog},
        {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true}]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('calls TodoListService.addTodo', () => {
    expect(calledTodo).toBeNull();
    todoList.openDialog();
    expect(calledTodo).toEqual(newTodo);
  });
});

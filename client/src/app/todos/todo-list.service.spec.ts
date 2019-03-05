import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {Todointerface} from "./todointerface";
import {TodoListService} from "./todo-list.service";

describe('User list service: ', () => {
  // A small collection of test users
  const testTodos: Todointerface[] = [
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
  ];
  const rTodos: Todointerface[] = testTodos.filter(todo =>
    todo.category.toLowerCase().indexOf('r') !== -1
  );

  let todoListService: TodoListService;
  let currentlyImpossibleToGenerateSearchTodoUrl: string;

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    todoListService = new TodoListService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getTodos() calls api/todos', () => {

    todoListService.getTodos().subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    const req = httpTestingController.expectOne(todoListService.baseUrl);

    expect(req.request.method).toEqual('GET');

    req.flush(testTodos);
  });

  it('getTodos(todoBody) adds appropriate param string to called URL', () => {
    todoListService.getTodos('r').subscribe(
      todos => expect(todos).toEqual(rTodos)
    );

    const req = httpTestingController.expectOne(todoListService.baseUrl + '?body=r&');
    expect(req.request.method).toEqual('GET');
    req.flush(rTodos);
  });

  it('filterByBody(todoBody) deals appropriately with a URL that already had a body', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?body=f&something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByBody('r');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&body=r&');
  });

  it('filterByBody(todoBody) deals appropriately with a URL that already had some filtering, but no body', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByBody('r');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&body=r&');
  });

  it('filterByBody(todoBody) deals appropriately with a URL has the keyword body, but nothing after the =', () => {
    currentlyImpossibleToGenerateSearchTodoUrl = todoListService.baseUrl + '?body=&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchTodoUrl;
    todoListService.filterByBody('');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '');
  });

  it('getTodoById() calls api/todos/id', () => {
    const targetTodo: Todointerface = testTodos[1];
    const targetId: string = targetTodo._id;
    todoListService.getTodoById(targetId).subscribe(
      todo => expect(todo).toBe(targetTodo)
    );

    const expectedUrl: string = todoListService.baseUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetTodo);
  });

  it('adding a todo calls api/todos/new', () => {
    const terry_id = 'terry_id';
    const newTodo: Todointerface = {
      _id: '',
      owner: 'Terry',
      status: false,
      body: 'Terry\'s todo body',
      category: 'four'
    };

    todoListService.addNewTodo(newTodo).subscribe(
      id => {
        expect(id).toBe(terry_id);
      }
    );

    const expectedUrl: string = todoListService.baseUrl + '/new';
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('POST');
    req.flush(terry_id);
  });
});

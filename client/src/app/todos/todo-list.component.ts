import {Component, OnInit} from '@angular/core';
import {TodoListService} from './todo-list.service';
import {Todointerface} from './todointerface';
import {Observable} from 'rxjs/Observable';
import {MatDialog} from '@angular/material';
import {AddTodoComponent} from "./add-todo.component";

@Component({
  selector: 'todo-list-component',
  templateUrl: 'todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})

export class TodoListComponent implements OnInit {
  public todos: Todointerface[];
  public filteredTodos: Todointerface[];

  public todoOwner: string;
  public todoStatus: string;
  public todoBody: string;
  public todoCategory: string;

  private highlightedID: string = '';

  constructor(public todoListService: TodoListService, public dialog: MatDialog) {

  }

  isHighlighted(todo: Todointerface): boolean {
    return todo._id['$oid'] === this.highlightedID;
  }

  openDialog(): void {
    const newTodo: Todointerface = {_id: '', owner: '', status: null, body: '', category: ''};
    const dialogRef = this.dialog.open(AddTodoComponent, {
      width: '500px',
      data: {todo: newTodo}
    });

    dialogRef.afterClosed().subscribe(newTodo => {
      if (newTodo != null) {
        this.todoListService.addNewTodo(newTodo).subscribe(
          result => {
            this.highlightedID = result;
            this.refreshTodos();
          },
          err => {
            // This should probably be turned into some sort of meaningful response.
            console.log('There was an error adding the todo.');
            console.log('The newTodo or dialogResult was ' + JSON.stringify(newTodo));
            console.log('The error was ' + JSON.stringify(err));
          });
      }
    });
  }

  public filterTodos(searchOwner: string, searchStatus: string, searchBody: string, searchCategory: string): Todointerface[] {

    this.filteredTodos = this.todos;

    // Filter by name
    if (searchOwner != null) {
      searchOwner = searchOwner.toLocaleLowerCase();

      this.filteredTodos = this.filteredTodos.filter(todo => {
        return !searchOwner || todo.owner.toLowerCase().indexOf(searchOwner) !== -1;
      });
    }

    // Filter by age
    if (searchStatus != null) {
      searchStatus = searchStatus.toLocaleLowerCase();

      this.filteredTodos = this.filteredTodos.filter(todo => {
        return !searchStatus || todo.status.toString().toLowerCase().indexOf(searchStatus) !== -1;
      });
    }

    // Filter by body
    if (searchBody != null) {
      searchBody = searchBody.toLocaleLowerCase();

      this.filteredTodos = this.filteredTodos.filter(todo => {
        return !searchBody || todo.body.toLowerCase().indexOf(searchBody) !== -1;
      });
    }

    // Filter by category
    if (searchCategory != null) {
      searchCategory = searchCategory.toLocaleLowerCase();

      this.filteredTodos = this.filteredTodos.filter(todo => {
        return !searchCategory || todo.category.toLowerCase().indexOf(searchCategory) !== -1;
      })
    }

    return this.filteredTodos;
  }

  /**
   * Starts an asynchronous operation to update the users list
   *
   */
  refreshTodos(): Observable<Todointerface[]> {
    // Get Users returns an Observable, basically a "promise" that
    // we will get the data from the server.
    //
    // Subscribe waits until the data is fully downloaded, then
    // performs an action on it (the first lambda)

    const todos: Observable<Todointerface[]> = this.todoListService.getTodos();
    todos.subscribe(
      todos => {
        this.todos = todos;
        this.filterTodos(this.todoOwner, this.todoStatus, this.todoBody, this.todoCategory);
      },
      err => {
        console.log(err);
      });
    return todos;
  }

  loadService(): void {
    this.todoListService.getTodos(this.todoBody).subscribe(
      todos => {
        this.todos = todos;
        this.filteredTodos = this.todos;
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit(): void {
    this.refreshTodos();
    this.loadService();
  }
}

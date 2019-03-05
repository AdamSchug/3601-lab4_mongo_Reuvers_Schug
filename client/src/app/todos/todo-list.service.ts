import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';

import {Todointerface} from './todointerface';
import {environment} from '../../environments/environment';


@Injectable()
export class TodoListService {
  readonly baseUrl: string = environment.API_URL + 'todos';
  private todoUrl: string = this.baseUrl;

  constructor(private http: HttpClient) {
  }

  getTodos(todoBody?: string): Observable<Todointerface[]> {
    this.filterByBody(todoBody);
    return this.http.get<Todointerface[]>(this.todoUrl);
  }

  getTodoById(id: string): Observable<Todointerface> {
    return this.http.get<Todointerface>(this.todoUrl + '/' + id);
  }

  filterByBody(todoBody?: string): void {
    if (!(todoBody == null || todoBody === '')) {
      if (this.parameterPresent('body=')) {
        // Clear previous search
        this.removeParameter('body=');
      }
      if (this.todoUrl.indexOf('?') !== -1) {
        // Already information passed through this url
        this.todoUrl += 'body=' + todoBody + '&';
      } else {
        // First part passed in url
        this.todoUrl += '?body=' + todoBody + '&';
      }
    } else {
      // Nothing present in the box
      if (this.parameterPresent('body=')) {
        let start = this.todoUrl.indexOf('body=');
        const end = this.todoUrl.indexOf('&', start);
        if (this.todoUrl.substring(start - 1, start) === '?') {
          start = start - 1;
        }
        this.todoUrl = this.todoUrl.substring(0, start) + this.todoUrl.substring(end + 1);
      }
    }
  }

  private parameterPresent(searchParam: string) {
    return this.todoUrl.indexOf(searchParam) !== -1;
  }

  private removeParameter(searchParam: string) {
    let start = this.todoUrl.indexOf(searchParam);
    let end = 0;
    if (this.todoUrl.indexOf('&') !== -1) {
      end = this.todoUrl.indexOf('&', start) + 1;
    } else {
      end = this.todoUrl.indexOf('&', start);
    }
    this.todoUrl = this.todoUrl.substring(0, start) + this.todoUrl.substring(end);
  }

  addNewTodo(newTodo: Todointerface): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        // We're sending JSON
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };
    return this.http.post<string>(this.todoUrl + '/new', newTodo, httpOptions);
  }
}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Todointerface} from './todointerface';
import {FormControl, Validators, FormGroup, FormBuilder} from "@angular/forms";

@Component({
  selector: 'add-todo.component',
  templateUrl: 'add-todo.component.html',
})
export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { todo: Todointerface }, private fb: FormBuilder) {
  }

  add_todo_validation_messages = {
    'owner': [
      {type: 'required', message: 'Required'},
      {type: 'minlength', message: 'Must be at least 2 characters long'},
      {type: 'maxlength', message: 'Cannot be more than 25 characters long'},
      {type: 'pattern', message: 'Must contain only numbers and letters'},
    ],

    'status': [
      {type: 'pattern', message: 'Must be true or false'},
      {type: 'minlength', message: 'Must be at least 4 characters long'},
      {type: 'maxlength', message: 'May not be greater than 5 characters long'},
      {type: 'required', message: 'Required'}
    ],

    'body': [
      {type: 'required', message: 'Required'}
    ],

    'category': [
      {type: 'required', message: 'Required'}
    ]
  };

  createForms() {

    this.addTodoForm = this.fb.group({

      owner: new FormControl('owner', Validators.compose([
        Validators.minLength(2),
        Validators.maxLength(25),
        Validators.pattern('^[A-Za-z0-9\\s]+[A-Za-z0-9\\s]+$(\\.0-9+)?'),
        Validators.required
      ])),

      status: new FormControl('status', Validators.compose([
        Validators.pattern(/(true|false)/i),
        Validators.min(4),
        Validators.max(5),
        Validators.required
      ])),

      body: new FormControl('body', Validators.required),

      category: new FormControl('category', Validators.required)
    })

  }

  ngOnInit() {
    this.createForms();
  }

}

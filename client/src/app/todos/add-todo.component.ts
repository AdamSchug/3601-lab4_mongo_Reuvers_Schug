import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Todo} from './todo';
import {FormControl, Validators, FormGroup, FormBuilder} from "@angular/forms";

@Component({
  selector: 'add-todo.component',
  templateUrl: 'add-todo.component.html',
})
export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { todo: Todo }, private fb: FormBuilder) {
  }

  add_todo_validation_messages = {
    'owner': [
      {type: 'required', message: 'Owner is required'},
      {type: 'minlength', message: 'Owner must be at least 2 characters long'},
      {type: 'maxlength', message: 'Owner cannot be more than 25 characters long'},
      {type: 'pattern', message: 'Owner must contain only numbers and letters'},
      {type: 'existingOwner', message: 'Owner has already been taken'}
    ],

    'status': [
      {type: 'pattern', message: 'status must be a boolean'},
      {type: 'minlength', message: 'status must be at least 4 characters long'},
      {type: 'maxlength', message: 'status may not be greater than 5 characters long'},
      {type: 'required', message: 'status is required'}
    ],

    'body': [
      {type: 'required', message: 'status is required'}
    ],

    'category': [
      {type: 'required', message: 'status is required'}
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
        Validators.pattern('true|false/i'),
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

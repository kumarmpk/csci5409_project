import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-edit-part',
  templateUrl: './create-edit-part.component.html',
})
export class CreateEditPartComponent implements OnInit {

  @Input() partForm: FormGroup;
  @Input() index: number;
  @Output() deletePart: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onDelete() {
    this.deletePart.emit(this.index);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PartService } from '../../../shared/services/part.service';

@Component({
  selector: 'app-create-edit-part',
  templateUrl: './create-edit-part.component.html',
})
export class CreateEditPartComponent implements OnInit {

  parts = [];
  @Input() partForm: FormGroup;
  @Input() index: number;
  @Output() deletePart: EventEmitter<number> = new EventEmitter();

  constructor(private partService: PartService) { }

  ngOnInit() {
    this.parts = this.partService.parts;
  }

  onDelete() {
    this.deletePart.emit(this.index);
  }
}

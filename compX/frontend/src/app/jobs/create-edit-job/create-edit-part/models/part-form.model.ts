import { FormControl } from '@angular/forms';
import { Part } from '../../../../shared/models/part.model';

export class PartForm {

    partId = new FormControl();
    partName = new FormControl();
    qty = new FormControl();

    constructor(part: Part) {

        this.partId.setValue(part.partId);
        this.partName.setValue(part.partName);
        this.qty.setValue(part.qty);
    }
}

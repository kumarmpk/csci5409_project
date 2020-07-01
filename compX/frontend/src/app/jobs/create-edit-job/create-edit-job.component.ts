import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import {FormArray, FormGroup} from '@angular/forms';
import {JobFormService} from '../../shared/services/job-form.service';
import {JobService} from '../../shared/services/job.service';
import {JobShort} from '../../shared/models/job-short.model';

@Component({
  selector: 'app-create-edit-job',
  templateUrl: './create-edit-job.component.html',
})
export class CreateEditJobComponent implements OnInit, OnDestroy {

  jobForm: FormGroup;
  jobFormSub: Subscription;
  jobServiceSub: Subscription;
  parts: FormArray;
  formInvalid = false;
  error = null;

  constructor(private jobFormService: JobFormService,
              private jobService: JobService) { }

  ngOnInit() {
    this.jobFormSub = this.jobFormService.jobForm$
        .subscribe(job => {
          this.jobForm = job;
          this.parts = this.jobForm.get('parts') as FormArray;
        });
  }

  onSubmit() {
    console.log('Job saved!');
    console.log(this.jobForm.value as JobShort);

    const job = this.jobForm.value as JobShort;
    // recipe.authorId = sessionStorage.getItem('id');

    // this.jobServiceSub = this.jobService.createJob(job).subscribe(
    //     jobItem => {
    //       console.log(jobItem);
    //       this.jobForm.reset();
    //       // this.router.navigate(['profile', 'myrecipes']);
    //     },
    //     error => {
    //       this.error = error.message;
    //     }
    // );
  }

  ngOnDestroy() {
    this.jobFormSub.unsubscribe();
    this.jobServiceSub.unsubscribe();
  }

  /* parts */

  addPart() {
    this.jobFormService.addPart();
  }

  deletePart(index: number) {
    this.jobFormService.deletePart(index);
  }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import { JobService } from '../../shared/services/job.service';
import { Subscription } from 'rxjs';
import { Job } from '../../shared/models/job.model';

@Component({
  selector: 'app-job-item',
  templateUrl: './job-item.component.html'
})
export class JobItemComponent implements OnInit, OnDestroy {

  jobs = [];
  error = null;
  jobSub: Subscription;

  constructor(private jobService: JobService) { }

  ngOnInit() {
    this.onFetchJobs();
  }

  ngOnDestroy() {
    this.jobSub.unsubscribe();
  }

  onFetchJobs() {
    this.jobSub = this.jobService.fetchJobs().subscribe(
        jobs => {
          this.jobs = jobs;
        },
        error => {
          this.error = error.message;
        }
    );
  }
}

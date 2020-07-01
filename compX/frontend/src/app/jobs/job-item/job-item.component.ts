import {Component, OnDestroy, OnInit} from '@angular/core';
import { JobService } from '../../shared/services/job.service';
import { Subscription } from 'rxjs';
import { Job } from '../../shared/models/job.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-job-item',
  templateUrl: './job-item.component.html'
})
export class JobItemComponent implements OnInit, OnDestroy {

  jobs: Job[] = [];
  error = null;
  jobSub: Subscription;

  constructor(private jobService: JobService,
              private router: Router) { }

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

  onShowOrders() {
    this.router.navigate(['orders']);
  }
}

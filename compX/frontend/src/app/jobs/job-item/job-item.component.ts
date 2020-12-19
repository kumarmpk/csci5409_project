import {Component, OnDestroy, OnInit} from '@angular/core';
import { JobService } from '../../shared/services/job.service';
import { Subscription } from 'rxjs';
import { Job } from '../../shared/models/job.model';
import {Router} from '@angular/router';
import {PartService} from '../../shared/services/part.service';
import {first} from 'rxjs/operators';
import {Part} from '../../shared/models/part.model';

@Component({
  selector: 'app-job-item',
  templateUrl: './job-item.component.html'
})
export class JobItemComponent implements OnInit, OnDestroy {

  filteredJobs: Job[] = [];
  query = '';

  jobs: Job[] = [];

  error = null;
  jobSub: Subscription;
  delSub: Subscription;

  constructor(private jobService: JobService,
              public partService: PartService,
              private router: Router) { }

  ngOnInit() {
    this.onFetchJobs();
  }

  ngOnDestroy() {
    this.jobSub.unsubscribe();
    if (this.delSub) {
      this.delSub.unsubscribe();
    }
  }

  onFilter(query: string) {
    this.query = query;
    this.filteredJobs = this.jobs.filter(i => i.jobName.toLowerCase().includes(query.toLowerCase()));
  }

  onFetchJobs() {
    this.jobSub = this.jobService.data.subscribe(
        jobs => {
          this.jobs = jobs;
          this.onFilter('');
        },
        error => {
          this.error = error.message;
        }
    );
    this.jobService.fetchJobs();
  }

  onDeleteJob(jobName, partID) {
    this.delSub = this.jobService.deleteJob(jobName, partID).subscribe(
        res => {
          this.jobs.splice( this.jobs.findIndex(j => j.jobName === jobName && j.partId === partID), 1 );
          this.onFilter(this.query);
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JobShort } from '../../shared/models/job-short.model';
import { JobService } from '../../shared/services/job.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-update-job',
    templateUrl: './update-job.component.html'
})
export class UpdateJobComponent implements OnInit, OnDestroy {

    jobName: string;
    jobShort: JobShort;
    jobSub: Subscription;
    error = null;

    constructor(private jobService: JobService,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            this.jobName = params.jobName;
            this.onFetchJob();
        });
    }

    ngOnDestroy() {
        this.jobSub.unsubscribe();
    }

    onFetchJob() {
      this.jobSub = this.jobService.fetchJob(this.jobName).subscribe(
          jobItems => {
              console.log(jobItems);
          },
          error => {
              this.error = error.message;
          }
      );
    }
}

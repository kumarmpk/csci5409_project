import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {JobShort} from '../../shared/models/job-short.model';
import {JobService} from '../../shared/services/job.service';

@Component({
    selector: 'app-update-job',
    templateUrl: './update-job.component.html'
})
export class UpdateJobComponent implements OnInit {

    jobName: string;
    jobShort: JobShort;

    constructor(private jobService: JobService,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            this.jobName = params.jobName;
            this.onFetchJob();
        });
    }

    onFetchJob() {
      console.log(this.jobName);

    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, skip } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { Job } from '../models/job.model';
import { plainToClass} from 'class-transformer';
import { JobShort} from '../models/job-short.model';
import { OrderItem } from '../models/order-item.model';
import { PartService } from './part.service';
import { flatMap } from 'rxjs/internal/operators';

@Injectable({
    providedIn: 'root',
})
export class JobService {

    private dataSource = new BehaviorSubject<Job[]>([]);
    data = this.dataSource.asObservable();

    baseURL = 'https://enigmatic-everglades-12100.herokuapp.com/api';

    constructor(private http: HttpClient, private partService: PartService) {
    }

    fetchJobs() {
        this.http
            .get(this.baseURL + '/jobs')
            .pipe(
                map(responseData => {
                    const key = 'result';
                    if (responseData.hasOwnProperty(key)) {
                        return plainToClass(Job, responseData[key]) as unknown as Array<Job>;
                    }
                }),
                catchError(errorRes => {
                    return throwError(errorRes);
                })
            ).subscribe(jobs => {
            this.dataSource.next(jobs);
        });
    }

    fetchJob(name: string) {
        return this.http
            .get(this.baseURL + '/jobList', {
                params: {
                    jobName: name,
                }
            })
            .pipe(
                map(responseData => {
                    const key = 'result';
                    if (responseData.hasOwnProperty(key)) {
                        return plainToClass(Job, responseData[key]) as unknown as Array<Job>;
                    }
                }),
                catchError(errorRes => {
                    return throwError(errorRes);
                })
            );
    }

    createJob(job: JobShort) {
        const jobItems = this.convertToJobItems(job);
        console.log(job);

        return from(jobItems).pipe(
            // tslint:disable-next-line:no-shadowed-variable
            flatMap(job => {
                return this.http
                    .post(this.baseURL + '/jobs',
                        JSON.stringify(job),
                        {
                            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
                        })
                    .pipe(
                        map((responseData) => {
                            return responseData;
                        }),
                        catchError(errorRes => {
                            return throwError(errorRes);
                        })
                    );
            }),
            skip(jobItems.length - 1)
        );
    }

    updateJob(job: JobShort) {
        const jobItems = this.convertToJobItems(job);
        console.log(jobItems);

        return from(jobItems).pipe(
            // tslint:disable-next-line:no-shadowed-variable
            flatMap(job => {
                return this.http
                    .put(this.baseURL + '/jobs',
                        JSON.stringify(job),
                        {
                            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
                        })
                    .pipe(
                        map((responseData) => {
                            return responseData;
                        }),
                        catchError(errorRes => {
                            return throwError(errorRes);
                        })
                    );
            }),
            skip(jobItems.length - 1)
        );
    }

    deleteJob(name, partID) {
        return this.http
            .delete(this.baseURL + '/jobs',
                {
                    params: {
                        jobName: name,
                        partId: partID
                    }
                })
            .pipe(
                map(responseData => {
                    return responseData;
                }),
                catchError(errorRes => {
                    return throwError(errorRes);
                })
            );
    }

    /* helper */

    private convertToJobItems(job: JobShort) {
        const name = job.jobName;
        // tslint:disable-next-line:only-arrow-functions no-shadowed-variable
        const partDict = this.partService.dataSource.value.reduce(function(map, item) {
            map[item.partName] = item.partId;
            return map;
        }, {});
        return job.parts.map(x => new Job(name, partDict[x.partName], x.qoh));
    }

    /* orders */

    fetchOrders() {
        return this.http
            .get(this.baseURL + '/orders')
            .pipe(
                map(responseData => {
                    const key = 'result';
                    if (responseData.hasOwnProperty(key)) {
                        return plainToClass(OrderItem, responseData[key]) as unknown as Array<OrderItem>;
                    }
                }),
                catchError(errorRes => {
                    return throwError(errorRes);
                })
            );
    }
}

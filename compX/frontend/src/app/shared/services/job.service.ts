import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {Job} from '../models/job.model';
import {plainToClass} from 'class-transformer';
import {JobShort} from '../models/job-short.model';
import {OrderItem} from '../models/order-item.model';
import {PartService} from './part.service';

@Injectable({
    providedIn: 'root',
})
export class JobService {

    private dataSource = new BehaviorSubject<Job[]>([]);
    data = this.dataSource.asObservable();

    baseURL = 'http://localhost:3000/';

    constructor(private http: HttpClient, private partService: PartService) {
    }

    fetchJobs() {
        const jobSub = this.http
            .get(this.baseURL + 'jobs')
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

        jobSub.subscribe(jobs => {
            this.dataSource.next(jobs);
        });
    }

    fetchJob(name: string) {

        const jobs = [
            new Job('new item', 342, 234),
            new Job('new item', 342, 234),
        ];

        // return jobs;

        return new Observable<Job[]>(observer => {
            observer.next(jobs);
        });

        // return this.http
        //     .get(this.baseURL + 'recipe/' + id)
        //     .pipe(
        //         map(responseData => {
        //             const key = 'data';
        //             if (responseData.hasOwnProperty(key)) {
        //                 return plainToClass(Recipe, responseData[key]);
        //             }
        //         }),
        //         catchError(errorRes => {
        //             return throwError(errorRes);
        //         })
        //     );
    }

    createJob(job: JobShort) {

        const name = job.jobName;
        // tslint:disable-next-line:only-arrow-functions no-shadowed-variable
        const partDict = this.partService.dataSource.value.reduce(function(map, item) {
            map[item.partName] = item.partId;
            return map;
        }, {});
        const jobItems = job.parts.map(x => new Job(name, partDict[x.partName], x.qty));
        console.log(jobItems);

        // recipe.instruction.forEach(item => {
        //     item.ingredients.forEach(ing => {
        //         const ingredient = ingredients.find(x => x.name === ing.name);
        //         ing.units = ingredient.units;
        //     });
        // });
        //
        // return this.http
        //     .post(`${this.baseURL}recipe/`,
        //         JSON.stringify(recipe),
        //         {
        //             headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        //         })
        //     .pipe(
        //         map((responseData) => {
        //             const key = 'data.id';
        //             if (responseData.hasOwnProperty(key)) {
        //                 return plainToClass(Recipe, responseData[key]);
        //             }
        //         }),
        //         catchError(errorRes => {
        //             return throwError(errorRes);
        //         })
        //     );
    }

    deleteJob(name, partID) {
        return this.http
            .delete(this.baseURL + 'jobs',
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

    /* orders */

    fetchOrders() {
        return this.http
            .get(this.baseURL + 'orders')
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

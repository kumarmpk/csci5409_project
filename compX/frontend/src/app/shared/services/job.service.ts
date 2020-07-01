import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';
import { Job } from '../models/job.model';
import { plainToClass } from 'class-transformer';

@Injectable({
  providedIn: 'root',
})
export class JobService {

  baseURL = 'http://localhost:4000/';

  constructor(private http: HttpClient) {}

  fetchJobs() {

    const jobs = [
        new Job("new item", 342, 234),
        new Job("new item", 342, 234),
        new Job("new item", 342, 234),
    ];

    // return jobs;

    return new Observable<Job[]>(observer => {
      observer.next(jobs);
    });

    // return this.http
    //     .get(this.baseURL + 'recipe/all')
    //     .pipe(
    //         map(responseData => {
    //           const key = 'data';
    //           if (responseData.hasOwnProperty(key)) {
    //             return plainToClass(Job, responseData[key]) as unknown as Array<Job>;
    //           }
    //         }),
    //         catchError(errorRes => {
    //           return throwError(errorRes);
    //         })
    //     );
  }
}

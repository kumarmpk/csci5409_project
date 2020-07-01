import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';
import { Job } from '../models/job.model';
import { plainToClass } from 'class-transformer';
import {JobShort} from '../models/job-short.model';

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

    createJob(job: JobShort) {

        // enter units for preselected items in steps
        // const ingredients = recipe.ingredients;
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
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Part } from '../models/part.model';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  baseURL = 'http://localhost:4000/';
  parts: Part[] = [];
  error = null;

  constructor(private http: HttpClient) {
  }

  fetchParts() {

    const mockParts = [
      new Part('name one', 4, 5),
      new Part('name two', 4, 5),
      new Part('name three', 4, 5),
    ];

    // return jobs;

    return new Observable<Part[]>(observer => {
      observer.next(mockParts);
    }).subscribe(newParts => {
          this.parts = newParts;
        },
        error => {
          this.error = error.message;
        }
    );

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

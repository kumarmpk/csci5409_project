import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Part } from '../models/part.model';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  dataSource = new BehaviorSubject<Part[]>([]);
  data = this.dataSource.asObservable();
  error = null;

  baseURL = 'http://localhost:3000/';

  constructor(private http: HttpClient) {
  }

  fetchParts() {

    const mockParts = [
      new Part('name one', 3, 5),
      new Part('name two', 4, 5),
      new Part('name three', 8, 5),
    ];

    // return jobs;

    this.dataSource.next(mockParts);

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

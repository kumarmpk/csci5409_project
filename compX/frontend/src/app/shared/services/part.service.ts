import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {Part} from '../models/part.model';
import {plainToClass} from 'class-transformer';
import {catchError, map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PartService {

    dataSource = new BehaviorSubject<Part[]>([]);
    data = this.dataSource.asObservable();
    error = null;
    partMap = new Map();

    baseURL = 'https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/';

    constructor(private http: HttpClient) {
    }

    fetchParts() {
        this.http
            .get(this.baseURL + 'parts')
            .pipe(
                map(responseData => {
                    const items = plainToClass(Part, responseData) as unknown as Array<Part>;
                    this.partMap.clear();
                    items.forEach(i => this.partMap.set(i.partId, i.partName));
                    return items;
                }),
                catchError(errorRes => {
                    return throwError(errorRes);
                })
            ).subscribe(parts => {
          this.dataSource.next(parts);
        });
    }
}

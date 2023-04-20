import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, map } from 'rxjs';
import { User, Users } from './models/users.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  /**
   * getting all users from api
   * @returns
  */
  getUsers(): Observable<User[]> {
    // return this.http.get<Users>('http://87.242.76.45/testdata.json').pipe(
    return this.http.get<Users>('./assets/data.json').pipe(
      delay(500),//falink small delay to see preloader while getting data
      map(users => users.users)
    );
  }

  /**
   * Fake method to remove a user
   * @param id
   * @returns
  */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`http://87.242.76.45/testdata/${id}.json`);
  }
}

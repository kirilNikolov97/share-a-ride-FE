import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TokenStorageService} from './token-storage.service';
import {NavigationService} from './navigation.service';


// const AUTH_API = 'http://localhost:8080/api/auth/';
const AUTH_API = 'https://share-a-ride-nbu.herokuapp.com/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) { }

  login(credentials): Observable<any> {
    return this.http.post(AUTH_API + 'signin', {
      username: credentials.username,
      password: credentials.password
    }, httpOptions);
  }

  register(user): Observable<any> {
    return this.http.post(AUTH_API + 'signup', {
      username: user.username,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isCompany: false
    }, httpOptions);
  }

  isAuthenticated() {
    return this.tokenStorageService.getUser() != null;
  }
}

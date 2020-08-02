import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { USER_API_URL } from './../constant/constant';
import { Router } from '@angular/router';
import { Login } from './../model/login';
import { map } from 'rxjs/operators';
import { UserDetail } from './../model/userDetail';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  userId: string;
  constructor(private http: HttpClient, private router: Router) {
  }

  authenticate(login: Login) {
    console.log("login" + login);
    console.log("login" + login.password + login.username);
    //create a token for authentication request
    let authToken = "Basic " + window.btoa(login.username + ":" + login.password);
    console.log("authToken" + authToken);
    //header customization
    let headers = new HttpHeaders({
      Authorization: authToken
    });

    return this.http.get(USER_API_URL + "/login", { headers }).pipe(
      map(successData => {
        sessionStorage.setItem("token", authToken);
        sessionStorage.setItem('user', login.username);
        return successData;
      })
    ).subscribe((res: UserDetail) => {
      this.router.navigate(['/home']);
      this.userId = res.id;
    }, err => {
      if (err.status == 401) {
        alert("Invalid Username or password!");
      } else {
        alert("Invalid Deatails");
      }
    }
    );
  }

  getAuthenticationToken() {
    return sessionStorage.getItem("token");
  }

  isUserLoggedIn(): boolean {
    let user = sessionStorage.getItem('user');
    if (user == null) {
      return false;
    } else {
      return true;
    }
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.userId = null;
    this.router.navigate(['/login']);
    alert("You are Successfully Logged out!");
  }

}

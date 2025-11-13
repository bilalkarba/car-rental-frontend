import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';
  private isBrowser: boolean;
  private readonly API_URL = 'http://localhost:3000/api'; // Update with your backend URL

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getStorage(): Storage | null {
    if (!this.isBrowser) return null;
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post(`${this.API_URL}/auth/login`, credentials, { headers }).pipe(
      tap((response: any) => {
        console.log('Login response:', response);
        if (response.token && response.user) {
          const storage = this.getStorage();
          if (storage) {
            storage.setItem(this.TOKEN_KEY, response.token);
            const userData = {
              ...response.user,
              id: response.user.id || response.user._id
            };
            storage.setItem(this.USER_KEY, JSON.stringify(userData));
          }
        }
      })
    );
  }

  isLogged(): boolean {
    const storage = this.getStorage();
    return storage ? !!storage.getItem(this.TOKEN_KEY) : false;
  }

  getToken(): string | null {
    const storage = this.getStorage();
    return storage ? storage.getItem(this.TOKEN_KEY) : null;
  }

  getUser(): any {
    const storage = this.getStorage();
    if (!storage) return null;
    
    const user = storage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Sending registration request to:', `${this.API_URL}/auth/register`);
    console.log('Registration data:', userData);

    return this.http.post(`${this.API_URL}/auth/register`, userData, { headers });
  }

  logout(): void {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(this.TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    }
    this.router.navigate(['/login']);
  }
}

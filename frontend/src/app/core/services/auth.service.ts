import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import {environment} from "../../../environments/environment";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  fullName: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  constructor(private http: HttpClient, private router: Router) {}

  register(request: RegisterRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/register`, request);
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    console.log('Attempting login for:', request.email);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        console.log('Login response received:', response);
        if (response.success && response.data) {
          this.storeTokens(response.data);
          console.log('Tokens and user data stored');
        }
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storeTokens(response.data);
        }
      })
    );
  }

  private storeTokens(data: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      role: data.role,
      fullName: data.fullName,
      email: data.email
    }));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getRole(): string | null {
    const user = this.getUserData();
    const role = user ? user.role : null;
    console.log('Current user role from storage:', role);
    return role;
  }

  getFullName(): string | null {
    const user = this.getUserData();
    return user ? user.fullName : null;
  }

  getUserData(): any {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    const loggedIn = !!this.getAccessToken();
    console.log('isLoggedIn check:', loggedIn);
    return loggedIn;
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  redirectToDashboard(): void {
    const rawRole = this.getRole() || '';
    const role = rawRole.toUpperCase().trim();
    console.log('Redirecting based on role:', role);

    if (role === 'STUDENT') {
      this.router.navigate(['/student/dashboard']);
    } else if (role === 'MENTOR') {
      this.router.navigate(['/mentor/dashboard']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      console.warn('Unknown or missing role:', role);
      this.router.navigate(['/auth/login']);
    }
  }
}

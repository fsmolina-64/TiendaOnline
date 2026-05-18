import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, User } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${API}/auth/register`, data).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${API}/auth/login`, data).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUserFromStorage() {
    const user = localStorage.getItem('user');
    if (user) this.currentUser.set(JSON.parse(user));
  }
  updateUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user));
  this.currentUser.set(user);
}
}
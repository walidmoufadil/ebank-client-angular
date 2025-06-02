import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { AuthResponse, LoginRequest, PasswordChangeRequest, User } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialiser les informations utilisateur depuis le token au démarrage
    if (this.isAuthenticated()) {
      this.loadUserFromToken();
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    const params = new HttpParams()
      .set('username', request.username)
      .set('password', request.password);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post<AuthResponse>(`${this.API_URL}/auth`, params, { headers })
      .pipe(
        tap(response => {
          if (response['access-token']) {
            this.setToken(response['access-token']);
            this.loadUserFromToken();
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  changePassword(request: PasswordChangeRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, request);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      const userInfo = this.parseJwt(token);
      if (userInfo) {
        const user: User = {
          username: userInfo.sub || '',
          roles: userInfo.scope ? [userInfo.scope] : []
        };
        this.currentUserSubject.next(user);
      }
    }
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to parse JWT token:', e);
      return null;
    }
  }

  getCurrentUserName(): string {
    const currentUser = this.currentUserSubject.value;
    if (currentUser && currentUser.username) {
      // Extraire la partie avant @ pour les emails
      return currentUser.username.includes('@') 
        ? currentUser.username.split('@')[0] 
        : currentUser.username;
    }
    return 'Utilisateur';
  }
}

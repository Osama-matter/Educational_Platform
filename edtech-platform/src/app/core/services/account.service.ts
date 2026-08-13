import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginDto, RegisterDto, UserDto, UserDetailsDto } from '../models/account.models';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private base = `${environment.apiBaseUrl}/Account`;

  register(dto: RegisterDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.base}/register`, dto).pipe(
      tap((res) => this.authStore.setSession(res))
    );
  }

  registerAdmin(dto: RegisterDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.base}/register-admin`, dto);
  }

  login(dto: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.base}/login`, dto).pipe(
      tap((res) => this.authStore.setSession(res))
    );
  }

  logout(): Observable<void> {
    this.authStore.clearSession();
    return this.http.post<void>(`${this.base}/Logout`, {}).pipe(
      catchError(() => of(void 0)),
      tap(() => this.authStore.clearSession())
    );
  }

  getDetails(): Observable<UserDetailsDto> {
    return this.http.get<UserDetailsDto>(`${this.base}/details`);
  }
}

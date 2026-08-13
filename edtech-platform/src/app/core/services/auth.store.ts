import { Injectable, signal, computed } from '@angular/core';
import { UserDto } from '../models/account.models';
import { jwtDecode } from 'jwt-decode';

interface JwtClaims {
  sub: string;
  role?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private session = signal<UserDto | null>(this.readFromStorage());

  currentUser = computed(() => this.session());
  token = computed(() => this.session()?.token ?? null);
  isAuthenticated = computed(() => !!this.session()?.token);

  userRoles = computed(() => {
    const t = this.token();
    if (!t) return [];
    try {
      const claims = jwtDecode<JwtClaims>(t);
      const roleClaim = claims.role || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (!roleClaim) return [];
      return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    } catch {
      return [];
    }
  });

  userId = computed(() => {
    const t = this.token();
    if (!t) return null;
    try {
      const claims = jwtDecode<any>(t);
      return claims.nameid || claims.sub || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
    } catch {
      return null;
    }
  });

  isAdmin = computed(() => this.userRoles().includes('Admin'));
  isInstructor = computed(() => this.userRoles().includes('Instructor'));

  hasAnyRole(roles: string[]): boolean {
    const currentRoles = this.userRoles();
    return roles.some((r) => currentRoles.includes(r));
  }

  setSession(user: UserDto): void {
    this.session.set(user);
    sessionStorage.setItem('session', JSON.stringify(user));
  }

  clearSession(): void {
    this.session.set(null);
    sessionStorage.removeItem('session');
  }

  private readFromStorage(): UserDto | null {
    const raw = sessionStorage.getItem('session');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

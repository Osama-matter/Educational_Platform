import { Injectable, signal, computed } from '@angular/core';
import { UserDto } from '../models/account.models';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private user = signal<UserDto | null>(null);
  private loadingState = signal<boolean>(true);

  currentUser = computed(() => this.user());
  isAuthenticated = computed(() => !!this.user());
  isLoading = computed(() => this.loadingState());

  userRoles = computed(() => this.user()?.roles || []);
  userId = computed(() => this.user()?.id || null);

  isAdmin = computed(() => this.userRoles().includes('Admin'));
  isInstructor = computed(() => this.userRoles().includes('Instructor'));

  hasAnyRole(roles: string[]): boolean {
    const currentRoles = this.userRoles();
    return roles.some((r) => currentRoles.includes(r));
  }

  setSession(user: UserDto): void {
    this.user.set(user);
    this.loadingState.set(false);
    this.purgeStorage();
  }

  clearSession(): void {
    this.user.set(null);
    this.loadingState.set(false);
    this.purgeStorage();
  }

  setLoading(loading: boolean): void {
    this.loadingState.set(loading);
  }

  private purgeStorage(): void {
    try {
      localStorage.removeItem('session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('session');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } catch {
      // Ignore
    }
  }
}

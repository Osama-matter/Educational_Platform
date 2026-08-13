import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-student-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="min-h-screen flex bg-background text-on-background">
      <!-- Right Sidebar (RTL) -->
      <aside class="w-64 bg-surface-container-lowest border-l border-outline-variant flex flex-col justify-between p-4 sticky top-0 h-screen shadow-sm">
        <div>
          <!-- Brand Logo -->
          <a routerLink="/" class="flex items-center gap-3 p-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl">
              م
            </div>
            <div class="text-right">
              <span class="font-headline-md text-primary font-bold text-lg leading-tight block">منارة</span>
              <span class="font-caption text-on-surface-variant text-xs">لوحة الطالب</span>
            </div>
          </a>

          <!-- Student Nav Links -->
          <nav class="space-y-1 text-right">
            <a
              routerLink="/student"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-primary-container/20 text-primary font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-all"
            >
              <span class="material-symbols-outlined">dashboard</span>
              <span>الرئيسية</span>
            </a>

            <a
              routerLink="/student/certificates"
              routerLinkActive="bg-primary-container/20 text-primary font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-all"
            >
              <span class="material-symbols-outlined">workspace_premium</span>
              <span>شهاداتي</span>
            </a>


            <a
              routerLink="/forum"
              routerLinkActive="bg-primary-container/20 text-primary font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-all"
            >
              <span class="material-symbols-outlined">forum</span>
              <span>المنتدى والمناقشات</span>
            </a>

            <a
              routerLink="/student/profile"
              routerLinkActive="bg-primary-container/20 text-primary font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-all"
            >
              <span class="material-symbols-outlined">person</span>
              <span>الملف الشخصي</span>
            </a>
          </nav>
        </div>

        <!-- User profile & Logout -->
        <div class="border-t border-outline-variant pt-4">
          <div class="flex items-center justify-between p-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center text-sm">
                ط
              </div>
              <div class="text-right">
                <span class="font-label-md text-on-surface block text-xs truncate max-w-[110px]">
                  {{ authStore.currentUser()?.email || 'طالب' }}
                </span>
                <span class="font-caption text-on-surface-variant text-[10px]">حساب طالب</span>
              </div>
            </div>
            <button (click)="logout()" title="تسجيل الخروج" class="text-error hover:bg-error-container/20 p-2 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-grow p-8 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class StudentShellComponent {
  authStore = inject(AuthStore);
  private accountService = inject(AccountService);
  private router = inject(Router);

  logout(): void {
    this.accountService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.authStore.clearSession();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}

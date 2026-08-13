import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="min-h-screen flex bg-background text-on-background">
      <!-- Right Sidebar (Admin Nav) -->
      <aside class="w-64 bg-surface-container border-l border-outline-variant flex flex-col justify-between p-4 sticky top-0 h-screen shadow-sm">
        <div>
          <!-- Brand Logo -->
          <a routerLink="/admin" class="flex items-center gap-3 p-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-xl">
              إ
            </div>
            <div class="text-right">
              <span class="font-headline-md text-secondary font-bold text-lg leading-tight block">منارة الإدارة</span>
              <span class="font-caption text-on-surface-variant text-xs">لوحة التحكم المركزية</span>
            </div>
          </a>

          <!-- Admin Nav Links -->
          <nav class="space-y-1 text-right">
            <a
              routerLink="/admin"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-secondary-container/20 text-secondary font-semibold"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span class="material-symbols-outlined">analytics</span>
              <span>الإحصائيات النشاط</span>
            </a>

            <a
              routerLink="/admin/courses"
              routerLinkActive="bg-secondary-container/20 text-secondary font-semibold"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span class="material-symbols-outlined">auto_stories</span>
              <span>إدارة الدورات</span>
            </a>

            <a
              routerLink="/admin/enrollments"
              routerLinkActive="bg-secondary-container/20 text-secondary font-semibold"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span class="material-symbols-outlined">how_to_reg</span>
              <span>إدارة التسجيلات</span>
            </a>

            <a
              routerLink="/admin/certificates"
              routerLinkActive="bg-secondary-container/20 text-secondary font-semibold"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span class="material-symbols-outlined">verified</span>
              <span>إدارة الشهادات</span>
            </a>

            <a
              routerLink="/admin/quiz-builder"
              routerLinkActive="bg-secondary-container/20 text-secondary font-semibold"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span class="material-symbols-outlined">quiz</span>
              <span>بناء الاختبارات</span>
            </a>


            <a
              routerLink="/admin/roles"
              routerLinkActive="bg-secondary-container/20 text-secondary font-semibold"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-all"
            >
              <span class="material-symbols-outlined">admin_panel_settings</span>
              <span>الصلاحيات والأمان</span>
            </a>
          </nav>
        </div>

        <!-- Admin Profile Footer -->
        <div class="border-t border-outline-variant pt-4">
          <div class="flex items-center justify-between p-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-secondary text-on-secondary font-bold flex items-center justify-center text-sm">
                م
              </div>
              <div class="text-right">
                <span class="font-label-md text-on-surface block text-xs truncate max-w-[110px]">
                  {{ authStore.currentUser()?.email || 'مدير النظام' }}
                </span>
                <span class="font-caption text-secondary text-[10px]">مسؤول النظام</span>
              </div>
            </div>
            <button (click)="logout()" title="تسجيل الخروج" class="text-error hover:bg-error-container/20 p-2 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Admin Workspace -->
      <main class="flex-grow p-8 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminShellComponent {
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

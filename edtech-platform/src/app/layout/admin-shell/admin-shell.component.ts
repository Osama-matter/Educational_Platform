import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row bg-background text-on-background text-right">
      
      <!-- Mobile Top App Bar (Visible on screens < lg) -->
      <header class="lg:hidden bg-surface-container border-b border-outline-variant px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <a routerLink="/admin" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-lg">
            إ
          </div>
          <div>
            <span class="font-headline-md text-secondary font-extrabold text-base leading-tight block">منارة الإدارة</span>
            <span class="font-caption text-on-surface-variant text-[10px]">لوحة التحكم</span>
          </div>
        </a>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="toggleMobileDrawer()"
            class="p-2 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest focus:outline-none transition-colors"
            aria-label="القائمة الجانبية للإدارة"
          >
            <span class="material-symbols-outlined text-2xl block">
              {{ drawerOpen() ? 'close' : 'menu' }}
            </span>
          </button>
        </div>
      </header>

      <!-- Backdrop for Mobile Drawer -->
      @if (drawerOpen()) {
        <div
          (click)="closeDrawer()"
          class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity"
        ></div>
      }

      <!-- Right Sidebar (Desktop Sticky + Mobile Slide-over Drawer) -->
      <aside
        class="fixed lg:sticky top-0 right-0 h-screen w-72 bg-surface-container border-l border-outline-variant flex flex-col justify-between p-5 z-50 shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out"
        [class.translate-x-0]="drawerOpen()"
        [class.translate-x-full]="!drawerOpen()"
        [class.lg:translate-x-0]="true"
      >
        <div class="space-y-6">
          <!-- Brand Logo & Mobile Close -->
          <div class="flex items-center justify-between">
            <a routerLink="/admin" (click)="closeDrawer()" class="flex items-center gap-3 p-1">
              <div class="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-xl shadow-xs">
                إ
              </div>
              <div class="text-right">
                <span class="font-headline-md text-secondary font-extrabold text-lg leading-tight block">منارة الإدارة</span>
                <span class="font-caption text-on-surface-variant text-xs">لوحة التحكم المركزية</span>
              </div>
            </a>

            <button
              type="button"
              (click)="closeDrawer()"
              class="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <!-- Admin Nav Links -->
          <nav class="space-y-1.5 text-right">
            <a
              routerLink="/admin"
              (click)="closeDrawer()"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-secondary text-on-secondary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">analytics</span>
              <span>الإحصائيات والنشاط</span>
            </a>

            <a
              routerLink="/admin/courses"
              (click)="closeDrawer()"
              routerLinkActive="bg-secondary text-on-secondary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">auto_stories</span>
              <span>إدارة الدورات</span>
            </a>

            <a
              routerLink="/admin/enrollments"
              (click)="closeDrawer()"
              routerLinkActive="bg-secondary text-on-secondary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">how_to_reg</span>
              <span>إدارة التسجيلات</span>
            </a>

            <a
              routerLink="/admin/certificates"
              (click)="closeDrawer()"
              routerLinkActive="bg-secondary text-on-secondary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">verified</span>
              <span>إدارة الشهادات</span>
            </a>

            <a
              routerLink="/admin/quiz-builder"
              (click)="closeDrawer()"
              routerLinkActive="bg-secondary text-on-secondary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">quiz</span>
              <span>بناء الاختبارات</span>
            </a>

            <a
              routerLink="/admin/roles"
              (click)="closeDrawer()"
              routerLinkActive="bg-secondary text-on-secondary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">admin_panel_settings</span>
              <span>الصلاحيات والمستخدمين</span>
            </a>

            <a
              routerLink="/catalog"
              (click)="closeDrawer()"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-surface-container-high transition-all text-xs sm:text-sm font-semibold border-t border-outline-variant/60 mt-3 pt-3"
            >
              <span class="material-symbols-outlined text-xl">visibility</span>
              <span>معاينة واجهة المنصة</span>
            </a>
          </nav>
        </div>

        <!-- Admin Profile Footer & Logout -->
        <div class="border-t border-outline-variant/80 pt-4">
          <div class="flex items-center justify-between p-2 rounded-2xl bg-surface-container-high/60">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-secondary text-on-secondary font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                إ
              </div>
              <div class="text-right min-w-0">
                <span class="font-bold text-on-surface block text-xs truncate max-w-[120px]">
                  {{ authStore.currentUser()?.email || 'مدير النظام' }}
                </span>
                <span class="font-caption text-secondary text-[10px]">مسؤول النظام</span>
              </div>
            </div>

            <button
              (click)="logout()"
              title="تسجيل الخروج"
              class="text-error hover:bg-error-container/30 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Admin Workspace -->
      <main class="flex-grow p-2 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminShellComponent {
  authStore = inject(AuthStore);
  private accountService = inject(AccountService);
  private router = inject(Router);

  drawerOpen = signal(false);

  toggleMobileDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

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

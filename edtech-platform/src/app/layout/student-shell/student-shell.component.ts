import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-student-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col md:flex-row bg-background text-on-background text-right">
      
      <!-- Mobile Top App Bar (Visible on screens < md) -->
      <header class="md:hidden bg-surface-container-lowest border-b border-outline-variant px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <a routerLink="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
            م
          </div>
          <div>
            <span class="font-headline-md text-primary font-extrabold text-base leading-tight block">منارة</span>
            <span class="font-caption text-on-surface-variant text-[10px]">بوابة الطالب</span>
          </div>
        </a>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="toggleMobileDrawer()"
            class="p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high focus:outline-none transition-colors"
            aria-label="القائمة الجانبية"
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
          class="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity"
        ></div>
      }

      <!-- Sidebar (Desktop Sticky + Mobile Slide-over Drawer) -->
      <aside
        class="fixed md:sticky top-0 right-0 h-screen w-72 bg-surface-container-lowest border-l border-outline-variant flex flex-col justify-between p-5 z-50 shadow-lg md:shadow-none transition-transform duration-300 ease-in-out"
        [class.translate-x-0]="drawerOpen()"
        [class.translate-x-full]="!drawerOpen()"
        [class.md:translate-x-0]="true"
      >
        <div class="space-y-6">
          <!-- Brand Logo & Close for Mobile -->
          <div class="flex items-center justify-between">
            <a routerLink="/" (click)="closeDrawer()" class="flex items-center gap-3 p-1">
              <div class="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-xs">
                م
              </div>
              <div class="text-right">
                <span class="font-headline-md text-primary font-bold text-lg leading-tight block">منارة</span>
                <span class="font-caption text-on-surface-variant text-xs">لوحة تحكم الطالب</span>
              </div>
            </a>

            <!-- Close button on mobile -->
            <button
              type="button"
              (click)="closeDrawer()"
              class="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <!-- Student Nav Links -->
          <nav class="space-y-1.5 text-right">
            <a
              routerLink="/student"
              (click)="closeDrawer()"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-primary text-on-primary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">dashboard</span>
              <span>الرئيسية والدورات</span>
            </a>

            <a
              routerLink="/student/certificates"
              (click)="closeDrawer()"
              routerLinkActive="bg-primary text-on-primary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">workspace_premium</span>
              <span>شهاداتي المكتسبة</span>
            </a>

            <a
              routerLink="/forum"
              (click)="closeDrawer()"
              routerLinkActive="bg-primary text-on-primary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">forum</span>
              <span>المنتدى والمناقشات</span>
            </a>

            <a
              routerLink="/catalog"
              (click)="closeDrawer()"
              routerLinkActive="bg-primary text-on-primary font-bold shadow-xs"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container transition-all text-xs sm:text-sm font-semibold"
            >
              <span class="material-symbols-outlined text-xl">school</span>
              <span>استكشاف الدورات</span>
            </a>
          </nav>
        </div>

        <!-- Student Profile Footer & Logout -->
        <div class="border-t border-outline-variant/70 pt-4 space-y-2">
          <div class="flex items-center justify-between p-2 rounded-2xl bg-surface-container-low/50">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                {{ (authStore.currentUser()?.username || authStore.currentUser()?.email || 'ط')[0].toUpperCase() }}
              </div>
              <div class="text-right min-w-0">
                <span class="font-bold text-on-surface block text-xs truncate max-w-[120px]">
                  {{ authStore.currentUser()?.username || (authStore.currentUser()?.email || 'طالب').split('@')[0] }}
                </span>
                <span class="font-caption text-on-surface-variant text-[10px]">طالب المنصة</span>
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

      <!-- Main Content Area -->
      <main class="flex-grow p-2 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto min-w-0">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Mobile Bar for Quick 1-Tap Navigation (Mobile only) -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant px-3 py-2 flex items-center justify-around shadow-lg">
        <a
          routerLink="/student"
          [routerLinkActiveOptions]="{ exact: true }"
          routerLinkActive="text-primary font-bold"
          class="flex flex-col items-center gap-0.5 text-on-surface-variant text-[10px]"
        >
          <span class="material-symbols-outlined text-xl">dashboard</span>
          <span>الرئيسية</span>
        </a>
        <a
          routerLink="/student/certificates"
          routerLinkActive="text-primary font-bold"
          class="flex flex-col items-center gap-0.5 text-on-surface-variant text-[10px]"
        >
          <span class="material-symbols-outlined text-xl">workspace_premium</span>
          <span>شهاداتي</span>
        </a>
        <a
          routerLink="/forum"
          routerLinkActive="text-primary font-bold"
          class="flex flex-col items-center gap-0.5 text-on-surface-variant text-[10px]"
        >
          <span class="material-symbols-outlined text-xl">forum</span>
          <span>المنتدى</span>
        </a>
        <a
          routerLink="/catalog"
          routerLinkActive="text-primary font-bold"
          class="flex flex-col items-center gap-0.5 text-on-surface-variant text-[10px]"
        >
          <span class="material-symbols-outlined text-xl">school</span>
          <span>الدورات</span>
        </a>
      </div>

    </div>
  `
})
export class StudentShellComponent {
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

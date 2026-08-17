import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-background text-on-background">
      <!-- Navbar Header -->
      <header class="bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant sticky top-0 z-40 shadow-xs">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          
          <!-- Logo & Brand -->
          <a routerLink="/" (click)="closeMobileMenu()" class="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/favicon.png" alt="matar.dev" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs shrink-0" />
            <div class="text-right min-w-0">
              <span class="font-headline-md text-primary font-black block text-base sm:text-xl tracking-tight leading-tight truncate">matar.dev</span>
              <span class="font-caption text-on-surface-variant text-[9px] sm:text-[11px] font-medium hidden xs:block">منصة البرمجة والتعليم الحديث</span>
            </div>
          </a>

          <!-- Desktop Navigation Links -->
          <nav class="hidden md:flex items-center gap-8 text-right">
            <a
              routerLink="/"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="text-primary font-bold"
              class="font-label-md text-sm text-on-surface hover:text-primary transition-colors"
            >
              الرئيسية
            </a>
            <a
              routerLink="/catalog"
              routerLinkActive="text-primary font-bold"
              class="font-label-md text-sm text-on-surface hover:text-primary transition-colors"
            >
              تصفح الدورات
            </a>
            <a
              routerLink="/forum"
              routerLinkActive="text-primary font-bold"
              class="font-label-md text-sm text-on-surface hover:text-primary transition-colors"
            >
              المنتدى والمناقشات
            </a>
          </nav>

          <!-- Desktop Auth CTA buttons & Theme Toggle -->
          <div class="hidden md:flex items-center gap-3">
            <button
              type="button"
              (click)="themeService.toggleTheme()"
              class="p-2.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high focus:outline-none transition-all shadow-2xs flex items-center justify-center"
              [title]="themeService.isDark() ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'"
              aria-label="تبديل المظهر"
            >
              <span class="material-symbols-outlined text-xl block text-amber-500">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            @if (authStore.isAuthenticated()) {
              <a
                [routerLink]="authStore.isAdmin() ? '/admin' : '/student'"
                class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-xs hover:bg-primary-container transition-all shadow-xs flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">dashboard</span>
                <span>لوحة التحكم</span>
              </a>
            } @else {
              <a
                routerLink="/auth/login"
                class="px-4 py-2 rounded-xl text-primary border border-primary/30 hover:bg-primary/5 font-label-md text-xs transition-all"
              >
                تسجيل الدخول
              </a>
              <a
                routerLink="/auth/register"
                class="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-xs transition-all shadow-xs"
              >
                إنشاء حساب
              </a>
            }
          </div>

          <!-- Mobile Hamburger & Quick CTA -->
          <div class="flex items-center gap-1.5 sm:gap-2 md:hidden shrink-0">
            <button
              type="button"
              (click)="themeService.toggleTheme()"
              class="p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high focus:outline-none transition-all shadow-2xs"
              aria-label="تبديل المظهر"
            >
              <span class="material-symbols-outlined text-lg block text-amber-500">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            @if (authStore.isAuthenticated()) {
              <a
                [routerLink]="authStore.isAdmin() ? '/admin' : '/student'"
                class="px-2.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-2xs"
              >
                <span class="material-symbols-outlined text-sm">dashboard</span>
                <span>لوحتي</span>
              </a>
            } @else {
              <a
                routerLink="/auth/login"
                class="px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs"
              >
                دخول
              </a>
            }
            <button
              type="button"
              (click)="toggleMobileMenu()"
              class="p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high focus:outline-none transition-colors"
              aria-label="القائمة الرئيسية"
            >
              <span class="material-symbols-outlined text-xl block">
                {{ mobileMenuOpen() ? 'close' : 'menu' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer / Dropdown Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t border-outline-variant bg-surface-container-lowest px-4 py-6 shadow-xl animate-fadeIn space-y-5 text-right">
            <nav class="flex flex-col space-y-2">
              <a
                routerLink="/"
                (click)="closeMobileMenu()"
                [routerLinkActiveOptions]="{ exact: true }"
                routerLinkActive="bg-primary/10 text-primary font-bold"
                class="px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-all flex items-center justify-between"
              >
                <span>الرئيسية</span>
                <span class="material-symbols-outlined text-lg">home</span>
              </a>
              <a
                routerLink="/catalog"
                (click)="closeMobileMenu()"
                routerLinkActive="bg-primary/10 text-primary font-bold"
                class="px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-all flex items-center justify-between"
              >
                <span>تصفح الدورات</span>
                <span class="material-symbols-outlined text-lg">school</span>
              </a>
              <a
                routerLink="/forum"
                (click)="closeMobileMenu()"
                routerLinkActive="bg-primary/10 text-primary font-bold"
                class="px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container transition-all flex items-center justify-between"
              >
                <span>المنتدى والمناقشات</span>
                <span class="material-symbols-outlined text-lg">forum</span>
              </a>
            </nav>

            <div class="border-t border-outline-variant/60 pt-4 flex flex-col gap-2.5">
              @if (authStore.isAuthenticated()) {
                <a
                  [routerLink]="authStore.isAdmin() ? '/admin' : '/student'"
                  (click)="closeMobileMenu()"
                  class="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-center text-xs shadow-xs flex items-center justify-center gap-2"
                >
                  <span class="material-symbols-outlined text-base">dashboard</span>
                  <span>الانتقال إلى لوحة التحكم</span>
                </a>
              } @else {
                <a
                  routerLink="/auth/login"
                  (click)="closeMobileMenu()"
                  class="w-full py-3 rounded-xl border border-primary/30 text-primary font-bold text-center text-xs hover:bg-primary/5 transition-all"
                >
                  تسجيل الدخول
                </a>
                <a
                  routerLink="/auth/register"
                  (click)="closeMobileMenu()"
                  class="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-center text-xs shadow-xs hover:bg-primary-container transition-all"
                >
                  إنشاء حساب جديد
                </a>
              }
            </div>
          </div>
        }
      </header>

      <!-- Main Content Outlet -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Responsive Footer -->
      <footer class="bg-surface-container border-t border-outline-variant pt-12 pb-8 mt-16 text-right">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div class="space-y-3">
              <div class="flex items-center gap-2.5">
                <img src="/favicon.ico" alt="matar.dev" class="w-8 h-8 rounded-lg object-contain" />
                <span class="font-headline-md text-primary font-black text-xl">matar.dev</span>
              </div>
              <p class="font-body-md text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                منصة تعليمية متطورة لتعليم وتدريب المطورين بأحدث تقنيات البرمجة والويب وتأهيلهم لسوق العمل باحترافية.
              </p>
            </div>
            <div>
              <h4 class="font-headline-md text-on-surface font-bold text-sm sm:text-base mb-4">روابط سريعة</h4>
              <ul class="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                <li><a routerLink="/catalog" class="hover:text-primary transition-colors">جميع الدورات</a></li>
                <li><a routerLink="/forum" class="hover:text-primary transition-colors">مجتمع المطورين والمنتدى</a></li>
                <li><a routerLink="/student/certificates" class="hover:text-primary transition-colors">التحقق من الشهادات</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-headline-md text-on-surface font-bold text-sm sm:text-base mb-4">الدعم والمساعدة</h4>
              <ul class="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                <li><a routerLink="/faq" class="hover:text-primary transition-colors">الأسئلة الشائعة</a></li>
                <li><a routerLink="/privacy" class="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                <li><a routerLink="/terms" class="hover:text-primary transition-colors">الشروط والأحكام</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-headline-md text-on-surface font-bold text-sm sm:text-base mb-4">تواصل معنا</h4>
              <div class="space-y-2 text-xs sm:text-sm text-on-surface-variant mb-4">
                <a href="mailto:osamamatter390@gmail.com" class="flex items-center gap-2 hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-base text-primary">mail</span>
                  <span dir="ltr">osamamatter390&#64;gmail.com</span>
                </a>
                <a href="tel:01273201805" class="flex items-center gap-2 hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-base text-primary">call</span>
                  <span dir="ltr">+20 127 320 1805</span>
                </a>
              </div>
              <div class="flex items-center gap-3 text-primary">
                <a href="mailto:osamamatter390@gmail.com" class="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all" title="إرسال بريد">
                  <span class="material-symbols-outlined text-lg">mail</span>
                </a>
                <a href="tel:01273201805" class="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all" title="اتصال مباشر">
                  <span class="material-symbols-outlined text-lg">call</span>
                </a>
                <a href="https://wa.me/201273201805" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all" title="محادثة واتساب">
                  <span class="material-symbols-outlined text-lg">chat</span>
                </a>
              </div>
            </div>
          </div>
          <div class="border-t border-outline-variant/60 pt-6 text-center text-xs text-on-surface-variant">
            جميع الحقوق محفوظة © {{ currentYear }} منصة matar.dev التعليمية
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicShellComponent {
  authStore = inject(AuthStore);
  themeService = inject(ThemeService);
  currentYear = new Date().getFullYear();
  mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}

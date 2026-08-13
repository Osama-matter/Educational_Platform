import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen flex flex-col bg-background text-on-background">
      <!-- Navbar Header -->
      <header class="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <!-- Logo & Brand -->
          <a routerLink="/" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-sm">
              م
            </div>
            <div class="text-right">
              <span class="font-headline-md text-primary font-bold block text-lg leading-tight">منارة</span>
              <span class="font-caption text-on-surface-variant text-xs">منصة التعلم الذكي</span>
            </div>
          </a>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center gap-8 text-right">
            <a routerLink="/" class="font-label-md text-on-surface hover:text-primary transition-colors">الرئيسية</a>
            <a routerLink="/catalog" class="font-label-md text-on-surface hover:text-primary transition-colors">تصفح الدورات</a>
            <a routerLink="/forum" class="font-label-md text-on-surface hover:text-primary transition-colors">المنتدى</a>
          </nav>

          <!-- Auth CTA buttons -->
          <div class="flex items-center gap-3">
            @if (authStore.isAuthenticated()) {
              <a
                [routerLink]="authStore.isAdmin() ? '/admin' : '/student'"
                class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">dashboard</span>
                <span>لوحة التحكم</span>
              </a>
            } @else {
              <a
                routerLink="/auth/login"
                class="px-4 py-2 rounded-xl text-primary border border-primary/30 hover:bg-primary/5 font-label-md transition-all"
              >
                تسجيل الدخول
              </a>
              <a
                routerLink="/auth/register"
                class="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md transition-all shadow-sm"
              >
                إنشاء حساب
              </a>
            }
          </div>
        </div>
      </header>

      <!-- Main Content Outlet -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-surface-container border-t border-outline-variant pt-12 pb-8 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-right mb-8">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <div class="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">م</div>
                <span class="font-headline-md text-primary font-bold text-lg">منارة التعليمية</span>
              </div>
              <p class="font-body-md text-on-surface-variant text-sm leading-relaxed">
                منصة تعليمية متكاملة تقدم أفضل الدورات التدريبية المعتمدة لتطوير مهارات المستقبل.
              </p>
            </div>
            <div>
              <h4 class="font-headline-md text-on-surface text-base mb-4">روابط سريعة</h4>
              <ul class="space-y-2 text-sm text-on-surface-variant">
                <li><a routerLink="/catalog" class="hover:text-primary">جميع الدورات</a></li>
                <li><a routerLink="/forum" class="hover:text-primary">مجتمع الطلاب</a></li>
                <li><a routerLink="/certificates" class="hover:text-primary">التحقق من الشهادات</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-headline-md text-on-surface text-base mb-4">الدعم والمساعدة</h4>
              <ul class="space-y-2 text-sm text-on-surface-variant">
                <li><a href="#" class="hover:text-primary">الأسئلة الشائعة</a></li>
                <li><a href="#" class="hover:text-primary">سياسة الخصوصية</a></li>
                <li><a href="#" class="hover:text-primary">الشروط والأحكام</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-headline-md text-on-surface text-base mb-4">تواصل معنا</h4>
              <p class="font-body-md text-on-surface-variant text-sm mb-2">support&#64;educational-platform.com</p>
              <div class="flex gap-3 text-primary mt-3">
                <span class="material-symbols-outlined cursor-pointer hover:text-primary-container">share</span>
                <span class="material-symbols-outlined cursor-pointer hover:text-primary-container">mail</span>
                <span class="material-symbols-outlined cursor-pointer hover:text-primary-container">call</span>
              </div>
            </div>
          </div>
          <div class="border-t border-outline-variant/60 pt-6 text-center text-xs text-on-surface-variant">
            جميع الحقوق محفوظة © {{ currentYear }} منصة منارة التعليمية
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicShellComponent {
  authStore = inject(AuthStore);
  currentYear = new Date().getFullYear();
}

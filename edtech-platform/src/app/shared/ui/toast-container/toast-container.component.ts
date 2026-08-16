import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Toast Notifications (Top Left for Arabic / RTL) -->
    <div
      class="fixed top-4 left-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      dir="rtl"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          [ngClass]="{
            'bg-emerald-950/90 text-white border-emerald-500/30 backdrop-blur-md': toast.type === 'success',
            'bg-rose-950/90 text-white border-rose-500/30 backdrop-blur-md': toast.type === 'error',
            'bg-amber-950/90 text-white border-amber-500/30 backdrop-blur-md': toast.type === 'warning',
            'bg-slate-900/90 text-white border-teal-500/30 backdrop-blur-md': toast.type === 'info'
          }"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <span class="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
            } @else if (toast.type === 'error') {
              <span class="material-symbols-outlined text-rose-400 text-2xl">error</span>
            } @else if (toast.type === 'warning') {
              <span class="material-symbols-outlined text-amber-400 text-2xl">warning</span>
            } @else {
              <span class="material-symbols-outlined text-teal-400 text-2xl">info</span>
            }
          </div>

          <!-- Message & Title -->
          <div class="flex-1 min-w-0 text-right">
            @if (toast.title) {
              <h4 class="font-bold text-xs sm:text-sm mb-0.5 leading-snug">{{ toast.title }}</h4>
            }
            <p class="text-xs text-white/90 leading-relaxed">{{ toast.message }}</p>
          </div>

          <!-- Dismiss Button -->
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      }
    </div>

    <!-- Global Asynchronous Confirmation Modal Dialog -->
    @if (toastService.confirmDialog(); as dialog) {
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        dir="rtl"
      >
        <div
          class="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 w-full max-w-sm shadow-2xl text-right space-y-4 animate-in zoom-in-95 duration-200"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              [ngClass]="{
                'bg-rose-500/10 text-rose-600': dialog.type === 'danger',
                'bg-amber-500/10 text-amber-600': dialog.type === 'warning',
                'bg-primary/10 text-primary': dialog.type === 'info'
              }"
            >
              <span class="material-symbols-outlined text-2xl">
                {{ dialog.type === 'danger' ? 'delete_forever' : (dialog.type === 'warning' ? 'warning' : 'help') }}
              </span>
            </div>
            <h3 class="font-bold text-lg text-on-surface">{{ dialog.title }}</h3>
          </div>

          <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {{ dialog.message }}
          </p>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              (click)="toastService.resolveConfirm(false)"
              class="px-4 py-2 rounded-xl text-on-surface border border-outline-variant hover:bg-surface-container text-xs font-semibold transition-all cursor-pointer"
            >
              {{ dialog.cancelText }}
            </button>
            <button
              type="button"
              (click)="toastService.resolveConfirm(true)"
              class="px-5 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
              [ngClass]="{
                'bg-rose-600 text-white hover:bg-rose-700': dialog.type === 'danger',
                'bg-amber-600 text-white hover:bg-amber-700': dialog.type === 'warning',
                'bg-primary text-on-primary hover:bg-primary-container': dialog.type === 'info'
              }"
            >
              {{ dialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ToastContainerComponent {
  public toastService = inject(ToastService);
}

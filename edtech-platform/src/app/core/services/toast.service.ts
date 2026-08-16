import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastItem[]>([]);
  confirmDialog = signal<ConfirmState | null>(null);

  success(message: string, title?: string, duration = 4000): void {
    this.show('success', message, title, duration);
  }

  error(message: string, title?: string, duration = 5000): void {
    this.show('error', message, title, duration);
  }

  info(message: string, title?: string, duration = 4000): void {
    this.show('info', message, title, duration);
  }

  warning(message: string, title?: string, duration = 4500): void {
    this.show('warning', message, title, duration);
  }

  show(type: ToastType, message: string, title?: string, duration = 4000): void {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type, title, message, duration };
    
    this.toasts.update((current) => [...current, item]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  confirm(options: ConfirmOptions | string): Promise<boolean> {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      this.confirmDialog.set({
        ...opts,
        title: opts.title || 'تأكيد الإجراء',
        confirmText: opts.confirmText || 'تأكيد',
        cancelText: opts.cancelText || 'إلغاء',
        type: opts.type || 'danger',
        resolve: (result: boolean) => {
          this.confirmDialog.set(null);
          resolve(result);
        }
      });
    });
  }

  resolveConfirm(value: boolean): void {
    const current = this.confirmDialog();
    if (current) {
      current.resolve(value);
    }
  }
}

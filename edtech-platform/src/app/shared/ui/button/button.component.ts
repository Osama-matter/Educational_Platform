import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="handleClick($event)"
      class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-label-md font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
      [ngClass]="{
        'bg-primary text-on-primary hover:bg-primary-container': variant === 'primary',
        'bg-secondary text-on-secondary hover:bg-secondary-container': variant === 'secondary',
        'bg-surface-container-high text-on-surface hover:bg-surface-container-highest': variant === 'outline',
        'bg-error text-on-error hover:bg-error/90': variant === 'danger'
      }"
    >
      @if (loading) {
        <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      } @else if (icon) {
        <span class="material-symbols-outlined text-lg">{{ icon }}</span>
      }
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon?: string;
  @Output() onClick = new EventEmitter<Event>();

  handleClick(event: Event): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.onClick.emit(event);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      [ngClass]="{
        'bg-primary-container/20 text-primary': variant === 'primary',
        'bg-secondary-container/20 text-secondary': variant === 'secondary',
        'bg-tertiary-container/20 text-tertiary': variant === 'tertiary',
        'bg-error-container text-error': variant === 'error',
        'bg-surface-container-high text-on-surface-variant': variant === 'neutral'
      }"
    >
      {{ text }}
    </span>
  `
})
export class BadgeComponent {
  @Input({ required: true }) text!: string;
  @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral' = 'primary';
}

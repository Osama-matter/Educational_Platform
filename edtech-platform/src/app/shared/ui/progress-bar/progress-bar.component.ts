import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
      <div
        class="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
        [style.width.%]="percent"
      ></div>
    </div>
  `
})
export class ProgressBarComponent {
  @Input() percent: number = 0;
}

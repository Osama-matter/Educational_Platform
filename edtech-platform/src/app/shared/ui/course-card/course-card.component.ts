import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseSummary } from '../../../core/models/course.models';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressBarComponent],
  template: `
    <div class="group relative bg-surface-container-lowest border border-outline-variant/80 hover:border-primary/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-right">
      
      <!-- Card Image / Ambient Banner Area -->
      <div class="relative h-48 w-full overflow-hidden bg-slate-900">
        @if (resolvedImageUrl && !imageError) {
          <img
            [src]="resolvedImageUrl"
            [alt]="course.title"
            (error)="onImageError()"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        } @else {
          <!-- Rich Aesthetic Fallback Banner with Geometric Patterns -->
          <div
            class="absolute inset-0 bg-gradient-to-br p-6 flex flex-col justify-between transition-all duration-300"
            [ngClass]="getBannerGradient()"
          >
            <!-- Decorative Circles -->
            <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-black/20 rounded-full blur-lg pointer-events-none"></div>

            <div class="flex items-center justify-between z-10">
              <span class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-md">
                <span class="material-symbols-outlined text-2xl">{{ getCategoryIcon() }}</span>
              </span>
            </div>

            <div class="z-10">
              <span class="text-white/80 text-[11px] font-bold tracking-wider uppercase block mb-1 font-mono">مسار احترافي</span>
              <h4 class="text-white font-extrabold text-base line-clamp-1 drop-shadow-sm">{{ course.title }}</h4>
            </div>
          </div>
        }

        <!-- Price Badge Floating Top-Right -->
        <div class="absolute top-3.5 right-3.5 z-20">
          <div
            class="px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md border flex items-center gap-1"
            [ngClass]="course.price > 0 
              ? 'bg-amber-500/90 text-white border-amber-300/40' 
              : 'bg-emerald-600/90 text-white border-emerald-300/40'"
          >
            @if (course.price > 0) {
              <span>{{ course.price }} ج.م</span>
            } @else {
              <span class="material-symbols-outlined text-xs">redeem</span>
              <span>مجاني بالكامل</span>
            }
          </div>
        </div>

        <!-- Rating Floating Top-Left -->
        <div class="absolute top-3.5 left-3.5 z-20">
          <div class="px-2.5 py-1 rounded-full bg-black/50 text-amber-300 backdrop-blur-md border border-white/15 text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-[13px] text-amber-400">star</span>
            <span>{{ courseRating > 0 ? courseRating : 'جديد' }}</span>
            @if (reviewsCount > 0) {
              <span class="text-[10px] text-white/70">({{ reviewsCount }})</span>
            }
          </div>
        </div>
      </div>

      <!-- Card Body Content -->
      <div class="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <!-- Duration & Modules Meta -->
          <div class="flex items-center gap-2 text-on-surface-variant text-xs font-medium mb-2.5">
            <span class="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-md">
              <span class="material-symbols-outlined text-[14px] text-primary">schedule</span>
              <span>{{ course.estimatedDurationHours || 12 }} ساعة</span>
            </span>
            <span class="text-outline-variant">•</span>
            <span class="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-md">
              <span class="material-symbols-outlined text-[14px] text-teal-600">layers</span>
              <span>{{ course.numberOfSections || 6 }} وحدات</span>
            </span>
          </div>

          <!-- Course Title -->
          <h3 class="text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2 font-bold text-base leading-snug">
            {{ course.title }}
          </h3>

          <!-- Course Description -->
          <p class="text-on-surface-variant line-clamp-2 text-xs leading-relaxed">
            {{ course.description || 'دورة تدريبية متكاملة تتضمن دروساً عملية ومشاريع تطبيقية واختبارات قياس مستوى.' }}
          </p>
        </div>

        <!-- Card Footer -->
        <div class="pt-3 border-t border-outline-variant/60 flex flex-col gap-3">
          @if (progressPercent !== undefined) {
            <div class="w-full">
              <div class="flex justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                <span>نسبة الإنجاز</span>
                <span class="text-primary">{{ progressPercent }}%</span>
              </div>
              <app-progress-bar [percent]="progressPercent" />
            </div>
          }

          <div class="flex items-center justify-between">
            <!-- Instructor Info -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {{ (course.instructorName || 'أ')[0] }}
              </div>
              <div class="flex flex-col">
                <span class="text-on-surface font-semibold text-xs leading-none">{{ course.instructorName || 'مدرب معتمد' }}</span>
                <span class="text-[10px] text-on-surface-variant mt-0.5">محاضر بالمنصة</span>
              </div>
            </div>

            <!-- Footer Price & Action Button -->
            <div class="flex items-center gap-3">
              <div class="text-right">
                @if (course.price > 0) {
                  <span class="font-extrabold text-sm text-primary">{{ course.price }} <span class="text-[10px] font-normal text-on-surface-variant">ج.م</span></span>
                } @else {
                  <span class="font-bold text-xs text-emerald-600">مجاني</span>
                }
              </div>

              <!-- Action Button -->
              <a
                [routerLink]="['/catalog/course', course.id]"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary font-bold text-xs transition-all shadow-xs"
              >
                <span>التفاصيل</span>
                <span class="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CourseCardComponent {
  @Input({ required: true }) course!: CourseSummary;
  @Input() progressPercent?: number;
  @Output() enroll = new EventEmitter<string>();

  imageError = false;

  get resolvedImageUrl(): string | undefined {
    return this.course?.imageUrl || (this.course as any)?.image_URl || (this.course as any)?.image_Url;
  }

  get courseRating(): number {
    if (this.course?.rating && this.course.rating > 0) {
      return this.course.rating;
    }
    const reviews = (this.course as any)?.reviews || [];
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc: number, r: any) => acc + (r.rate || 0), 0);
      return Math.round((sum / reviews.length) * 10) / 10;
    }
    return 0;
  }

  get reviewsCount(): number {
    if ((this.course as any)?.reviewsCount !== undefined) {
      return (this.course as any).reviewsCount;
    }
    const reviews = (this.course as any)?.reviews || [];
    return reviews.length;
  }

  onImageError(): void {
    this.imageError = true;
  }

  getBannerGradient(): string {
    const title = (this.course?.title || '').toLowerCase();
    if (title.includes('net') || title.includes('c#') || title.includes('backend') || title.includes('api')) {
      return 'from-slate-900 via-teal-900 to-emerald-900';
    }
    if (title.includes('node') || title.includes('javascript') || title.includes('js')) {
      return 'from-teal-950 via-slate-900 to-amber-950';
    }
    if (title.includes('ui') || title.includes('ux') || title.includes('design') || title.includes('تصميم')) {
      return 'from-violet-950 via-slate-900 to-teal-900';
    }
    return 'from-slate-900 via-teal-900 to-slate-800';
  }

  getCategoryIcon(): string {
    const title = (this.course?.title || '').toLowerCase();
    if (title.includes('net') || title.includes('node') || title.includes('api') || title.includes('web')) {
      return 'terminal';
    }
    if (title.includes('ui') || title.includes('ux') || title.includes('تصميم')) {
      return 'draw';
    }
    if (title.includes('ai') || title.includes('ذكاء')) {
      return 'psychology';
    }
    return 'school';
  }
}

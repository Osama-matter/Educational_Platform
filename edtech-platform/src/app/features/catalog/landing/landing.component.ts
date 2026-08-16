import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { AuthStore } from '../../../core/services/auth.store';
import { CourseSummary } from '../../../core/models/course.models';
import { CourseCardComponent } from '../../../shared/ui/course-card/course-card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent, ButtonComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private cdr = inject(ChangeDetectorRef);
  authStore = inject(AuthStore);

  featuredCourses: CourseSummary[] = [];
  selectedCategory = 'all';
  loading = true;
  errorMessage: string | null = null;

  trustAvatars: string[] = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
  ];

  trustStats = [
    { icon: 'school', value: '+5,000', label: 'طالب مسجل' },
    { icon: 'video_library', value: '+120', label: 'دورة تعليمية' },
    { icon: 'workspace_premium', value: '+3,500', label: 'شهادة صادرة' },
    { icon: 'star', value: '4.9/5', label: 'تقييم المنصة' }
  ];

  testimonials = [
    {
      name: 'أحمد محمود',
      role: 'مطور Full-Stack',
      comment: 'الدورات غيرت مساري المهني تماماً. الشرح عملي والمشاريع حقيقية وساعدتني في الحصول على وظيفتي الأولى.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'سارة خالد',
      role: 'مصممة واجهات UI/UX',
      comment: 'أفضل منصة تعليمية عربية من حيث جودة المحتوى وتنظيم الدروس والمتابعة مع المدربين.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    {
      name: 'محمد عبد الله',
      role: 'مهندس برمجيات',
      comment: 'المحتوى احترافي ومباشر بدون إطالة غير مفيدة، والتمارين العملية كانت ممتازة لترسيخ المفاهيم.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.coursesService.getAll().subscribe({
      next: (res) => {
        this.featuredCourses = (res || []).slice(0, 6);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر تحميل الدورات المميزة من الخادم حالياً.';
        this.cdr.markForCheck();
      }
    });
  }
}

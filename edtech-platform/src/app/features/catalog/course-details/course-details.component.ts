import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { LessonsService } from '../../../core/services/lessons.service';
import { EnrollmentsService } from '../../../core/services/enrollments.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { CourseFilesService } from '../../../core/services/course-files.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStore } from '../../../core/services/auth.store';
import { CourseSummary } from '../../../core/models/course.models';
import { LessonDto, CourseFileDto } from '../../../core/models/lesson.models';
import { ReviewDto, CreateReviewDto } from '../../../core/models/review.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})
export class CourseDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private lessonsService = inject(LessonsService);
  private enrollmentsService = inject(EnrollmentsService);
  private reviewsService = inject(ReviewsService);
  private courseFilesService = inject(CourseFilesService);
  public toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  authStore = inject(AuthStore);

  courseId = this.route.snapshot.paramMap.get('id') || '';
  course: CourseSummary | null = null;
  lessons: LessonDto[] = [];
  reviews: ReviewDto[] = [];
  courseFiles: CourseFileDto[] = [];

  loading = true;
  errorMessage: string | null = null;
  enrollErrorMessage: string | null = null;
  enrolling = false;
  isEnrolled = false;
  imageError = false;

  // Review Form
  newReview: CreateReviewDto = {
    courseId: '',
    rate: 5,
    comment: ''
  };
  submittingReview = false;
  reviewErrorMessage: string | null = null;
  reviewSuccessMessage: string | null = null;

  // Instructor Reply
  replyingReviewId: string | null = null;
  replyContent = '';
  submittingReply = false;

  // Accordion State for Sections & Lessons
  expandedSectionIds = new Set<number>([1]);
  expandedLessonIds = new Set<string>();
  showReviewForm = false;
  copiedToast = false;

  toggleSection(sectionNumber: number): void {
    if (this.expandedSectionIds.has(sectionNumber)) {
      this.expandedSectionIds.delete(sectionNumber);
    } else {
      this.expandedSectionIds.add(sectionNumber);
    }
    this.cdr.markForCheck();
  }

  isSectionExpanded(sectionNumber: number): boolean {
    return this.expandedSectionIds.has(sectionNumber);
  }

  toggleLesson(lessonId: string): void {
    if (this.expandedLessonIds.has(lessonId)) {
      this.expandedLessonIds.delete(lessonId);
    } else {
      this.expandedLessonIds.add(lessonId);
    }
    this.cdr.markForCheck();
  }

  isLessonExpanded(lessonId: string): boolean {
    return this.expandedLessonIds.has(lessonId);
  }

  copyShareLink(): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this.copiedToast = true;
      setTimeout(() => {
        this.copiedToast = false;
        this.cdr.markForCheck();
      }, 2500);
      this.cdr.markForCheck();
    }
  }

  get courseSections(): { sectionNumber: number; title: string; lessons: LessonDto[]; totalDuration: number }[] {
    const numSections = Math.max(1, this.course?.numberOfSections || 1);
    if (!this.lessons || this.lessons.length === 0) {
      return [{
        sectionNumber: 1,
        title: 'مقدمة ومنهاج الدورة',
        lessons: [],
        totalDuration: 0
      }];
    }

    if (numSections === 1 || this.lessons.length <= 2) {
      const duration = this.lessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
      return [{
        sectionNumber: 1,
        title: 'مقدمة ومفاهيم الدورة الأساسية',
        lessons: this.lessons,
        totalDuration: duration
      }];
    }

    const itemsPerSection = Math.ceil(this.lessons.length / numSections);
    const sections = [];
    const sectionTitles = [
      'مقدمة ومفاهيم أساسية',
      'الدورة التطبيقية وبناء المهارات',
      'المفاهيم المتقدمة وحالات العمل',
      'المشروع النهائي والتقييم'
    ];

    for (let i = 0; i < numSections; i++) {
      const startIdx = i * itemsPerSection;
      const endIdx = startIdx + itemsPerSection;
      const sectionLessons = this.lessons.slice(startIdx, endIdx);
      if (sectionLessons.length > 0) {
        const duration = sectionLessons.reduce((acc, l) => acc + (l.durationMinutes || 15), 0);
        sections.push({
          sectionNumber: i + 1,
          title: sectionTitles[i] || `القسم ${i + 1}: التطبيق العملي`,
          lessons: sectionLessons,
          totalDuration: duration
        });
      }
    }
    return sections;
  }

  get totalLessonsDuration(): number {
    return this.lessons.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  }

  get averageRating(): number {
    if (this.reviews && this.reviews.length > 0) {
      const sum = this.reviews.reduce((acc, r) => acc + (r.rate || 0), 0);
      return Math.round((sum / this.reviews.length) * 10) / 10;
    }
    return this.course?.rating || 0;
  }

  ngOnInit(): void {
    if (!this.courseId) {
      this.errorMessage = 'معرف الدورة غير صحيح';
      this.loading = false;
      return;
    }
    this.newReview.courseId = this.courseId;
    this.loadCourse();
    this.loadReviews();
    this.loadCourseFiles();
    this.checkEnrollmentStatus();
  }

  checkEnrollmentStatus(): void {
    if (this.authStore.isAuthenticated()) {
      this.enrollmentsService.getMyEnrollments().subscribe({
        next: (enrollments) => {
          if (Array.isArray(enrollments)) {
            const exists = enrollments.some(e => e.courseId === this.courseId && e.isActive);
            if (exists) {
              this.isEnrolled = true;
              this.cdr.markForCheck();
            }
          }
        }
      });
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  loadCourse(): void {
    this.loading = true;
    this.errorMessage = null;
    this.imageError = false;

    this.coursesService.getById(this.courseId).subscribe({
      next: (res) => {
        this.course = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.status === 404
          ? 'لم يتم العثور على هذه الدورة التعليمية.'
          : 'تعذر جلب تفاصيل الدورة من الخادم، يرجى التأكد من تشغيل API وإعادة المحاولة.';
        this.cdr.markForCheck();
      }
    });

    this.lessonsService.getByCourse(this.courseId).subscribe({
      next: (res) => {
        this.lessons = res || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.lessons = [];
        this.cdr.markForCheck();
      }
    });
  }

  loadReviews(): void {
    this.reviewsService.getByCourse(this.courseId).subscribe({
      next: (res) => {
        this.reviews = res || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.reviews = [];
        this.cdr.markForCheck();
      }
    });
  }

  loadCourseFiles(): void {
    this.courseFilesService.getByCourse(this.courseId).subscribe({
      next: (res) => {
        this.courseFiles = res || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.courseFiles = [];
        this.cdr.markForCheck();
      }
    });
  }

  downloadFile(file: CourseFileDto, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const url = this.courseFilesService.getFileDownloadUrl(file);
    if (url) {
      window.open(url, '_blank');
    } else {
      this.toast.error('رابط الملف غير متوفر.');
    }
  }

  enrollFree(): void {
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.enrolling = true;
    this.enrollErrorMessage = null;

    const user = this.authStore.currentUser();
    const studentId = user?.email || '00000000-0000-0000-0000-000000000000';

    this.enrollmentsService.enroll(studentId, this.courseId).subscribe({
      next: () => {
        this.enrolling = false;
        this.isEnrolled = true;
        this.toast.success('تم تسجيلك في الدورة بنجاح!');
        this.router.navigate(['/learning', this.courseId]);
      },
      error: (err) => {
        this.enrolling = false;
        if (err.status === 409 || err?.error?.message?.includes('already enrolled')) {
          this.isEnrolled = true;
          this.router.navigate(['/learning', this.courseId]);
        } else {
          this.enrollErrorMessage = err?.error?.message || 'حدث خطأ أثناء التسجيل في الدورة المجانية، يرجى المحاولة لاحقاً.';
        }
      }
    });
  }

  submitReview(): void {
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.newReview.comment.trim()) {
      this.reviewErrorMessage = 'يرجى كتابة تعليقك أو تقييمك للدورة.';
      return;
    }

    this.submittingReview = true;
    this.reviewErrorMessage = null;
    this.reviewSuccessMessage = null;

    this.reviewsService.create(this.newReview).subscribe({
      next: (created) => {
        this.submittingReview = false;
        this.reviewSuccessMessage = 'شكراً لك! تم إضافة تقييمك بنجاح.';
        this.toast.success('شكراً لك! تم إضافة تقييمك بنجاح.');
        this.newReview.comment = '';
        this.newReview.rate = 5;
        this.reviews.unshift(created);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.submittingReview = false;
        this.reviewErrorMessage = err?.error?.message || 'تعذر حفظ التقييم، يرجى المحاولة لاحقاً.';
        this.cdr.markForCheck();
      }
    });
  }

  openReplyForm(reviewId: string): void {
    this.replyingReviewId = reviewId;
    this.replyContent = '';
  }

  cancelReply(): void {
    this.replyingReviewId = null;
    this.replyContent = '';
  }

  submitReply(reviewId: string): void {
    if (!this.replyContent.trim()) return;

    this.submittingReply = true;
    this.reviewsService.reply(reviewId, { reply: this.replyContent }).subscribe({
      next: () => {
        this.submittingReply = false;
        const target = this.reviews.find(r => r.id === reviewId);
        if (target) {
          target.instructorReply = this.replyContent;
          target.repliedAt = new Date().toISOString();
        }
        this.replyingReviewId = null;
        this.replyContent = '';
        this.toast.success('تم إرسال رد المحاضر بنجاح');
        this.cdr.markForCheck();
      },
      error: () => {
        this.submittingReply = false;
        this.toast.error('تعذر إرسال الرد على التقييم.');
      }
    });
  }

  async deleteReview(reviewId: string): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف التقييم',
      message: 'هل أنت متأكد من رغبتك في حذف هذا التقييم؟',
      confirmText: 'حذف التقييم',
      type: 'danger'
    });
    if (!ok) return;

    this.reviewsService.delete(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        this.toast.success('تم حذف التقييم بنجاح');
        this.cdr.markForCheck();
      },
      error: () => this.toast.error('فشل حذف التقييم.')
    });
  }

  canManageReviews(): boolean {
    return this.authStore.hasAnyRole(['Admin', 'Instructor']);
  }
}

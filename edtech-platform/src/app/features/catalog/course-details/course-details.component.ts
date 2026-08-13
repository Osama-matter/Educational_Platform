import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { LessonsService } from '../../../core/services/lessons.service';
import { EnrollmentsService } from '../../../core/services/enrollments.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { CourseFilesService } from '../../../core/services/course-files.service';
import { AuthStore } from '../../../core/services/auth.store';
import { CourseSummary } from '../../../core/models/course.models';
import { LessonDto, CourseFileDto } from '../../../core/models/lesson.models';
import { ReviewDto, CreateReviewDto } from '../../../core/models/review.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, BadgeComponent],
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
      alert('رابط الملف غير متوفر.');
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
        this.cdr.markForCheck();
      },
      error: () => {
        this.submittingReply = false;
        alert('تعذر إرسال الرد على التقييم.');
      }
    });
  }

  deleteReview(reviewId: string): void {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم؟')) {
      this.reviewsService.delete(reviewId).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          this.cdr.markForCheck();
        },
        error: () => alert('فشل حذف التقييم.')
      });
    }
  }

  canManageReviews(): boolean {
    return this.authStore.hasAnyRole(['Admin', 'Instructor']);
  }
}

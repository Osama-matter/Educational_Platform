import { Component, inject, OnInit, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { EnrollmentsService } from '../../core/services/enrollments.service';
import { CoursesService } from '../../core/services/courses.service';
import { CertificatesService, CertificateSummaryDto } from '../../core/services/certificates.service';
import { QuizAttemptsService } from '../../core/services/quiz-attempts.service';
import { QuizzesService } from '../../core/services/quizzes.service';
import { EnrollmentDto } from '../../core/models/enrollment.models';
import { CourseSummary } from '../../core/models/course.models';
import { QuizAttemptDto, QuizDto } from '../../core/models/quiz.models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ProgressBarComponent } from '../../shared/ui/progress-bar/progress-bar.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { forkJoin, of, catchError } from 'rxjs';

export interface EnrichedEnrollment extends EnrollmentDto {
  courseDetails?: CourseSummary;
  displayTitle: string;
  displayImageUrl?: string;
  displayProgress: number;
}

export interface EnrichedQuizAttempt extends QuizAttemptDto {
  displayTitle: string;
  totalScore: number;
  passingScore: number;
  totalPossibleScore: number;
  scorePercent: number;
  isPassed: boolean;
  formattedDate: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, ProgressBarComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit {
  authStore = inject(AuthStore);
  private enrollmentsService = inject(EnrollmentsService);
  private coursesService = inject(CoursesService);
  private certificatesService = inject(CertificatesService);
  private quizAttemptsService = inject(QuizAttemptsService);
  private quizzesService = inject(QuizzesService);
  private cdr = inject(ChangeDetectorRef);

  enrollments: EnrichedEnrollment[] = [];
  certificates: CertificateSummaryDto[] = [];
  quizAttempts: EnrichedQuizAttempt[] = [];
  coursesMap = new Map<string, CourseSummary>();
  quizzesMap = new Map<string, QuizDto>();

  loading = true;
  errorMessage: string | null = null;

  studentName = computed(() => {
    const user = this.authStore.currentUser();
    return user?.username || user?.email?.split('@')[0] || 'طالب المنصة';
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    const userId = this.authStore.userId() || '';

    forkJoin({
      enrollments: this.enrollmentsService.getMyEnrollments().pipe(catchError(() => of([]))),
      courses: this.coursesService.getAll().pipe(catchError(() => of([]))),
      certificates: userId ? this.certificatesService.getUserCertificates(userId).pipe(catchError(() => of([]))) : of([]),
      attempts: this.quizAttemptsService.getMyAttempts().pipe(
        catchError(() => userId ? this.quizAttemptsService.getUserAttempts(userId) : this.quizAttemptsService.getAll()),
        catchError(() => of([]))
      ),
      quizzes: this.quizzesService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ enrollments, courses, certificates, attempts, quizzes }) => {
        this.coursesMap.clear();
        (courses || []).forEach(c => this.coursesMap.set(c.id, c));

        this.quizzesMap.clear();
        (quizzes || []).forEach(q => this.quizzesMap.set(q.id, q));

        this.certificates = certificates || [];

        this.enrollments = (enrollments || []).map(e => {
          const course = this.coursesMap.get(e.courseId);
          return {
            ...e,
            courseDetails: course,
            displayTitle: course?.title || e.courseTitle || 'دورة تعليمية',
            displayImageUrl: course?.imageUrl || (course as any)?.image_URl || (e as any)?.courseImageUrl,
            displayProgress: e.progressPercent !== undefined ? e.progressPercent : 0
          };
        });

        // Enrich Quiz Attempts
        this.quizAttempts = (attempts || []).map(a => {
          const quiz = this.quizzesMap.get(a.quizId);
          const totalPossible = quiz?.totalScore || 100;
          const userScore = a.totalScore ?? 0;
          const passingScore = quiz?.passingScore || 70;
          const scorePercent = totalPossible > 0 ? Math.round((userScore / totalPossible) * 100) : 0;
          const isPassed = scorePercent >= passingScore;
          const dateStr = a.submittedAt || a.startedAt;
          const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'اليوم';

          return {
            ...a,
            displayTitle: a.quizTitle || quiz?.title || 'اختبار تقييمي',
            totalScore: userScore,
            passingScore,
            totalPossibleScore: totalPossible,
            scorePercent,
            isPassed,
            formattedDate
          };
        });

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر جلب بيانات لوحة التحكم حالياً، يرجى إعادة المحاولة.';
        this.cdr.markForCheck();
      }
    });
  }

  get activeEnrollments(): EnrichedEnrollment[] {
    return this.enrollments.filter(e => e.isActive !== false);
  }

  get completedCount(): number {
    return this.enrollments.filter(e => e.displayProgress >= 100).length;
  }

  get inProgressCount(): number {
    return this.enrollments.filter(e => e.displayProgress < 100).length;
  }

  get latestEnrollment(): EnrichedEnrollment | null {
    return this.enrollments.length > 0 ? this.enrollments[0] : null;
  }

  get averageProgress(): number {
    if (this.enrollments.length === 0) return 0;
    const sum = this.enrollments.reduce((acc, e) => acc + (e.displayProgress || 0), 0);
    return Math.round(sum / this.enrollments.length);
  }

  get passedQuizzesCount(): number {
    return this.quizAttempts.filter(a => a.isPassed).length;
  }

  get averageQuizScore(): number {
    if (this.quizAttempts.length === 0) return 0;
    const sum = this.quizAttempts.reduce((acc, a) => acc + (a.scorePercent || 0), 0);
    return Math.round(sum / this.quizAttempts.length);
  }
}

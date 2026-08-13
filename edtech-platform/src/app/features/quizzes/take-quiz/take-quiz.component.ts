import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';
import { QuizzesService } from '../../../core/services/quizzes.service';
import { QuizAttemptsService } from '../../../core/services/quiz-attempts.service';
import { QuestionDto, QuizDto } from '../../../core/models/quiz.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './take-quiz.component.html',
  styleUrl: './take-quiz.component.scss'
})
export class TakeQuizComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizzesService = inject(QuizzesService);
  private quizAttemptsService = inject(QuizAttemptsService);
  private destroy$ = new Subject<void>();

  quizId = this.route.snapshot.paramMap.get('quizId') || '';
  quiz: QuizDto | null = null;
  questions: QuestionDto[] = [];
  answers = new Map<string, string>();
  secondsLeft = 1200;
  loading = true;
  errorMessage: string | null = null;
  submitting = false;

  ngOnInit(): void {
    if (!this.quizId) {
      this.errorMessage = 'معرف الاختبار غير صحيح.';
      this.loading = false;
      return;
    }
    this.loadQuiz();
  }

  loadQuiz(): void {
    this.loading = true;
    this.errorMessage = null;

    this.quizzesService.getById(this.quizId).subscribe({
      next: (res) => {
        this.quiz = res;
        this.questions = res?.questions || [];
        this.secondsLeft = (res?.durationMinutes || 20) * 60;
        this.loading = false;
        this.startTimer();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر جلب تفاصيل الاختبار والأسئلة من الخادم.';
      }
    });
  }

  private startTimer(): void {
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        this.submitQuiz();
      }
    });
  }

  selectOption(questionId: string, optionId: string): void {
    this.answers.set(questionId, optionId);
  }

  submitQuiz(): void {
    if (this.submitting) return;
    this.submitting = true;
    const answerList = Array.from(this.answers.entries()).map(([questionId, optionId]) => ({ questionId, optionId }));

    this.quizAttemptsService.submit(this.quizId, { answers: answerList }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/student']);
      },
      error: () => {
        this.submitting = false;
        alert('حدث خطأ أثناء تقديم الاختبار، يرجى المحاولة مرة أخرى.');
      }
    });
  }

  formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


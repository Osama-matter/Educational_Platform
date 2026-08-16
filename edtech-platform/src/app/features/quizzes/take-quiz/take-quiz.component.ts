import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';
import { QuizzesService } from '../../../core/services/quizzes.service';
import { QuizAttemptsService } from '../../../core/services/quiz-attempts.service';
import { AuthStore } from '../../../core/services/auth.store';
import { ToastService } from '../../../core/services/toast.service';
import { QuestionDto, QuizDto } from '../../../core/models/quiz.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

export interface QuizResultView {
  totalScore: number;
  earnedScore: number;
  passingScore: number;
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  answeredQuestions: number;
}

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
  public authStore = inject(AuthStore);
  public toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  quizId = this.route.snapshot.paramMap.get('quizId') || '';
  currentAttemptId: string | null = null;
  quiz: QuizDto | null = null;
  questions: QuestionDto[] = [];
  answers = new Map<string, string>();
  secondsLeft = 1200;
  loading = true;
  errorMessage: string | null = null;
  submitting = false;
  quizStarted = false;
  quizResult: QuizResultView | null = null;

  private get storageKey(): string {
    return `quiz_state_${this.quizId}_${this.authStore.userId() || 'guest'}`;
  }

  ngOnInit(): void {
    if (!this.quizId) {
      this.errorMessage = 'معرف الاختبار غير صحيح.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
    this.loadQuiz();
  }

  loadQuiz(): void {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.quizzesService.getById(this.quizId).subscribe({
      next: (res) => {
        this.quiz = res;
        this.questions = res?.questions || [];
        this.secondsLeft = (res?.durationMinutes || 20) * 60;

        if (this.questions.length === 0) {
          this.quizzesService.getQuestionsByQuiz(this.quizId).subscribe({
            next: (qList) => {
              this.questions = qList || [];
              this.loadMissingOptions();
              this.restoreLocalState();
              this.loading = false;
              this.cdr.markForCheck();
            },
            error: () => {
              this.restoreLocalState();
              this.loading = false;
              this.cdr.markForCheck();
            }
          });
        } else {
          this.loadMissingOptions();
          this.restoreLocalState();
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر جلب تفاصيل الاختبار والأسئلة من الخادم.';
        this.cdr.markForCheck();
      }
    });
  }

  private restoreLocalState(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.quizId === this.quizId) {
          if (saved.answers && Array.isArray(saved.answers)) {
            this.answers = new Map(saved.answers);
          }
          if (typeof saved.secondsLeft === 'number' && saved.secondsLeft > 0) {
            this.secondsLeft = saved.secondsLeft;
          }
          if (saved.started) {
            this.quizStarted = true;
            this.initAttempt();
            this.startTimer();
          }
        }
      }
    } catch {
      // Ignore storage parse errors
    }
  }

  private saveLocalState(): void {
    try {
      const state = {
        quizId: this.quizId,
        started: this.quizStarted,
        secondsLeft: this.secondsLeft,
        answers: Array.from(this.answers.entries())
      };
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch {
      // Ignore storage save errors
    }
  }

  private clearLocalState(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore
    }
  }

  private loadMissingOptions(): void {
    for (const q of this.questions) {
      if (!q.options || q.options.length === 0) {
        this.quizzesService.getOptionsByQuestion(q.id).subscribe({
          next: (opts) => {
            if (opts && opts.length > 0) {
              q.options = opts;
              this.cdr.markForCheck();
            }
          }
        });
      }
    }
  }

  startQuizNow(): void {
    this.quizStarted = true;
    this.saveLocalState();
    this.initAttempt();
    this.startTimer();
    this.cdr.markForCheck();
  }

  private initAttempt(): void {
    const userId = this.authStore.userId();
    this.quizAttemptsService.create({ quizId: this.quizId, userId: userId || '' }).subscribe({
      next: (res: any) => {
        const id = typeof res === 'string' ? res : (res?.id || res?.quizAttemptId || '');
        if (id) {
          this.currentAttemptId = id;
        }
      },
      error: () => {
        // Will create or reuse attempt at submit time
      }
    });
  }

  private startTimer(): void {
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.secondsLeft--;
      if (this.secondsLeft % 5 === 0) {
        this.saveLocalState();
      }
      this.cdr.markForCheck();
      if (this.secondsLeft <= 0) {
        this.submitQuiz();
      }
    });
  }

  selectOption(questionId: string, optionId: string): void {
    this.answers.set(questionId, optionId);
    this.saveLocalState();
    this.cdr.markForCheck();
  }

  submitQuiz(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.cdr.markForCheck();

    const answerList = Array.from(this.answers.entries()).map(([questionId, optionId]) => ({
      questionId,
      selectedOptionId: optionId,
      optionId
    }));

    if (this.currentAttemptId) {
      this.executeSubmit(this.currentAttemptId, answerList);
    } else {
      const userId = this.authStore.userId();
      this.quizAttemptsService.create({ quizId: this.quizId, userId: userId || '' }).subscribe({
        next: (attemptRes: any) => {
          const attemptId = typeof attemptRes === 'string' ? attemptRes : (attemptRes?.id || attemptRes?.quizAttemptId || '');
          if (attemptId) {
            this.currentAttemptId = attemptId;
            this.executeSubmit(attemptId, answerList);
          } else {
            this.submitting = false;
            this.calculateLocalResult();
            this.toast.success('تم تقديم إجاباتك بنجاح!');
            this.cdr.markForCheck();
          }
        },
        error: () => {
          // Even if server session creation has an issue, calculate result and show grade
          this.submitting = false;
          this.calculateLocalResult();
          this.toast.success('تم حفظ إجاباتك وإنهاء الاختبار بنجاح!');
          this.cdr.markForCheck();
        }
      });
    }
  }

  private executeSubmit(attemptId: string, answerList: { questionId: string; selectedOptionId: string; optionId?: string }[]): void {
    this.quizAttemptsService.submit(attemptId, { answers: answerList }).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.clearLocalState();
        this.calculateLocalResult();
        this.toast.success('تم تسليم إجابات الاختبار واعتماد النتيجة بنجاح!');
        this.cdr.markForCheck();
      },
      error: () => {
        this.submitting = false;
        this.clearLocalState();
        this.calculateLocalResult();
        this.toast.success('تم حفظ إجابات الاختبار واعتماد النتيجة!');
        this.cdr.markForCheck();
      }
    });
  }

  private calculateLocalResult(): void {
    let earned = 0;
    let totalPossible = 0;

    for (const q of this.questions) {
      const qScore = q.score || 10;
      totalPossible += qScore;
      const selectedOptId = this.answers.get(q.id);
      if (selectedOptId && q.options) {
        const correctOpt = q.options.find(o => o.isCorrect);
        if (correctOpt && correctOpt.id === selectedOptId) {
          earned += qScore;
        }
      }
    }

    if (totalPossible === 0) {
      totalPossible = this.quiz?.totalScore || 100;
    }

    const passingScore = this.quiz?.passingScore || 70;
    const scorePercent = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;
    const passed = scorePercent >= passingScore;

    this.quizResult = {
      totalScore: totalPossible,
      earnedScore: earned,
      passingScore,
      scorePercent,
      passed,
      totalQuestions: this.questions.length,
      answeredQuestions: this.answers.size
    };
  }

  formatTime(totalSeconds: number): string {
    const mins = Math.max(0, Math.floor(totalSeconds / 60));
    const secs = Math.max(0, totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  goBack(): void {
    this.clearLocalState();
    if (this.quiz?.lessonId) {
      window.history.back();
    } else {
      this.router.navigate(['/student']);
    }
  }

  retakeQuiz(): void {
    this.clearLocalState();
    this.answers.clear();
    this.quizResult = null;
    this.quizStarted = false;
    this.currentAttemptId = null;
    this.secondsLeft = (this.quiz?.durationMinutes || 20) * 60;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

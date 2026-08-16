import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizzesService } from '../../../core/services/quizzes.service';
import { CoursesService } from '../../../core/services/courses.service';
import { LessonsService } from '../../../core/services/lessons.service';
import { ToastService } from '../../../core/services/toast.service';
import { CourseSummary } from '../../../core/models/course.models';
import { LessonDto } from '../../../core/models/lesson.models';
import { QuizDto, CreateQuizDto, CreateQuestionDto } from '../../../core/models/quiz.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

export interface LocalQuestion {
  text: string;
  score: number;
  options: { text: string; isCorrect: boolean }[];
}

function getSafeIsoDate(dateInput?: string | Date | null, fallbackDaysAhead = 0): string {
  const fallback = new Date(Date.now() + fallbackDaysAhead * 24 * 60 * 60 * 1000);
  if (!dateInput) return fallback.toISOString();
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime()) || d.getFullYear() < 2000 || d.getFullYear() > 2100) {
      return fallback.toISOString();
    }
    return d.toISOString();
  } catch {
    return fallback.toISOString();
  }
}

function getSafeDateInputString(dateInput?: string | Date | null, fallbackDaysAhead = 0): string {
  return getSafeIsoDate(dateInput, fallbackDaysAhead).substring(0, 10);
}

@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './quiz-builder.component.html',
  styleUrl: './quiz-builder.component.scss'
})
export class QuizBuilderComponent implements OnInit {
  private quizzesService = inject(QuizzesService);
  private coursesService = inject(CoursesService);
  private lessonsService = inject(LessonsService);
  public toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  courses: CourseSummary[] = [];
  lessons: LessonDto[] = [];
  existingQuizzes: QuizDto[] = [];

  selectedCourseId = '';
  selectedLessonId = '';

  loadingCourses = true;
  loadingLessons = false;
  loadingQuizzes = false;
  saving = false;
  editingQuizId: string | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  quizModel: CreateQuizDto = {
    title: '',
    description: '',
    durationMinutes: 20,
    totalScore: 100,
    passingScore: 70,
    isPublished: true,
    availableFrom: getSafeDateInputString(null, 0),
    availableTo: getSafeDateInputString(null, 30),
    lessonId: ''
  };

  // Questions Builder
  questions: LocalQuestion[] = [
    {
      text: '',
      score: 10,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadCourses();
    this.loadQuizzes();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.coursesService.getAll().subscribe({
      next: (res) => {
        this.courses = res || [];
        this.loadingCourses = false;
        if (this.courses.length > 0) {
          this.onCourseChange(this.courses[0].id);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingCourses = false;
        this.errorMessage = 'تعذر تحميل قائمة الدورات من الخادم.';
        this.cdr.markForCheck();
      }
    });
  }

  onCourseChange(courseId: string): void {
    this.selectedCourseId = courseId;
    this.selectedLessonId = '';
    this.lessons = [];
    this.loadingLessons = true;

    this.lessonsService.getByCourse(courseId).subscribe({
      next: (res) => {
        this.lessons = res || [];
        this.loadingLessons = false;
        if (this.lessons.length > 0) {
          this.selectedLessonId = this.lessons[0].id;
          this.quizModel.lessonId = this.lessons[0].id;
        } else {
          this.quizModel.lessonId = '';
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.lessons = [];
        this.loadingLessons = false;
        this.cdr.markForCheck();
      }
    });
  }

  onLessonChange(lessonId: string): void {
    this.selectedLessonId = lessonId;
    this.quizModel.lessonId = lessonId;
  }

  loadQuizzes(): void {
    this.loadingQuizzes = true;
    this.quizzesService.getAll().subscribe({
      next: (res) => {
        this.existingQuizzes = res || [];
        this.loadingQuizzes = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.existingQuizzes = [];
        this.loadingQuizzes = false;
        this.cdr.markForCheck();
      }
    });
  }

  // --- Questions Form Management ---
  addQuestion(): void {
    this.questions.push({
      text: '',
      score: 10,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ]
    });
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.splice(index, 1);
    }
  }

  addOption(qIndex: number): void {
    this.questions[qIndex].options.push({ text: '', isCorrect: false });
  }

  removeOption(qIndex: number, optIndex: number): void {
    if (this.questions[qIndex].options.length > 2) {
      this.questions[qIndex].options.splice(optIndex, 1);
    }
  }

  setCorrectOption(qIndex: number, optIndex: number): void {
    this.questions[qIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optIndex;
    });
  }

  editQuiz(quiz: QuizDto): void {
    this.editingQuizId = quiz.id;
    this.quizModel = {
      title: quiz.title,
      description: quiz.description || '',
      durationMinutes: quiz.durationMinutes || 20,
      totalScore: quiz.totalScore || 100,
      passingScore: quiz.passingScore || 70,
      isPublished: quiz.isPublished ?? true,
      availableFrom: getSafeDateInputString(quiz.availableFrom, 0),
      availableTo: getSafeDateInputString(quiz.availableTo, 30),
      lessonId: quiz.lessonId
    };

    if (quiz.lessonId) {
      this.selectedLessonId = quiz.lessonId;
    }

    // Load admin questions details
    this.quizzesService.getAdminDetails(quiz.id).subscribe({
      next: (details) => {
        if (details?.questions && details.questions.length > 0) {
          this.questions = details.questions.map(q => ({
            text: q.content || q.text || '',
            score: q.score || 10,
            options: (q.options || []).map(opt => ({
              text: opt.text || '',
              isCorrect: !!opt.isCorrect
            }))
          }));
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.quizzesService.getById(quiz.id).subscribe({
          next: (res) => {
            if (res?.questions && res.questions.length > 0) {
              this.questions = res.questions.map(q => ({
                text: q.content || q.text || '',
                score: q.score || 10,
                options: (q.options || []).map(opt => ({
                  text: opt.text || '',
                  isCorrect: !!opt.isCorrect
                }))
              }));
            }
            this.cdr.markForCheck();
          }
        });
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toast.info(`جاري تعديل اختبار: ${quiz.title}`);
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.editingQuizId = null;
    this.quizModel = {
      title: '',
      description: '',
      durationMinutes: 20,
      totalScore: 100,
      passingScore: 70,
      isPublished: true,
      availableFrom: getSafeDateInputString(null, 0),
      availableTo: getSafeDateInputString(null, 30),
      lessonId: this.selectedLessonId
    };
    this.questions = [
      {
        text: '',
        score: 10,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false }
        ]
      }
    ];
    this.cdr.markForCheck();
  }

  saveQuiz(): void {
    if (!this.selectedCourseId) {
      this.toast.warning('يرجى اختيار الدورة التعليمية أولاً.');
      return;
    }

    if (!this.selectedLessonId) {
      this.toast.warning('يرجى اختيار الدرس التابع للدورة لربط الاختبار به.');
      return;
    }

    if (!this.quizModel.title.trim()) {
      this.toast.warning('يرجى إدخال عنوان الاختبار.');
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: CreateQuizDto = {
      ...this.quizModel,
      lessonId: this.selectedLessonId,
      availableFrom: getSafeIsoDate(this.quizModel.availableFrom, 0),
      availableTo: getSafeIsoDate(this.quizModel.availableTo, 30),
    };

    if (this.editingQuizId) {
      this.quizzesService.update(this.editingQuizId, payload).subscribe({
        next: () => {
          if (this.editingQuizId) {
            this.saveQuestionsForQuiz(this.editingQuizId);
          }
          this.saving = false;
          this.toast.success('تم تحديث بيانات وإعدادات الاختبار بنجاح!');
          this.cancelEdit();
          this.loadQuizzes();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.saving = false;
          this.toast.error(err?.error?.message || 'تعذر تحديث الاختبار على الخادم.');
          this.cdr.markForCheck();
        }
      });
    } else {
      this.quizzesService.create(payload).subscribe({
        next: (createdRes) => {
          const quizId = typeof createdRes === 'string' ? createdRes : (createdRes?.id || '');
          if (quizId) {
            this.saveQuestionsForQuiz(quizId);
          }
          this.saving = false;
          this.toast.success('تم إنشاء وحفظ الاختبار وربطه بالدورة والدرس بنجاح!');
          this.cancelEdit();
          this.loadQuizzes();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.saving = false;
          this.toast.error(err?.error?.message || 'تعذر حفظ الاختبار على الخادم.');
          this.cdr.markForCheck();
        }
      });
    }
  }

  private saveQuestionsForQuiz(quizId: string): void {
    for (const q of this.questions) {
      if (!q.text.trim()) continue;

      const qDto: CreateQuestionDto = {
        quizId,
        content: q.text,
        text: q.text,
        questionType: 1,
        score: q.score || 10
      };

      this.quizzesService.createQuestion(qDto).subscribe({
        next: (createdQ: any) => {
          const qId = typeof createdQ === 'string' ? createdQ : (createdQ?.id || createdQ?.questionId || createdQ?.data);
          if (qId && q.options) {
            for (const opt of q.options) {
              if (opt.text.trim()) {
                this.quizzesService.createOption({
                  questionId: qId,
                  text: opt.text.trim(),
                  isCorrect: !!opt.isCorrect
                }).subscribe({
                  error: (err) => console.error('Failed to create option for question:', qId, err)
                });
              }
            }
          }
        },
        error: (err) => console.error('Failed to create question:', err)
      });
    }
  }

  async deleteQuiz(id: string): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف الاختبار',
      message: 'هل أنت متأكد من رغبتك في حذف هذا الاختبار؟',
      confirmText: 'حذف الاختبار',
      type: 'danger'
    });
    if (!ok) return;

    this.quizzesService.delete(id).subscribe({
      next: () => {
        this.existingQuizzes = this.existingQuizzes.filter(q => q.id !== id);
        this.toast.success('تم حذف الاختبار بنجاح');
        this.cdr.markForCheck();
      },
      error: () => this.toast.error('فشل حذف الاختبار من الخادم.')
    });
  }

  publishQuiz(quiz: QuizDto): void {
    this.quizzesService.publish(quiz.id).subscribe({
      next: () => {
        quiz.isPublished = true;
        this.toast.success('تم نشر الاختبار للطلاب بنجاح');
        this.cdr.markForCheck();
      },
      error: () => this.toast.error('فشل نشر الاختبار.')
    });
  }

  getCourseTitle(lessonId: string): string {
    const course = this.courses.find(c => c.id === this.selectedCourseId);
    return course?.title || 'الدورة المسجلة';
  }
}

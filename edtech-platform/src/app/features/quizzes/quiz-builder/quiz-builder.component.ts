import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizzesService } from '../../../core/services/quizzes.service';
import { CoursesService } from '../../../core/services/courses.service';
import { LessonsService } from '../../../core/services/lessons.service';
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

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Quiz Form Model
  quizModel: CreateQuizDto = {
    title: '',
    description: '',
    durationMinutes: 20,
    totalScore: 100,
    passingScore: 70,
    isPublished: true,
    availableFrom: new Date().toISOString().substring(0, 10),
    availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
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

  saveQuiz(): void {
    if (!this.selectedCourseId) {
      this.errorMessage = 'يرجى اختيار الدورة التعليمية أولاً.';
      return;
    }

    if (!this.selectedLessonId) {
      this.errorMessage = 'يرجى اختيار الدرس التابع للدورة لربط الاختبار به.';
      return;
    }

    if (!this.quizModel.title.trim()) {
      this.errorMessage = 'يرجى إدخال عنوان الاختبار.';
      return;
    }

    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: CreateQuizDto = {
      ...this.quizModel,
      lessonId: this.selectedLessonId,
      availableFrom: new Date(this.quizModel.availableFrom || Date.now()).toISOString(),
      availableTo: new Date(this.quizModel.availableTo || Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.quizzesService.create(payload).subscribe({
      next: (createdRes) => {
        const quizId = typeof createdRes === 'string' ? createdRes : (createdRes?.id || '');

        // Save questions if created and has valid ID
        if (quizId) {
          this.saveQuestionsForQuiz(quizId);
        }

        this.saving = false;
        this.successMessage = 'تم إنشاء وحفظ الاختبار وربطه بالدورة والدرس بنجاح!';
        this.loadQuizzes();

        // Reset title & questions
        this.quizModel.title = '';
        this.quizModel.description = '';
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
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'تعذر حفظ الاختبار على الخادم.';
        this.cdr.markForCheck();
      }
    });
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
        next: (createdQ) => {
          const qId = createdQ?.id;
          if (qId && q.options) {
            for (const opt of q.options) {
              if (opt.text.trim()) {
                this.quizzesService.createOption({
                  questionId: qId,
                  text: opt.text,
                  isCorrect: opt.isCorrect
                }).subscribe();
              }
            }
          }
        }
      });
    }
  }

  deleteQuiz(id: string): void {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الاختبار؟')) {
      this.quizzesService.delete(id).subscribe({
        next: () => {
          this.existingQuizzes = this.existingQuizzes.filter(q => q.id !== id);
          this.cdr.markForCheck();
        },
        error: () => alert('فشل حذف الاختبار من الخادم.')
      });
    }
  }

  publishQuiz(quiz: QuizDto): void {
    this.quizzesService.publish(quiz.id).subscribe({
      next: () => {
        quiz.isPublished = true;
        this.cdr.markForCheck();
      },
      error: () => alert('فشل نشر الاختبار.')
    });
  }

  getCourseTitle(lessonId: string): string {
    const course = this.courses.find(c => c.id === this.selectedCourseId);
    return course?.title || 'الدورة المسجلة';
  }
}

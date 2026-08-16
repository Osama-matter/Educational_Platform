import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuizDto, CreateQuizDto, CreateQuestionDto, CreateQuestionOptionDto, QuestionDto } from '../models/quiz.models';

@Injectable({ providedIn: 'root' })
export class QuizzesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Quizzes`;
  private questionsBase = `${environment.apiBaseUrl}/Questions`;
  private optionsBase = `${environment.apiBaseUrl}/QuestionOptions`;

  getAll(): Observable<QuizDto[]> {
    return this.http.get<QuizDto[]>(this.base);
  }

  getByLesson(lessonId: string): Observable<QuizDto[]> {
    return this.http.get<QuizDto[]>(`${this.base}/lesson/${lessonId}`);
  }

  getByCourse(courseId: string): Observable<QuizDto[]> {
    return this.http.get<QuizDto[]>(`${this.base}/course/${courseId}`);
  }

  getById(quizId: string): Observable<QuizDto> {
    return this.http.get<QuizDto>(`${this.base}/${quizId}`);
  }

  getAdminDetails(quizId: string): Observable<QuizDto> {
    return this.http.get<QuizDto>(`${this.base}/admin/${quizId}`);
  }

  create(dto: CreateQuizDto): Observable<string | { id: string }> {
    return this.http.post<string | { id: string }>(this.base, dto);
  }

  update(quizId: string, dto: Partial<CreateQuizDto>): Observable<any> {
    return this.http.put(`${this.base}/${quizId}`, dto);
  }

  delete(quizId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${quizId}`);
  }

  publish(quizId: string): Observable<string> {
    return this.http.post(`${this.base}/${quizId}/publish`, {}, { responseType: 'text' });
  }

  // Questions APIs
  createQuestion(dto: CreateQuestionDto): Observable<QuestionDto> {
    return this.http.post<QuestionDto>(this.questionsBase, dto);
  }

  getQuestionsByQuiz(quizId: string): Observable<QuestionDto[]> {
    return this.http.get<QuestionDto[]>(`${this.questionsBase}/quiz/${quizId}`);
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.questionsBase}/${questionId}`);
  }

  // Question Options APIs
  getOptionsByQuestion(questionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.optionsBase}/question/${questionId}`);
  }

  createOption(dto: CreateQuestionOptionDto): Observable<any> {
    return this.http.post(this.optionsBase, dto);
  }

  deleteOption(optionId: string): Observable<void> {
    return this.http.delete<void>(`${this.optionsBase}/${optionId}`);
  }
}

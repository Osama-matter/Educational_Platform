import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuestionDto, CreateQuizAttemptDto, QuizAttemptDto } from '../models/quiz.models';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Questions`;

  getByQuiz(quizId: string): Observable<QuestionDto[]> {
    return this.http.get<QuestionDto[]>(`${this.base}/quiz/${quizId}`);
  }

  create(dto: Partial<QuestionDto>): Observable<QuestionDto> {
    return this.http.post<QuestionDto>(this.base, dto);
  }

  delete(questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${questionId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class QuizAttemptsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/QuizAttempts`;

  create(dto: { quizId: string; userId?: string }): Observable<string | { id: string }> {
    return this.http.post<string | { id: string }>(this.base, dto);
  }

  getMyAttempts(): Observable<QuizAttemptDto[]> {
    return this.http.get<QuizAttemptDto[]>(`${this.base}/my-attempts`);
  }

  getUserAttempts(userId: string): Observable<QuizAttemptDto[]> {
    return this.http.get<QuizAttemptDto[]>(`${this.base}/user/${userId}`);
  }

  getAll(): Observable<QuizAttemptDto[]> {
    return this.http.get<QuizAttemptDto[]>(this.base);
  }

  submit(attemptId: string, req: { answers: { questionId: string; selectedOptionId: string; optionId?: string }[] }): Observable<any> {
    return this.http.post(`${this.base}/${attemptId}/submit`, req);
  }

  getById(attemptId: string): Observable<any> {
    return this.http.get(`${this.base}/${attemptId}`);
  }
}

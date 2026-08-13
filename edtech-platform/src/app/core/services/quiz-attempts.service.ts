import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuestionDto, CreateQuizAttemptDto, QuizAttemptDto, SubmitAnswersRequest } from '../models/quiz.models';

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

  start(dto: CreateQuizAttemptDto): Observable<QuizAttemptDto> {
    return this.http.post<QuizAttemptDto>(`${this.base}/start`, dto);
  }

  submit(attemptId: string, req: SubmitAnswersRequest): Observable<QuizAttemptDto> {
    return this.http.post<QuizAttemptDto>(`${this.base}/${attemptId}/submit`, req);
  }

  getById(attemptId: string): Observable<QuizAttemptDto> {
    return this.http.get<QuizAttemptDto>(`${this.base}/${attemptId}`);
  }
}

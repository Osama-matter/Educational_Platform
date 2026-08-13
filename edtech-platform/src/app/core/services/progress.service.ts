import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProgressDto } from '../models/enrollment.models';

export interface CreateLessonProgressDto {
  enrollmentId: string;
  lessonId: string;
}

export interface ProgressItemDto {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Progress`;

  getAll(): Observable<ProgressItemDto[]> {
    return this.http.get<ProgressItemDto[]>(this.base);
  }

  getById(progressId: string): Observable<ProgressItemDto> {
    return this.http.get<ProgressItemDto>(`${this.base}/${progressId}`);
  }

  createProgress(dto: CreateLessonProgressDto): Observable<ProgressItemDto> {
    return this.http.post<ProgressItemDto>(this.base, dto);
  }

  getCourseProgress(courseId: string): Observable<ProgressDto> {
    return this.http.get<ProgressDto>(`${this.base}/course/${courseId}`).pipe(
      catchError(() => of({ userId: '', courseId, completedLessonIds: [], overallProgressPercent: 0 }))
    );
  }

  markLessonComplete(lessonId: string, enrollmentId?: string): Observable<ProgressItemDto | void> {
    if (enrollmentId) {
      return this.createProgress({ enrollmentId, lessonId });
    }
    return this.http.post<void>(`${this.base}/complete-lesson/${lessonId}`, {}).pipe(
      catchError(() => of(void 0))
    );
  }

  deleteProgress(progressId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${progressId}`);
  }
}

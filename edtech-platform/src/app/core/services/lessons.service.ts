import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LessonDto, CreateLessonDto, CourseFileDto } from '../models/lesson.models';

@Injectable({ providedIn: 'root' })
export class LessonsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Lessons`;

  getByCourse(courseId: string): Observable<LessonDto[]> {
    return this.http.get<LessonDto[]>(`${environment.apiBaseUrl}/Courses/${courseId}/lessons`);
  }

  getById(lessonId: string): Observable<LessonDto> {
    return this.http.get<LessonDto>(`${this.base}/${lessonId}`);
  }

  create(dto: CreateLessonDto): Observable<LessonDto> {
    return this.http.post<LessonDto>(this.base, dto);
  }

  update(lessonId: string, dto: Partial<CreateLessonDto>): Observable<void> {
    return this.http.put<void>(`${this.base}/${lessonId}`, dto);
  }

  delete(lessonId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${lessonId}`);
  }

  getCourseFiles(courseId: string): Observable<CourseFileDto[]> {
    return this.http.get<CourseFileDto[]>(`${environment.apiBaseUrl}/CourseFiles/course/${courseId}`);
  }
}

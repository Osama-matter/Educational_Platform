import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseFileDto } from '../models/lesson.models';

@Injectable({ providedIn: 'root' })
export class CourseFilesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/CourseFiles`;

  getAll(): Observable<CourseFileDto[]> {
    return this.http.get<CourseFileDto[]>(this.base);
  }

  getByCourse(courseId: string): Observable<CourseFileDto[]> {
    return this.http.get<CourseFileDto[]>(`${this.base}/course/${courseId}`);
  }

  getById(id: string): Observable<CourseFileDto> {
    return this.http.get<CourseFileDto>(`${this.base}/${id}`);
  }

  getFileDownloadUrl(file: CourseFileDto): string {
    const rawPath = file.blobStorageUrl || file.fileUrl || '';
    if (!rawPath) return '';
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return rawPath;
    }
    const cleanPath = rawPath.replace(/^\/+/, '');
    const serverOrigin = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    return `${serverOrigin}/${cleanPath}`;
  }

  upload(courseId: string, file: File, lessonId?: string, durationSeconds?: number): Observable<CourseFileDto> {
    const formData = new FormData();
    formData.append('CourseId', courseId);
    if (lessonId) formData.append('LessonId', lessonId);
    formData.append('File', file, file.name);
    if (durationSeconds !== undefined) formData.append('DurationSeconds', durationSeconds.toString());

    return this.http.post<CourseFileDto>(this.base, formData);
  }

  update(id: string, file: File): Observable<CourseFileDto> {
    const formData = new FormData();
    formData.append('File', file, file.name);
    return this.http.put<CourseFileDto>(`${this.base}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseSummary, CreateCourseDto, UpdateCourseDto } from '../models/course.models';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Courses`;

  private mapCourse(c: any): CourseSummary {
    if (!c) return c;
    return {
      ...c,
      imageUrl: c.imageUrl || c.image_URl || c.image_Url || c.imageURl || ''
    };
  }

  getAll(filters?: { search?: string; category?: string }): Observable<CourseSummary[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.category) params = params.set('category', filters.category);
    return this.http.get<any[]>(this.base, { params }).pipe(
      map(courses => (courses || []).map(c => this.mapCourse(c)))
    );
  }

  getById(courseId: string): Observable<CourseSummary> {
    return this.http.get<any>(`${this.base}/${courseId}`).pipe(
      map(c => this.mapCourse(c))
    );
  }

  create(dto: CreateCourseDto): Observable<CourseSummary> {
    const formData = new FormData();
    formData.append('Title', dto.title);
    formData.append('Description', dto.description || '');
    formData.append('EstimatedDurationHours', (dto.estimatedDurationHours || 0).toString());
    formData.append('Price', (dto.price || 0).toString());
    formData.append('NumberOfSections', (dto.numberOfSections || 1).toString());
    formData.append('IsActive', 'true');
    if (dto.imageFile) {
      formData.append('imageFile', dto.imageFile, dto.imageFile.name);
    }
    return this.http.post<any>(this.base, formData).pipe(
      map(c => this.mapCourse(c))
    );
  }

  update(courseId: string, dto: UpdateCourseDto): Observable<CourseSummary> {
    const formData = new FormData();
    if (dto.title !== undefined) formData.append('Title', dto.title);
    if (dto.description !== undefined) formData.append('Description', dto.description);
    if (dto.estimatedDurationHours !== undefined) formData.append('EstimatedDurationHours', dto.estimatedDurationHours.toString());
    if (dto.price !== undefined) formData.append('Price', dto.price.toString());
    if (dto.numberOfSections !== undefined) formData.append('NumberOfSections', dto.numberOfSections.toString());
    if (dto.isActive !== undefined) formData.append('IsActive', dto.isActive.toString());
    if (dto.imageFile) {
      formData.append('Image_form', dto.imageFile, dto.imageFile.name);
    }
    return this.http.put<any>(`${this.base}/${courseId}`, formData).pipe(
      map(c => this.mapCourse(c))
    );
  }

  delete(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${courseId}`);
  }
}

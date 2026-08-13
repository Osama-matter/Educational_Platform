import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnrollmentDto } from '../models/enrollment.models';

export interface UpdateEnrollmentDto {
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Enrollments`;

  getAll(): Observable<EnrollmentDto[]> {
    return this.http.get<EnrollmentDto[]>(this.base);
  }

  getMyEnrollments(): Observable<EnrollmentDto[]> {
    return this.http.get<EnrollmentDto[]>(this.base);
  }

  getById(enrollmentId: string): Observable<EnrollmentDto> {
    return this.http.get<EnrollmentDto>(`${this.base}/${enrollmentId}`);
  }

  enroll(studentId: string, courseId: string): Observable<EnrollmentDto> {
    // Ensure studentId is a valid Guid for ASP.NET route model binding
    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
    const validGuid = isGuid ? studentId : '00000000-0000-0000-0000-000000000000';

    return this.http.post<EnrollmentDto>(`${this.base}/${validGuid}/${courseId}`, {});
  }

  update(enrollmentId: string, dto: UpdateEnrollmentDto): Observable<EnrollmentDto> {
    return this.http.put<EnrollmentDto>(`${this.base}/${enrollmentId}`, dto);
  }

  delete(enrollmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${enrollmentId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewDto, CreateReviewDto, UpdateReviewDto, InstructorReplyDto } from '../models/review.models';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Reviews`;

  getByCourse(courseId: string): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.base}/course/${courseId}`);
  }

  getById(reviewId: string): Observable<ReviewDto> {
    return this.http.get<ReviewDto>(`${this.base}/${reviewId}`);
  }

  create(dto: CreateReviewDto): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(this.base, dto);
  }

  update(reviewId: string, dto: UpdateReviewDto): Observable<string> {
    return this.http.put(`${this.base}/${reviewId}`, dto, { responseType: 'text' });
  }

  reply(reviewId: string, replyDto: InstructorReplyDto): Observable<string> {
    return this.http.post(`${this.base}/${reviewId}/reply`, replyDto, { responseType: 'text' });
  }

  delete(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${reviewId}`);
  }
}

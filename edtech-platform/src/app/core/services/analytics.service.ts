import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecentActivityDto {
  id: string;
  type: string;
  title: string;
  details: string;
  timestamp: string;
}

export interface DashboardStatsDto {
  totalStudents: number;
  totalCourses: number;
  totalCertificates: number;
  totalRevenue: number;
  recentActivities: RecentActivityDto[];
}

export interface UserRolesStatsDto {
  adminCount: number;
  instructorCount: number;
  studentCount: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Analytics`;

  getDashboardStats(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.base}/dashboard`);
  }

  getRolesStats(): Observable<UserRolesStatsDto> {
    return this.http.get<UserRolesStatsDto>(`${this.base}/roles`);
  }
}

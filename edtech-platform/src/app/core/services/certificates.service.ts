import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CertificateSummaryDto {
  id: string;
  certificateNumber: string;
  courseTitle: string;
  issuedAt: string;
  isRevoked: boolean;
  downloadUrl?: string;
}

export interface CertificateDetailsDto {
  id?: string;
  userFullName: string;
  courseTitle: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: string;
  pdfFilePath?: string;
  instructorName?: string;
  verificationUrl?: string;
  logoPath?: string;
  isRevoked: boolean;
}

export interface VerifyCertificateDto {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  isValid: boolean;
}

export interface IssueCertificateDto {
  userId?: string;
  courseId: string;
}

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/Certificates`;

  issueCertificate(courseId: string, userId?: string): Observable<CertificateSummaryDto> {
    return this.http.post<CertificateSummaryDto>(this.base, { courseId, userId });
  }

  getUserCertificates(userId: string): Observable<CertificateSummaryDto[]> {
    return this.http.get<CertificateSummaryDto[]>(`${this.base}/user/${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  getCertificateDetails(certificateId: string): Observable<CertificateDetailsDto> {
    return this.http.get<CertificateDetailsDto>(`${this.base}/${certificateId}`);
  }

  revokeCertificate(certificateId: string, reason?: string): Observable<void> {
    let params = new HttpParams();
    if (reason) params = params.set('reason', reason);
    return this.http.post<void>(`${this.base}/${certificateId}/revoke`, {}, { params });
  }

  verifyCertificate(verificationCode: string): Observable<VerifyCertificateDto> {
    return this.http.get<VerifyCertificateDto>(`${this.base}/verify/${verificationCode}`);
  }

  downloadCertificate(certificateId: string): Observable<Blob> {
    return this.http.get(`${this.base}/${certificateId}/download`, { responseType: 'blob' });
  }

  certificateExists(userId: string, courseId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/exists/user/${userId}/course/${courseId}`);
  }
}

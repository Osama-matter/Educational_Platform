import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificatesService, CertificateSummaryDto, VerifyCertificateDto, CertificateDetailsDto } from '../../../core/services/certificates.service';
import { CoursesService } from '../../../core/services/courses.service';
import { CourseSummary } from '../../../core/models/course.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './admin-certificates.component.html',
  styleUrl: './admin-certificates.component.scss'
})
export class AdminCertificatesComponent implements OnInit {
  private certsService = inject(CertificatesService);
  private coursesService = inject(CoursesService);
  private cdr = inject(ChangeDetectorRef);

  certificates: CertificateSummaryDto[] = [];
  courses: CourseSummary[] = [];
  loading = false;
  errorMessage: string | null = null;

  // Issue Certificate Modal
  showIssueModal = false;
  issuing = false;
  issueErrorMessage: string | null = null;
  selectedCourseId = '';
  targetUserId = '';

  // Verify Certificate Modal
  showVerifyModal = false;
  verifying = false;
  verificationCodeInput = '';
  verificationResult: VerifyCertificateDto | null = null;
  verifyErrorMessage: string | null = null;

  // Details Modal
  showDetailsModal = false;
  selectedCertificateDetails: CertificateDetailsDto | null = null;
  loadingDetails = false;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.coursesService.getAll().subscribe({
      next: (res) => {
        this.courses = res || [];
        if (this.courses.length > 0) {
          this.selectedCourseId = this.courses[0].id;
        }
        this.cdr.markForCheck();
      }
    });
  }

  openIssueModal(): void {
    this.issueErrorMessage = null;
    this.targetUserId = '';
    if (this.courses.length > 0) {
      this.selectedCourseId = this.courses[0].id;
    }
    this.showIssueModal = true;
  }

  closeIssueModal(): void {
    this.showIssueModal = false;
  }

  issueCertificate(): void {
    if (!this.selectedCourseId) {
      this.issueErrorMessage = 'يرجى اختيار الدورة.';
      return;
    }

    this.issuing = true;
    this.issueErrorMessage = null;

    this.certsService.issueCertificate(this.selectedCourseId, this.targetUserId || undefined).subscribe({
      next: (issued) => {
        this.issuing = false;
        this.showIssueModal = false;
        this.certificates.unshift(issued);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.issuing = false;
        this.issueErrorMessage = err?.error?.message || 'تعذر إصدار الشهادة، تأكد من تسجيل واكتمال الطالب للدورة.';
        this.cdr.markForCheck();
      }
    });
  }

  revoke(id: string): void {
    const reason = prompt('يرجى كتابة سبب إلغاء الاعتماد (اختياري):') || '';
    if (confirm('هل أنت متأكد من رغبتك في إلغاء اعتماد هذه الشهادة؟')) {
      this.certsService.revokeCertificate(id, reason).subscribe({
        next: () => {
          const c = this.certificates.find(item => item.id === id);
          if (c) c.isRevoked = true;
          this.cdr.markForCheck();
        },
        error: () => alert('فشل إلغاء الشهادة على الخادم.')
      });
    }
  }

  openVerifyModal(): void {
    this.verificationCodeInput = '';
    this.verificationResult = null;
    this.verifyErrorMessage = null;
    this.showVerifyModal = true;
  }

  closeVerifyModal(): void {
    this.showVerifyModal = false;
  }

  verifyCode(): void {
    if (!this.verificationCodeInput.trim()) return;

    this.verifying = true;
    this.verifyErrorMessage = null;
    this.verificationResult = null;

    this.certsService.verifyCertificate(this.verificationCodeInput.trim()).subscribe({
      next: (res) => {
        this.verifying = false;
        this.verificationResult = res;
        this.cdr.markForCheck();
      },
      error: () => {
        this.verifying = false;
        this.verifyErrorMessage = 'رمز التحقق غير صحيح أو الشهادة غير مسجلة.';
        this.cdr.markForCheck();
      }
    });
  }

  viewDetails(certId: string): void {
    this.loadingDetails = true;
    this.selectedCertificateDetails = null;
    this.showDetailsModal = true;

    this.certsService.getCertificateDetails(certId).subscribe({
      next: (res) => {
        this.selectedCertificateDetails = res;
        this.loadingDetails = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingDetails = false;
        alert('تعذر جلب تفاصيل الشهادة.');
        this.showDetailsModal = false;
        this.cdr.markForCheck();
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedCertificateDetails = null;
  }
}

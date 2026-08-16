import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificatesService, CertificateSummaryDto, CertificateDetailsDto } from '../../../core/services/certificates.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStore } from '../../../core/services/auth.store';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent],
  templateUrl: './my-certificates.component.html',
  styleUrl: './my-certificates.component.scss'
})
export class MyCertificatesComponent implements OnInit {
  private certificatesService = inject(CertificatesService);
  private authStore = inject(AuthStore);
  public toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  certificates: CertificateSummaryDto[] = [];
  loading = true;
  errorMessage: string | null = null;
  downloadingId: string | null = null;

  // View Details Modal
  showDetailsModal = false;
  selectedDetails: CertificateDetailsDto | null = null;
  loadingDetails = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    const userId = this.authStore.userId();
    if (!userId) {
      this.certificates = [];
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.certificatesService.getUserCertificates(userId).subscribe({
      next: (res) => {
        this.certificates = res || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.certificates = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  download(certId: string, certNumber: string): void {
    this.downloadingId = certId;
    this.certificatesService.downloadCertificate(certId).subscribe({
      next: (blob) => {
        this.downloadingId = null;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate-${certNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('تم بدء تحميل الشهادة بنجاح');
        this.cdr.markForCheck();
      },
      error: () => {
        this.downloadingId = null;
        this.toast.error('تعذر تحميل ملف الشهادة.');
        this.cdr.markForCheck();
      }
    });
  }

  viewDetails(certId: string): void {
    this.loadingDetails = true;
    this.selectedDetails = null;
    this.showDetailsModal = true;

    this.certificatesService.getCertificateDetails(certId).subscribe({
      next: (res) => {
        this.selectedDetails = res;
        this.loadingDetails = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingDetails = false;
        this.showDetailsModal = false;
        this.toast.error('تعذر جلب تفاصيل الشهادة.');
        this.cdr.markForCheck();
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedDetails = null;
  }
}

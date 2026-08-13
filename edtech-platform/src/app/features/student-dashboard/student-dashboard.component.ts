import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { EnrollmentsService } from '../../core/services/enrollments.service';
import { EnrollmentDto } from '../../core/models/enrollment.models';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit {
  authStore = inject(AuthStore);
  private enrollmentsService = inject(EnrollmentsService);
  private cdr = inject(ChangeDetectorRef);

  enrollments: EnrollmentDto[] = [];
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (res) => {
        this.enrollments = res || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر جلب تسجيلاتك الدراسية من الخادم حالياً.';
        this.cdr.markForCheck();
      }
    });
  }
}



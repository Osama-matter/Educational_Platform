import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrollmentsService } from '../../../core/services/enrollments.service';
import { CoursesService } from '../../../core/services/courses.service';
import { EnrollmentDto } from '../../../core/models/enrollment.models';
import { CourseSummary } from '../../../core/models/course.models';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-enrollments-management',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, ButtonComponent],
  templateUrl: './enrollments-management.component.html',
  styleUrl: './enrollments-management.component.scss'
})
export class EnrollmentsManagementComponent implements OnInit {
  private enrollmentsService = inject(EnrollmentsService);
  private coursesService = inject(CoursesService);
  private cdr = inject(ChangeDetectorRef);

  enrollments: EnrollmentDto[] = [];
  courses: CourseSummary[] = [];
  loading = true;
  errorMessage: string | null = null;

  // Manual Enroll Modal
  showEnrollModal = false;
  savingEnroll = false;
  enrollModalErrorMessage: string | null = null;
  manualStudentId = '';
  manualCourseId = '';

  ngOnInit(): void {
    this.loadData();
    this.loadCourses();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.enrollmentsService.getAll().subscribe({
      next: (res) => {
        this.enrollments = res || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر تحميل سجلات التسجيل الإدارية من الخادم.';
        this.cdr.markForCheck();
      }
    });
  }

  loadCourses(): void {
    this.coursesService.getAll().subscribe({
      next: (res) => {
        this.courses = res || [];
        if (this.courses.length > 0) {
          this.manualCourseId = this.courses[0].id;
        }
        this.cdr.markForCheck();
      }
    });
  }

  openEnrollModal(): void {
    this.manualStudentId = '';
    if (this.courses.length > 0) {
      this.manualCourseId = this.courses[0].id;
    }
    this.enrollModalErrorMessage = null;
    this.showEnrollModal = true;
  }

  closeEnrollModal(): void {
    this.showEnrollModal = false;
  }

  createManualEnrollment(): void {
    if (!this.manualStudentId.trim() || !this.manualCourseId) {
      this.enrollModalErrorMessage = 'يرجى إدخال معرف الطالب واختيار الدورة.';
      return;
    }

    this.savingEnroll = true;
    this.enrollModalErrorMessage = null;

    this.enrollmentsService.enroll(this.manualStudentId.trim(), this.manualCourseId).subscribe({
      next: (created) => {
        this.savingEnroll = false;
        this.showEnrollModal = false;
        this.enrollments.unshift(created);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.savingEnroll = false;
        this.enrollModalErrorMessage = err?.error?.message || 'تعذر إضافة التسجيل للطالب، يرجى التأكد من معرف الطالب.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleEnrollmentStatus(item: EnrollmentDto): void {
    const newStatus = !item.isActive;
    this.enrollmentsService.update(item.id, { isActive: newStatus }).subscribe({
      next: () => {
        item.isActive = newStatus;
        this.cdr.markForCheck();
      },
      error: () => alert('فشل تحديث حالة التسجيل.')
    });
  }

  deleteEnrollment(id: string): void {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا التسجيل؟')) {
      this.enrollmentsService.delete(id).subscribe({
        next: () => {
          this.enrollments = this.enrollments.filter(e => e.id !== id);
          this.cdr.markForCheck();
        },
        error: () => alert('فشل حذف التسجيل من الخادم.')
      });
    }
  }
}

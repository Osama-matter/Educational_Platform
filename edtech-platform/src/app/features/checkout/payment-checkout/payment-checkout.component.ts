import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../../core/services/courses.service';
import { FawaterakService } from '../../../core/services/fawaterak.service';
import { AuthStore } from '../../../core/services/auth.store';
import { CourseSummary } from '../../../core/models/course.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './payment-checkout.component.html',
  styleUrl: './payment-checkout.component.scss'
})
export class PaymentCheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private fawaterakService = inject(FawaterakService);
  private authStore = inject(AuthStore);
  private cdr = inject(ChangeDetectorRef);

  courseId = this.route.snapshot.paramMap.get('courseId') || '';
  course: CourseSummary | null = null;
  customerName = this.authStore.currentUser()?.username || '';
  customerEmail = this.authStore.currentUser()?.email || '';
  customerPhone = '';
  loadingCourse = true;
  loadingPayment = false;
  errorMessage: string | null = null;
  paymentErrorMessage: string | null = null;

  ngOnInit(): void {
    if (!this.courseId) {
      this.errorMessage = 'معرف الدورة غير صحيح.';
      this.loadingCourse = false;
      this.cdr.markForCheck();
      return;
    }
    this.loadCourse();
  }

  loadCourse(): void {
    this.loadingCourse = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.coursesService.getById(this.courseId).subscribe({
      next: (res) => {
        this.course = res;
        this.loadingCourse = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingCourse = false;
        this.errorMessage = 'تعذر جلب تفاصيل الدورة لإتمام عملية الشراء. يرجى التأكد من تشغيل خادم الـ API.';
        this.cdr.markForCheck();
      }
    });
  }

  payNow(): void {
    if (!this.customerName.trim() || !this.customerPhone.trim()) {
      this.paymentErrorMessage = 'يرجى إدخال اسم العميل ورقم الهاتف لإتمام عملية الشراء.';
      return;
    }

    this.loadingPayment = true;
    this.paymentErrorMessage = null;

    this.fawaterakService.initiatePayment({
      courseId: this.courseId,
      paymentMethod: 'fawaterak',
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone
    }).subscribe({
      next: (res) => {
        this.loadingPayment = false;
        if (res.paymentUrl) {
          window.location.href = res.paymentUrl;
        } else {
          this.router.navigate(['/learning', this.courseId]);
        }
      },
      error: (err) => {
        this.loadingPayment = false;
        this.paymentErrorMessage = err?.error?.message || 'فشلت عملية إنشاء الفاتورة الدفع، يرجى المحاولة لاحقاً.';
      }
    });
  }
}


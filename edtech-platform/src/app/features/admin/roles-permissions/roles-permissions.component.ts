import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, UserRolesStatsDto } from '../../../core/services/analytics.service';
import { AccountService } from '../../../core/services/account.service';
import { RegisterDto } from '../../../core/models/account.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.scss'
})
export class RolesPermissionsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private accountService = inject(AccountService);
  private cdr = inject(ChangeDetectorRef);

  rolesStats: UserRolesStatsDto | null = null;
  loading = true;
  errorMessage: string | null = null;

  // Register Admin Modal
  showAdminModal = false;
  savingAdmin = false;
  modalErrorMessage: string | null = null;
  modalSuccessMessage: string | null = null;
  newAdmin: RegisterDto = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.analyticsService.getRolesStats().subscribe({
      next: (res) => {
        this.rolesStats = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر تحميل بيانات الأدوار والمستخدمين من الخادم.';
        this.cdr.markForCheck();
      }
    });
  }

  openAdminModal(): void {
    this.newAdmin = {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    };
    this.modalErrorMessage = null;
    this.modalSuccessMessage = null;
    this.showAdminModal = true;
  }

  closeAdminModal(): void {
    this.showAdminModal = false;
  }

  createAdmin(): void {
    if (!this.newAdmin.email || !this.newAdmin.password || !this.newAdmin.username) {
      this.modalErrorMessage = 'يرجى ملء جميع الحقول المطلوبة (اسم المستخدم، البريد، كلمة المرور).';
      return;
    }

    this.savingAdmin = true;
    this.modalErrorMessage = null;
    this.modalSuccessMessage = null;

    this.accountService.registerAdmin(this.newAdmin).subscribe({
      next: () => {
        this.savingAdmin = false;
        this.modalSuccessMessage = 'تم إنشاء حساب المسؤول بنجاح!';
        setTimeout(() => {
          this.closeAdminModal();
          this.loadData();
        }, 1500);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.savingAdmin = false;
        this.modalErrorMessage = err?.error?.message || err?.error || 'تعذر إنشاء حساب المسؤول على الخادم.';
        this.cdr.markForCheck();
      }
    });
  }
}

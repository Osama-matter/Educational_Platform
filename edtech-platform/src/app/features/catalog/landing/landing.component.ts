import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { CourseSummary } from '../../../core/models/course.models';
import { CourseCardComponent } from '../../../shared/ui/course-card/course-card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent, ButtonComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private cdr = inject(ChangeDetectorRef);

  featuredCourses: CourseSummary[] = [];
  selectedCategory = 'all';
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.coursesService.getAll().subscribe({
      next: (res) => {
        this.featuredCourses = (res || []).slice(0, 6);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر تحميل الدورات المميزة من الخادم حالياً.';
        this.cdr.markForCheck();
      }
    });
  }
}



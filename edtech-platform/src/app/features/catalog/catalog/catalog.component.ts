import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../../core/services/courses.service';
import { CourseSummary } from '../../../core/models/course.models';
import { CourseCardComponent } from '../../../shared/ui/course-card/course-card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseCardComponent, ButtonComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private cdr = inject(ChangeDetectorRef);

  courses: CourseSummary[] = [];
  filteredCourses: CourseSummary[] = [];
  searchQuery = '';
  filterType: 'all' | 'free' | 'paid' = 'all';
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
        this.courses = res || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'فشل جلب قائمة الدورات من الخادم.';
        this.cdr.markForCheck();
      }
    });
  }


  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.courses];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.instructorName && c.instructorName.toLowerCase().includes(q))
      );
    }

    if (this.filterType === 'free') {
      result = result.filter(c => c.price === 0);
    } else if (this.filterType === 'paid') {
      result = result.filter(c => c.price > 0);
    }

    this.filteredCourses = result;
  }
}


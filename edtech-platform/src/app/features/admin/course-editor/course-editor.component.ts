import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../../../core/services/courses.service';
import { LessonsService } from '../../../core/services/lessons.service';
import { CourseFilesService } from '../../../core/services/course-files.service';
import { ToastService } from '../../../core/services/toast.service';
import { CourseSummary, CreateCourseDto, UpdateCourseDto } from '../../../core/models/course.models';
import { LessonDto, CreateLessonDto, CourseFileDto } from '../../../core/models/lesson.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent],
  templateUrl: './course-editor.component.html',
  styleUrl: './course-editor.component.scss'
})
export class CourseEditorComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private lessonsService = inject(LessonsService);
  private courseFilesService = inject(CourseFilesService);
  public toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  courses: CourseSummary[] = [];
  loading = true;
  errorMessage: string | null = null;

  // Course Modal (Create & Edit)
  showCourseModal = false;
  editingCourseId: string | null = null;
  savingCourse = false;
  courseModalErrorMessage: string | null = null;
  newCourse: CreateCourseDto = {
    title: '',
    description: '',
    estimatedDurationHours: 10,
    price: 0,
    numberOfSections: 4
  };

  // Lesson Modal (Create & Edit)
  showLessonModal = false;
  editingLessonId: string | null = null;
  savingLesson = false;
  lessonModalErrorMessage: string | null = null;
  selectedCourseForLesson: CourseSummary | null = null;
  newLesson: CreateLessonDto = {
    courseId: '',
    title: '',
    content: '',
    videoUrl: '',
    orderIndex: 1,
    durationMinutes: 15
  };

  // Files Modal
  showFilesModal = false;
  activeFileCourse: CourseSummary | null = null;
  courseFiles: CourseFileDto[] = [];
  loadingFiles = false;
  uploadingFile = false;
  selectedFileToUpload: File | null = null;

  // Expanded courses and their lessons map
  expandedCourseId: string | null = null;
  courseLessons: { [courseId: string]: LessonDto[] } = {};
  loadingLessons: { [courseId: string]: boolean } = {};
  deletingLessonId: string | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.coursesService.getAll().subscribe({
      next: (res) => {
        this.courses = res || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر تحميل قائمة الدورات لإدارتها من الخادم.';
        this.cdr.markForCheck();
      }
    });
  }

  selectedCourseImage: File | null = null;

  onCourseImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedCourseImage = file;
    }
  }

  // --- Course Operations ---
  openCreateCourseModal(): void {
    this.editingCourseId = null;
    this.selectedCourseImage = null;
    this.newCourse = {
      title: '',
      description: '',
      estimatedDurationHours: 10,
      price: 0,
      numberOfSections: 4
    };
    this.courseModalErrorMessage = null;
    this.showCourseModal = true;
  }

  openEditCourseModal(course: CourseSummary): void {
    this.editingCourseId = course.id;
    this.selectedCourseImage = null;
    this.newCourse = {
      title: course.title,
      description: course.description || '',
      estimatedDurationHours: course.estimatedDurationHours || 10,
      price: course.price || 0,
      numberOfSections: course.numberOfSections || 4
    };
    this.courseModalErrorMessage = null;
    this.showCourseModal = true;
  }

  closeCourseModal(): void {
    this.showCourseModal = false;
    this.editingCourseId = null;
    this.selectedCourseImage = null;
  }

  saveCourse(): void {
    if (!this.newCourse.title.trim()) {
      this.courseModalErrorMessage = 'يرجى إدخال عنوان الدورة.';
      return;
    }

    this.savingCourse = true;
    this.courseModalErrorMessage = null;

    if (this.editingCourseId) {
      const updateDto: UpdateCourseDto = {
        title: this.newCourse.title,
        description: this.newCourse.description,
        estimatedDurationHours: this.newCourse.estimatedDurationHours,
        price: this.newCourse.price,
        numberOfSections: this.newCourse.numberOfSections,
        isActive: true,
        imageFile: this.selectedCourseImage || undefined
      };

      this.coursesService.update(this.editingCourseId, updateDto).subscribe({
        next: () => {
          this.savingCourse = false;
          this.showCourseModal = false;
          const idx = this.courses.findIndex(c => c.id === this.editingCourseId);
          if (idx !== -1) {
            this.courses[idx] = {
              ...this.courses[idx],
              title: this.newCourse.title,
              description: this.newCourse.description,
              estimatedDurationHours: this.newCourse.estimatedDurationHours,
              price: this.newCourse.price,
              numberOfSections: this.newCourse.numberOfSections
            };
          }
          this.editingCourseId = null;
          this.selectedCourseImage = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.savingCourse = false;
          this.courseModalErrorMessage = err?.error?.message || 'تعذر تعديل الدورة على الخادم.';
          this.cdr.markForCheck();
        }
      });
    } else {
      const createDto: CreateCourseDto = {
        ...this.newCourse,
        imageFile: this.selectedCourseImage || undefined
      };

      this.coursesService.create(createDto).subscribe({
        next: (created) => {
          this.savingCourse = false;
          this.showCourseModal = false;
          this.courses.unshift(created);
          this.selectedCourseImage = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.savingCourse = false;
          this.courseModalErrorMessage = err?.error?.message || 'تعذر إضافة الدورة على الخادم.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  async deleteCourse(id: string): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف الدورة',
      message: 'هل أنت متأكد من رغبتك في حذف هذه الدورة؟ سيتم حذف كافة الدروس والملفات التابعة لها.',
      confirmText: 'حذف الدورة',
      type: 'danger'
    });
    if (!ok) return;

    this.coursesService.delete(id).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== id);
        if (this.expandedCourseId === id) {
          this.expandedCourseId = null;
        }
        this.toast.success('تم حذف الدورة بنجاح');
        this.cdr.markForCheck();
      },
      error: () => this.toast.error('فشل حذف الدورة من الخادم.')
    });
  }

  // --- Lesson Operations ---
  openAddLessonModal(course?: CourseSummary): void {
    this.editingLessonId = null;
    const targetCourse = course || (this.courses.length > 0 ? this.courses[0] : null);
    if (!targetCourse) {
      this.toast.warning('يرجى إنشاء دورة أولاً قبل إضافة الدروس.');
      return;
    }

    this.selectedCourseForLesson = targetCourse;
    const existingLessons = this.courseLessons[targetCourse.id] || [];
    const nextOrder = existingLessons.length > 0
      ? Math.max(...existingLessons.map(l => (l.orderIndex ?? l.order ?? 0))) + 1
      : 1;

    this.newLesson = {
      courseId: targetCourse.id,
      title: '',
      content: '',
      videoUrl: '',
      orderIndex: nextOrder,
      durationMinutes: 15
    };
    this.lessonModalErrorMessage = null;
    this.showLessonModal = true;
  }

  openEditLessonModal(course: CourseSummary, lesson: LessonDto): void {
    this.editingLessonId = lesson.id;
    this.selectedCourseForLesson = course;
    this.newLesson = {
      courseId: course.id,
      title: lesson.title,
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      orderIndex: lesson.orderIndex ?? lesson.order ?? 1,
      durationMinutes: lesson.durationMinutes || 15
    };
    this.lessonModalErrorMessage = null;
    this.showLessonModal = true;
  }

  closeLessonModal(): void {
    this.showLessonModal = false;
    this.editingLessonId = null;
  }

  onCourseSelectionChange(courseId: string): void {
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      this.selectedCourseForLesson = course;
      this.newLesson.courseId = course.id;
      const existingLessons = this.courseLessons[course.id] || [];
      const nextOrder = existingLessons.length > 0
        ? Math.max(...existingLessons.map(l => (l.orderIndex ?? l.order ?? 0))) + 1
        : 1;
      this.newLesson.orderIndex = nextOrder;
    }
  }

  saveLesson(): void {
    if (!this.newLesson.courseId) {
      this.lessonModalErrorMessage = 'يرجى اختيار الدورة.';
      return;
    }
    if (!this.newLesson.title.trim()) {
      this.lessonModalErrorMessage = 'يرجى إدخال عنوان الدرس.';
      return;
    }

    this.savingLesson = true;
    this.lessonModalErrorMessage = null;

    if (this.editingLessonId) {
      this.lessonsService.update(this.editingLessonId, this.newLesson).subscribe({
        next: () => {
          this.savingLesson = false;
          this.showLessonModal = false;
          const targetCourseId = this.newLesson.courseId;
          const list = this.courseLessons[targetCourseId];
          if (list) {
            const idx = list.findIndex(l => l.id === this.editingLessonId);
            if (idx !== -1) {
              list[idx] = {
                ...list[idx],
                title: this.newLesson.title,
                content: this.newLesson.content,
                videoUrl: this.newLesson.videoUrl,
                orderIndex: this.newLesson.orderIndex,
                durationMinutes: this.newLesson.durationMinutes
              };
            }
          }
          this.editingLessonId = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.savingLesson = false;
          this.lessonModalErrorMessage = err?.error?.message || 'تعذر تعديل الدرس على الخادم.';
          this.cdr.markForCheck();
        }
      });
    } else {
      this.lessonsService.create(this.newLesson).subscribe({
        next: (createdLesson) => {
          this.savingLesson = false;
          this.showLessonModal = false;

          const targetCourseId = this.newLesson.courseId;
          if (!this.courseLessons[targetCourseId]) {
            this.courseLessons[targetCourseId] = [];
          }
          this.courseLessons[targetCourseId].push(createdLesson);
          this.expandedCourseId = targetCourseId;

          this.cdr.markForCheck();
        },
        error: (err) => {
          this.savingLesson = false;
          this.lessonModalErrorMessage = err?.error?.message || 'تعذر إضافة الدرس على الخادم.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  toggleCourseLessons(courseId: string): void {
    if (this.expandedCourseId === courseId) {
      this.expandedCourseId = null;
      return;
    }

    this.expandedCourseId = courseId;
    if (!this.courseLessons[courseId]) {
      this.loadCourseLessons(courseId);
    }
  }

  loadCourseLessons(courseId: string): void {
    this.loadingLessons[courseId] = true;
    this.lessonsService.getByCourse(courseId).subscribe({
      next: (lessons) => {
        this.courseLessons[courseId] = lessons || [];
        this.loadingLessons[courseId] = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.courseLessons[courseId] = [];
        this.loadingLessons[courseId] = false;
        this.cdr.markForCheck();
      }
    });
  }

  async deleteLesson(courseId: string, lessonId: string): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف الدرس',
      message: 'هل أنت متأكد من رغبتك في حذف هذا الدرس؟',
      confirmText: 'حذف الدرس',
      type: 'danger'
    });
    if (!ok) return;

    this.deletingLessonId = lessonId;
    this.lessonsService.delete(lessonId).subscribe({
      next: () => {
        if (this.courseLessons[courseId]) {
          this.courseLessons[courseId] = this.courseLessons[courseId].filter(l => l.id !== lessonId);
        }
        this.deletingLessonId = null;
        this.toast.success('تم حذف الدرس بنجاح');
        this.cdr.markForCheck();
      },
      error: () => {
        this.deletingLessonId = null;
        this.toast.error('فشل حذف الدرس من الخادم.');
        this.cdr.markForCheck();
      }
    });
  }

  // --- Course Files Operations ---
  activeCourseLessons: LessonDto[] = [];
  selectedFileLessonId = '';

  openFilesModal(course: CourseSummary): void {
    this.activeFileCourse = course;
    this.showFilesModal = true;
    this.selectedFileToUpload = null;
    this.selectedFileLessonId = '';
    this.activeCourseLessons = [];
    this.loadCourseFiles(course.id);

    this.lessonsService.getByCourse(course.id).subscribe({
      next: (lessons) => {
        this.activeCourseLessons = lessons || [];
        if (this.activeCourseLessons.length > 0) {
          this.selectedFileLessonId = this.activeCourseLessons[0].id;
        }
        this.cdr.markForCheck();
      }
    });
  }

  closeFilesModal(): void {
    this.showFilesModal = false;
    this.activeFileCourse = null;
    this.selectedFileToUpload = null;
    this.selectedFileLessonId = '';
    this.activeCourseLessons = [];
  }

  loadCourseFiles(courseId: string): void {
    this.loadingFiles = true;
    this.courseFilesService.getByCourse(courseId).subscribe({
      next: (files) => {
        this.courseFiles = files || [];
        this.loadingFiles = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.courseFiles = [];
        this.loadingFiles = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileToUpload = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.activeFileCourse || !this.selectedFileToUpload) return;

    this.uploadingFile = true;
    this.courseFilesService.upload(
      this.activeFileCourse.id,
      this.selectedFileToUpload,
      this.selectedFileLessonId || undefined
    ).subscribe({
      next: (uploaded) => {
        this.uploadingFile = false;
        this.selectedFileToUpload = null;
        this.courseFiles.unshift(uploaded);
        this.toast.success('تم رفع الملف بنجاح');
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploadingFile = false;
        this.toast.error('فشل رفع الملف إلى الخادم.');
        this.cdr.markForCheck();
      }
    });
  }

  downloadFile(file: CourseFileDto, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const url = this.courseFilesService.getFileDownloadUrl(file);
    if (url) {
      window.open(url, '_blank');
    } else {
      this.toast.error('رابط الملف غير متوفر.');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف الملف',
      message: 'هل أنت متأكد من حذف هذا الملف؟',
      confirmText: 'حذف الملف',
      type: 'danger'
    });
    if (!ok) return;

    this.courseFilesService.delete(fileId).subscribe({
      next: () => {
        this.courseFiles = this.courseFiles.filter(f => f.id !== fileId);
        this.toast.success('تم حذف الملف بنجاح');
        this.cdr.markForCheck();
      },
      error: () => this.toast.error('فشل حذف الملف.')
    });
  }
}

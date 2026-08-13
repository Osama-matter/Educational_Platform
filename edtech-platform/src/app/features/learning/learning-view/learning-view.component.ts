import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LessonsService } from '../../../core/services/lessons.service';
import { CoursesService } from '../../../core/services/courses.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CourseFilesService } from '../../../core/services/course-files.service';
import { ForumService } from '../../../core/services/forum.service';
import { AuthStore } from '../../../core/services/auth.store';
import { LessonDto, CourseFileDto } from '../../../core/models/lesson.models';
import { CourseSummary } from '../../../core/models/course.models';
import { ForumThreadDto } from '../../../core/models/forum.models';

@Component({
  selector: 'app-learning-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learning-view.component.html',
  styleUrl: './learning-view.component.scss'
})
export class LearningViewComponent implements OnInit, OnDestroy {
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public authStore = inject(AuthStore);
  private lessonsService = inject(LessonsService);
  private coursesService = inject(CoursesService);
  private progressService = inject(ProgressService);
  private courseFilesService = inject(CourseFilesService);
  private forumService = inject(ForumService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  courseId = this.route.snapshot.paramMap.get('courseId') || '';
  course: CourseSummary | null = null;
  lessons: LessonDto[] = [];
  activeLesson: LessonDto | null = null;
  courseFiles: CourseFileDto[] = [];
  completedLessonIds = new Set<string>();
  progressPercent = 0;
  loading = true;
  errorMessage: string | null = null;
  completing = false;

  // Video State
  rawVideoUrl: string | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  isDirectVideo = false;
  hasVideo = false;

  // Dynamic Anti-Piracy Watermark
  watermarkTop = 20;
  watermarkLeft = 20;
  watermarkTimestamp = new Date().toLocaleTimeString('ar-EG');
  private watermarkInterval: any;

  // Active Tab: 'content' | 'qa' | 'attachments' | 'notes'
  activeTab: 'content' | 'qa' | 'attachments' | 'notes' = 'content';

  // Drawer
  showLessonsDrawer = false;

  // Real Forum Q&A Threads
  forumThreads: ForumThreadDto[] = [];
  loadingThreads = false;
  newQuestionTitle = '';
  newQuestionContent = '';
  submittingQuestion = false;

  // Student Notes (persisted in localStorage per lesson)
  userNote = '';

  // Student Identity
  studentEmail = computed(() => this.authStore.currentUser()?.email || 'طالب مسجل');
  studentName = computed(() => {
    const user = this.authStore.currentUser();
    return user?.username || user?.email?.split('@')[0] || 'طالب المنصة';
  });

  ngOnInit(): void {
    if (!this.courseId) {
      this.errorMessage = 'معرف الدورة غير صحيح.';
      this.loading = false;
      return;
    }
    this.loadCourseInfo();
    this.loadData();
    this.loadCourseFiles();
    this.loadForumThreads();

    // Floating watermark
    this.watermarkInterval = setInterval(() => {
      this.watermarkTop = Math.floor(Math.random() * 60) + 15;
      this.watermarkLeft = Math.floor(Math.random() * 50) + 15;
      this.watermarkTimestamp = new Date().toLocaleTimeString('ar-EG');
      this.cdr.markForCheck();
    }, 8000);
  }

  ngOnDestroy(): void {
    if (this.watermarkInterval) {
      clearInterval(this.watermarkInterval);
    }
  }

  loadCourseInfo(): void {
    this.coursesService.getById(this.courseId).subscribe({
      next: (res) => {
        this.course = res;
        this.cdr.markForCheck();
      }
    });
  }

  loadCourseFiles(): void {
    this.courseFilesService.getByCourse(this.courseId).subscribe({
      next: (res) => {
        this.courseFiles = res || [];
        this.cdr.markForCheck();
      }
    });
  }

  loadForumThreads(): void {
    this.loadingThreads = true;
    this.forumService.getThreads(this.courseId).subscribe({
      next: (res) => {
        this.forumThreads = res || [];
        this.loadingThreads = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.forumThreads = [];
        this.loadingThreads = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.lessonsService.getByCourse(this.courseId).subscribe({
      next: (res) => {
        this.lessons = res || [];
        if (this.lessons.length > 0) {
          const targetLessonId = this.route.snapshot.queryParamMap.get('lessonId');
          const matched = targetLessonId ? this.lessons.find(l => l.id === targetLessonId) : null;
          this.selectLesson(matched || this.lessons[0]);
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.lessons = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.progressService.getCourseProgress(this.courseId).subscribe({
      next: (res) => {
        if (res?.completedLessonIds) {
          this.completedLessonIds = new Set(res.completedLessonIds);
          this.progressPercent = res.overallProgressPercent || 0;
          this.cdr.markForCheck();
        }
      }
    });
  }

  selectLesson(lesson: LessonDto): void {
    this.activeLesson = lesson;
    this.showLessonsDrawer = false;
    this.prepareVideoUrl(lesson);
    this.loadSavedNotes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  private prepareVideoUrl(lesson: LessonDto): void {
    this.safeVideoUrl = null;
    this.rawVideoUrl = null;
    this.isDirectVideo = false;
    this.hasVideo = false;

    let rawUrl = lesson.videoUrl || '';
    if (!rawUrl && lesson.content) {
      const urlMatch = lesson.content.match(/https?:\/\/[^\s]+/i);
      if (urlMatch) {
        rawUrl = urlMatch[0];
      }
    }

    if (!rawUrl) return;

    this.rawVideoUrl = rawUrl;

    if (rawUrl.match(/\.(mp4|webm|ogg|m3u8)($|\?)/i)) {
      this.isDirectVideo = true;
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      this.hasVideo = true;
      return;
    }

    let embedUrl = rawUrl;

    if (rawUrl.includes('youtu.be/')) {
      const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      if (id) embedUrl = `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&playsinline=1`;
    } else if (rawUrl.includes('youtube.com/watch')) {
      const urlParams = new URL(rawUrl).searchParams;
      const id = urlParams.get('v');
      if (id) embedUrl = `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&playsinline=1`;
    } else if (rawUrl.includes('youtube.com/embed/')) {
      embedUrl = rawUrl.includes('?') ? `${rawUrl}&playsinline=1` : `${rawUrl}?playsinline=1`;
    }

    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.hasVideo = true;
  }

  openExternalVideo(): void {
    if (this.rawVideoUrl) {
      window.open(this.rawVideoUrl, '_blank');
    }
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
      alert('رابط الملف غير متوفر.');
    }
  }

  toggleFullscreen(): void {
    if (!this.videoContainer) return;
    const elem = this.videoContainer.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  getCleanLessonContent(): string {
    if (!this.activeLesson?.content) return '';
    return this.activeLesson.content.replace(/https?:\/\/[^\s]+/gi, '').trim();
  }

  getLessonKeyPoints(): string[] {
    const content = this.getCleanLessonContent();
    if (content && content.length > 20) {
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 1) {
        return lines.slice(0, 5);
      }
    }

    return [
      `استيعاب المفاهيم التطبيقية الخاصة بـ "${this.activeLesson?.title}"`,
      `التطبيق العملي للتمارين والمشاريع الملحقة بالدرس`,
      `مراجعة الملفات والمصادر المرفقة لتثبيت المعلومة`
    ];
  }

  markComplete(): void {
    if (!this.activeLesson) return;
    this.completing = true;
    const lessonId = this.activeLesson.id;

    this.progressService.markLessonComplete(lessonId).subscribe({
      next: () => {
        this.completing = false;
        this.completedLessonIds.add(lessonId);
        this.updateProgress();
        this.cdr.markForCheck();
      },
      error: () => {
        this.completing = false;
        this.completedLessonIds.add(lessonId);
        this.updateProgress();
        this.cdr.markForCheck();
      }
    });
  }

  getCurrentLessonIndex(): number {
    if (!this.activeLesson) return -1;
    return this.lessons.findIndex(l => l.id === this.activeLesson?.id);
  }

  hasPreviousLesson(): boolean {
    return this.getCurrentLessonIndex() > 0;
  }

  hasNextLesson(): boolean {
    const idx = this.getCurrentLessonIndex();
    return idx >= 0 && idx < this.lessons.length - 1;
  }

  goToPreviousLesson(): void {
    const idx = this.getCurrentLessonIndex();
    if (idx > 0) {
      this.selectLesson(this.lessons[idx - 1]);
    }
  }

  goToNextLesson(): void {
    const idx = this.getCurrentLessonIndex();
    if (idx >= 0 && idx < this.lessons.length - 1) {
      this.selectLesson(this.lessons[idx + 1]);
    }
  }

  openLessonsDrawer(): void {
    this.showLessonsDrawer = true;
  }

  closeLessonsDrawer(): void {
    this.showLessonsDrawer = false;
  }

  addQuestion(): void {
    if (!this.newQuestionTitle.trim() && !this.newQuestionContent.trim()) return;

    this.submittingQuestion = true;
    const title = this.newQuestionTitle.trim() || `سؤال حول: ${this.activeLesson?.title || 'الدرس'}`;
    const content = this.newQuestionContent.trim() || title;

    this.forumService.createThread({
      courseId: this.courseId,
      title,
      content
    }).subscribe({
      next: (created) => {
        this.submittingQuestion = false;
        this.newQuestionTitle = '';
        this.newQuestionContent = '';
        this.forumThreads.unshift(created);
        this.cdr.markForCheck();
      },
      error: () => {
        this.submittingQuestion = false;
        this.forumThreads.unshift({
          id: 'q_' + Date.now(),
          title,
          content,
          courseId: this.courseId,
          authorId: 'me',
          authorName: 'أنت',
          createdAt: new Date().toISOString(),
          postsCount: 0,
          votesCount: 0
        });
        this.newQuestionTitle = '';
        this.newQuestionContent = '';
        this.cdr.markForCheck();
      }
    });
  }

  saveNote(): void {
    if (this.activeLesson) {
      localStorage.setItem(`note_${this.courseId}_${this.activeLesson.id}`, this.userNote);
      alert('تم حفظ ملاحظاتك بنجاح!');
    }
  }

  loadSavedNotes(): void {
    if (this.activeLesson) {
      this.userNote = localStorage.getItem(`note_${this.courseId}_${this.activeLesson.id}`) || '';
    }
  }

  private updateProgress(): void {
    if (this.lessons.length > 0) {
      this.progressPercent = Math.round((this.completedLessonIds.size / this.lessons.length) * 100);
    }
  }

  goBack(): void {
    this.router.navigate(['/student']);
  }
}

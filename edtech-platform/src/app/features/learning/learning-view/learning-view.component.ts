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
import { QuizzesService } from '../../../core/services/quizzes.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStore } from '../../../core/services/auth.store';
import { LessonDto, CourseFileDto } from '../../../core/models/lesson.models';
import { CourseSummary } from '../../../core/models/course.models';
import { ForumThreadDto, ForumPostDto } from '../../../core/models/forum.models';
import { QuizDto } from '../../../core/models/quiz.models';

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
  public toast = inject(ToastService);
  private lessonsService = inject(LessonsService);
  private coursesService = inject(CoursesService);
  private progressService = inject(ProgressService);
  private courseFilesService = inject(CourseFilesService);
  private forumService = inject(ForumService);
  private quizzesService = inject(QuizzesService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  courseId = this.route.snapshot.paramMap.get('courseId') || '';
  course: CourseSummary | null = null;
  lessons: LessonDto[] = [];
  activeLesson: LessonDto | null = null;
  courseFiles: CourseFileDto[] = [];
  lessonQuizzes: QuizDto[] = [];
  loadingQuizzes = false;
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

  // Active Tab: 'content' | 'quizzes' | 'qa' | 'attachments' | 'notes'
  activeTab: 'content' | 'quizzes' | 'qa' | 'attachments' | 'notes' = 'content';

  // Drawer
  showLessonsDrawer = false;

  // Real Forum Q&A Threads & Replies
  forumThreads: ForumThreadDto[] = [];
  loadingThreads = false;
  newQuestionTitle = '';
  newQuestionContent = '';
  submittingQuestion = false;

  // Replies map for lesson Q&A
  threadRepliesMap: Record<string, ForumPostDto[]> = {};
  loadingRepliesMap: Record<string, boolean> = {};
  expandedThreadIds = new Set<string>();
  replyInputMap: Record<string, string> = {};
  submittingReplyMap: Record<string, boolean> = {};

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
    this.loadLessonQuizzes(lesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.markForCheck();
  }

  loadLessonQuizzes(lessonId: string): void {
    this.loadingQuizzes = true;
    this.quizzesService.getByLesson(lessonId).subscribe({
      next: (res) => {
        this.lessonQuizzes = res || [];
        this.loadingQuizzes = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.quizzesService.getAll().subscribe({
          next: (all) => {
            this.lessonQuizzes = (all || []).filter(q => q.lessonId === lessonId);
            this.loadingQuizzes = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.lessonQuizzes = [];
            this.loadingQuizzes = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  async startQuiz(quizId: string, title?: string, duration?: number): Promise<void> {
    const quizName = title || 'الاختبار التقييمي للدرس';
    const dur = duration || 20;
    const ok = await this.toast.confirm({
      title: `بدء ${quizName}`,
      message: `تنبيه: مدة الاختبار ${dur} دقيقة وسيبدأ المؤقت التنازلي فور الدخول. هل ترغب في بدء الاختبار الآن؟`,
      confirmText: 'نعم، ابدأ الاختبار',
      cancelText: 'إلغاء والعودة للدرس',
      type: 'warning'
    });

    if (ok) {
      this.router.navigate(['/quizzes/take', quizId]);
    }
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
      this.toast.error('رابط الملف غير متوفر.');
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

  toggleReplies(threadId: string): void {
    if (this.expandedThreadIds.has(threadId)) {
      this.expandedThreadIds.delete(threadId);
    } else {
      this.expandedThreadIds.add(threadId);
      if (!this.threadRepliesMap[threadId]) {
        this.loadReplies(threadId);
      }
    }
    this.cdr.markForCheck();
  }

  loadReplies(threadId: string): void {
    this.loadingRepliesMap[threadId] = true;
    this.forumService.getPosts(threadId).subscribe({
      next: (res) => {
        this.threadRepliesMap[threadId] = res || [];
        this.loadingRepliesMap[threadId] = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.threadRepliesMap[threadId] = [];
        this.loadingRepliesMap[threadId] = false;
        this.cdr.markForCheck();
      }
    });
  }

  submitLessonReply(thread: ForumThreadDto): void {
    const content = this.replyInputMap[thread.id]?.trim();
    if (!content) return;

    this.submittingReplyMap[thread.id] = true;
    this.forumService.createPost(thread.id, content).subscribe({
      next: (created) => {
        this.submittingReplyMap[thread.id] = false;
        this.replyInputMap[thread.id] = '';
        if (!this.threadRepliesMap[thread.id]) {
          this.threadRepliesMap[thread.id] = [];
        }
        this.threadRepliesMap[thread.id].push(created);
        thread.postsCount = (thread.postsCount || 0) + 1;
        this.cdr.markForCheck();
      },
      error: () => {
        this.submittingReplyMap[thread.id] = false;
        if (!this.threadRepliesMap[thread.id]) {
          this.threadRepliesMap[thread.id] = [];
        }
        this.threadRepliesMap[thread.id].push({
          id: 'p_' + Date.now(),
          threadId: thread.id,
          authorId: 'me',
          authorName: this.studentName() || 'أنت',
          content: content,
          createdAt: new Date().toISOString(),
          votesCount: 0
        });
        this.replyInputMap[thread.id] = '';
        thread.postsCount = (thread.postsCount || 0) + 1;
        this.cdr.markForCheck();
      }
    });
  }

  canModifyQuestion(q: ForumThreadDto): boolean {
    if (!this.authStore.isAuthenticated()) return false;
    if (this.authStore.isAdmin()) return true;

    const currentUserId = this.authStore.userId()?.toString().toLowerCase();
    const qUserId = (q.authorId || q.userId)?.toString().toLowerCase();
    if (currentUserId && qUserId && currentUserId === qUserId) return true;

    const currentName = (this.studentName() || '').trim().toLowerCase();
    const authorName = (q.authorName || q.userName || '').trim().toLowerCase();

    if (authorName === 'أنت' || authorName === 'unknown' || authorName === 'طالب') return true;
    if (currentName && authorName === currentName) return true;

    return false;
  }

  canModifyLessonReply(r: ForumPostDto): boolean {
    if (!this.authStore.isAuthenticated()) return false;
    if (this.authStore.isAdmin()) return true;

    const currentUserId = this.authStore.userId()?.toString().toLowerCase();
    const rUserId = (r.authorId || r.userId)?.toString().toLowerCase();
    if (currentUserId && rUserId && currentUserId === rUserId) return true;

    const currentName = (this.studentName() || '').trim().toLowerCase();
    const authorName = (r.authorName || r.userName || '').trim().toLowerCase();

    if (authorName === 'أنت' || authorName === 'unknown' || authorName === 'عضو') return true;
    if (currentName && authorName === currentName) return true;

    return false;
  }

  async deleteLessonQuestion(q: ForumThreadDto): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف السؤال',
      message: 'هل أنت متأكد من حذف هذا السؤال؟',
      confirmText: 'حذف',
      type: 'danger'
    });
    if (!ok) return;

    this.forumService.deleteThread(q.id).subscribe({
      next: () => {
        this.forumThreads = this.forumThreads.filter(t => t.id !== q.id);
        this.toast.success('تم حذف السؤال بنجاح');
        this.cdr.markForCheck();
      },
      error: () => {
        this.forumThreads = this.forumThreads.filter(t => t.id !== q.id);
        this.toast.success('تم حذف السؤال');
        this.cdr.markForCheck();
      }
    });
  }

  async deleteLessonReply(q: ForumThreadDto, reply: ForumPostDto): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف الرد',
      message: 'هل أنت متأكد من حذف هذا الرد؟',
      confirmText: 'حذف',
      type: 'danger'
    });
    if (!ok) return;

    this.forumService.deletePost(reply.id).subscribe({
      next: () => {
        if (this.threadRepliesMap[q.id]) {
          this.threadRepliesMap[q.id] = this.threadRepliesMap[q.id].filter(r => r.id !== reply.id);
        }
        if (q.postsCount > 0) q.postsCount--;
        this.toast.success('تم حذف الرد بنجاح');
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.threadRepliesMap[q.id]) {
          this.threadRepliesMap[q.id] = this.threadRepliesMap[q.id].filter(r => r.id !== reply.id);
        }
        if (q.postsCount > 0) q.postsCount--;
        this.toast.success('تم حذف الرد');
        this.cdr.markForCheck();
      }
    });
  }

  saveNote(): void {
    if (this.activeLesson) {
      localStorage.setItem(`note_${this.courseId}_${this.activeLesson.id}`, this.userNote);
      this.toast.success('تم حفظ ملاحظاتك بنجاح');
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

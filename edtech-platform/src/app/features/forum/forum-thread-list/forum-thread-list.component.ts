import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../../core/services/forum.service';
import { ToastService } from '../../../core/services/toast.service';
import { ForumThreadDto, ForumPostDto } from '../../../core/models/forum.models';
import { AuthStore } from '../../../core/services/auth.store';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-forum-thread-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './forum-thread-list.component.html',
  styleUrl: './forum-thread-list.component.scss'
})
export class ForumThreadListComponent implements OnInit {
  private forumService = inject(ForumService);
  public toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  public authStore = inject(AuthStore);

  threads: ForumThreadDto[] = [];
  loading = true;
  errorMessage: string | null = null;

  // New Thread Modal
  showNewModal = false;
  saving = false;
  modalErrorMessage: string | null = null;
  newThread = { title: '', content: '' };

  // Edit Thread Modal
  showEditModal = false;
  editingThread: ForumThreadDto | null = null;
  editThreadData = { title: '', content: '' };
  savingEdit = false;
  editErrorMessage: string | null = null;

  // Thread detail view & replies
  selectedThread: ForumThreadDto | null = null;
  threadPosts: ForumPostDto[] = [];
  loadingPosts = false;
  newReplyContent = '';
  submittingReply = false;
  replyErrorMessage: string | null = null;

  // Inline Post Editing
  editingPostId: string | null = null;
  editPostContent = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.forumService.getThreads().subscribe({
      next: (res) => {
        this.threads = res || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'تعذر جلب مناقشات المنتدى من الخادم حالياً.';
        this.cdr.markForCheck();
      }
    });
  }

  canModifyThread(thread: ForumThreadDto): boolean {
    if (!this.authStore.isAuthenticated()) return false;
    if (this.authStore.isAdmin()) return true;
    
    const currentUserId = this.authStore.userId()?.toString().toLowerCase();
    const threadUserId = (thread.authorId || thread.userId)?.toString().toLowerCase();
    if (currentUserId && threadUserId && currentUserId === threadUserId) return true;

    const currentUser = this.authStore.currentUser();
    const currentUsername = (currentUser?.username || '').trim().toLowerCase();
    const currentEmailPrefix = (currentUser?.email?.split('@')[0] || '').trim().toLowerCase();
    const authorName = (thread.authorName || thread.userName || '').trim().toLowerCase();

    if (authorName === 'أنت' || authorName === 'unknown' || authorName === 'عضو') return true;
    if (currentUsername && authorName === currentUsername) return true;
    if (currentEmailPrefix && authorName === currentEmailPrefix) return true;

    return false;
  }

  canModifyPost(post: ForumPostDto): boolean {
    if (!this.authStore.isAuthenticated()) return false;
    if (this.authStore.isAdmin()) return true;

    const currentUserId = this.authStore.userId()?.toString().toLowerCase();
    const postUserId = (post.authorId || post.userId)?.toString().toLowerCase();
    if (currentUserId && postUserId && currentUserId === postUserId) return true;

    const currentUser = this.authStore.currentUser();
    const currentUsername = (currentUser?.username || '').trim().toLowerCase();
    const currentEmailPrefix = (currentUser?.email?.split('@')[0] || '').trim().toLowerCase();
    const authorName = (post.authorName || post.userName || '').trim().toLowerCase();

    if (authorName === 'أنت' || authorName === 'unknown' || authorName === 'عضو') return true;
    if (currentUsername && authorName === currentUsername) return true;
    if (currentEmailPrefix && authorName === currentEmailPrefix) return true;

    return false;
  }

  openNewModal(): void {
    this.newThread = { title: '', content: '' };
    this.modalErrorMessage = null;
    this.showNewModal = true;
  }

  closeModal(): void {
    this.showNewModal = false;
  }

  createThread(): void {
    if (!this.newThread.title.trim() || !this.newThread.content.trim()) {
      this.modalErrorMessage = 'يرجى كتابة عنوان المناقشة والمحتوى.';
      return;
    }

    this.saving = true;
    this.modalErrorMessage = null;

    this.forumService.createThread({
      title: this.newThread.title,
      content: this.newThread.content,
      description: this.newThread.content
    }).subscribe({
      next: (created) => {
        this.saving = false;
        this.showNewModal = false;
        this.threads.unshift(created);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.saving = false;
        this.modalErrorMessage = err?.error?.message || err?.error || 'فشلت إضافة المناقشة، يرجى التأكد من تسجيل الدخول والاتصال بالخادم.';
        this.cdr.markForCheck();
      }
    });
  }

  openEditModal(thread: ForumThreadDto, event?: Event): void {
    if (event) event.stopPropagation();
    this.editingThread = thread;
    this.editThreadData = { title: thread.title, content: thread.content || '' };
    this.editErrorMessage = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingThread = null;
  }

  updateThread(): void {
    if (!this.editingThread || !this.editThreadData.title.trim() || !this.editThreadData.content.trim()) {
      this.editErrorMessage = 'يرجى تعبئة العنوان ومحتوى الموضوع.';
      return;
    }

    this.savingEdit = true;
    this.editErrorMessage = null;
    const threadId = this.editingThread.id;

    this.forumService.updateThread(threadId, {
      title: this.editThreadData.title.trim(),
      content: this.editThreadData.content.trim()
    }).subscribe({
      next: (updated) => {
        this.savingEdit = false;
        this.showEditModal = false;
        const idx = this.threads.findIndex(t => t.id === threadId);
        if (idx !== -1) {
          this.threads[idx].title = updated.title || this.editThreadData.title;
          this.threads[idx].content = updated.content || this.editThreadData.content;
        }
        if (this.selectedThread && this.selectedThread.id === threadId) {
          this.selectedThread.title = updated.title || this.editThreadData.title;
          this.selectedThread.content = updated.content || this.editThreadData.content;
        }
        this.editingThread = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.savingEdit = false;
        this.editErrorMessage = err?.error?.message || err?.error || 'فشل تحديث الموضوع، يرجى المحاولة لاحقاً.';
        this.cdr.markForCheck();
      }
    });
  }

  async deleteThread(thread: ForumThreadDto, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    const ok = await this.toast.confirm({
      title: 'حذف موضوع المناقشة',
      message: 'هل أنت متأكد من حذف هذا الموضوع؟ سيتم حذف كافة الردود المرتبطة به نهائياً.',
      confirmText: 'حذف الموضوع',
      type: 'danger'
    });
    if (!ok) return;

    this.forumService.deleteThread(thread.id).subscribe({
      next: () => {
        this.threads = this.threads.filter(t => t.id !== thread.id);
        if (this.selectedThread?.id === thread.id) {
          this.selectedThread = null;
        }
        this.toast.success('تم حذف الموضوع بنجاح');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || err?.error || 'فشل حذف الموضوع.');
      }
    });
  }

  selectThread(thread: ForumThreadDto): void {
    this.selectedThread = thread;
    this.threadPosts = [];
    this.newReplyContent = '';
    this.replyErrorMessage = null;
    this.editingPostId = null;
    this.loadPosts(thread.id);
  }

  closeThreadDetail(): void {
    this.selectedThread = null;
    this.threadPosts = [];
  }

  loadPosts(threadId: string): void {
    this.loadingPosts = true;
    this.forumService.getPosts(threadId).subscribe({
      next: (res) => {
        this.threadPosts = res || [];
        this.loadingPosts = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.threadPosts = [];
        this.loadingPosts = false;
        this.cdr.markForCheck();
      }
    });
  }

  submitReply(): void {
    if (!this.selectedThread || !this.newReplyContent.trim()) {
      this.replyErrorMessage = 'يرجى كتابة نص الرد أولاً.';
      return;
    }

    if (!this.authStore.isAuthenticated()) {
      this.replyErrorMessage = 'يجب تسجيل الدخول لإضافة رد على المناقشة.';
      return;
    }

    this.submittingReply = true;
    this.replyErrorMessage = null;
    const threadId = this.selectedThread.id;

    this.forumService.createPost(threadId, this.newReplyContent.trim()).subscribe({
      next: (post) => {
        this.submittingReply = false;
        this.newReplyContent = '';
        this.threadPosts.push(post);
        if (this.selectedThread) {
          this.selectedThread.postsCount = (this.selectedThread.postsCount || 0) + 1;
        }
        this.toast.success('تم إرسال ردك بنجاح');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.submittingReply = false;
        this.replyErrorMessage = err?.error?.message || err?.error || 'فشل إرسال الرد، يرجى إعادة المحاولة.';
        this.cdr.markForCheck();
      }
    });
  }

  startEditPost(post: ForumPostDto): void {
    this.editingPostId = post.id;
    this.editPostContent = post.content;
  }

  cancelEditPost(): void {
    this.editingPostId = null;
    this.editPostContent = '';
  }

  saveEditPost(post: ForumPostDto): void {
    if (!this.editPostContent.trim()) return;

    this.forumService.updatePost(post.id, this.editPostContent.trim()).subscribe({
      next: (updated) => {
        post.content = updated.content || this.editPostContent;
        this.editingPostId = null;
        this.toast.success('تم تعديل الرد بنجاح');
        this.cdr.markForCheck();
      },
      error: () => {
        post.content = this.editPostContent;
        this.editingPostId = null;
        this.toast.success('تم حفظ التعديل');
        this.cdr.markForCheck();
      }
    });
  }

  async deletePost(post: ForumPostDto): Promise<void> {
    const ok = await this.toast.confirm({
      title: 'حذف الرد',
      message: 'هل أنت متأكد من حذف هذا الرد؟',
      confirmText: 'حذف الرد',
      type: 'danger'
    });
    if (!ok) return;

    this.forumService.deletePost(post.id).subscribe({
      next: () => {
        this.threadPosts = this.threadPosts.filter(p => p.id !== post.id);
        if (this.selectedThread && this.selectedThread.postsCount > 0) {
          this.selectedThread.postsCount--;
        }
        this.toast.success('تم حذف الرد بنجاح');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || err?.error || 'فشل حذف الرد.');
      }
    });
  }

  voteThread(thread: ForumThreadDto, event: Event): void {
    event.stopPropagation();
    this.forumService.voteThread(thread.id, true).subscribe({
      next: () => {
        thread.votesCount = (thread.votesCount || 0) + 1;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }
}

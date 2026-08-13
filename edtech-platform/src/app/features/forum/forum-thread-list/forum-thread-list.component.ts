import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../../core/services/forum.service';
import { ForumThreadDto } from '../../../core/models/forum.models';
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
  private cdr = inject(ChangeDetectorRef);

  threads: ForumThreadDto[] = [];
  loading = true;
  errorMessage: string | null = null;
  showNewModal = false;
  saving = false;
  modalErrorMessage: string | null = null;

  newThread = {
    title: '',
    content: ''
  };

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
      content: this.newThread.content
    }).subscribe({
      next: (created) => {
        this.saving = false;
        this.showNewModal = false;
        this.threads.unshift(created);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.saving = false;
        this.modalErrorMessage = err?.error?.message || 'فشلت إضافة المناقشة، يرجى التأكد من تسجيل الدخول والاتصال بالخادم.';
        this.cdr.markForCheck();
      }
    });
  }
}

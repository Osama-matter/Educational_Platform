import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ForumThreadDto, ForumPostDto } from '../models/forum.models';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getThreads(courseId?: string): Observable<ForumThreadDto[]> {
    return this.http.get<ForumThreadDto[]>(`${this.base}/ForumThreads`);
  }

  getThreadById(id: string): Observable<ForumThreadDto> {
    return this.http.get<ForumThreadDto>(`${this.base}/ForumThreads/${id}`);
  }

  createThread(dto: Partial<ForumThreadDto> & { description?: string }): Observable<ForumThreadDto> {
    const payload = {
      title: dto.title,
      description: dto.content || dto.description,
      content: dto.content || dto.description
    };
    return this.http.post<ForumThreadDto>(`${this.base}/ForumThreads`, payload);
  }

  updateThread(id: string, dto: { title: string; content: string }): Observable<ForumThreadDto> {
    const payload = {
      title: dto.title,
      description: dto.content,
      content: dto.content
    };
    return this.http.put<ForumThreadDto>(`${this.base}/ForumThreads/${id}`, payload);
  }

  deleteThread(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/ForumThreads/${id}`);
  }

  getPosts(threadId: string): Observable<ForumPostDto[]> {
    return this.http.get<ForumPostDto[]>(`${this.base}/ForumPosts/thread/${threadId}`);
  }

  createPost(threadId: string, content: string): Observable<ForumPostDto> {
    return this.http.post<ForumPostDto>(`${this.base}/ForumPosts`, {
      threadId,
      forumThreadId: threadId,
      content
    });
  }

  updatePost(id: string, content: string): Observable<ForumPostDto> {
    return this.http.put<ForumPostDto>(`${this.base}/ForumPosts/${id}`, { content });
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/ForumPosts/${id}`);
  }

  voteThread(threadId: string, isUpvote: boolean): Observable<void> {
    return this.http.post<void>(`${this.base}/ForumVoting/thread/${threadId}`, { isUpvote });
  }

  subscribeThread(threadId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/ForumSubscriptions/subscribe/${threadId}`, {});
  }
}

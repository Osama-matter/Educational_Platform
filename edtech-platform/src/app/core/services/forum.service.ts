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
    const url = courseId
      ? `${this.base}/ForumThreads/course/${courseId}`
      : `${this.base}/ForumThreads`;
    return this.http.get<ForumThreadDto[]>(url);
  }

  getThreadById(id: string): Observable<ForumThreadDto> {
    return this.http.get<ForumThreadDto>(`${this.base}/ForumThreads/${id}`);
  }

  createThread(dto: Partial<ForumThreadDto>): Observable<ForumThreadDto> {
    return this.http.post<ForumThreadDto>(`${this.base}/ForumThreads`, dto);
  }

  getPosts(threadId: string): Observable<ForumPostDto[]> {
    return this.http.get<ForumPostDto[]>(`${this.base}/ForumPosts/thread/${threadId}`);
  }

  createPost(threadId: string, content: string): Observable<ForumPostDto> {
    return this.http.post<ForumPostDto>(`${this.base}/ForumPosts`, { threadId, content });
  }

  voteThread(threadId: string, isUpvote: boolean): Observable<void> {
    return this.http.post<void>(`${this.base}/ForumVoting/thread/${threadId}`, { isUpvote });
  }

  subscribeThread(threadId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/ForumSubscriptions/subscribe/${threadId}`, {});
  }
}

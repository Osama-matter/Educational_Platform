export interface ForumThreadDto {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  description?: string;
  authorId?: string;
  userId?: string;
  authorName?: string;
  userName?: string;
  createdAt: string;
  votesCount: number;
  postsCount: number;
  isSubscribed?: boolean;
}

export interface ForumPostDto {
  id: string;
  threadId: string;
  forumThreadId?: string;
  authorId?: string;
  userId?: string;
  authorName?: string;
  userName?: string;
  content: string;
  createdAt: string;
  votesCount: number;
}

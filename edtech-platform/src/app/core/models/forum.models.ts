export interface ForumThreadDto {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  votesCount: number;
  postsCount: number;
  isSubscribed?: boolean;
}

export interface ForumPostDto {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  votesCount: number;
}

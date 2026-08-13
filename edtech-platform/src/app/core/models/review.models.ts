export interface ReviewDto {
  id: string;
  courseId: string;
  userId: string;
  userFullName?: string;
  rate: number;
  comment: string;
  createdAt: string;
  instructorReply?: string;
  repliedAt?: string;
}

export interface CreateReviewDto {
  courseId: string;
  rate: number;
  comment: string;
}

export interface UpdateReviewDto {
  rate: number;
  comment: string;
}

export interface InstructorReplyDto {
  reply: string;
}

export interface EnrollmentDto {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt?: string;
  isActive: boolean;
}

export interface ProgressDto {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
  overallProgressPercent: number;
}

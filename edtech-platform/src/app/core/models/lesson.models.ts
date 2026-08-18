export interface LessonDto {
  id: string;
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  durationMinutes?: number;
  order?: number;
  orderIndex?: number;
  isFreePreview?: boolean;
}

export interface CreateLessonDto {
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  orderIndex: number;
  durationMinutes?: number;
}

export interface CourseFileDto {
  id: string;
  lessonId?: string;
  courseId: string;
  fileName: string;
  blobStorageUrl?: string;
  fileUrl?: string;
  fileSize?: number;
  fileSizeBytes?: number;
}

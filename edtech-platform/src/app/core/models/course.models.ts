export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  estimatedDurationHours: number;
  isActive: boolean;
  price: number;
  numberOfSections: number;
  imageUrl?: string;
  rating?: number;
  totalStudents?: number;
  category?: string;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  estimatedDurationHours: number;
  price: number;
  numberOfSections: number;
  imageFile?: File;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  estimatedDurationHours?: number;
  price?: number;
  numberOfSections?: number;
  isActive?: boolean;
  imageFile?: File;
}

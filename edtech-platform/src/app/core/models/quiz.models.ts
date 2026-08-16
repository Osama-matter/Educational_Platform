export interface QuestionOptionDto {
  id: string;
  questionId?: string;
  text?: string;
  optionText?: string;
  isCorrect?: boolean;
}

export interface QuestionDto {
  id: string;
  quizId?: string;
  content?: string;
  text?: string;
  questionText?: string;
  questionType?: number;
  score?: number;
  points?: number;
  options?: QuestionOptionDto[];
}

export interface QuizDto {
  id: string;
  lessonId: string;
  courseId?: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalScore?: number;
  passingScore?: number;
  passingScorePercent?: number;
  isPublished?: boolean;
  availableFrom?: string;
  availableTo?: string;
  questions?: QuestionDto[];
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  availableFrom?: string;
  availableTo?: string;
  durationMinutes: number;
  totalScore: number;
  passingScore: number;
  isPublished: boolean;
  lessonId: string;
}

export interface CreateQuestionDto {
  content: string;
  text?: string;
  questionType: number;
  score: number;
  quizId: string;
}

export interface CreateQuestionOptionDto {
  text: string;
  isCorrect: boolean;
  questionId: string;
}

export interface CreateQuizAttemptDto {
  userId: string;
  quizId: string;
}

export interface QuizAttemptDto {
  id: string;
  userId: string;
  quizId: string;
  quizTitle?: string;
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  totalScore?: number;
  scorePercent?: number;
  status?: number;
  totalTimeMinutes?: number;
  passed?: boolean;
}

export interface SubmitAnswersRequest {
  answers: {
    questionId: string;
    optionId: string;
  }[];
}

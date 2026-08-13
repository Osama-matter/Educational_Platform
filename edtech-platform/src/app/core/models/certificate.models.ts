export interface CertificateDto {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  issuedAt: string;
  certificateCode: string;
  pdfUrl?: string;
  isRevoked?: boolean;
}

export interface IssueCertificateDto {
  userId: string;
  courseId: string;
}

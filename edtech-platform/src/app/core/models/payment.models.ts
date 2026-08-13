export interface InitiatePaymentRequest {
  courseId: string;
  paymentMethod: string; // e.g., 'fawaterak', 'card', 'vodafone_cash'
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentInitResponse {
  invoiceId: number;
  paymentUrl: string;
  status: string;
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InitiatePaymentRequest, PaymentInitResponse } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class FawaterakService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/FawaterakPayments`;

  initiatePayment(req: InitiatePaymentRequest): Observable<PaymentInitResponse> {
    return this.http.post<PaymentInitResponse>(`${this.base}/initiate`, req);
  }

  checkInvoiceStatus(invoiceId: number): Observable<{ isPaid: boolean; status: string }> {
    return this.http.get<{ isPaid: boolean; status: string }>(`${this.base}/invoice/${invoiceId}/status`);
  }
}

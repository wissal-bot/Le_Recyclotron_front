import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SubscriptionBody,
  DonationBody,
  PaymentMethodBody,
} from '../../interfaces/payment.interface';

@Injectable({
  providedIn: 'root',
})
export class Api_paymentService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  createSubscription(
    data: SubscriptionBody
  ): Observable<{ subscriptionId: string }> {
    return this.http.post<{ subscriptionId: string }>(
      `${this.API_URL}/subscription`,
      data
    );
  }

  cancelSubscription(subscriptionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/subscription/${subscriptionId}`
    );
  }

  createDonation(data: DonationBody): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/donation`, data);
  }

  updatePaymentMethod(data: PaymentMethodBody): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/payment-method`, data);
  }

  handleWebhook(webhookData: any): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/webhook`, webhookData);
  }
}

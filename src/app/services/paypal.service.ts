import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private apiUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) {}

  // Helper method to get headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Create PayPal payment after booking
  createPayment(bookingId: string, amount: number, returnUrl: string, cancelUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, {
      bookingId,
      amount,
      return_url: returnUrl,
      cancel_url: cancelUrl
    }, { headers: this.getHeaders() });
  }

  // Execute payment after user approval
  executePayment(paymentId: string, payerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/execute?paymentId=${paymentId}&PayerID=${payerId}`, {
      headers: this.getHeaders()
    });
  }
  
  // Cancel payment
  cancelPayment(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cancel?paymentId=${paymentId}`, {
      headers: this.getHeaders()
    });
  }
  
  // Get payment status
  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${paymentId}`, {
      headers: this.getHeaders()
    });
  }
}

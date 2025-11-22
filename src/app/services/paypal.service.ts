import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  private apiUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) {}

  // Helper: auth headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /* ===================================================
     1️⃣ CREATE PAYMENT (NO BOOKING CREATED YET)
     Backend:
       POST /api/payments/create
  =================================================== */
  createPayment(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/create`,
      data,
      { headers: this.getHeaders(), withCredentials: true }
    );
  }

  /* ===================================================
     2️⃣ EXECUTE PAYMENT (بعد الموافقة على PayPal)
     Backend:
       GET /api/payments/execute?paymentId=..&PayerID=..
  =================================================== */
  executePayment(paymentId: string, payerId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/execute?paymentId=${paymentId}&PayerID=${payerId}`,
      { headers: this.getHeaders(), withCredentials: true }
    );
  }

  /* ===================================================
     3️⃣ CANCEL PAYMENT
     Backend:
       GET /api/payments/cancel?paymentId=..
  =================================================== */
  cancelPayment(paymentId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/cancel?paymentId=${paymentId}`,
      { headers: this.getHeaders(), withCredentials: true }
    );
  }

  /* ===================================================
     4️⃣ GET PAYMENT STATUS
     Backend:
       GET /api/payments/status/:paymentId
  =================================================== */
  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/status/${paymentId}`,
      { headers: this.getHeaders(), withCredentials: true }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:3000/api/bookings';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    };
  }

  createBooking(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  getAdminBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, this.getHeaders());
  }

  getUserBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`, this.getHeaders());
  }

  getBookingsByCarId(carId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/car/${carId}`);
  }
}
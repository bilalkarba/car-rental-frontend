import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:3000/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(data: any): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Mettre à jour les noms des champs pour correspondre au backend
    const bookingData = {
      carId: data.carId,
      userId: data.userId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalAmount: data.totalPrice || data.totalAmount
    };
    
    return this.http.post(this.apiUrl, bookingData, { headers });
  }

  getAllBookings(): Observable<any[]> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    return this.http.get<any[]>(this.apiUrl, { headers });
  }
  
  getBookingById(id: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }
  
  updateBookingStatus(id: string, status: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status }, { headers });
  }
}

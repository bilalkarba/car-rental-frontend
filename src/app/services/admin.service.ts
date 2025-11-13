import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = environment.apiUrl; // ✅ backend URL

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private getHeadersForFormData() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // 🚗 جميع السيارات
  getAllCars(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/cars`, this.getHeaders());
  }

  // 📅 جميع الكراءات
  getAllBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/bookings`, this.getHeaders());
  }

  // 🗑️ حذف سيارة
  deleteCar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/cars/${id}`, this.getHeaders());
  }

  // 🔍 جلب سيارة بالمعرف
  getCarById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cars/${id}`, this.getHeaders());
  }

  // ✏️ تعديل سيارة
  updateCar(id: string, carData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cars/${id}`, carData, this.getHeaders());
  }

  // ➕ إضافة سيارة جديدة
  addCar(carData: FormData): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/cars`, carData, { headers });
  }

  // 🔄 تحديث حالة توفر السيارة
  updateCarAvailability(carId: string, available: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/cars/${carId}/availability`, 
      { available }, 
      this.getHeaders()
    );
  }
}

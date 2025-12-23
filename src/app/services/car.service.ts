import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class CarService {
  api = 'https://car-rental-backend-production-c739.up.railway.app/api/cars';
  
  constructor(private http: HttpClient) {}
  
  getCars(){ return this.http.get(this.api); }

  getAllCars(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}`);
  }
  
  getCarById(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }
  
  createCar(car:any){ return this.http.post(this.api, car); } // admin only
  
  updateCar(id: string, car: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, car);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgencyService {
  private apiUrl = 'http://localhost:3000/api/agencies';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    };
  }

  createAgency(agency: any): Observable<any> {
    return this.http.post(this.apiUrl, agency, this.getHeaders());
  }

  getAllAgencies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  getAgencyStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats`, this.getHeaders());
  }

  getAgencyById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  getAgencyAdmins(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/admins`, this.getHeaders());
  }

  getAgencyCars(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/cars`, this.getHeaders());
  }
}

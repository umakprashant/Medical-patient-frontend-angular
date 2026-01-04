import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  constructor(private http: HttpClient) {}

  getPatients(): Observable<{ patients: any[] }> {
    return this.http.get<{ patients: any[] }>(`${API_URL}/doctor/patients`);
  }

  getPatientDetails(patientId: number): Observable<{ patient: any }> {
    return this.http.get<{ patient: any }>(`${API_URL}/doctor/patients/${patientId}`);
  }
}


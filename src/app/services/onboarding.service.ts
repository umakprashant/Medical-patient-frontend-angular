import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  constructor(private http: HttpClient) {}

  getStatus(): Observable<{ onboardingCompleted: boolean; currentStep: number }> {
    return this.http.get<{ onboardingCompleted: boolean; currentStep: number }>(`${API_URL}/onboarding/status`);
  }

  saveStep1(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/onboarding/step1`, data);
  }

  getStep1(): Observable<{ data: any }> {
    return this.http.get<{ data: any }>(`${API_URL}/onboarding/step1`);
  }

  saveStep2(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/onboarding/step2`, data);
  }

  getStep2(): Observable<{ data: any }> {
    return this.http.get<{ data: any }>(`${API_URL}/onboarding/step2`);
  }

  saveStep3(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/onboarding/step3`, data);
  }

  getStep3(): Observable<{ data: any }> {
    return this.http.get<{ data: any }>(`${API_URL}/onboarding/step3`);
  }

  getSummary(): Observable<{ summary: any }> {
    return this.http.get<{ summary: any }>(`${API_URL}/onboarding/summary`);
  }

  completeOnboarding(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/onboarding/complete`, {});
  }

  getDoctors(): Observable<{ doctors: any[] }> {
    return this.http.get<{ doctors: any[] }>(`${API_URL}/onboarding/doctors`);
  }
}
